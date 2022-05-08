import { Component, createEffect, For, useContext } from "solid-js";
import { TrackWithId } from "./types";

import styles from "./TrackList.module.css";
import { chordsToString } from "./chord-utils";
import Edit from "./icons/Edit";
import Delete from "./icons/Delete";
import { DatabaseContext } from "./DatabaseProvider";
import { ModalDialogContext } from "./ModalDialogProvider";
import createTrackEditor from "./TrackEditor";

const TrackList: Component<{ tracks: TrackWithId[] }> = (props) => {
  const { showDialog } = useContext(ModalDialogContext)!;
  const { deleteTrack } = useContext(DatabaseContext)!;
  function editTrack(track: TrackWithId) {
    const TrackEditor = createTrackEditor(track);
    showDialog((dialogProps) => <TrackEditor close={dialogProps.close} />);
  }
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
              {chordsToString(track.chords, track.keySignature ?? 0)}
            </div>
            <div class={styles.buttons}>
              <button
                type="button"
                class="icon-only"
                onClick={() => editTrack(track)}
              >
                <Edit />
              </button>
              <button
                type="button"
                class="icon-only"
                onClick={() => deleteTrack(track.id)}
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
