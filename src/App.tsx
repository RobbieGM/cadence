import { Component, Show, useContext } from "solid-js";
import styles from "./App.module.css";
import noData from "./assets/no_data.svg";
import { DatabaseContext } from "./DatabaseProvider";
import Header from "./Header";
import Plus from "./icons/Plus";
import { ModalDialogContext } from "./ModalDialogProvider";
import createTrackEditor from "./TrackEditor";
import TrackList from "./TrackList";

const App: Component = () => {
  const { tracks } = useContext(DatabaseContext)!;
  const { showDialog } = useContext(ModalDialogContext)!;
  function addTrack() {
    const TrackEditor = createTrackEditor(null);
    showDialog((props) => <TrackEditor close={props.close} />);
  }
  return (
    <div class={styles.App}>
      <Header
        add={addTrack}
        generate={() =>
          showDialog(() => "This functionality not implemented yet.")
        }
      />
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
