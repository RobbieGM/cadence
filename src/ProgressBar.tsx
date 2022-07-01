import { nanoid } from "nanoid/non-secure";
import { Component } from "solid-js";
import styles from "./ProgressBar.module.css";

interface Props {
  /** Progress, 0 to 1 or indeterminate */
  value: number | "indeterminate";
  text?: string;
}

const HEIGHT = 8;

const ProgressBar: Component<Props> = (props) => {
  const id = nanoid();
  return (
    <div
      class={styles.ProgressBar}
      role="progressbar"
      aria-labelledby={id}
      aria-valuenow={props.value}
    >
      <span id={id} class={styles.label}>
        {props.text}
      </span>
      <svg width="100%" height={HEIGHT}>
        <defs>
          <clipPath id="rounded-rect">
            <rect width="100%" height="100%" rx={HEIGHT / 2}></rect>
          </clipPath>
        </defs>
        <rect
          height="100%"
          width="100%"
          fill="var(--gray-100)"
          clip-path="url(#rounded-rect)"
          class={styles.backgroundRect}
        />
        <rect
          height="100%"
          width={
            props.value === "indeterminate" ? "0" : props.value * 100 + "%"
          }
          fill="var(--gray-300)"
          clip-path="url(#rounded-rect)"
        />
      </svg>
    </div>
  );
};

export default ProgressBar;
