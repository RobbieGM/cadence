import type { Component } from "solid-js";
import Plus from "../icons/Plus";
import useKeyboardShortcut from "../use-keyboard-shortcut";
import GenerateChordsMenu from "./GenerateChordsMenu";
import styles from "./Header.module.css";

interface Props {
  add: () => void;
}

const Header: Component<Props> = (props) => {
  useKeyboardShortcut(["Ctrl", "Enter"], () => props.add());
  let addTrackButton: HTMLButtonElement | undefined;
  function onAttemptGenerationWithoutTracks() {
    addTrackButton!.animate(
      [
        { transform: "none" },
        { transform: "scale(1.1)" },
        { transform: "none" },
      ],
      { duration: 200, easing: "cubic-bezier(0,.4,1,.6)" }
    );
  }
  return (
    <header class={styles.Header}>
      <h1>
        <span class={styles.hideWhenSmall}>Your&nbsp;</span>Music
      </h1>
      <section>
        <button
          type="button"
          class={styles.headerButton}
          onClick={() => props.add()}
          ref={addTrackButton}
        >
          <Plus />
          Add
          <span class={styles.hideWhenSmall}>&nbsp;music</span>
          <kbd aria-label="Control Enter">^↵</kbd>
        </button>
        <GenerateChordsMenu
          onAttemptGenerationWithoutTracks={onAttemptGenerationWithoutTracks}
        />
      </section>
    </header>
  );
};

export default Header;
