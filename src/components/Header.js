import React from "react";
import logo from "../assets/logo.png";
import { useLanguage } from "../context/LanguageContext";
import { ReactComponent as FlagEN } from "../assets/flag_en.svg";
import { ReactComponent as FlagPT } from "../assets/flag_pt.svg";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="App-header">
      <div className="header-content">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{t("headerTitle")}</h1>
      </div>
      <div className="language-switcher">
        <button
          onClick={() => setLanguage("en")}
          className={`lang-button ${language === "en" ? "active" : ""}`}
          title="English"
        >
          <FlagEN />
          <span className="lang-text">{t("languageEN")}</span>
        </button>
        <button
          onClick={() => setLanguage("pt")}
          className={`lang-button ${language === "pt" ? "active" : ""}`}
          title="Português"
        >
          <FlagPT />
          <span className="lang-text">{t("languagePT")}</span>
        </button>
      </div>
    </header>
  );
}
