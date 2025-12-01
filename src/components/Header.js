import React from "react";
import logo from "../assets/logo.png";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <header className="App-header">
      <div className="header-content">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{t("headerTitle")}</h1>
      </div>
      <div className="language-switcher">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="lang-select"
          aria-label="Select language"
        >
          <option value="en">{t("languageEN")} - English</option>
          <option value="pt">{t("languagePT")} - Português</option>
        </select>
      </div>
    </header>
  );
}
