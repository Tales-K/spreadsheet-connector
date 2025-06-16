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

  const { key, ...restRowProps } = row.getRowProps();

  const classNames = [];
  if (isConnected) {
    classNames.push("connected-row");
  }
  if (isOver && canDrop) {
    classNames.push("droppable-row-hover");
  }

  return (
    <tr key={key} {...restRowProps} ref={drop} className={classNames.join(" ")}>
      {row.cells.map((cell) => {
        const cellProps = cell.getCellProps();
        const cellKey = cellProps.key; // Extract key
        // eslint-disable-next-line no-unused-vars
        const { key: _key, ...restCellProps } = cellProps; // Destructure to remove key from spread

        if (cell.column.id === "connect") {
          return (
            <td
              key={cellKey}
              {...restCellProps}
              style={{ textAlign: "center" }}
            >
              <ConnectDotCell
                originalId={originalId}
                tableId={tableId}
                removeRelation={removeRelation}
                relations={relations}
              />
            </td>
          );
        }
        return (
          <td key={cellKey} {...restCellProps}>
            {cell.render("Cell")}
          </td>
        );
      })}
    </tr>
  );
}

export default DraggableRow;
