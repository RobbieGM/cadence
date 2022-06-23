import { createMemo, createSignal, Show, useContext } from "solid-js";
import ChordProgressionEditor from "./ChordProgressionEditor";
import styles from "./ChordProgressionGeneratorDialog.module.css";
import { DatabaseContext } from "./DatabaseProvider";
import { Dialog } from "./ModalDialogProvider";
import TagSelector, { Tag } from "./TagSelector";
import { Chord, Track } from "./types";

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

const RECOMMENDED_MINIMUM_TRACKS = 10;

const ChordProgressionGeneratorDialog: Dialog = (props) => {
  const { tracks } = useContext(DatabaseContext)!;
  const tags = createMemo(() => getAllTags(tracks() ?? []));
  const [include, setInclude] = createSignal([] as string[]);
  const [required, setRequired] = createSignal([] as string[]);
  const [exclude, setExclude] = createSignal([] as string[]);
  const [showMustSelectTracksHint, setShowMustSelectTracksHint] =
    createSignal(false);
  const [
    showRecommendedMinimumTracksHint,
    setShowRecommendedMinimumTracksHint,
  ] = createSignal(false);
  const [beginningChords, setBeginningChords] = createSignal([] as Chord[]);
  const [keySignature, setKeySignature] = createSignal(0);
  const selectedTracks = createMemo(() =>
    (tracks() ?? []).filter(
      (track) =>
        include().some((tag) => track.tags.includes(tag)) &&
        required().every((tag) => track.tags.includes(tag)) &&
        !exclude().some((tag) => track.tags.includes(tag))
    )
  );
  function generate() {}
  return (
    <div class={styles.ChordProgressionGeneratorDialog}>
      <h2>Generate Chords</h2>
      <fieldset>
        <legend>Include</legend>
        <p>Tracks with any of these tags will be used to train the AI.</p>
        <TagSelector
          selectedTags={include()}
          allTags={tags()}
          setSelectedTags={setInclude}
        />
      </fieldset>
      <details class={styles.filterOptionsDetails}>
        <summary>Filter</summary>
        <div class={styles.filterOptions}>
          <fieldset>
            <legend>Require</legend>
            <p>
              Tracks without all of the below selected tags will be excluded.
            </p>
            <TagSelector
              selectedTags={required()}
              allTags={tags()}
              setSelectedTags={setRequired}
            />
          </fieldset>
          <fieldset>
            <legend>Exclude</legend>
            <p>Tracks with any of these tags will be excluded.</p>
            <TagSelector
              selectedTags={exclude()}
              allTags={tags()}
              setSelectedTags={setExclude}
            />
          </fieldset>
        </div>
      </details>
      <p class={styles.hint}>{selectedTracks().length} tracks selected</p>
      <details class={styles.beginningSequenceDetails}>
        <summary>Beginning sequence</summary>
        <p>
          The AI will predict what might come next in this sequence, based on
          the tracks you selected.
        </p>
        <ChordProgressionEditor
          chords={beginningChords()}
          setChords={setBeginningChords}
          keySignature={keySignature()}
          setKeySignature={setKeySignature}
          // Placeholder should show maximum number of chords to put in
        />
      </details>
      <Show when={selectedTracks().length === 0 && showMustSelectTracksHint()}>
        <p class={styles.hint}>
          You must select at least one track to train the AI.
        </p>
      </Show>
      <Show
        when={
          selectedTracks().length > 0 &&
          selectedTracks().length < RECOMMENDED_MINIMUM_TRACKS &&
          showRecommendedMinimumTracksHint()
        }
      >
        <p class={styles.hint}>
          You&rsquo;ll want a lot more data than that to get a decent result. Or, click &ldquo;Generate
          anyway.&rdquo;
        </p>
      </Show>
      <menu>
        <button onClick={() => props.close()}>Cancel</button>
        <button
          class="primary"
          onClick={() => {
            if (selectedTracks().length === 0) {
              setShowMustSelectTracksHint(true);
              return;
            }
            if (selectedTracks().length < RECOMMENDED_MINIMUM_TRACKS) {
              if (showRecommendedMinimumTracksHint()) {
                setShowRecommendedMinimumTracksHint(false);
                // Generate anyway
              } else setShowRecommendedMinimumTracksHint(true);
              return;
            }
            generate();
          }}
        >
          Generate
          <Show
            when={
              selectedTracks().length > 0 &&
              selectedTracks().length < RECOMMENDED_MINIMUM_TRACKS &&
              showRecommendedMinimumTracksHint()
            }
          >
            {" "}
            Anyway
          </Show>
        </button>
      </menu>
    </div>
  );
};

export default ChordProgressionGeneratorDialog;
