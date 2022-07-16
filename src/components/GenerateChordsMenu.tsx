import classNames from "classnames";
import Dismiss from "solid-dismiss";
import { Component, createSignal, For, lazy, useContext } from "solid-js";
import Delete from "../icons/Delete";
import Plus from "../icons/Plus";
import Run from "../icons/Run";
import { Props as ChordProgressionGeneratorDialogProps } from "./ChordProgressionGeneratorDialog";
import { DatabaseContext } from "./DatabaseProvider";
import styles from "./GenerateChordsMenu.module.css";
import { Props as ModelTrainerDialogProps } from "./ModelTrainerDialog";

const GenerateChordsMenu: Component = () => {
  const ModelTrainerDialog = lazy(() => import("./ModelTrainerDialog"));
  const ChordProgressionGeneratorDialog = lazy(
    () => import("./ChordProgressionGeneratorDialog")
  );
  const { modelNames, deleteModel, getModel } = useContext(DatabaseContext)!;
  const [open, setOpen] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;
  let openModelTrainerDialog: (props: ModelTrainerDialogProps) => void;
  let openChordProgressionGeneratorDialog: (
    props: ChordProgressionGeneratorDialogProps
  ) => void;
  return (
    <div class={styles.wrapper}>
      <button type="button" ref={buttonRef}>
        <Run />
        Generate chords
      </button>
      <Dismiss
        menuButton={buttonRef}
        open={open}
        setOpen={(newOpen) => {
          // Ignore setting open to true (happens when the button is clicked) unless there are model names
          if (newOpen && modelNames()?.length === 0) {
            // Prompt to train new model instead
            openModelTrainerDialog({
              openChordProgressionGeneratorDialog: (model) =>
                openChordProgressionGeneratorDialog({ model }),
            });
            return;
          }
          setOpen(newOpen);
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
