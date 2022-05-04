export type ChordType =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant"
  | "sus4"
  | "sus2"
  | "halfdiminished"
  | "maj7"
  | "power";
export type Note =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";
export interface Chord {
  type: ChordType;
  root: Note;
}

export interface Track {
  name: string;
  chords: Chord[];
  tags: string[];
}
