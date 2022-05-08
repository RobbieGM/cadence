import { Component, createSignal, useContext } from "solid-js";
import { DialogProps } from "./ModalDialogProvider";
import { Chord, Track, TrackWithId } from "./types";

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
        chords: chords(),
        keySignature: keySignature(),
      };
      if (track) {
        updateTrack(track.id, trackFromFormData);
      } else {
        addTrack(trackFromFormData);
      }
      props.close();
    }
    return (
      <form
        class={styles.TrackEditor}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label>
          Title
          <input
            type="text"
            placeholder="Ride of the Valkyries"
            value={name()}
            required
            onInput={(e) => setName(e.currentTarget.value)}
          />
        </label>
        <label>
          Tags
          <input
            type="text"
            placeholder="dramatic, minor"
            value={tags()}
            required
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
          required
        />
        <menu>
          <button type="button" onClick={() => props.close()}>
            Cancel
          </button>
          <button type="submit" class="primary">
            Save
          </button>
        </menu>
      </form>
    );
  };
}

export default createTrackEditor;
