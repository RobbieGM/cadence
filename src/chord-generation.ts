// eslint-disable-next-line max-classes-per-file
import type { Rank, Sequential, Tensor, Tensor1D } from "@tensorflow/tfjs";
import { Chord, chordQualities, Track } from "./types";

const DIMENSIONALITY = 12 * chordQualities.length + 1; // Every chord + 1 (empty padding)

function getTf() {
  return import("@tensorflow/tfjs");
}

export function preloadTensorflow() {
  getTf();
}

export const defaultModelSettings = {
  layerSize: 128,
  windowSize: 16,
  epochs: 10,
  batchSize: 128,
  validationSplit: 0.2,
  learningRate: 1e-2,
};
export type ModelSettings = typeof defaultModelSettings;

function transposeToAllRoots(data: Track[]) {
  let augmented = [...data];
  for (let i = 1; i < 12; i += 1) {
    augmented = augmented.concat(
      data.map((track) => ({
        ...track,
        chords: track.chords.map((chord) => ({
          ...chord,
          root: (chord.root + i) % 12,
        })),
      }))
    );
  }
  return augmented;
}

function leftPad<T>(array: T[], minLength: number, padding: T) {
  return Array.from({ length: minLength - array.length }, () => padding).concat(
    array
  );
}

function chordToInt(chord: Chord) {
  return 12 * chordQualities.indexOf(chord.quality) + chord.root + 1; // Add 1 to reserve 0 for left padding window
}

function intToChord(number: number): Chord {
  // Undo reserving 0 for left pad window
  // eslint-disable-next-line no-param-reassign
  number -= 1;
  return {
    root: number % 12,
    quality: chordQualities[Math.floor(number / 12)],
  };
}

function makeXY(
  tf: typeof import("@tensorflow/tfjs"),
  windowSize: number,
  tracks: Track[]
) {
  // Each chord in a track gets to be the Y-value once, and the X-values are all the chords before it, left-padded by nulls to fill the window.
  // In a track [C, Am, C, D] with window size 2 we train:
  // [null, null] -> C
  // [null, C] -> Am
  // [C, Am] -> C
  // [Am, C] -> D
  const totalExamples = tracks.reduce(
    (sum, track) => sum + track.chords.length,
    0
  );
  const xsBuffer = new tf.TensorBuffer(
    [totalExamples, windowSize, DIMENSIONALITY],
    "bool"
  );
  /* xsBuffer shape:
  [
    // track 0
    [0 0 0 0]
    [0 0 0 A]
    [0 0 A E] // = [oneHot(0), oneHot(0), oneHot(A), oneHot(E)]
    [0 A E D]
    [A E D E]
    ...
    // track 1
    [0 0 0 0]
    [0 0 0 C]
    [0 0 C D]
    [0 C D G]
    [C D G Em]
    ...
  ]
  */
  const ysBuffer = new tf.TensorBuffer([totalExamples, DIMENSIONALITY], "bool");
  let exampleIndex = 0; // An "example" is one windowSize worth of chords, and a corresponding chord afterwards (y)
  tracks.forEach((track) => {
    const chords = track.chords.map(chordToInt);
    for (let yIndex = 0; yIndex < chords.length; yIndex += 1) {
      for (
        let xIndex = Math.max(yIndex - windowSize, 0);
        xIndex < yIndex;
        xIndex += 1
      ) {
        const chordIndexInExample = windowSize - (yIndex - xIndex);
        // When the example has fewer than 20 real chords, put them on the right (left zero-pad)
        xsBuffer.set(true, exampleIndex, chordIndexInExample, chords[xIndex]);
      }
      ysBuffer.set(true, exampleIndex, chords[yIndex]);
      exampleIndex += 1;
    }
  });
  return [xsBuffer.toTensor(), ysBuffer.toTensor()];
}

export class Model {
  static TrainingCancelledError = class extends Error {};

  private model: Promise<Sequential>;

  private trained = false;

  private name?: string;

  modelSettings: ModelSettings;

  /**
   * Create a new model
   */
  constructor(modelSettings: ModelSettings);

  /**
   * Load a model from indexedDB.
   */
  constructor(name: string);

