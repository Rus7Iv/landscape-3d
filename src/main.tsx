import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./style.css";
import HomePage from "./pages/HomePage";
import SolarSystemPage from "./pages/SolarSystemPage";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/solar-system" element={<SolarSystemPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
