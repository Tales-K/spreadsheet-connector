import React, { useState, useCallback, useRef, useEffect } from "react";
import Papa from "papaparse";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ArcherContainer } from "react-archer";
import CsvUploader from "./CsvUploader";
import CsvTable from "./CsvTable";
import logo from "./assets/logo.png"; // Import the logo from assets
import "./App.css";
import { formatToNumber, formatUsToUkDate } from "./utils/formattingUtils";
import { translations } from "./translations";
import { ReactComponent as FlagEN } from "./assets/flag_en.svg"; // Import EN flag
import { ReactComponent as FlagPT } from "./assets/flag_pt.svg"; // Import PT flag

function App() {
  const [leftCsvData, setLeftCsvData] = useState([]);
  const [rightCsvData, setRightCsvData] = useState([]);
  const [leftCsvHeaders, setLeftCsvHeaders] = useState([]);
  const [rightCsvHeaders, setRightCsvHeaders] = useState([]);
  const [relations, setRelations] = useState([]);
  const archerRef = useRef(null); // Create a ref for ArcherContainer
  const [formatUpdateKey, setFormatUpdateKey] = useState(0); // Key for forcing CsvTable re-render
  const [leftLinkingColumn, setLeftLinkingColumn] = useState(null); // New state
  const [rightLinkingColumn, setRightLinkingColumn] = useState(null); // New state
  const [language, setLanguage] = useState("en"); // Language state, default 'en'

  // Function to get current translations
  const t = useCallback(
    (key) => {
      return translations[language][key] || key; // Fallback to key if translation not found
    },
    [language]
  );

  // Update document title when language changes
  useEffect(() => {
    document.title = t("appTitle");
  }, [t]);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  const handleFileUpload = (file, side) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields;
        const data = results.data.map((row, index) => ({
          ...row,
          id: `${side}-row-${index}`,
        }));
        if (side === "left") {
          setLeftCsvData(data);
          setLeftCsvHeaders(headers);
        } else {
          setRightCsvData(data);
          setRightCsvHeaders(headers);
        }
        // Reset relations when a new file is uploaded
        setRelations([]);
      },
    });
  };

  const addRelation = useCallback((newRelationSource, newRelationTarget) => {
    setRelations((prevRelations) => {
      const newRelation = {
        from: {
          id: newRelationSource.id,
          anchor: newRelationSource.tableId === "left" ? "right" : "left",
        },
        to: {
          id: newRelationTarget.id,
          anchor: newRelationTarget.tableId === "left" ? "right" : "left",
        },
        style: { strokeColor: "#8fbc8f", strokeWidth: 2 }, // DarkSeaGreen - better visibility on dark theme
      };

      // Avoid duplicate relations (either direction)
      const relationExists = prevRelations.find(
        (r) =>
          (r.from.id === newRelation.from.id &&
            r.to.id === newRelation.to.id) ||
          (r.from.id === newRelation.to.id && r.to.id === newRelation.from.id)
      );

      if (relationExists) {
        return prevRelations;
      }
      return [...prevRelations, newRelation];
    });
  }, []);

  const removeRelation = useCallback((rowId) => {
    setRelations((prevRelations) =>
      prevRelations.filter((r) => r.from.id !== rowId && r.to.id !== rowId)
    );
  }, []);

  const removeAllRelations = useCallback(() => {
    setRelations([]);
    if (archerRef.current) {
      archerRef.current.refreshScreen(); // Refresh Archer to remove lines
    }
  }, [archerRef]);

  const handleColumnAction = useCallback(
    (tableId, columnAccessor, actionType) => {
      console.log(
        `handleColumnAction called with: tableId=${tableId}, columnAccessor=${columnAccessor}, actionType=${actionType}`
      );

      if (actionType === "toggleLinkingColumn") {
        if (tableId === "left") {
          setLeftLinkingColumn((prev) =>
            prev === columnAccessor ? null : columnAccessor
          );
        } else {
          // tableId === "right"
          setRightLinkingColumn((prev) =>
            prev === columnAccessor ? null : columnAccessor
          );
        }
        // No data transformation needed, but CsvTable might re-render due to prop changes.
        // We might need to trigger a key change if the button text depends on this state directly in CsvTable
        // and CsvTable is not re-rendering. However, passing linkingColumn as a prop should suffice.
        setFormatUpdateKey((prevKey) => prevKey + 1); // Force re-render to update button text
        return;
      }

      const setData = tableId === "left" ? setLeftCsvData : setRightCsvData;

      setData((currentData) => {
        const transformedData = currentData.map((row) => {
          const originalValue = row[columnAccessor];
          let newValue = originalValue;

          if (actionType === "formatToNumber") {
            newValue = formatToNumber(originalValue);
          } else if (actionType === "usToUkDate") {
            newValue = formatUsToUkDate(originalValue);
          }
          return { ...row, [columnAccessor]: newValue };
        });

        if (
          transformedData.length > 0 &&
          transformedData[0].hasOwnProperty(columnAccessor)
        ) {
          console.log(
            `Formatted value of first cell in column '${columnAccessor}' for table '${tableId}':`,
            transformedData[0][columnAccessor]
          );
        } else {
          console.log(
            `Could not log first cell value for column '${columnAccessor}' in table '${tableId}'. Transformed data might be empty or column accessor is invalid.`
          );
        }
        return transformedData;
      });

      setFormatUpdateKey((prevKey) => prevKey + 1);
      if (archerRef.current) {
        archerRef.current.refreshScreen();
      }
    },
    [
      archerRef,
      setLeftCsvData,
      setRightCsvData,
      setLeftLinkingColumn,
      setRightLinkingColumn,
    ] // Added new setters
  );

  const handleAutoLink = () => {
    if (!leftLinkingColumn || !rightLinkingColumn) {
      alert(t("alertSelectLinkingColumns"));
      return;
    }
    if (leftCsvData.length === 0 || rightCsvData.length === 0) {
      alert(t("alertUploadData"));
      return;
    }

    console.log(
      `Starting auto-link. Left column: ${leftLinkingColumn}, Right column: ${rightLinkingColumn}`
    );

    const relationsToAdd = [];
    leftCsvData.forEach((leftRow) => {
      const leftValue = leftRow[leftLinkingColumn];
      if (leftValue === null || leftValue === undefined) return;

      rightCsvData.forEach((rightRow) => {
        const rightValue = rightRow[rightLinkingColumn];
        if (rightValue === null || rightValue === undefined) return;

        if (String(leftValue).trim() === String(rightValue).trim()) {
          relationsToAdd.push({
            source: { id: leftRow.id, tableId: "left" },
            target: { id: rightRow.id, tableId: "right" },
          });
        }
      });
    });

    setRelations((prevRelations) => {
      let updatedRelations = [...prevRelations];
      relationsToAdd.forEach((pair) => {
        const newRelation = {
          from: {
            id: pair.source.id,
            anchor: pair.source.tableId === "left" ? "right" : "left",
          },
          to: {
            id: pair.target.id,
            anchor: pair.target.tableId === "left" ? "right" : "left",
          },
          style: { strokeColor: "#8fbc8f", strokeWidth: 2 }, // DarkSeaGreen
        };

        const relationExists = updatedRelations.find(
          (r) =>
            (r.from.id === newRelation.from.id &&
              r.to.id === newRelation.to.id) ||
            (r.from.id === newRelation.to.id && r.to.id === newRelation.from.id)
        );

        if (!relationExists) {
          updatedRelations.push(newRelation);
        }
      });
      console.log(
        `Auto-linking: ${
          updatedRelations.length - prevRelations.length
        } new links added.`
      );
      return updatedRelations;
    });

    if (archerRef.current) {
      archerRef.current.refreshScreen();
    }
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
          <header className="App-header">
            <div className="header-content">
              <img src={logo} className="App-logo" alt="logo" />
              <h1>{t("headerTitle")}</h1>
            </div>
            <div className="language-switcher">
              <button
                onClick={() => toggleLanguage("en")}
                className={`lang-button ${language === "en" ? "active" : ""}`}
                title="English"
              >
                <FlagEN />
                <span className="lang-text">{t("languageEN")}</span>
              </button>
              <button
                onClick={() => toggleLanguage("pt")}
                className={`lang-button ${language === "pt" ? "active" : ""}`}
                title="Português"
              >
                <FlagPT />
                <span className="lang-text">{t("languagePT")}</span>
              </button>
            </div>
          </header>
          <div className="action-buttons-container">
            <button onClick={handleAutoLink} className="action-button">
              {t("autoLinkButton")}
            </button>
            <button onClick={removeAllRelations} className="action-button">
              {t("removeAllLinksButton")}
            </button>
          </div>
          <div className="csv-container">
            <div className="csv-section">
              <h2>{t("leftCsvTitle")}</h2>
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "left")}
                buttonText={t("chooseFile")}
                tableId="left" // Pass tableId for unique input id
              />
              {leftCsvData.length > 0 && (
                <CsvTable
                  key={`left-table-${formatUpdateKey}-${language}`}
                  headers={leftCsvHeaders}
                  data={leftCsvData}
                  tableId="left"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef}
                  onColumnAction={handleColumnAction}
                  linkingColumn={leftLinkingColumn}
                  texts={{
                    formatToNumber: t("formatToNumber"),
                    usToUkDate: t("usToUkDate"),
                    sortAscending: t("sortAscending"),
                    sortDescending: t("sortDescending"),
                    removeSort: t("removeSort"),
                    selectForLinking: t("selectForLinking"),
                    removeAsLinkingColumn: t("removeAsLinkingColumn"),
                    columnHeaderConnect: t("columnHeaderConnect"),
                  }}
                />
              )}
            </div>
            <div className="csv-section">
              <h2>{t("rightCsvTitle")}</h2>
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "right")}
                buttonText={t("chooseFile")}
                tableId="right" // Pass tableId for unique input id
              />
              {rightCsvData.length > 0 && (
                <CsvTable
                  key={`right-table-${formatUpdateKey}-${language}`}
                  headers={rightCsvHeaders}
                  data={rightCsvData}
                  tableId="right"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef}
                  onColumnAction={handleColumnAction}
                  linkingColumn={rightLinkingColumn}
                  texts={{
                    formatToNumber: t("formatToNumber"),
                    usToUkDate: t("usToUkDate"),
                    sortAscending: t("sortAscending"),
                    sortDescending: t("sortDescending"),
                    removeSort: t("removeSort"),
                    selectForLinking: t("selectForLinking"),
                    removeAsLinkingColumn: t("removeAsLinkingColumn"),
                    columnHeaderConnect: t("columnHeaderConnect"),
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </ArcherContainer>
    </DndProvider>
  );
}

export default App;
