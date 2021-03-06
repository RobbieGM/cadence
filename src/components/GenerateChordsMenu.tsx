import classNames from "classnames";
import Dismiss from "solid-dismiss";
import { Component, createSignal, For, lazy, useContext } from "solid-js";
import Delete from "../icons/Delete";
import Plus from "../icons/Plus";
import Run from "../icons/Run";
import useKeyboardShortcut from "../use-keyboard-shortcut";
import { Props as ChordProgressionGeneratorDialogProps } from "./ChordProgressionGeneratorDialog";
import { DatabaseContext } from "./DatabaseProvider";
import styles from "./GenerateChordsMenu.module.css";
import headerStyles from "./Header.module.css";
import { Props as ModelTrainerDialogProps } from "./ModelTrainerDialog";

interface Props {
  onAttemptGenerationWithoutTracks(): void;
}

const GenerateChordsMenu: Component<Props> = (props) => {
  const ModelTrainerDialog = lazy(() => import("./ModelTrainerDialog"));
  const ChordProgressionGeneratorDialog = lazy(
    () => import("./ChordProgressionGeneratorDialog")
  );
  const { modelNames, deleteModel, getModel, tracks } =
    useContext(DatabaseContext)!;
  const [open, setOpen] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;
  let trainButton: HTMLButtonElement | undefined;
  let openModelTrainerDialog: (p: ModelTrainerDialogProps) => void;
  let openChordProgressionGeneratorDialog: (
    p: ChordProgressionGeneratorDialogProps
  ) => void;
  function generateChords(focusFirstButton = false) {
    if (!tracks()?.length) {
      props.onAttemptGenerationWithoutTracks();
      return;
    }
    if (modelNames()?.length === 0) {
      // Prompt to train new model instead
      openModelTrainerDialog({
        openChordProgressionGeneratorDialog: (model) =>
          openChordProgressionGeneratorDialog({ model }),
      });
      return;
    }
    setOpen(true);
    if (focusFirstButton) {
      trainButton?.focus();
    }
  }
  useKeyboardShortcut(["Ctrl", "KeyG"], () => generateChords(true));
  return (
    <div class={styles.wrapper}>
      <button type="button" ref={buttonRef} class={headerStyles.headerButton}>
        <Run />
        Generate chords
        <kbd aria-label="Control G">^G</kbd>
      </button>
      <Dismiss
        menuButton={buttonRef}
        open={open}
        setOpen={(newOpen) => {
          if (newOpen) {
            generateChords();
          } else {
            setOpen(false);
          }
        }}
        animation={{
          enterClass: styles.animateFrom,
          enterToClass: styles.animateTo,
          exitClass: styles.animateTo,
          exitToClass: styles.animateFrom,
        }}
        class={styles.dropdown}
        cursorKeys
      >
        <menu>
          <button
            ref={trainButton}
            class={styles.trainButton}
            onClick={() => {
              openModelTrainerDialog({
                openChordProgressionGeneratorDialog: (model) =>
                  openChordProgressionGeneratorDialog({ model }),
              });
              setOpen(false);
            }}
          >
            <Plus />
            Train AI&hellip;
          </button>
          <ul>
            <For each={modelNames()}>
              {(name) => (
                <li>
                  <button
                    class={styles.useModelButton}
                    onKeyDown={(e) => {
                      if (e.key === "Delete" || e.key === "Backspace")
                        deleteModel(name);
                    }}
                    onClick={() => {
                      setOpen(false);
                      openChordProgressionGeneratorDialog({
                        model: getModel(name),
                      });
                    }}
                  >
                    {name}
                  </button>
                  <button
                    class={classNames("icon-only", styles.deleteButton)}
                    onClick={() => deleteModel(name)}
                    tabIndex={-1}
                  >
                    <Delete />
                  </button>
                </li>
              )}
            </For>
          </ul>
        </menu>
      </Dismiss>
      <ModelTrainerDialog
        ref={({ open: openFunc }) => {
          openModelTrainerDialog = (p) => {
            openFunc(p);
          };
        }}
      />
      <ChordProgressionGeneratorDialog
        ref={({ open: openFunc }) => {
          openChordProgressionGeneratorDialog = openFunc;
        }}
      />
    </div>
  );
};

export default GenerateChordsMenu;
