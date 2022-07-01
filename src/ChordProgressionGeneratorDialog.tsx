import { Dialog } from "./ModalDialogProvider";
import ChordProgressionEditor from "./ChordProgressionEditor";
import { createSignal, Show } from "solid-js";
import { Chord } from "./types";
import styles from "./ChordProgressionGeneratorDialog.module.css";
import detailsSummary from "./details-summary.module.css";
import { Model } from "./chord-generation";
import { chordToString } from "./chord-utils";
import { nanoid } from "nanoid/non-secure";

const createChordProgressionGeneratorDialog =
  (model: Model): Dialog =>
  (props) => {
    const [beginningChords, setBeginningChords] = createSignal([] as Chord[]);
    const [keySignature, setKeySignature] = createSignal(0);
    const [distributionExponent, setDistributionExponent] = createSignal(2);
    const distributionExponentInputId = nanoid();
    const [output, setOutput] = createSignal([] as Chord[]);
    const textareaId = nanoid();
    async function generate() {
      setOutput([]);
      for await (const chord of model.generate(
        8,
        beginningChords(),
        distributionExponent()
      )) {
        setOutput((output) => [...output, chord]);
      }
    }
    return (
      <div class={styles.ChordProgressionGeneratorDialog}>
        <h2>Generate chords</h2>
        <section>
          <label for={textareaId}>Beginning sequence</label>
          <p>
            The AI will predict what might come next in this sequence, based on
            the tracks you selected.
          </p>
          <ChordProgressionEditor
            chords={beginningChords()}
            setChords={setBeginningChords}
            keySignature={keySignature()}
            setKeySignature={setKeySignature}
            // Placeholder should show maximum number of chords to put in (windowSize)
            placeholder={`Enter up to ${model.modelSettings.windowSize} chords`}
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
              All predicted next chord probabilities will be exponentiated by
              this value before a weighted random selection is performed. Lower
              values are more creative and erratic, higher ones are more
              predictable.
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
        <output>
          <Show when={output().length} fallback="Output will appear here">
            {output()
              .map((chord) => chordToString(chord, keySignature()))
              .join(" ")}
          </Show>
        </output>
        <menu>
          <button onClick={() => props.close()}>Cancel</button>
          <button class="primary" onClick={generate}>
            Generate
          </button>
        </menu>
      </div>
    );
  };

export default createChordProgressionGeneratorDialog;
