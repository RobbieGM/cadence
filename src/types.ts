export const chordQualities = [
  "major",
  "minor",
  "diminished",
  "augmented",
  "dominant",
  "sus4",
  "sus2",
  "halfdiminished",
  "maj7",
  "min7",
  "maj9",
  "power",
] as const;
export type ChordQuality = typeof chordQualities[number];

export type AbsoluteNote = number; // 0 to 11, where 0 is C and 11 is B

export type KeySignature = number; // -6 to 6, indicating number of sharps or flats (positive is sharps, negative is flats)

export interface Chord {
  quality: ChordQuality;
  root: AbsoluteNote;
}

export interface Track {
  name: string;
  chords: Chord[];
  tags: string[];
  keySignature?: KeySignature;
}
export type TrackWithId = Track & { id: number };
