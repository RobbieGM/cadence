/* @refresh reload */
import { ErrorBoundary, render } from "solid-js/web";

import "./index.css";
import App from "./App";
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
      <ModalDialogProvider>
        <App />
      </ModalDialogProvider>
    </ErrorBoundary>
  ),
  document.getElementById("root") as HTMLElement
);
