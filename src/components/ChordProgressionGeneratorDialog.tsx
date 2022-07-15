import classNames from "classnames";
import { nanoid } from "nanoid/non-secure";
import { createEffect, createSignal, Show, useContext } from "solid-js";
import { Model } from "../chord-generation";
import { chordToString } from "../chord-utils";
import detailsSummary from "../styles/details-summary.module.css";
import { Chord } from "../types";
import ChordProgressionEditor from "./ChordProgressionEditor";
import styles from "./ChordProgressionGeneratorDialog.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import wrapModal from "./ModalDialogProvider";

export interface Props {
  model: Model;
}

const ChordProgressionGeneratorDialog = wrapModal<Props>((props) => {
  const { saveModel } = useContext(DatabaseContext)!;
  const [savedModelName, setSavedModelName] = createSignal(
    undefined as string | undefined
  );
  const [beginningChords, setBeginningChords] = createSignal([] as Chord[]);
  const [keySignature, setKeySignature] = createSignal(0);
  const [distributionExponent, setDistributionExponent] = createSignal(2);
  const distributionExponentInputId = nanoid();
  const [output, setOutput] = createSignal([] as Chord[]);
  const textareaId = nanoid();
  const outputId = nanoid();
  const modelNameInputId = nanoid();
  const [modelNameInput, setModelNameInput] = createSignal("");
  let model: Model | undefined;
  createEffect(() => {
    props.onOpen(({ model: m }) => {
      model = m;
      setSavedModelName(model.getName());
    });
  });
  async function generate() {
    setOutput([]);
    for await (const chord of model!.generate(
      8,
      beginningChords(),
      distributionExponent()
    )) {
      setOutput((out) => [...out, chord]);
    }
  }
  return (
    <div class={styles.ChordProgressionGeneratorDialog}>
      <h2>Generate chords</h2>
      <section>
        <label for={textareaId}>Beginning sequence</label>
        <p class={styles.beginningSequenceDescription}>
          The AI will predict what might come next in this sequence, based on
          the tracks you selected.
        </p>
        <ChordProgressionEditor
          chords={beginningChords()}
          setChords={setBeginningChords}
          keySignature={keySignature()}
          setKeySignature={setKeySignature}
          // Placeholder should show maximum number of chords to put in (windowSize)
          placeholder={
            model ? `Enter up to ${model.modelSettings.windowSize} chords` : ""
          }
          textareaId={textareaId}
        />
      </section>
      <details>
        <summary>Randomization</summary>
        <div class={detailsSummary.indented}>
          <label style="padding-top: 8px" for={distributionExponentInputId}>
            Distribution exponent
          </label>
          <p>
            All predicted next chord probabilities will be exponentiated by this
            value before a weighted random selection is performed. Lower values
            are more creative and erratic, higher ones are more predictable.
          </p>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            id={distributionExponentInputId}
            value={distributionExponent()}
            onChange={(e) =>
              setDistributionExponent(parseFloat(e.currentTarget.value))
            }
          />
        </div>
      </details>
      <button
        class={classNames("primary", styles.generateButton)}
        onClick={generate}
      >
        Generate
      </button>
      <label for={outputId}>Output</label>
      <output id={outputId}>
        <Show when={output().length} fallback="Output will appear here">
          {output()
            .map((chord) => chordToString(chord, keySignature()))
            .join(" ")}
        </Show>
      </output>
      {
        <Show
          when={savedModelName() == null}
          fallback={<p>Model saved as &ldquo;{savedModelName()}&rdquo;</p>}
        >
          {
            <>
              <p>
                Like the results? You can save this model to use it later
                without re-training.
              </p>
              <form
                class={styles.saveWidget}
                onSubmit={async (e) => {
                  e.preventDefault();
                  await saveModel(model!, modelNameInput());
                }}
              >
                <input
                  type="text"
                  required
                  placeholder="Model name"
                  aria-label="Model name"
                  value={modelNameInput()}
                  id={modelNameInputId}
                  onChange={(e) => setModelNameInput(e.currentTarget.value)}
                />
                <button type="submit">Save</button>
              </form>
            </>
          }
        </Show>
      }
    </div>
  );
});

export default ChordProgressionGeneratorDialog;
