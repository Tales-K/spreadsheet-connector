import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { formatToNumber, formatUsToUkDate } from "../utils/formattingUtils";

export function useSpreadsheetConnector() {
  const [leftCsvData, setLeftCsvData] = useState([]);
  const [rightCsvData, setRightCsvData] = useState([]);
  const [leftCsvHeaders, setLeftCsvHeaders] = useState([]);
  const [rightCsvHeaders, setRightCsvHeaders] = useState([]);
  const [relations, setRelations] = useState([]);
  const archerRef = useRef(null);
  const [formatUpdateKey, setFormatUpdateKey] = useState(0);
  const [leftLinkingColumn, setLeftLinkingColumn] = useState(null);
  const [rightLinkingColumn, setRightLinkingColumn] = useState(null);

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
        style: { strokeColor: "#8fbc8f", strokeWidth: 2 },
      };
      const relationExists = prevRelations.find(
        (r) =>
          (r.from.id === newRelation.from.id &&
            r.to.id === newRelation.to.id) ||
          (r.from.id === newRelation.to.id && r.to.id === newRelation.from.id)
      );
      if (relationExists) return prevRelations;
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
      archerRef.current.refreshScreen();
    }
  }, [archerRef]);

  const handleColumnAction = useCallback(
    (tableId, columnAccessor, actionType) => {
      if (actionType === "toggleLinkingColumn") {
        if (tableId === "left") {
          setLeftLinkingColumn((prev) =>
            prev === columnAccessor ? null : columnAccessor
          );
        } else {
          setRightLinkingColumn((prev) =>
            prev === columnAccessor ? null : columnAccessor
          );
        }
        setFormatUpdateKey((prevKey) => prevKey + 1);
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
        return transformedData;
      });
      setFormatUpdateKey((prevKey) => prevKey + 1);
      if (archerRef.current) {
        archerRef.current.refreshScreen();
      }
    },
    [archerRef]
  );

  const handleAutoLink = (t) => {
    if (!leftLinkingColumn || !rightLinkingColumn) {
      alert(t("alertSelectLinkingColumns"));
      return;
    }
    if (leftCsvData.length === 0 || rightCsvData.length === 0) {
      alert(t("alertUploadData"));
      return;
    }
    const relationsToAdd = [];
    leftCsvData.forEach((leftRow) => {
      const leftValue = leftRow[leftLinkingColumn];
      if (leftValue == null) return;
      rightCsvData.forEach((rightRow) => {
        const rightValue = rightRow[rightLinkingColumn];
        if (rightValue == null) return;
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
          style: { strokeColor: "#8fbc8f", strokeWidth: 2 },
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
      return updatedRelations;
    });
    if (archerRef.current) {
      archerRef.current.refreshScreen();
    }
  };

  return {
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
    setLeftLinkingColumn,
    setRightLinkingColumn,
  };
}
