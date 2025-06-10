import React, { useEffect } from "react";
import { useDrag } from "react-dnd";
import { ArcherElement } from "react-archer";
import { getEmptyImage } from "react-dnd-html5-backend";

const ItemTypes = { ROW: "row" };

function ConnectDotCell({ originalId, tableId, removeRelation, relations }) {
  const [, drag, dragPreview] = useDrag(() => ({
    type: ItemTypes.ROW,
    item: { id: originalId, tableId }, // This is the item being dragged
    collect: (monitor) => ({}),
  }));

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const isConnected = relations.some(
    (r) => r.from.id === originalId || r.to.id === originalId
  );
  const dotColor = isConnected ? "olive" : "gray";

  const handleDotClick = () => {
    if (isConnected) {
      removeRelation(originalId);
    }
    // If not connected, drag will be initiated by react-dnd on mousedown via the drag ref
  };

  // ArcherElement relations prop for lines originating from this dot
  const archerRelations = relations
    .filter((r) => r.from.id === originalId)
    .map((r) => ({
      targetId: r.to.id,
      sourceAnchor: r.from.anchor,
      targetAnchor: r.to.anchor,
      style: r.style,
    }));

  return (
    // The drag ref is attached to the div that acts as the drag handle (the dot container)
    <div
      ref={drag}
      style={{
        display: "inline-block",
        cursor: isConnected ? "pointer" : "grab",
      }}
      onClick={handleDotClick}
    >
      <ArcherElement id={originalId} relations={archerRelations}>
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: dotColor,
            borderRadius: "50%",
            margin: "auto", // Centers the dot if parent td has text-align: center
          }}
        />
      </ArcherElement>
    </div>
  );
}
export default ConnectDotCell;
