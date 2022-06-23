import { Component, Index } from "solid-js";
import { nanoid } from "nanoid/non-secure";

import styles from "./TagSelector.module.css";

export type Tag = [tag: string, count: number];

interface Props {
  selectedTags: string[];
  allTags: Tag[];
  setSelectedTags: (tags: string[]) => void;
}

const TagSelector: Component<Props> = (props) => {
  const id = nanoid();
  return (
    <div class={styles.TagSelector}>
      <Index each={props.allTags}>
        {(tag) => (
          <div class={styles.container}>
            <input
              type="checkbox"
              checked={props.selectedTags.includes(tag()[0])}
              onChange={(event) => {
                const t = tag();
                if (event.currentTarget.checked) {
                  props.setSelectedTags([...props.selectedTags, t[0]]);
                } else {
                  props.setSelectedTags(
                    props.selectedTags.filter((st) => st !== t[0])
                  );
                }
              }}
              id={`${id}-${tag()[0]}`}
            />
            <label class={styles.Tag} for={`${id}-${tag()[0]}`}>
              {tag()[0]} <span class={styles.count}>({tag()[1]})</span>
            </label>
          </div>
        )}
      </Index>
    </div>
  );
};

export default TagSelector;
