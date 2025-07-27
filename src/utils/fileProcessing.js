import Papa from "papaparse";
import { parseOfxFile, convertOfxToCsv } from "./ofxUtils";

// Process CSV file
export const processCsvFile = (file, side, callback) => {
  console.log('📊 Processing CSV file:', { fileName: file.name, side });
  
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const headers = results.meta.fields;
      const data = results.data.map((row, index) => ({
        ...row,
        id: `${side}-row-${index}`,
      }));
      
      console.log('✅ CSV processing completed:', { rowCount: data.length, headers });
      callback({ data, headers });
    },
  });
};

// Process OFX file
export const processOfxFile = (file, side, callback) => {
  console.log('📄 Processing OFX file:', { fileName: file.name, side, fileSize: file.size });
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const ofxContent = e.target.result;
      
      // Parse OFX content
      const parsedOfx = parseOfxFile(ofxContent);
      
      console.log('🔄 Converting OFX to CSV format...');
      // Convert OFX data to CSV-like format
      const csvData = convertOfxToCsv(parsedOfx, side);
      console.log('✅ CSV data converted:', { rowCount: csvData.length, firstRow: csvData[0] });
      
      const headers = csvData.length > 0 ? Object.keys(csvData[0]).filter(key => key !== 'id') : [];
      console.log('📋 Headers extracted:', headers);
      
      callback({ data: csvData, headers });
      console.log('🎉 OFX processing completed successfully!');
    } catch (error) {
      console.error('💥 Error parsing OFX file:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  };
  
  reader.readAsText(file);
};

// Main file upload handler
export const handleFileUpload = (file, side, onSuccess, onError) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  console.log('🔍 File upload started:', { fileName: file.name, fileExtension, side, fileSize: file.size });
  
  try {
    if (fileExtension === 'ofx') {
      processOfxFile(file, side, onSuccess);
    } else {
      processCsvFile(file, side, onSuccess);
    }
  } catch (error) {
    console.error('💥 File processing error:', error);
    onError(error);
  }
};
