import { createEffect, createMemo, Show, useContext } from "solid-js";
import {
  defaultModelSettings,
  Model,
  preloadTensorflow,
} from "../chord-generation";
import detailsSummary from "../styles/details-summary.module.css";
import { Track } from "../types";
import { DatabaseContext } from "./DatabaseProvider";
import wrapModal from "./ModalDialogWrapper";
import styles from "./ModelTrainerDialog.module.css";
import ProgressBar from "./ProgressBar";
import { ResettableSignalContext } from "./ResettableSignalContext";
import TagSelector, { Tag } from "./TagSelector";

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

export interface Props {
  openChordProgressionGeneratorDialog(model: Model): void;
}

const ModelTrainerDialog = wrapModal<Props>((props) => {
  const { tracks } = useContext(DatabaseContext)!;
  const { createSignal } = useContext(ResettableSignalContext)!;
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
  const selectedTracks = createMemo(() =>
    (tracks() ?? []).filter(
      (track) =>
        include().some((tag) => track.tags.includes(tag)) &&
        required().every((tag) => track.tags.includes(tag)) &&
        !exclude().some((tag) => track.tags.includes(tag))
    )
  );
  const [model, setModel] = createSignal<Model | undefined>(undefined);
  const [progress, setProgress] = createSignal<number | "indeterminate">(0);
  const [progressBarText, setProgressBarText] = createSignal("");
  let openChordProgressionGeneratorDialog: ((m: Model) => void) | undefined;
  createEffect(() => {
    preloadTensorflow();
    props.onOpen(({ openChordProgressionGeneratorDialog: openDialog }) => {
      openChordProgressionGeneratorDialog = openDialog;
    });
  });
  async function train() {
    props.setDirty();
    setModel(new Model(defaultModelSettings));
    try {
      await model()!.train(selectedTracks(), (newProgress, text) => {
        setProgress(() => newProgress);
        setProgressBarText(text);
      });
      props.close();
      // Wait for animation to finish too
      setTimeout(() => {
        openChordProgressionGeneratorDialog?.(model()!);
      }, 200);
    } catch (e) {
      if (!(e instanceof Model.TrainingCancelledError)) {
        setProgress(0);
        setProgressBarText("Error; try again.");
        setModel(undefined);
        throw e;
      }
    }
  }
  function cancel() {
    model()?.cancelTraining();
    props.close();
  }
  return (
    <div class={styles.ModelTrainerDialog}>
      <h2>Train AI</h2>
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
        <div class={detailsSummary.indented}>
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
          You&rsquo;ll want a lot more data than that to get a decent result.
          Or, click &ldquo;Train anyway.&rdquo;
        </p>
      </Show>
      <menu>
        <button onClick={cancel}>Cancel</button>
        <button
          class="primary"
          disabled={model() != null}
          onClick={() => {
            if (selectedTracks().length === 0) {
              setShowMustSelectTracksHint(true);
              return;
            }
            if (selectedTracks().length < RECOMMENDED_MINIMUM_TRACKS) {
              if (showRecommendedMinimumTracksHint()) {
                // Train anyway
                setShowRecommendedMinimumTracksHint(false);
              } else {
                setShowRecommendedMinimumTracksHint(true);
                return;
              }
            }
            train();
          }}
        >
          {model()?.hasBeenTrained() ? "Re-train" : "Train"}
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
      <Show when={model()}>
        <ProgressBar value={progress()} text={progressBarText()} />
      </Show>
    </div>
  );
});

export default ModelTrainerDialog;
