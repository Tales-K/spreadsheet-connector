import React from "react";

// Accept buttonText and tableId (for unique input id) props
function CsvUploader({ onFileUpload, buttonText, tableId }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
      // Optionally reset the input value to allow uploading the same file again
      event.target.value = null;
    }
  };

  const inputId = `csv-upload-${tableId || "default"}`;

  return (
    <div className="csv-uploader">
      {/* Styled label acting as a button */}
      <label htmlFor={inputId} className="action-button-label">
        {buttonText || "Choose File"}
      </label>
      {/* Hidden actual file input */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        id={inputId}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default CsvUploader;
