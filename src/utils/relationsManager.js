export const createRelation = (newRelationSource, newRelationTarget) => {
  return {
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
};

export const relationExists = (relations, newRelation) => {
  return relations.find(
    (r) =>
      (r.from.id === newRelation.from.id &&
        r.to.id === newRelation.to.id) ||
      (r.from.id === newRelation.to.id && r.to.id === newRelation.from.id)
  );
};

export const autoLinkData = (leftData, rightData, leftColumn, rightColumn) => {
  const relationsToAdd = [];
  
  leftData.forEach((leftRow) => {
    const leftValue = leftRow[leftColumn];
    if (leftValue == null) return;
    
    rightData.forEach((rightRow) => {
      const rightValue = rightRow[rightColumn];
      if (rightValue == null) return;
      
      if (String(leftValue).trim() === String(rightValue).trim()) {
        relationsToAdd.push({
          source: { id: leftRow.id, tableId: "left" },
          target: { id: rightRow.id, tableId: "right" },
        });
      }
    });
  });
  
  return relationsToAdd;
};
