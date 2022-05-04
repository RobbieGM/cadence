import { createContext, createSignal } from "solid-js";
import type { Component } from "solid-js";

import styles from "./ModalDialogProvider.module.css";

type Dialog = Component<{ close(): void }>;
interface ModalDialogContextType {
  showDialog(dialog: Dialog): void;
}

interface HTMLDialogElement extends HTMLElement {
  showModal(): void;
  close(): void;
}

export const ModalDialogContext = createContext<ModalDialogContextType>();
const ModalDialogProvider: Component = (props) => {
  const [dialog, setDialog] = createSignal<Dialog>();
  const [closing, setClosing] = createSignal(false);
  let ref: HTMLDialogElement | undefined;
  return (
    <ModalDialogContext.Provider
      value={{
        showDialog(newDialog: Dialog) {
          setDialog(() => newDialog);
          ref?.showModal();
        },
      }}
    >
      {props.children}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={ref}
        class={`${styles.Dialog} ${closing() ? styles.closing : ""}`}
        onClick={(e) => {
          if (e.target.tagName !== "DIALOG") return;
          const rect = e.target.getBoundingClientRect();
          const clickedInDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;
          if (!clickedInDialog) ref?.close();
        }}
      >
        {(() => {
          const Dialog = dialog();
          return Dialog ? <Dialog close={() => ref?.close()} /> : null;
        })()}
      </dialog>
    </ModalDialogContext.Provider>
  );
};

export default ModalDialogProvider;