  constructor(firstArg: ModelSettings | string) {
    if (typeof firstArg === "string") {
      this.name = firstArg;
      this.modelSettings = defaultModelSettings;
      this.model = getTf().then(
        (tf) =>
          tf.loadLayersModel(`indexeddb://${this.name}`) as Promise<Sequential>
      );
    } else {
      const modelSettings = firstArg;
      this.modelSettings = modelSettings;
      this.model = getTf().then((tf) => {
        const model = tf.sequential();
        model.add(
          tf.layers.lstm({
            units: modelSettings.layerSize,
            returnSequences: false,
            inputShape: [modelSettings.windowSize, DIMENSIONALITY],
          })
        );
        model.add(
          tf.layers.dense({
            units: DIMENSIONALITY,
            activation: "softmax",
          })
        );
        return model;
      });
    }
  }

  async train(
    tracks: Track[],
    onProgress: (progress: number | "indeterminate", text: string) => void
  ) {
    onProgress("indeterminate", "Creating model???");
    const model = await this.model;
    onProgress("indeterminate", "Compiling model???");
    const tf = await getTf();
    const optimizer = tf.train.adam(this.modelSettings.learningRate);
    model.compile({ optimizer, loss: "categoricalCrossentropy" });
    onProgress("indeterminate", "Preparing data???");
    const augmentedTracks = transposeToAllRoots(tracks);
    onProgress(0, "Training???");
    const [xs, ys] = makeXY(tf, this.modelSettings.windowSize, augmentedTracks);
    const numExamples = ys.shape[0] * this.modelSettings.epochs;
    const totalBatches = Math.ceil(
      numExamples /
        this.modelSettings.batchSize /
        (1 + this.modelSettings.validationSplit)
    );
    let epochsCompleted = 0;
    await model.fit(xs, ys, {
      epochs: this.modelSettings.epochs,
      batchSize: this.modelSettings.batchSize,
      validationSplit: this.modelSettings.validationSplit,
      callbacks: {
        onBatchBegin: (batchOfEpoch) => {
          onProgress(
            epochsCompleted / this.modelSettings.epochs +
              batchOfEpoch / totalBatches,
            `Training???`
          );
        },
        onEpochEnd(epoch) {
          epochsCompleted = epoch + 1; // epoch is zero-indexed
        },
      },
    });
    if (model.stopTraining) {
      throw new Model.TrainingCancelledError();
    }
    onProgress(1, "Done.");
  }

  hasBeenTrained() {
    return this.trained;
  }

  getName() {
    return this.name;
  }

  async cancelTraining() {
    (await this.model).stopTraining = true;
  }

  async *generate(
    outputLength: number,
    chords?: Chord[],
    distributionExponent = 2
  ) {
    const tf = await getTf();
    const model = await this.model;
    const input = leftPad(
      (chords ?? []).map(chordToInt),
      this.modelSettings.windowSize,
      0
    );
    const inputAsTensor = () => {
      // Same shape as xsBuffer, but 1 example only
      const buffer = new tf.TensorBuffer(
        [1, this.modelSettings.windowSize, DIMENSIONALITY],
        "bool"
      );
      for (let i = 0; i < this.modelSettings.windowSize; i += 1) {
        buffer.set(true, 0, i, input[i]);
      }
      return buffer.toTensor();
    };
    const sampleOutput = async (output: Tensor<Rank>) => {
      const data = (await output.data()) as Float32Array;
      let sum = 0;
      // Weight data
      for (let i = 0; i < data.length; i += 1) {
        data[i] = Math.max(0, data[i]);
        data[i] **= distributionExponent; // Make less likely values even less likely
        sum += data[i];
      }
      // Pick weighted random by stopping when another sum passes a random value from 0 to sum
      const random = Math.random() * sum;
      let sum2 = 0;
      let selectedIndex = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        sum2 += data[selectedIndex];
        if (sum2 >= random) {
          return selectedIndex;
        }
        selectedIndex += 1;
      }
    };
    for (let i = 0; i < outputLength; i += 1) {
      const output = model.predict(inputAsTensor()) as Tensor1D;
      const nextChord = intToChord(await sampleOutput(output));
      yield nextChord;
      input.shift();
      input.push(chordToInt(nextChord));
    }
  }

  /**
   * Saves the model. Don't call this directly--use DatabaseProvider interface to ensure that list of models is in sync.
   */
  async save(name: string) {
    await (await this.model).save(`indexeddb://${name}`);
    this.name = name;
  }
}
