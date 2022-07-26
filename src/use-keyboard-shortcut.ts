import { onCleanup, onMount } from "solid-js";

type Modifiers = "Ctrl" | "Shift" | "Meta" | "Alt";
type Letter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
type Keys = `Key${Letter}` | "Enter";
type KeyCombo = [...Modifiers[], Keys];

export default function useKeyboardShortcut(
  keys: KeyCombo,
  callback: () => void
) {
  const principal = keys.pop();
  const modifiers = keys;
  function listener(e: KeyboardEvent) {
    const ctrl = modifiers.includes("Ctrl");
    const shift = modifiers.includes("Shift");
    const meta = modifiers.includes("Meta");
    const alt = modifiers.includes("Alt");

    if (
      e.code === principal &&
      e.ctrlKey === ctrl &&
      e.shiftKey === shift &&
      e.metaKey === meta &&
      e.altKey === alt
    ) {
      e.preventDefault();
      callback();
    }
  }
  onMount(() => window.addEventListener("keydown", listener));
  onCleanup(() => window.removeEventListener("keydown", listener));
}
