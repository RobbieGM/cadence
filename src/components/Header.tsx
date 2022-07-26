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
  return (
    <header class={styles.Header}>
      <h1>
        <span class={styles.hideWhenSmall}>Your&nbsp;</span>Music
      </h1>
      <section>
        <button type="button" onClick={() => props.add()}>
          <Plus />
          Add
          <span class={styles.hideWhenSmall}>&nbsp;music</span>
          <kbd aria-label="Control Enter">^↵</kbd>
        </button>
        <GenerateChordsMenu />
      </section>
    </header>
  );
};

export default Header;
