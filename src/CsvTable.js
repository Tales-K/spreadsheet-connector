import React, { useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import DraggableRow from "./DraggableRow";

function CsvTable({
  headers,
  data,
  tableId,
  addRelation,
  removeRelation,
  relations,
  archerRef, // Accept archerRef prop
}) {
  const columns = React.useMemo(() => {
    const baseColumns = headers.map((header) => ({
      Header: header,
      accessor: header,
    }));
    if (tableId === "right") {
      return [
        { Header: "Connect", id: "connect", Cell: ({ row }) => <div /> }, // Placeholder for DraggableRow to render dot
        ...baseColumns,
      ];
    }
    return [
      ...baseColumns,
      { Header: "Connect", id: "connect", Cell: ({ row }) => <div /> }, // Placeholder for DraggableRow to render dot
    ];
  }, [headers, tableId]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy }, // Destructure sortBy from table instance state
  } = tableInstance;

  useEffect(() => {
    // Refresh Archer lines when sorting changes and the ref is available
    if (sortBy && sortBy.length > 0 && archerRef && archerRef.current) {
      archerRef.current.refreshScreen();
    }
  }, [sortBy, archerRef]);

  return (
    <div style={{ maxWidth: "50vw", overflowX: "auto" }}>
      <table {...getTableProps()} className="csv-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
              {/* <th>Connect</th> Removed this extra hardcoded header */}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const originalId = row.original.id;
            const isRowConnected = relations.some(
              (r) => r.from.id === originalId || r.to.id === originalId
            );
            return (
              <DraggableRow
                key={originalId} // Use originalId for key
                row={row}
                tableId={tableId}
                addRelation={addRelation}
                removeRelation={removeRelation}
                relations={relations}
                isRightTable={tableId === "right"}
                isConnected={isRowConnected} // Pass calculated isConnected
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CsvTable;
