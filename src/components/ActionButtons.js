import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function ActionButtons({ onAutoLink, onRemoveAll }) {
  const { t } = useLanguage();
  return (
    <div className="action-buttons-container">
      <button onClick={onAutoLink} className="action-button">
        {t("autoLinkButton")}
      </button>
      <button onClick={onRemoveAll} className="action-button">
        {t("removeAllLinksButton")}
      </button>
    </div>
  );
}
