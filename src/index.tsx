/* @refresh reload */
import "requestidlecallback-polyfill"; // https://caniuse.com/requestidlecallback
import { ErrorBoundary, render } from "solid-js/web";
import { registerSW } from "virtual:pwa-register";
import App from "./components/App";
import DatabaseProvider from "./components/DatabaseProvider";
import "./styles/index.css";

render(
  () => (
    <ErrorBoundary
      fallback={(error: any) => {
        // eslint-disable-next-line no-console
        console.error("Error", error);
        return (
          <div style="margin: 8px">
            <p>A serious error occurred. Check the console for details.</p>
            <button class="primary" onClick={() => window.location.reload()}>
              Reload
            </button>
            <details>
              <summary>Error details</summary>
              {error.toString()}
            </details>
          </div>
        );
      }}
    >
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </ErrorBoundary>
  ),
  document.getElementById("root") as HTMLElement
);

registerSW({});
