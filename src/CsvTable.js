import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useTable, useSortBy } from "react-table";
import DraggableRow from "./DraggableRow";

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
  texts, // Receive texts prop for internationalization
}) {
  const [showMenu, setShowMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const toggleButtonRefs = useRef({});

  const columns = React.useMemo(() => {
    const baseColumns = headers.map((header) => ({
      Header: header, // Header text comes from CSV, not translated here unless explicitly mapped
      accessor: header,
    }));
    if (tableId === "right") {
      return [
        {
          Header: texts.columnHeaderConnect || "Connect", // Use translated text
          id: "connect",
          Cell: ({ row }) => <div />,
        },
        ...baseColumns,
      ];
    }
    return [
      ...baseColumns,
      {
        Header: texts.columnHeaderConnect || "Connect", // Use translated text
        id: "connect",
        Cell: ({ row }) => <div />,
      },
    ];
  }, [headers, tableId, texts]); // Add texts to dependency array

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy }, // Destructure sortBy from table instance state
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  const handleToggleDropdown = (columnId, event) => {
    event.stopPropagation();
    if (showMenu === columnId) {
      setShowMenu(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
      setShowMenu(columnId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu &&
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".dropdown-toggle")
      ) {
        setShowMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    // Refresh Archer lines when sorting changes and the ref is available
    if (sortBy && sortBy.length > 0 && archerRef && archerRef.current) {
      archerRef.current.refreshScreen();
    }
  }, [sortBy, archerRef]);

  return (
    <div
      style={{ maxWidth: "100%", overflowX: "auto", overflowY: "visible" }} // Ensure full width usage
      className="table-wrapper"
    >
      <table {...getTableProps()} className="csv-table">
        <thead>
          {headerGroups.map((headerGroup) => {
            const headerGroupProps = headerGroup.getHeaderGroupProps();
            const { key: headerGroupKey, ...restHeaderGroupProps } =
              headerGroupProps;
            return (
              <tr key={headerGroupKey} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const columnHeaderProps = column.getHeaderProps();
                  const { key: columnHeaderKey, ...restColumnHeaderProps } =
                    columnHeaderProps;
                  return (
                    <th key={columnHeaderKey} {...restColumnHeaderProps}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="header-text">
                          {column.render("Header")}
                        </span>
                        {column.id !== "connect" && (
                          <div className="dropdown">
                            <button
                              ref={(el) =>
                                (toggleButtonRefs.current[column.id] = el)
                              }
                              className="dropdown-toggle"
                              onClick={(e) =>
                                handleToggleDropdown(column.id, e)
                              }
                            >
                              ...
                            </button>
                            {showMenu === column.id &&
                              ReactDOM.createPortal(
                                <ul
                                  className="dropdown-menu show"
                                  style={{
                                    position: "absolute",
                                    top: `${menuPosition.top}px`,
                                    left: `${menuPosition.left}px`,
                                    zIndex: 1050,
                                  }}
                                >
                                  <li>
                                    <button
                                      onClick={() => {
                                        onColumnAction(
                                          tableId,
                                          column.id,
                                          "formatToNumber"
                                        );
                                        setShowMenu(null);
                                      }}
                                    >
                                      {texts.formatToNumber ||
                                        "Format to number"}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => {
                                        onColumnAction(
                                          tableId,
                                          column.id,
                                          "usToUkDate"
                                        );
                                        setShowMenu(null);
                                      }}
                                    >
                                      {texts.usToUkDate || "US to UK date"}
                                    </button>
                                  </li>
                                  <hr />
                                  <li>
                                    <button
                                      onClick={() => {
                                        column.toggleSortBy(false);
                                        setShowMenu(null);
                                      }}
                                    >
                                      {texts.sortAscending || "Sort Ascending"}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => {
                                        column.toggleSortBy(true);
                                        setShowMenu(null);
                                      }}
                                    >
                                      {texts.sortDescending ||
                                        "Sort Descending"}
                                    </button>
                                  </li>
                                  {column.isSorted && (
                                    <li>
                                      <button
                                        onClick={() => {
                                          column.clearSortBy();
                                          setShowMenu(null);
                                        }}
                                      >
                                        {texts.removeSort || "Remove Sort"}
                                      </button>
                                    </li>
                                  )}
                                  <hr />
                                  <li>
                                    <button
                                      onClick={() => {
                                        onColumnAction(
                                          tableId,
                                          column.id,
                                          "toggleLinkingColumn"
                                        );
                                        setShowMenu(null);
                                      }}
                                    >
                                      {linkingColumn === column.id
                                        ? texts.removeAsLinkingColumn
                                        : texts.selectForLinking}
                                    </button>
                                  </li>
                                </ul>,
                                document.body
                              )}
                          </div>
                        )}
                      </div>
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const { key: rowKey, ...restRowProps } = row.getRowProps();
            return (
              <DraggableRow
                key={rowKey} // Use the key from getRowProps
                row={row}
                tableId={tableId}
                addRelation={addRelation}
                removeRelation={removeRelation}
                relations={relations}
                {...restRowProps} // Spread the rest of the row props here
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CsvTable;
