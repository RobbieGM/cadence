import classNames from "classnames/bind";
import {
  batch,
  Component,
  createEffect,
  createSignal,
  For,
  Index,
} from "solid-js";
import {
  ChordParseError,
  chordsToString,
  chordToString,
  getDefaultQuality,
  parseChord,
  parseChordProgression,
} from "../chord-utils";
import Backspace from "../icons/Backspace";
import {
  AbsoluteNote,
  Chord,
  chordQualities,
  ChordQuality,
  KeySignature,
} from "../types";
import styles from "./ChordProgressionEditor.module.css";

const cx = classNames.bind(styles);

interface Props {
  chords: Chord[];
  setChords: (chords: Chord[]) => void;
  keySignature: KeySignature;
  setKeySignature: (keySignature: KeySignature) => void;
  textareaId?: string;
  placeholder?: string;
  required?: boolean;
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

function highlightErrors(content: string, error?: ChordParseError | null) {
  if (error == null || error.ranges.length === 0) return content;
  let result = content
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  for (let i = error.ranges.length - 1; i >= 0; i -= 1) {
    const { start, end } = error.ranges[i];
    result = `${result.substring(0, start)}<mark>${result.substring(
      start,
      end
    )}</mark>${result.substring(end)}`;
  }
  return result;
}

const ChordProgressionEditor: Component<Props> = (props) => {
  const [text, setText] = createSignal("");
  createEffect(() => {
    setText(chordsToString(props.chords, props.keySignature));
  });
  const [chordParseError, setChordParseError] = createSignal(
    null as ChordParseError | null
  );
  let textarea: HTMLTextAreaElement | undefined;
  let textareaOverlay: HTMLDivElement | undefined;
  function updateText(newText: string, performFlush = true) {
    batch(() => {
      setText(newText);
      try {
        const chords = parseChordProgression(newText);
        if (performFlush) props.setChords(chords);
        textarea!.setCustomValidity("");
        setChordParseError(null);
      } catch (e) {
        if (e instanceof ChordParseError) {
          textarea!.setCustomValidity(e.message);
          setChordParseError(e);
        } else {
          throw e;
        }
      }
    });
  }
  function flush() {
    // Triggers normalization
    try {
      props.setChords(parseChordProgression(text()));
    } catch (e) {
      if (!(e instanceof ChordParseError)) {
        throw e;
      }
    }
  }
  function onTextareaInput() {
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
    updateText(`${beforeCorrected}${insideCorrected}${afterCorrected}`, false);
    textarea.setSelectionRange(
      beforeCorrected.length,
      beforeCorrected.length + insideCorrected.length
    );
  }
  function onPaste(e: ClipboardEvent) {
    const before = textarea!.value.substring(0, textarea!.selectionStart);
    const after = textarea!.value.substring(textarea!.selectionEnd);
    let content = e.clipboardData!.getData("text");
    if (!content.startsWith(" ") && !before.endsWith(" "))
      content = ` ${content}`;
    if (!content.endsWith(" ") && !after.startsWith(" ")) content += " ";
    updateText(`${before}${content}${after}`, false);
    textarea!.setSelectionRange(
      before.length + content.length,
      before.length + content.length
    );
    e.preventDefault();
  }
  function backspace() {
    if (!textarea) return;
    const [selectionStart, selectionEnd] =
      document.activeElement === textarea
        ? [textarea.selectionStart, textarea.selectionEnd]
        : [textarea.value.length, textarea.value.length];
    if (selectionStart === 0 && selectionEnd === 0) return;
    let before = textarea.value.substring(0, selectionStart);
    let after = textarea.value.substring(selectionEnd);
    before = removeLastWord(before);
    after = removeFirstWord(after);
    updateText(`${before}${after.length !== 0 ? " " : ""}${after}`);
    textarea.setSelectionRange(before.length, before.length);
  }
  // Inserts a chord with the default quality given the key signature
  function insertChord(root: AbsoluteNote) {
    if (!textarea) return;
    // Check if the cursor is inside a chord, or between chords
    if (textarea.selectionStart !== textarea.selectionEnd) {
      backspace();
    }
    function getCursor() {
      const cursorPosition =
        document.activeElement === textarea
          ? textarea!.selectionEnd
          : textarea!.value.length;
      const textBefore = textarea!.value.substring(0, cursorPosition);
      const textAfter = textarea!.value.substring(cursorPosition);
      const atStart = cursorPosition === 0;
      const atEnd = cursorPosition === textarea!.value.length;
      return { textBefore, textAfter, atStart, atEnd };
    }
    const cursor = getCursor();
    const betweenChords =
      cursor.textBefore.endsWith(" ") ||
      cursor.textAfter.startsWith(" ") ||
      cursor.atStart ||
      cursor.atEnd;
    function insert() {
      // Update before and after in case backspace was called
      const { textBefore, textAfter, atStart, atEnd } = getCursor();
      const quality = getDefaultQuality(root, props.keySignature);
      const chordString = chordToString({ root, quality }, props.keySignature);
      const spaceBefore = atStart ? "" : " ";
      const spaceAfter = atEnd ? "" : " ";
      updateText(
        `${textBefore.trim()}${spaceBefore}${chordString}${spaceAfter}${textAfter.trim()}`
      );
      const cursorPosition =
        textBefore.trim().length + spaceBefore.length + chordString.length;
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
    updateText(`${beforeChord}${newChordString}${afterChord}`);
    const newCursorPosition = beforeChord.length + newChordString.length;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
  }
  return (
    <div class={styles.ChordProgressionEditor}>
      <div class={styles.textareaContainer}>
        <textarea
          value={text()}
          inputMode="none"
          onInput={onTextareaInput}
          onChange={flush}
          onPaste={onPaste}
          ref={textarea}
          id={props.textareaId}
          placeholder={props.placeholder}
          spellcheck={false}
          required={props.required}
          onscroll={() => {
            textareaOverlay!.scrollTop = textarea!.scrollTop;
          }}
        ></textarea>
        <div
          class={styles.textareaOverlay}
          ref={textareaOverlay}
          // eslint-disable-next-line solid/no-innerhtml
          innerHTML={highlightErrors(text(), chordParseError())}
          aria-hidden="true"
        ></div>
      </div>
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
        <span class={styles.keySignatureLabel}>Key signature</span>
        <select
          value={props.keySignature}
          onInput={(e) =>
            props.setKeySignature(parseInt(e.currentTarget.value, 10))
          }
          aria-label="Key signature"
        >
          <option value={-6}>Six flats (G♭/E♭m)</option>
          <option value={-5}>Five flats (D♭/B♭m)</option>
          <option value={-4}>Four flats (A♭/Fm)</option>
          <option value={-3}>Three flats (E♭/Cm)</option>
          <option value={-2}>Two flats (B♭/Gm)</option>
          <option value={-1}>One flat (F/Dm)</option>
          <option value={0}>No sharps/flats (C/Am)</option>
          <option value={1}>One sharp (G/Em)</option>
          <option value={2}>Two sharps (D/Bm)</option>
          <option value={3}>Three sharps (A/F♯m)</option>
          <option value={4}>Four sharps (E/C♯m)</option>
          <option value={5}>Five sharps (B/G♯m)</option>
          <option value={6}>Six sharps (F♯/D♯m)</option>
        </select>
      </label>
    </div>
  );
};

export default ChordProgressionEditor;
