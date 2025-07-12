import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./polyfills/ie11";
import { applyWindowsFixes, addWindowsEventListeners } from "./utils/windowsCompatibility";

// Apply Windows compatibility fixes
applyWindowsFixes();

// Add Windows event listeners
document.addEventListener('DOMContentLoaded', () => {
  addWindowsEventListeners();
});

// Test with simple app first
const testMode = window.location.search.includes('test=simple');
if (testMode) {
  import('./App.simple').then(({ default: SimpleApp }) => {
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <SimpleApp />
      </React.StrictMode>
    );
  });
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
