import Papa from "papaparse";
import { parseOfxFile, convertOfxToCsv } from "./ofxParser";

export const processFile = (file, side, setData, setHeaders, setRelations) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  console.log('🔍 File upload started:', { fileName: file.name, fileExtension, side, fileSize: file.size });
  
  if (fileExtension === 'ofx') {
    console.log('📄 Processing OFX file...');
    processOfxFile(file, side, setData, setHeaders, setRelations);
  } else {
    console.log('📊 Processing CSV file...');
    processCsvFile(file, side, setData, setHeaders, setRelations);
  }
};

const processOfxFile = (file, side, setData, setHeaders, setRelations) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      console.log('📖 FileReader loaded, content length:', e.target.result?.length);
      const ofxContent = e.target.result;
      
      const parsedOfx = parseOfxFile(ofxContent);
      
      console.log('🔄 Converting OFX to CSV format...');
      const csvData = convertOfxToCsv(parsedOfx, side);
      console.log('✅ CSV data converted:', { rowCount: csvData.length, firstRow: csvData[0] });
      
      const headers = csvData.length > 0 ? Object.keys(csvData[0]).filter(key => key !== 'id') : [];
      console.log('📋 Headers extracted:', headers);
      
      setData(csvData);
      setHeaders(headers);
      setRelations([]);
      
      console.log('🎉 OFX processing completed successfully!');
    } catch (error) {
      console.error('💥 Error parsing OFX file:', error);
      console.error('Stack trace:', error.stack);
      alert('Error parsing OFX file. Please make sure it\'s a valid OFX file. Check console for details.');
    }
  };
  reader.readAsText(file);
};

const processCsvFile = (file, side, setData, setHeaders, setRelations) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const headers = results.meta.fields;
      const data = results.data.map((row, index) => ({
        ...row,
        id: `${side}-row-${index}`,
      }));
      setData(data);
      setHeaders(headers);
      setRelations([]);
    },
  });
};
