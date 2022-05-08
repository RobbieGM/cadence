import type { AbsoluteNote, Chord, ChordQuality, KeySignature } from "./types";

const noteNameToAbsoluteNote = {
  C: 0,
  "C♯": 1,
  "D♭": 1,
  D: 2,
  "D♯": 3,
  "E♭": 3,
  E: 4,
  F: 5,
  "F♯": 6,
  "G♭": 6,
  G: 7,
  "G♯": 8,
  "A♭": 8,
  A: 9,
  "A♯": 10,
  "B♭": 10,
  B: 11,
};

const qualitySuffixes: { [quality in ChordQuality]: string } = {
  major: "",
  minor: "m",
  diminished: "°",
  augmented: "+",
  dominant: "7",
  sus4: "sus4",
  sus2: "sus2",
  halfdiminished: "ø",
  maj7: "maj7",
  min7: "m7",
  maj9: "9",
  power: "5",
};

const getChordQualityFromSuffix = (suffix: string): ChordQuality | undefined =>
  (Object.keys(qualitySuffixes) as ChordQuality[]).find(
    (quality) => qualitySuffixes[quality] === suffix
  ) as ChordQuality | undefined;

export function chordToString(chord: Chord, keySignature: KeySignature) {
  const noteNames = [
    "C",
    keySignature >= 0 ? "C♯" : "D♭",
    "D",
    keySignature >= 2 ? "D♯" : "E♭",
    "E",
    "F",
    keySignature >= -1 ? "F♯" : "G♭",
    "G",
    keySignature >= 1 ? "G♯" : "A♭",
    "A",
    keySignature >= 3 ? "A♯" : "B♭",
    "B",
  ];
  const root = noteNames[chord.root];
  const qualitySuffix = qualitySuffixes[chord.quality];
  return `${root}${qualitySuffix}`;
}

export const chordsToString = (chords: Chord[], keySignature: KeySignature) =>
  chords.map((chord) => chordToString(chord, keySignature)).join(" ");

/**
 * Parses a chord from a string, assuming it is well-formatted (e.g. all "b"s are replaced with "♭"s).
 * @param string A chord string, e.g. "Cmaj7"
 * @param keySignature Key signature, e.g. -3
 * @returns a chord, or null if the string is invalid
 */
export function parseChord(string: string): Chord | null {
  const match =
    /^(?<root>[A-G][♯♭]?)(?<quality>|m|°|\+|7|sus4|sus2|ø|maj7|m7|9|5)$/.exec(
      string
    );
  if (match == null || match.groups == null) return null;
  const { root: rootString, quality: qualitySuffix } = match.groups;
  const root =
    noteNameToAbsoluteNote[rootString as keyof typeof noteNameToAbsoluteNote];
  const quality = getChordQualityFromSuffix(qualitySuffix);
  if (quality == null) return null;
  return { root, quality };
}

export class ChordParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChordParseError";
  }
}

export function parseChordProgression(string: string): Chord[] {
  if (string.trim().length === 0) return [];
  return string
    .trim()
    .split(/\s+/)
    .map((chordString) => {
      const chord = parseChord(chordString);
      if (chord == null) {
        throw new ChordParseError(`Unrecognized chord "${chordString}"`);
      }
      return chord;
    });
}

const defaultQualities: ChordQuality[] = [
  "major",
  "diminished",
  "minor",
  "major",
  "minor",
  "major",
  "diminished",
  "major",
  "major",
  "minor",
  "major",
  "diminished",
]; // Specifies default chord qualities for each note relative to the root of the key signature.
export function getDefaultQuality(
  chordRoot: number,
  keySignature: number
): ChordQuality {
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const relativeMajorRoot = mod(keySignature * 7, 12);
  return defaultQualities[mod(chordRoot - relativeMajorRoot, 12)];
}
