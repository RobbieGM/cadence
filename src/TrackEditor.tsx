import { Component, createSignal, useContext } from "solid-js";
import { DialogProps } from "./ModalDialogProvider";
import { Track, TrackWithId } from "./types";

import styles from "./TrackEditor.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import ChordProgressionEditor from "./ChordProgressionEditor";

function createTrackEditor(track: TrackWithId | null): Component<DialogProps> {
  return function TrackEditor(props) {
    const [name, setName] = createSignal(track?.name ?? "");
    const [tags, setTags] = createSignal(track?.tags?.join(", ") ?? "");
    const [chords, setChords] = createSignal(track?.chords ?? []);
    const [keySignature, setKeySignature] = createSignal(
      track?.keySignature ?? 0
    );
    const { addTrack, updateTrack } = useContext(DatabaseContext)!;
    function save() {
      const trackFromFormData: Track = {
        name: name(),
        tags: tags()
          .split(",")
          .map((s) => s.trim()),
        chords: [
          { root: 0, quality: "minor" },
          { root: 5, quality: "major" },
        ], // chords().split(" ").map((s) => s.trim()),
      };
      if (track) {
        updateTrack(track.id, trackFromFormData);
      } else {
        addTrack(trackFromFormData);
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
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label for="chord-progression-editor">Chords</label>
        <ChordProgressionEditor
          chords={chords()}
          setChords={setChords}
          textareaId="chord-progression-editor"
          placeholder="Bm D F#m F#…"
          keySignature={keySignature()}
          setKeySignature={setKeySignature}
        />
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
