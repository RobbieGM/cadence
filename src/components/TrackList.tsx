import { Component, For, useContext } from "solid-js";
import { Track, TrackWithId } from "../types";

import { chordsToString } from "../chord-utils";
import Delete from "../icons/Delete";
import Download from "../icons/Download";
import Edit from "../icons/Edit";
import { DatabaseContext } from "./DatabaseProvider";
import styles from "./TrackList.module.css";

interface Props {
  tracks: TrackWithId[];
  editTrack(track: TrackWithId): void;
}

function download({ name, ...track }: Track) {
  const link = document.createElement("a");
  const blob = new Blob([JSON.stringify(track)], { type: "application/json" });
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `${name}.json`);
  link.click();
}

const TrackList: Component<Props> = (props) => {
  const { deleteTrack } = useContext(DatabaseContext)!;
  return (
    <section class={styles.TrackList}>
      <div class={styles.label}>Title</div>
      <div class={styles.label}>Tags</div>
      <div class={`${styles.label} ${styles.chordsColumn}`}>Chords</div>
      <div />
      <For each={props.tracks}>
        {(track) => (
          <>
            <div>{track.name}</div>
            <div>
              <For each={track.tags}>
                {(tag) => <span class={styles.tag}>{tag}</span>}
              </For>
            </div>
            <div class={styles.chordsColumn}>
              {chordsToString(track.chords, track.keySignature)}
            </div>
            <div class={styles.buttons}>
              <button
                type="button"
                class={`icon-only ${styles.downloadButton}`}
                onClick={() => download(track)}
                aria-label="Download"
              >
                <Download />
              </button>
              <button
                type="button"
                class="icon-only"
                onClick={() => props.editTrack(track)}
                aria-label="Edit"
              >
                <Edit />
              </button>
              <button
                type="button"
                class="icon-only"
                onClick={() => deleteTrack(track.id)}
                aria-label="Delete"
              >
                <Delete />
              </button>
            </div>
          </>
        )}
      </For>
    </section>
  );
};

export default TrackList;
