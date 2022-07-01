/* @refresh reload */
import { ErrorBoundary, render } from "solid-js/web";
import App from "./App";
import DatabaseProvider from "./DatabaseProvider";
import "./index.css";
import "requestidlecallback-polyfill"; // https://caniuse.com/requestidlecallback
import ModalDialogProvider from "./ModalDialogProvider";

render(
  () => (
    <ErrorBoundary
      fallback={(error: any) => {
        // eslint-disable-next-line no-console
        console.error("Error", error);
        return <p>A serious error occurred. Check the console for details.</p>;
      }}
    >
      <DatabaseProvider>
        <ModalDialogProvider>
          <App />
        </ModalDialogProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  ),
  document.getElementById("root") as HTMLElement
);
