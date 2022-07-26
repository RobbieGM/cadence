import classNames from "classnames";
import {
  Component,
  createSignal,
  lazy,
  onMount,
  Show,
  useContext,
} from "solid-js";
import noData from "../assets/no_data.svg";
import Plus from "../icons/Plus";
import { Track } from "../types";
import styles from "./App.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import Header from "./Header";
import type { Props } from "./TrackEditor";
import TrackList from "./TrackList";

function isValidTrack(track: any): track is Track {
  return (
    track instanceof Object &&
    typeof track.name === "string" &&
    Array.isArray(track.chords) &&
    Array.isArray(track.tags)
  );
}

const App: Component = () => {
  const { tracks, addTrack } = useContext(DatabaseContext)!;
  const TrackEditor = lazy(() => import("./TrackEditor"));
  const [draggingOver, setDraggingOver] = createSignal(false);
  let openTrackEditor: (props: Props) => void | undefined;
  onMount(() => {
    window.addEventListener("dragenter", () => setDraggingOver(true));
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      setDraggingOver(true);
    });
    window.addEventListener("dragleave", () => setDraggingOver(false));
    window.addEventListener("dragend", () => setDraggingOver(false));
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      setDraggingOver(false);
      const files = e.dataTransfer?.files;
      if (files == null || files.length === 0) return;
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i += 1) {
        fileArray.push(files.item(i)!);
      }
      Promise.all(
        fileArray.map((file) =>
          file
            .text()
            .then(JSON.parse)
            .then((trackWithoutName) => {
              const track = { ...trackWithoutName, name: file.name };
              if (isValidTrack(track)) {
                addTrack(track);
                return true;
              }
              return false;
            })
        )
      ).then((results) => {
        const failures = results.reduce(
          (acc, succeeded) => acc + (succeeded ? 0 : 1),
          0
        );
        if (failures > 0) {
          alert(
            `${failures} of your files were not valid tracks and were skipped.`
          );
        }
      });
    });
  });
  return (
    <div class={classNames(styles.App, draggingOver() && styles.draggingOver)}>
      <Header add={() => openTrackEditor({ track: null })} />
      <Show when={tracks()}>
        <Show
          when={tracks()!.length > 0}
          fallback={
            <div class={styles.emptyState}>
              <img src={noData} alt="" style="aspect-ratio: 648/632" />
              <p>
                Add music for Cadence to train its AI on in order to generate
                chords.
              </p>
              <button
                type="button"
                class="primary"
                onClick={() => openTrackEditor({ track: null })}
              >
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
