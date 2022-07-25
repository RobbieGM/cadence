import { nanoid } from "nanoid";
import { Component, useContext } from "solid-js";
import { ModelSettings } from "../chord-generation";
import { DatabaseContext } from "./DatabaseProvider";
import styles from "./ModelSettings.module.css";

interface Props {
  modelSettings: ModelSettings;
  setModelSettings(modelSettings: ModelSettings): void;
}

const ModelSettingsEditor: Component<Props> = (props) => {
  const { setPersistedModelSettings } = useContext(DatabaseContext)!;
  const layerSizeId = nanoid();
  const windowSizeId = nanoid();
  const epochsId = nanoid();
  const batchSizeId = nanoid();
  function set(key: keyof ModelSettings, value: number) {
    const newSettings = {
      ...props.modelSettings,
      [key]: value,
    };
    props.setModelSettings(newSettings);
    setPersistedModelSettings(newSettings);
  }
  const onChange =
    (key: keyof ModelSettings) =>
    (
      e: Event & {
        currentTarget: HTMLInputElement;
      }
    ) =>
      set(key, +e.currentTarget.value);
  return (
    <>
      <section class={styles.field}>
        <label for={layerSizeId}>Layer size</label>
        <p>
          A larger layer allows the model to remember more, but slows down
          training and may allow overfitting (memorization of the training
          data).
        </p>
        <input
          type="number"
          min="20"
          max="200"
          step="1"
          id={layerSizeId}
          value={props.modelSettings.layerSize}
          onChange={onChange("layerSize")}
        />
      </section>
      <section class={styles.field}>
        <label for={windowSizeId}>Window size</label>
        <p>
          The window size is how far back, in chords, the model can remember.
        </p>
        <input
          type="number"
          min="4"
          max="24"
          step="1"
          id={windowSizeId}
          value={props.modelSettings.windowSize}
          onChange={onChange("windowSize")}
        />
      </section>
      <section class={styles.field}>
        <label for={epochsId}>Epochs</label>
        <p>
          In each epoch, the model is trained once again on the same training
          data. More epochs usually yield better results, but take time.
        </p>
        <input
          type="number"
          min="1"
          max="25"
          step="1"
          id={epochsId}
          value={props.modelSettings.epochs}
          onChange={onChange("epochs")}
        />
      </section>
      <section class={styles.field}>
        <label for={batchSizeId}>Batch size</label>
        <p>
          The number of sequences (windows) that are trained together before
          updating model parameters.
        </p>
        <input
          type="number"
          min="8"
          max="512"
          step="1"
          value={props.modelSettings.batchSize}
          onChange={onChange("batchSize")}
        />
      </section>
    </>
  );
};

export default ModelSettingsEditor;
