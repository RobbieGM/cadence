import { Component, For } from "solid-js";
import { Track } from "./types";

import styles from "./TrackList.module.css";
import { trackChordsToString } from "./chord-utils";
import Edit from "./icons/Edit";
import Delete from "./icons/Delete";

const TrackList: Component<{ tracks: Track[] }> = (props) => (
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
          <div class={styles.chordsColumn}>{trackChordsToString(track)}</div>
          <div>
            <Edit />
            <Delete />
          </div>
        </>
      )}
    </For>
  </section>
);

export default TrackList;
