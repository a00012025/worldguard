import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { VerificationProvider } from "./contexts/VerificationContext.tsx";
import { MiniKitProvider } from "./contexts/MiniKitContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <VerificationProvider>
        <MiniKitProvider>
          <App />
        </MiniKitProvider>
      </VerificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
