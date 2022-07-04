import classNames from "classnames";
import Dismiss from "solid-dismiss";
import { Component, createSignal, For, lazy, useContext } from "solid-js";
import Delete from "../icons/Delete";
import Plus from "../icons/Plus";
import Run from "../icons/Run";
import createChordProgressionGeneratorDialog from "./ChordProgressionGeneratorDialog";
import { DatabaseContext } from "./DatabaseProvider";
import styles from "./GenerateChordsMenu.module.css";
import { ModalDialogContext } from "./ModalDialogProvider";

const GenerateChordsMenu: Component = () => {
  const { showDialog } = useContext(ModalDialogContext)!;
  const ModelTrainerDialog = lazy(() => import("./ModelTrainerDialog"));
  const { modelNames, deleteModel, getModel } = useContext(DatabaseContext)!;
  const [open, setOpen] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;
  return (
    <div class={styles.wrapper}>
      <button type="button" ref={buttonRef}>
        <Run />
        Generate chords
      </button>
      <Dismiss
        menuButton={buttonRef}
        open={open}
        setOpen={(open) => {
          // Ignore setting open to true (happens when the button is clicked) unless there are model names
          if (open && modelNames()?.length === 0) {
            // Prompt to train new model instead
            showDialog(ModelTrainerDialog);
            return;
          }
          setOpen(open);
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
              showDialog(ModelTrainerDialog);
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
                      const ChordProgressionGeneratorDialog =
                        createChordProgressionGeneratorDialog(getModel(name));
                      showDialog(ChordProgressionGeneratorDialog);
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
    </div>
  );
};

export default GenerateChordsMenu;
