import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Log ANY error that would otherwise blank the page
window.addEventListener("error", (e) => {
  console.error("[window.error]", e.error || e.message || e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandledrejection]", e.reason);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("No #root element found in index.html");
} else {
  console.log("Mounting React into #root…");
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
