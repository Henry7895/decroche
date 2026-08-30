import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import CvBuilder from "./pages/CvBuilder";
import CoverLetterBuilder from "./pages/CoverLetterBuilder";
import "./index.css";

// La route "/" utilise App.tsx (accueil + découvrir + swipe + profil, avec
// les vraies animations Motion). Les autres routes restent des pages dédiées
// simples (connexion, CV...). Prochaine étape : brancher DiscoverGrid/SwipeDeck
// sur jobsService.fetchJobs() au lieu de DEMO_JOBS une fois Supabase configuré.
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/decroche/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/decroche">
      <Routes>
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
        <Route path="/cv" element={<CvBuilder />} />
        <Route path="/lettre" element={<CoverLetterBuilder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
