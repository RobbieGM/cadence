import { createContext, createSignal, ParentComponent, Signal } from "solid-js";

interface ResettableContextType {
  /**
   * A substitute for the usual solidjs createSignal which can be reset
   */
  createSignal<U>(value: U): Signal<U>;
  createSignal<U>(value: () => U): Signal<U>;
  reset(): void;
}

export const ResettableSignalContext = createContext<ResettableContextType>();

const ResettableSignalProvider: ParentComponent = (props) => {
  const signalResetters = [] as Array<() => void>;
  return (
    <ResettableSignalContext.Provider
      value={{
        createSignal<U>(initial: U | (() => U)) {
          const getInitial =
            typeof initial === "function"
              ? (initial as () => U)
              : () => initial;
          const [value, setValue] = createSignal(getInitial());
          signalResetters.push(() => setValue(getInitial));
          return [value, setValue];
        },
        reset() {
          signalResetters.forEach((f) => f());
        },
      }}
    >
      {props.children}
    </ResettableSignalContext.Provider>
  );
};

export default ResettableSignalProvider;
