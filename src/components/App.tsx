import { Component, lazy, Show, useContext } from "solid-js";
import noData from "../assets/no_data.svg";
import Plus from "../icons/Plus";
import styles from "./App.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import Header from "./Header";
import type { Props } from "./TrackEditor";
import TrackList from "./TrackList";

const App: Component = () => {
  const { tracks } = useContext(DatabaseContext)!;
  const TrackEditor = lazy(() => import("./TrackEditor"));
  let openTrackEditor: (props: Props) => void | undefined;
  async function addTrack() {
    openTrackEditor({ track: null });
  }
  return (
    <div class={styles.App}>
      <Header add={addTrack} />
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
          <TrackList
            tracks={tracks()!}
            editTrack={(track) => openTrackEditor({ track })}
          />
        </Show>
      </Show>
      <TrackEditor
        ref={({ open }) => {
          openTrackEditor = open;
        }}
      />
    </div>
  );
};

export default App;
