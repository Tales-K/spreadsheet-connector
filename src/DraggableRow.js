import React from "react";
import { useDrop } from "react-dnd";
import ConnectDotCell from "./ConnectDotCell";

const ItemTypes = {
  ROW: "row",
};

function DraggableRow({
  row,
  tableId,
  addRelation,
  isConnected,
  removeRelation,
  relations,
  isRightTable,
}) {
  const originalId = row.original.id;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.ROW,
    drop: (draggedItem) => {
      if (draggedItem.tableId && draggedItem.tableId !== tableId) {
        addRelation(draggedItem, { id: originalId, tableId: tableId });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const rowStyle = {
    backgroundColor: isConnected
      ? "lightgreen"
      : isOver && canDrop
      ? "#e6ffe6"
      : "transparent",
  };

  const { key, ...restRowProps } = row.getRowProps();

  return (
    <tr key={key} {...restRowProps} ref={drop} style={rowStyle}>
      {row.cells.map((cell) => {
        if (cell.column.id === "connect") {
          return (
            <td {...cell.getCellProps()} style={{ textAlign: "center" }}>
              <ConnectDotCell
                originalId={originalId}
                tableId={tableId}
                removeRelation={removeRelation}
                relations={relations}
              />
            </td>
          );
        }
        return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
      })}
    </tr>
  );
}

export default DraggableRow;
