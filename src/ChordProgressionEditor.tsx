import classNames from "classnames/bind";
import { Component, createSignal, For, Index, untrack } from "solid-js";
import {
  chordsToString,
  chordToString,
  getDefaultQuality,
  parseChord,
} from "./chord-utils";
import styles from "./ChordProgressionEditor.module.css";
import Backspace from "./icons/Backspace";
import {
  AbsoluteNote,
  Chord,
  chordQualities,
  ChordQuality,
  KeySignature,
} from "./types";

const cx = classNames.bind(styles);

interface Props {
  chords: Chord[];
  setChords: (chords: Chord[]) => void;
  keySignature: KeySignature;
  setKeySignature: (keySignature: KeySignature) => void;
  textareaId?: string;
  placeholder?: string;
}

const accessibleNoteNames = [
  "C",
  "D flat",
  "D",
  "E flat",
  "E",
  "F",
  "G flat",
  "G",
  "A flat",
  "A",
  "B flat",
  "B",
];

// For example, in C major, defaultQualities[4] is for E, which is minor.
const chordQualityLabels: { [key in ChordQuality]: string } = {
  major: "Major",
  minor: "Minor",
  diminished: "Diminished",
  augmented: "Augmented",
  dominant: "Dom. 7th",
  sus4: "Sus. 4th",
  sus2: "Sus. 2nd",
  halfdiminished: "Half-dim.",
  maj7: "Major 7th",
  min7: "Minor 7th",
  maj9: "Major 9th",
  power: "Power chord",
};
const autocorrections = {
  // These are applied instantly to the text box
  "#": "♯",
  b: "♭",
  min: "m",
  halfdim: "ø",
  dim: "°",
  aug: "+",
  "m7♭5": "ø",
  maj9: "9",
  power: "5",
  "  ": " ",
  "\n": " ",
  "\r": " ",
};
function autocorrect(text: string): string {
  Object.entries(autocorrections).forEach(([key, value]) => {
    // eslint-disable-next-line no-param-reassign
    text = text.replaceAll(key, value);
  });
  return text;
}

function removeLastWord(s: string) {
  const lastIndex = s.lastIndexOf(" ");
  return lastIndex === -1 ? "" : s.substring(0, lastIndex);
}
function removeFirstWord(s: string) {
  const firstIndex = s.indexOf(" ");
  return firstIndex === -1 ? "" : s.substring(firstIndex + 1);
}

