import type { Component } from "solid-js";

import styles from "./Header.module.css";
import Plus from "../icons/Plus";
import Run from "../icons/Run";

interface Props {
  add: () => void;
  generate: () => void;
}

const Header: Component<Props> = (props) => (
  <header class={styles.Header}>
    <h1>
      <span class={styles.hideWhenSmall}>Your&nbsp;</span>Music
    </h1>
    <section>
      <button type="button" onClick={() => props.add()}>
        <Plus />
        Add<span class={styles.hideWhenSmall}>&nbsp;music</span>
      </button>
      <button type="button" onClick={() => props.generate()}>
        <Run />
        Generate chords
      </button>
    </section>
  </header>
);

export default Header;
