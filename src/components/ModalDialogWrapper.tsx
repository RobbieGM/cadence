import classNames from "classnames";
import {
  Component,
  createEffect,
  createSignal,
  on,
  ParentComponent,
  useContext,
} from "solid-js";
import styles from "./ModalDialogWrapper.module.css";
import ResettableSignalProvider, {
  ResettableSignalContext,
} from "./ResettableSignalContext";

interface DialogProps {
  open: boolean;
  dirty?: boolean;
  onClose(): void;
}

class BackgroundScrollPreventer {
  scrollTop = 0;

  openDialogs = 0;

  private static hasScrollbar() {
    return (
      document.documentElement.scrollHeight >
      document.documentElement.clientHeight
    );
  }

  private static scrollbarHasWidth() {
    // Mobile devices and Mac have overlay scrollbars, others have normal ones
    // Checking for this "properly" (with clientWidth) would force synchronous layout
    const platform =
      ((navigator as any).userAgentData?.platform as string) ??
      navigator.platform;
    if (platform.startsWith("Mac")) return false;
    if ((navigator as any).userAgentData?.mobile) return false;
    if (platform.startsWith("Android")) return false;
    if (platform.startsWith("iP")) return false;
    return true;
  }

  dialogOpened() {
    this.openDialogs += 1;
    if (this.openDialogs === 1 && BackgroundScrollPreventer.hasScrollbar()) {
      if (BackgroundScrollPreventer.scrollbarHasWidth()) {
        this.scrollTop = document.documentElement.scrollTop;
        document.body.style.top = `-${this.scrollTop}px`;
        document.body.classList.add("scroll-disabled");
      } else {
        document.body.style.overflowY = "hidden";
      }
    }
  }

  dialogClosed() {
    this.openDialogs -= 1;
    if (this.openDialogs === 0) {
      if (BackgroundScrollPreventer.scrollbarHasWidth()) {
        document.body.classList.remove("scroll-disabled");
        document.documentElement.scrollTop = this.scrollTop;
        document.body.style.removeProperty("top");
      } else {
        document.body.style.overflowY = "auto";
      }
    }
  }
}

const backgroundScrollPreventer = new BackgroundScrollPreventer();

const ModalDialogWrapper: ParentComponent<DialogProps> = (props) => {
  let dialog: HTMLDialogElement | undefined;
  createEffect(
    on(
      () => props.open,
      () => {
        if (props.open) {
          dialog?.showModal();
        } else {
          dialog?.close();
        }
      }
    )
  );
  function mouseDown(
    e: (TouchEvent | MouseEvent) & {
      currentTarget: HTMLElement;
      target: Element;
    }
  ) {
    if (e.target.tagName !== "DIALOG") return;
    const [clientX, clientY] =
      "touches" in e
        ? [e.touches[0].clientX, e.touches[0].clientY]
        : [e.clientX, e.clientY];
    const clickedOutside = () => {
      const rect = e.target.getBoundingClientRect();
      return !(
        rect.top <= clientY &&
        clientY <= rect.top + rect.height &&
        rect.left <= clientX &&
        clientX <= rect.left + rect.width
      );
    };

    if (!props.dirty && clickedOutside()) {
      dialog?.close();
      props.onClose();
    }
    e.stopPropagation();
  }
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={dialog}
      class={classNames(styles.Dialog, props.open && styles.open)}
      onTouchStart={mouseDown}
      onMouseDown={mouseDown}
      // @ts-ignore
      onClose={() => props.onClose()}
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
  /**
   * Indicate that there is unsaved data in the dialog and it will not be closed by clicking outside which is easier to do accidentally.
   */
  setDirty(): void;
}

export default function wrapModal<T>(
  Wrapped: Component<InternalDialogProps<T>>
): Component<ExternalDialogProps<T>> {
  const Inner = (props: ExternalDialogProps<T>) => {
    let onOpen: (p: T) => void | undefined;
    let hasBeenOpened = false;
    const [open, setOpen] = createSignal(false);
    const { reset, createSignal: createResettableSignal } = useContext(
      ResettableSignalContext
    )!;
    const [dirty, setDirty] = createResettableSignal(false);
    createEffect(() => {
      props.ref({
        open(p) {
          if (hasBeenOpened) {
            reset();
          } else {
            hasBeenOpened = true;
          }
          setOpen(true);
          backgroundScrollPreventer.dialogOpened();
          onOpen(p);
        },
      });
    });
    return (
      <ModalDialogWrapper
        open={open()}
        onClose={() => {
          setOpen(false);
          backgroundScrollPreventer.dialogClosed();
        }}
        dirty={dirty()}
      >
        <Wrapped
          close={() => setOpen(false)}
          onOpen={(handler) => {
            onOpen = (p) => {
              handler(p);
            };
          }}
          setDirty={() => setDirty(true)}
        />
      </ModalDialogWrapper>
    );
  };
  const Outer = (props: ExternalDialogProps<T>) => (
    <ResettableSignalProvider>
      <Inner {...props} />
    </ResettableSignalProvider>
  );
  return Outer;
}
