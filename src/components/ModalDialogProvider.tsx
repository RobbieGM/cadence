import { debugOwnerComputations } from "@solid-devtools/logger";
import {
  Component,
  createEffect,
  createSignal,
  ParentComponent,
} from "solid-js";
import styles from "./ModalDialogProvider.module.css";

interface DialogProps {
  open: boolean;
  onClickOutside(): void;
}

interface HTMLDialogElement extends HTMLElement {
  showModal(): void;
  close(): void;
  open: boolean;
}

const ModalDialogWrapper: ParentComponent<DialogProps> = (props) => {
  let dialog: HTMLDialogElement | undefined;
  debugOwnerComputations();
  createEffect(
    // on(
    //   () => props.open,
    () => {
      if (props.open) {
        console.debug(".showModal(), is open:", dialog?.open);
        try {
          dialog?.showModal();
        } catch (err) {
          console.error("Failed to open dialog", err);
        }
      } else {
        console.debug(".close(), is open:", dialog?.open);
        dialog?.close();
      }
    }
    // )
  );
  createEffect(() => {
    console.debug("props.open", props.open, "dialog.open", dialog?.open);
  });
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
    if (!clickedInDialog) {
      dialog?.close();
      props.onClickOutside();
    }
    e.stopPropagation();
  }
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={dialog}
      class={styles.Dialog}
      onTouchStart={mouseDown}
      onMouseDown={mouseDown}
    >
      {props.children}
    </dialog>
  );
};

/**
 * Props from the component containing the dialog
 */
interface ExternalDialogProps<T> {
  ref: (value: { open(props: T): void }) => void;
}

/**
 * Props visible to the dialog component itself
 */
interface InternalDialogProps<T> {
  close(): void;
  onOpen(handler: (props: T) => void): void;
}

export default function wrapModal<T>(
  Wrapped: Component<InternalDialogProps<T>>
): Component<ExternalDialogProps<T>> {
  return (props) => {
    let onOpen: (p: T) => void | undefined;
    const [open, setOpen] = createSignal(false);
    createEffect(() => {
      props.ref({
        open(p) {
          setOpen(true);
          onOpen(p);
        },
      });
    });
    return (
      <ModalDialogWrapper open={open()} onClickOutside={() => setOpen(false)}>
        <Wrapped
          close={() => setOpen(false)}
          onOpen={(handler) => {
            onOpen = handler;
          }}
        />
      </ModalDialogWrapper>
    );
  };
}
