import { createEffect, useContext } from "solid-js";
import { Chord, Track, TrackWithId } from "../types";
import wrapModal from "./ModalDialogWrapper";

import ChordProgressionEditor from "./ChordProgressionEditor";
import { DatabaseContext } from "./DatabaseProvider";
import { ResettableSignalContext } from "./ResettableSignalContext";
import styles from "./TrackEditor.module.css";

export interface Props {
  track: TrackWithId | null;
}

const TrackEditor = wrapModal<Props>((props) => {
  const { createSignal } = useContext(ResettableSignalContext)!;
  const [name, setName] = createSignal("");
  const [tags, setTags] = createSignal("");
  const [chords, setChords] = createSignal([] as Chord[]);
  const [keySignature, setKeySignature] = createSignal(0);
  const { addTrack, updateTrack } = useContext(DatabaseContext)!;
  let trackId: number | null = null;
  createEffect(() => {
    props.onOpen(({ track }) => {
      if (track != null) {
        setName(track.name);
        setTags(track.tags.join(", "));
        setChords(track.chords);
        setKeySignature(track.keySignature);
        trackId = track.id;
      }
      setTimeout(() => {
        // Ideally this should be done when any field is edited but that requires more abstraction
        // Let's assume instead that if they close the dialog quickly, they opened it on accident
        props.setDirty();
      }, 2000);
    });
  });
  function save() {
    const trackFromFormData: Track = {
      name: name(),
      tags: tags()
        .split(",")
        .map((s) => s.trim()),
      chords: chords(),
      keySignature: keySignature(),
    };
    if (trackId) {
      updateTrack(trackId, trackFromFormData);
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
});

export default TrackEditor;
