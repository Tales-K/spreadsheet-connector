// src/utils/formattingUtils.js

export function formatToNumber(originalValue) {
  if (
    originalValue === null ||
    originalValue === undefined ||
    typeof originalValue !== "string"
  ) {
    const num = Number(originalValue);
    if (!isNaN(num)) {
      return num.toFixed(2);
    }
    return originalValue;
  }

  let tempValue = originalValue.replace(/[a-zA-Z$€£¥]+/g, "");
  const cleanedValue = tempValue.replace(/[^\d,.-]/g, "");
  let processedValue = cleanedValue;
  const dotCount = (processedValue.match(/\./g) || []).length;
  const commaCount = (processedValue.match(/,/g) || []).length;

  if (dotCount > 0 && commaCount > 0) {
    if (processedValue.lastIndexOf(".") > processedValue.lastIndexOf(",")) {
      processedValue = processedValue.replace(/,/g, "");
    } else {
      processedValue = processedValue.replace(/\./g, "");
      processedValue = processedValue.replace(",", ".");
    }
  } else if (dotCount > 1) {
    processedValue = processedValue.replace(/\./g, "");
  } else if (commaCount > 1) {
    processedValue = processedValue.replace(/,/g, "");
  } else if (commaCount === 1 && dotCount === 0) {
    processedValue = processedValue.replace(",", ".");
  }

  if (processedValue.match(/\.\d+,\d+$/)) {
    processedValue = processedValue.replace(/\./g, "");
    processedValue = processedValue.replace(",", ".");
  }

  const finalValueForParse = processedValue.replace(/[^\d.-]/g, "");
  const numberValue = parseFloat(finalValueForParse);

  if (isNaN(numberValue)) {
    return originalValue;
  } else {
    return numberValue.toFixed(2);
  }
}

export function formatUsToUkDate(originalValue) {
  const sValue = String(originalValue).trim(); // Ensure it's a string and trim whitespace

  // Regex to match MM/DD/YYYY or M/D/YYYY
  const fullDateParts = sValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fullDateParts && fullDateParts.length === 4) {
    const [, p1, p2, p3] = fullDateParts; // p1=MM, p2=DD, p3=YYYY
    const month = parseInt(p1, 10);
    const day = parseInt(p2, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const result = `${p2.padStart(2, "0")}/${p1.padStart(2, "0")}/${p3}`;
      return result; // DD/MM/YYYY
    }
  }

  // Regex to match MM/DD or M/D (no year)
  const shortDatePartsNoYear = sValue.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (shortDatePartsNoYear && shortDatePartsNoYear.length === 3) {
    const [, p1, p2] = shortDatePartsNoYear; // p1=MM, p2=DD
    const month = parseInt(p1, 10);
    const day = parseInt(p2, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const result = `${p2.padStart(2, "0")}/${p1.padStart(2, "0")}`;
      return result; // DD/MM
    }
  }

  return originalValue; // Return original if format is not as expected
}
