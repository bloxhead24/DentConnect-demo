import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { applyWindowsFixes, addWindowsEventListeners } from "./utils/windowsCompatibility";

// Apply Windows compatibility fixes
applyWindowsFixes();

// Add Windows event listeners
document.addEventListener('DOMContentLoaded', () => {
  addWindowsEventListeners();
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