const ChordProgressionEditor: Component<Props> = (props) => {
  const chords = untrack(() => props.chords); // Make chords non-reactive so the text box doesn't update when the chords are updated
  const [text, setText] = createSignal(
    // Key signature should not be reactive, and is unlikely to change anyway
    // eslint-disable-next-line solid/reactivity
    chordsToString(chords, props.keySignature)
  );
  let textarea: HTMLTextAreaElement | undefined;
  // Inserts a chord with the default quality given the key signature
  function updateTextarea() {
    if (!textarea) return;
    const before = textarea.value.substring(0, textarea.selectionStart);
    const inside = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    const after = textarea.value.substring(textarea.selectionEnd);
    const [beforeCorrected, insideCorrected, afterCorrected] = [
      before,
      inside,
      after,
    ].map(autocorrect);
    setText(`${beforeCorrected}${insideCorrected}${afterCorrected}`);
    textarea.setSelectionRange(
      beforeCorrected.length,
      beforeCorrected.length + insideCorrected.length
    );
  }
  function backspace() {
    if (!textarea) return;
    if (textarea.selectionStart === 0 && textarea.selectionEnd === 0) return;
    let before = textarea.value.substring(0, textarea.selectionStart);
    let after = textarea.value.substring(textarea.selectionEnd);
    before = removeLastWord(before);
    after = removeFirstWord(after);
    setText(`${before} ${after}`);
    textarea.setSelectionRange(before.length, before.length);
  }
  function insertChord(root: AbsoluteNote) {
    if (!textarea) return;
    // Check if the cursor is inside a chord, or between chords
    if (textarea.selectionStart !== textarea.selectionEnd) {
      backspace();
    }
    function getCursor() {
      const before = textarea!.value.substring(0, textarea!.selectionEnd);
      const after = textarea!.value.substring(textarea!.selectionEnd);
      const atStart = textarea!.selectionEnd === 0;
      const atEnd = textarea!.selectionEnd === textarea!.value.length;
      return { before, after, atStart, atEnd };
    }
    const cursor = getCursor();
    const betweenChords =
      cursor.before.endsWith(" ") ||
      cursor.after.startsWith(" ") ||
      cursor.atStart ||
      cursor.atEnd;
    function insert() {
      // Update before and after in case backspace was called
      const { before, after, atStart, atEnd } = getCursor();
      const quality = getDefaultQuality(root, props.keySignature);
      const chordString = chordToString({ root, quality }, props.keySignature);
      const spaceBefore = atStart ? "" : " ";
      const spaceAfter = atEnd ? "" : " ";
      setText(
        `${before.trim()}${spaceBefore}${chordString}${spaceAfter}${after.trim()}`
      );
      const cursorPosition =
        before.trim().length + spaceBefore.length + chordString.length;
      textarea!.setSelectionRange(cursorPosition, cursorPosition);
    }
    if (betweenChords) {
      // Insert a new chord
      insert();
    } else {
      // Replace the current chord if the cursor is inside it
      backspace();
      insert();
    }
  }
  function setCurrentChordQuality(quality: ChordQuality) {
    // Find last chord in text before the cursor (selection end)
    if (!textarea) return;
    if (textarea.selectionStart !== textarea.selectionEnd) return;
    let cursor = textarea.selectionEnd;
    // Increment cursor until the current chord is behind it
    while (textarea.value[cursor] !== " " && cursor < textarea.value.length) {
      cursor += 1;
    }
    const beforeCursor = textarea.value.substring(0, cursor);
    const lastSpace = beforeCursor.lastIndexOf(" ");
    const beforeChord = beforeCursor.substring(
      0,
      lastSpace === -1 ? 0 : lastSpace + 1
    );
    const chordString = beforeCursor.substring(
      lastSpace === -1 ? 0 : lastSpace + 1
    );
    const afterChord = textarea.value.substring(cursor);
    const chord = parseChord(chordString);
    if (chord == null) return;
    const newChord = { ...chord, quality };
    const newChordString = chordToString(newChord, props.keySignature);
    setText(`${beforeChord}${newChordString}${afterChord}`);
    const newCursorPosition = beforeChord.length + newChordString.length;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
  }
  return (
    <div class={styles.ChordProgressionEditor}>
      <textarea
        value={text()}
        inputMode="none"
        onInput={updateTextarea}
        ref={textarea}
        id={props.textareaId}
        placeholder={props.placeholder}
        spellcheck={false}
      ></textarea>
      {/* Event handlers prevent blurring the textarea. Disabled eslint rule because the element itself is not interactive */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        class={styles.ChordEditor}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      >
        <div class={styles.RootEditor}>
          <div class={styles.PianoKeyboard}>
            <Index each={accessibleNoteNames}>
              {(note, i) => (
                <button
                  type="button"
                  aria-label={note()}
                  class={cx("key", note().split(" "))}
                  onClick={() => insertChord(i)}
                ></button>
              )}
            </Index>
          </div>
          <button
            type="button"
            class={`${styles.backspace}`}
            onClick={backspace}
          >
            <Backspace />
          </button>
        </div>
        <div class={styles.ChordQualitySelector}>
          <For each={chordQualities}>
            {(quality) => (
              <button
                type="button"
                onClick={() => setCurrentChordQuality(quality)}
              >
                {chordQualityLabels[quality]}
              </button>
            )}
          </For>
        </div>
      </div>
      <label class={styles.keySignatureSelector}>
        Key signature
        <select
          value={props.keySignature}
          onInput={(e) =>
            props.setKeySignature(parseInt(e.currentTarget.value, 10))
          }
        >
          <option value={0}>No sharps/flats (C/Am)</option>
          <option value={1}>One sharp (G/Em)</option>
          <option value={2}>Two sharps (D/Bm)</option>
          <option value={3}>Three sharps (A/F♯m)</option>
          <option value={4}>Four sharps (E/C♯m)</option>
          <option value={5}>Five sharps (B/G♯m)</option>
          <option value={6}>Six sharps (F♯/D♯m)</option>
          <option value={-1}>One flat (F/Dm)</option>
          <option value={-2}>Two flats (B♭/Gm)</option>
          <option value={-3}>Three flats (E♭/Cm)</option>
          <option value={-4}>Four flats (A♭/Fm)</option>
          <option value={-5}>Five flats (D♭/B♭m)</option>
          <option value={-6}>Six flats (G♭/E♭m)</option>
        </select>
      </label>
    </div>
  );
};

export default ChordProgressionEditor;
