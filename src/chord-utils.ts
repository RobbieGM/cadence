import { createMemo } from "solid-js";
import type { Chord, ChordQuality, Track } from "./types";

const noteNames = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];

export function chordToString(chord: Chord) {
  const root = noteNames[chord.root];
  const qualitySuffixes: { [quality in ChordQuality]: string } = {
    major: "",
    minor: "m",
    diminished: "°",
    augmented: "+",
    dominant: "7",
    sus4: "sus4",
    sus2: "sus2",
    halfdiminished: "m7♭5",
    maj7: "maj7",
    min7: "m7",
    power: "power",
  };
  const qualitySuffix = qualitySuffixes[chord.quality];
  return `${root}${qualitySuffix}`;
}

export const trackChordsToString = (track: Track) =>
  track.chords.map(chordToString).join(" ");
