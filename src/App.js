import React, { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ArcherContainer } from "react-archer";
import CsvUploader from "./CsvUploader";
import CsvTable from "./CsvTable";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [leftCsvData, setLeftCsvData] = useState([]);
  const [rightCsvData, setRightCsvData] = useState([]);
  const [leftCsvHeaders, setLeftCsvHeaders] = useState([]);
  const [rightCsvHeaders, setRightCsvHeaders] = useState([]);
  const [relations, setRelations] = useState([]);
  const archerRef = useRef(null); // Create a ref for ArcherContainer

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
        style: { strokeColor: "olive", strokeWidth: 2 },
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

  return (
    <DndProvider backend={HTML5Backend}>
      <ArcherContainer
        ref={archerRef} // Assign the ref to ArcherContainer
        strokeColor="gray"
        relations={relations}
        lineStyle="curve"
      >
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Spreadsheet Matcher</h1>
          </header>
          <div className="csv-container">
            <div className="csv-section">
              <h2>Left CSV</h2>
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "left")}
              />
              {leftCsvData.length > 0 && (
                <CsvTable
                  headers={leftCsvHeaders}
                  data={leftCsvData}
                  tableId="left"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef} // Pass the ref to CsvTable
                />
              )}
            </div>
            <div className="csv-section">
              <h2>Right CSV</h2>
              <CsvUploader
                onFileUpload={(file) => handleFileUpload(file, "right")}
              />
              {rightCsvData.length > 0 && (
                <CsvTable
                  headers={rightCsvHeaders}
                  data={rightCsvData}
                  tableId="right"
                  addRelation={addRelation}
                  removeRelation={removeRelation}
                  relations={relations}
                  archerRef={archerRef} // Pass the ref to CsvTable
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
