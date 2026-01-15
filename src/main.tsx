import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import HomePage from "./pages/HomePage";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
