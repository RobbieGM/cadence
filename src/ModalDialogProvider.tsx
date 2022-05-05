import { createContext, createSignal } from "solid-js";
import type { Component } from "solid-js";

import styles from "./ModalDialogProvider.module.css";

export interface DialogProps {
  close(): void;
}
export type Dialog = Component<DialogProps>;
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
  let ref: HTMLDialogElement | undefined;
  function mouseDown(
    e: (TouchEvent | MouseEvent) & {
      currentTarget: HTMLElement;
      target: Element;
    }
  ) {
    if (e.target.tagName !== "DIALOG") return;
    const rect = e.target.getBoundingClientRect();
    const [clientX, clientY] =
      "touches" in e
        ? [e.touches[0].clientX, e.touches[0].clientY]
        : [e.clientX, e.clientY];
    const clickedInDialog =
      rect.top <= clientY &&
      clientY <= rect.top + rect.height &&
      rect.left <= clientX &&
      clientX <= rect.left + rect.width;
    if (!clickedInDialog) ref?.close();
    e.stopPropagation();
  }
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
        class={styles.Dialog}
        onTouchStart={mouseDown}
        onMouseDown={mouseDown}
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
