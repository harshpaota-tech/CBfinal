import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n/index.js"; // initialize i18next before any component uses t()
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
