import { useState, useRef, useCallback } from "react";
import { formatToNumber, formatUsToUkDate } from "../utils/formattingUtils";
import { processFile } from "../utils/fileProcessor";
import { createRelation, relationExists, autoLinkData } from "../utils/relationsManager";

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
    if (side === "left") {
      processFile(file, side, setLeftCsvData, setLeftCsvHeaders, setRelations);
    } else {
      processFile(file, side, setRightCsvData, setRightCsvHeaders, setRelations);
    }
  };

  const addRelation = useCallback((newRelationSource, newRelationTarget) => {
    setRelations((prevRelations) => {
      const newRelation = createRelation(newRelationSource, newRelationTarget);
      if (relationExists(prevRelations, newRelation)) return prevRelations;
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
    
    const relationsToAdd = autoLinkData(leftCsvData, rightCsvData, leftLinkingColumn, rightLinkingColumn);
    
    setRelations((prevRelations) => {
      let updatedRelations = [...prevRelations];
      relationsToAdd.forEach((pair) => {
        const newRelation = createRelation(pair.source, pair.target);
        if (!relationExists(updatedRelations, newRelation)) {
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
