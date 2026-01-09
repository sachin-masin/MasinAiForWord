import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./brandStyles.css";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { AuthProvider } from "./components/Auth/AuthProvider";

const title = "MasinAI for Word";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

Office.onReady((info) => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <AuthProvider>
        <App title={title} />
      </AuthProvider>
    </FluentProvider>
  );
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root?.render(NextApp);
  });
}
