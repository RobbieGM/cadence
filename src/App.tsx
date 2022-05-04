import { Component, Show, useContext } from "solid-js";

import styles from "./App.module.css";
import { useTracks } from "./database";
import Header from "./Header";
import noData from "./assets/no_data.svg";
import Plus from "./icons/Plus";
import { ModalDialogContext } from "./ModalDialogProvider";

const App: Component = () => {
  const { tracks } = useTracks();
  const { showDialog } = useContext(ModalDialogContext)!;
  function addTrack() {
    showDialog(() => <>Hello</>);
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
              <button class="primary" onClick={addTrack}>
                <Plus />
                Add music
              </button>
            </div>
          }
        >
          You have at least one track
        </Show>
      </Show>
    </div>
  );
};

export default App;
