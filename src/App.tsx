import { Component, lazy, Show, useContext } from "solid-js";
import styles from "./App.module.css";
import noData from "./assets/no_data.svg";
import { DatabaseContext } from "./DatabaseProvider";
import Header from "./Header";
import Plus from "./icons/Plus";
import { ModalDialogContext } from "./ModalDialogProvider";
import TrackList from "./TrackList";

const trackEditorPromise = import("./TrackEditor");

const App: Component = () => {
  const ModelTrainerDialog = lazy(() => import("./ModelTrainerDialog"));
  const { tracks } = useContext(DatabaseContext)!;
  const { showDialog } = useContext(ModalDialogContext)!;
  async function addTrack() {
    const { default: createTrackEditor } = await trackEditorPromise;
    const TrackEditor = createTrackEditor(null);
    showDialog((props) => <TrackEditor close={props.close} />);
  }
  return (
    <div class={styles.App}>
      <Header add={addTrack} generate={() => showDialog(ModelTrainerDialog)} />
      <Show when={tracks()}>
        <Show
          when={tracks()!.length > 0}
          fallback={
            <div class={styles.emptyState}>
              <img src={noData} alt="" />
              <p>
                Add music for Cadence to train its AI on in order to generate
                chords.
              </p>
              <button type="button" class="primary" onClick={addTrack}>
                <Plus />
                Add music
              </button>
            </div>
          }
        >
          <TrackList tracks={tracks()!} />
        </Show>
      </Show>
    </div>
  );
};

export default App;
