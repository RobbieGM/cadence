import { createContext, createSignal, ParentComponent, Signal } from "solid-js";

interface ResettableContextType {
  /**
   * A substitute for the usual solidjs createSignal which can be reset
   */
  createSignal<U>(value: U): Signal<U>;
  reset(): void;
}

export const ResettableSignalContext = createContext<ResettableContextType>();

const ResettableSignalProvider: ParentComponent = (props) => {
  const signalResetters = [] as Array<() => void>;
  return (
    <ResettableSignalContext.Provider
      value={{
        createSignal(initial) {
          const [value, setValue] = createSignal(initial);
          signalResetters.push(() => setValue(() => initial));
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
