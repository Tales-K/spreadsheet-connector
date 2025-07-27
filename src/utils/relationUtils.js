// Create a new relation object
export const createRelation = (source, target) => {
  return {
    from: {
      id: source.id,
      anchor: source.tableId === "left" ? "right" : "left",
    },
    to: {
      id: target.id,
      anchor: target.tableId === "left" ? "right" : "left",
    },
    style: { strokeColor: "#8fbc8f", strokeWidth: 2 },
  };
};

// Check if a relation already exists
export const relationExists = (relations, newRelation) => {
  return relations.find(
    (r) =>
      (r.from.id === newRelation.from.id && r.to.id === newRelation.to.id) ||
      (r.from.id === newRelation.to.id && r.to.id === newRelation.from.id)
  );
};

// Add a new relation if it doesn't exist
export const addRelation = (relations, source, target) => {
  const newRelation = createRelation(source, target);
  
  if (relationExists(relations, newRelation)) {
    return relations;
  }
  
  return [...relations, newRelation];
};

// Remove relations associated with a specific row
export const removeRelationsForRow = (relations, rowId) => {
  return relations.filter((r) => r.from.id !== rowId && r.to.id !== rowId);
};

// Generate auto-linking relations based on matching values in specified columns
export const generateAutoLinkRelations = (leftData, rightData, leftColumn, rightColumn) => {
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

// Add multiple relations while avoiding duplicates
export const addMultipleRelations = (existingRelations, newRelationPairs) => {
  let updatedRelations = [...existingRelations];
  
  newRelationPairs.forEach((pair) => {
    const newRelation = createRelation(pair.source, pair.target);
    
    if (!relationExists(updatedRelations, newRelation)) {
      updatedRelations.push(newRelation);
    }
  });
  
  return updatedRelations;
};
