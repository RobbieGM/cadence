const chordQualities = [
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
  "power",
] as const;
export type ChordQuality = typeof chordQualities[number];

type AbsoluteNote = number; // 0 to 11, where 0 is C and 11 is B

export interface Chord {
  quality: ChordQuality;
  root: AbsoluteNote;
}

export interface Track {
  name: string;
  chords: Chord[];
  tags: string[];
}
