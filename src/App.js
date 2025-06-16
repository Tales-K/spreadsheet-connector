import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ArcherContainer } from "react-archer";
import CsvUploader from "./CsvUploader";
import CsvTable from "./CsvTable";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { useSpreadsheetConnector } from "./hooks/useSpreadsheetConnector";
import Header from "./components/Header";
import ActionButtons from "./components/ActionButtons";
import "./App.css";

function AppContent() {
  const {
    leftCsvData,
    rightCsvData,
    leftCsvHeaders,
    rightCsvHeaders,
    relations,
    archerRef,
    formatUpdateKey,
    leftLinkingColumn,
    rightLinkingColumn,
    handleFileUpload,
    addRelation,
    removeRelation,
    removeAllRelations,
    handleColumnAction,
    handleAutoLink,
  } = useSpreadsheetConnector();
  const { t } = useLanguage();

  const tableTexts = {
    formatToNumber: t("formatToNumber"),
    usToUkDate: t("usToUkDate"),
    sortAscending: t("sortAscending"),
    sortDescending: t("sortDescending"),
    removeSort: t("removeSort"),
    selectForLinking: t("selectForLinking"),
    removeAsLinkingColumn: t("removeAsLinkingColumn"),
    columnHeaderConnect: t("columnHeaderConnect"),
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ArcherContainer
        ref={archerRef}
        strokeColor="#9e9e9e"
        relations={relations}
        lineStyle="curve"
      >
        <div className="App">
          <Header />
          <ActionButtons
            onAutoLink={handleAutoLink}
            onRemoveAll={removeAllRelations}
          />
          <div className="csv-container">
            <div className="csv-section">
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "left")}
                buttonText={t("chooseFile")}
                tableId="left"
              />
              {leftCsvData.length > 0 && (
                <CsvTable
                  key={`left-table-${formatUpdateKey}`}
                  headers={leftCsvHeaders}
                  data={leftCsvData}
                  tableId="left"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef}
                  onColumnAction={handleColumnAction}
                  linkingColumn={leftLinkingColumn}
                  texts={tableTexts}
                />
              )}
            </div>
            <div className="csv-section">
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "right")}
                buttonText={t("chooseFile")}
                tableId="right"
              />
              {rightCsvData.length > 0 && (
                <CsvTable
                  key={`right-table-${formatUpdateKey}`}
                  headers={rightCsvHeaders}
                  data={rightCsvData}
                  tableId="right"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef}
                  onColumnAction={handleColumnAction}
                  linkingColumn={rightLinkingColumn}
                  texts={tableTexts}
                />
              )}
            </div>
          </div>
        </div>
      </ArcherContainer>
    </DndProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
