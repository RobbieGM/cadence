import { Component, createSignal, useContext } from "solid-js";
import { DialogProps } from "./ModalDialogProvider";
import { Track } from "./types";

import styles from "./TrackEditor.module.css";
import { DatabaseContext } from "./DatabaseProvider";

function createTrackEditor(track: Track | null): Component<DialogProps> {
  return function TrackEditor(props) {
    const [name, setName] = createSignal(track?.name ?? "");
    const [tags, setTags] = createSignal(track?.tags?.join(", ") ?? "");
    const [chords, setChords] = createSignal(track?.chords?.join(" ") ?? "");
    const { addTrack } = useContext(DatabaseContext)!;
    function save() {
      if (track) {
        // Overwrite
      } else {
        // Create
        const newTrack: Track = {
          name: name(),
          tags: tags()
            .split(",")
            .map((s) => s.trim()),
          chords: [
            { root: 0, quality: "minor" },
            { root: 5, quality: "major" },
          ], // chords().split(" ").map((s) => s.trim()),
        };
        addTrack(newTrack);
      }
      props.close();
    }
    return (
      <div class={styles.TrackEditor}>
        <label>
          Title
          <input
            type="text"
            placeholder="Ride of the Valkyries"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
          />
        </label>
        <label>
          Tags
          <input
            type="text"
            placeholder="dramatic, minor"
            value={tags()}
            onInput={(e) => setTags(e.currentTarget.value)}
          />
        </label>
        <label>
          Chords
          <textarea
            placeholder="Bm D F#m F#…"
            spellcheck={false}
            value={chords()}
            onInput={(e) => setChords(e.currentTarget.value)}
          ></textarea>
        </label>
        <menu>
          <button type="button" onClick={() => props.close()}>
            Cancel
          </button>
          <button type="button" class="primary" onClick={save}>
            Save
          </button>
        </menu>
      </div>
    );
  };
}

export default createTrackEditor;
