import React from "react";
import DataGrid from "react-data-grid";
import 'react-data-grid/styles.css';

// Helper to create columns for react-data-grid
function getColumns(headers, tableId, texts, linkingColumn, onColumnAction) {
  const baseColumns = headers.map((header) => ({
    key: header,
    name: header,
    resizable: true,
    sortable: true,
    width: 150,
  }));
  const connectColumn = {
    key: "connect",
    name: texts.columnHeaderConnect || "Connect",
    resizable: false,
    sortable: false,
    width: 70,
    renderCell: (props) => <div />, 
  };
  if (tableId === "right") {
    return [connectColumn, ...baseColumns];
  }
  return [...baseColumns, connectColumn];
}

function CsvTable({
  headers,
  data,
  tableId,
  addRelation,
  removeRelation,
  relations,
  archerRef,
  onColumnAction,
  linkingColumn,
  texts,
  fileName,
}) {
  const columns = getColumns(headers, tableId, texts, linkingColumn, onColumnAction);
  // Add a unique id for each row if not present
  const rows = data.map((row, idx) => ({ id: row.id || idx, ...row }));
  return (
    <div className="table-wrapper">
      {fileName && <div className="file-name-display">{fileName}</div>}
      <DataGrid
        columns={columns}
        rows={rows}
        style={{ width: "100%", minHeight: 400 }}
        className="csv-table"
        defaultColumnOptions={{ resizable: true, sortable: true }}
      />
    </div>
  );
}

export default CsvTable;
