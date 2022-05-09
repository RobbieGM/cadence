import { createMemo, createSignal, useContext } from "solid-js";
import styles from "./ChordProgressionGeneratorDialog.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import { Dialog } from "./ModalDialogProvider";
import TagSelector, { Tag } from "./TagSelector";
import { Track } from "./types";

function getAllTags(tracks: Track[]): Tag[] {
  const tagCounts = tracks.reduce((acc, track) => {
    const tags = track.tags || [];
    tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {} as { [tag: string]: number });
  return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
}

const ChordProgressionGeneratorDialog: Dialog = (props) => {
  const { tracks } = useContext(DatabaseContext)!;
  const tags = createMemo(() => getAllTags(tracks() ?? []));
  const [include, setInclude] = createSignal([] as string[]);
  const [filterIn, setFilterIn] = createSignal([] as string[]);
  const [filterOut, setFilterOut] = createSignal([] as string[]);
  return (
    <div class={styles.ChordProgressionGeneratorDialog}>
      <fieldset>
        <legend>Include</legend>
        <p>Tracks with any of these tags will be included.</p>
        <TagSelector
          selectedTags={include()}
          allTags={tags()}
          setSelectedTags={setInclude}
        />
      </fieldset>
      <details>
        <summary>Filter</summary>
        <fieldset>
          <legend>Filter in</legend>
          <p>Tracks without all of the below selected tags will be excluded.</p>
          <TagSelector
            selectedTags={filterIn()}
            allTags={tags()}
            setSelectedTags={setFilterIn}
          />
        </fieldset>
        <fieldset>
          <legend>Filter out</legend>
          <p>Tracks with any of these tags will be excluded.</p>
          <TagSelector
            selectedTags={filterOut()}
            allTags={tags()}
            setSelectedTags={setFilterOut}
          />
        </fieldset>
      </details>
    </div>
  );
};

export default ChordProgressionGeneratorDialog;
