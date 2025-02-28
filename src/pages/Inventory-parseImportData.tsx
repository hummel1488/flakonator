
// This is a helper file that contains just the parseImportData function
// to be included in the Inventory.tsx file

// Parse imported data from CSV or other formats
const parseImportData = (data: string) => {
  try {
    // Clean up the data - remove any BOM markers and normalize line endings
    data = data.replace(/^\uFEFF/, ''); // Remove BOM if present
    
    // Normalize line endings
    data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split into lines
    const lines = data.trim().split('\n');
    
    if (lines.length <= 1) {
      throw new Error('Файл пуст или содержит только заголовок');
    }
    
    // Detect separator used in the file
    let separator = ',';
    const firstLine = lines[0];
    
    if (firstLine.includes('\t')) {
      separator = '\t';
    } else if (firstLine.includes(';')) {
      separator = ';';
    } else if (firstLine.split(',').length > 1) {
      separator = ',';
    } else {
      // If no common separator is found, try to detect based on pattern
      if (firstLine.match(/[^\w\s"']/)) {
        // Use the first non-alphanumeric character as separator
        separator = firstLine.match(/[^\w\s"']/)?.[0] || ',';
      }
    }
    
    console.log("Detected separator:", separator);
    console.log("First line:", firstLine);
    
    // Parse header line to find column indexes
    const headers = firstLine.split(separator).map(h => h.trim());
    console.log("Headers:", headers);
    
    // Try to find column indices based on variations
    const nameIndex = findColumnIndex(headers, NAME_VARIATIONS);
    const sizeIndex = findColumnIndex(headers, SIZE_VARIATIONS);
    const typeIndex = findColumnIndex(headers, TYPE_VARIATIONS);
    const locationIndex = findColumnIndex(headers, LOCATION_VARIATIONS);
    const quantityIndex = findColumnIndex(headers, QUANTITY_VARIATIONS);
    
    console.log("Column indices:", { nameIndex, sizeIndex, typeIndex, locationIndex, quantityIndex });
    
    // Check if we have at least the essential columns
    if (nameIndex === -1) {
      throw new Error('Не удалось найти столбец с названием товара');
    }
    
    // We need either a quantity column or size-specific quantity columns
    let hasQuantityInfo = quantityIndex !== -1;
    
    // Check for size-specific quantity columns and for columns that might be just quantities
    const sizeQuantityMap: Record<string, number> = {};
    const possibleQuantityColumns: number[] = [];
    
    // First pass: Look for clearly labeled size-specific quantity columns
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      
      // 5ml detection
      if ((header.includes('5') && (header.includes('мл') || header.includes('ml'))) || 
          header === '5' || header === '5ml' || header === '5мл') {
        sizeQuantityMap['5'] = i;
        hasQuantityInfo = true;
        console.log("Found 5ml column at index", i, ":", headers[i]);
      }
      // 16ml detection
      else if ((header.includes('16') && (header.includes('мл') || header.includes('ml'))) || 
               header === '16' || header === '16ml' || header === '16мл') {
        sizeQuantityMap['16'] = i;
        hasQuantityInfo = true;
        console.log("Found 16ml column at index", i, ":", headers[i]);
      }
      // 20ml detection
      else if ((header.includes('20') && (header.includes('мл') || header.includes('ml'))) || 
               header === '20' || header === '20ml' || header === '20мл') {
        sizeQuantityMap['20'] = i;
        hasQuantityInfo = true;
        console.log("Found 20ml column at index", i, ":", headers[i]);
      }
      // 25ml detection
      else if ((header.includes('25') && (header.includes('мл') || header.includes('ml'))) || 
               header === '25' || header === '25ml' || header === '25мл') {
        sizeQuantityMap['25'] = i;
        hasQuantityInfo = true;
        console.log("Found 25ml column at index", i, ":", headers[i]);
      }
      // 30ml detection
      else if ((header.includes('30') && (header.includes('мл') || header.includes('ml'))) || 
               header === '30' || header === '30ml' || header === '30мл') {
        sizeQuantityMap['30'] = i;
        hasQuantityInfo = true;
        console.log("Found 30ml column at index", i, ":", headers[i]);
      }
      // Car diffuser detection
      else if (header.includes('авто') || header.includes('diffuser') || 
               header.includes('диффузор') || header.includes('car')) {
        sizeQuantityMap['car'] = i;
        hasQuantityInfo = true;
        console.log("Found car diffuser column at index", i, ":", headers[i]);
      }
      
      // Also check for possible quantity columns (just numbers)
      // If the column header is numeric or empty, it might be a quantity column
      if (!Object.values(sizeQuantityMap).includes(i) && // Not already identified as a size column
          (header === '' || /^\d+$/.test(header) || 
           QUANTITY_VARIATIONS.some(v => normalizeText(header).includes(normalizeText(v))))) {
        possibleQuantityColumns.push(i);
        console.log("Found possible quantity column at index", i, ":", headers[i]);
      }
    }
    
    console.log("Size quantity map:", sizeQuantityMap);
    console.log("Possible quantity columns:", possibleQuantityColumns);
    
    // Second pass: sample the data to determine if any columns are likely quantities
    // Read a few rows to check if columns contain numeric values
    const sampleRowCount = Math.min(5, lines.length - 1);
    const numericColumnCounts: Record<number, number> = {};
    
    for (let i = 1; i <= sampleRowCount; i++) {
      if (i >= lines.length) break;
      
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(separator).map(item => item.trim());
      
      // Check each potential quantity column
      possibleQuantityColumns.forEach(colIndex => {
        if (colIndex < columns.length) {
          const value = columns[colIndex];
          // If the value is numeric, increment the count for this column
          if (/^[0-9]+$/.test(value.replace(/[^\d]/g, ''))) {
            numericColumnCounts[colIndex] = (numericColumnCounts[colIndex] || 0) + 1;
          }
        }
      });
    }
    
    // Identify columns that consistently contain numbers across sample rows
    const likelyQuantityColumns = Object.entries(numericColumnCounts)
      .filter(([_, count]) => count >= sampleRowCount * 0.6) // At least 60% of rows have numbers
      .map(([colIndex]) => parseInt(colIndex));
    
    console.log("Likely quantity columns:", likelyQuantityColumns);
    
    // If we haven't found quantity info yet, use the identified likely quantity columns
    if (!hasQuantityInfo && likelyQuantityColumns.length > 0) {
      // If we have only one quantity column and a size column, use it as the general quantity
      if (likelyQuantityColumns.length === 1 && sizeIndex !== -1) {
        const quantColIndex = likelyQuantityColumns[0];
        console.log("Using column", quantColIndex, "as general quantity column");
        hasQuantityInfo = true;
      } 
      // If we have multiple quantity columns and no size-specific quantities yet, 
      // try to map them to sizes
      else if (likelyQuantityColumns.length > 1 && Object.keys(sizeQuantityMap).length === 0) {
        // If we have exactly the number of standard sizes, assume they map in order
        const standardSizes = ['5', '16', '20', '25', '30', 'car'];
        if (likelyQuantityColumns.length <= standardSizes.length) {
          likelyQuantityColumns.forEach((colIndex, i) => {
            if (i < standardSizes.length) {
              sizeQuantityMap[standardSizes[i]] = colIndex;
              console.log(`Mapping column ${colIndex} to size ${standardSizes[i]}`);
            }
          });
          hasQuantityInfo = true;
        }
      }
    }
    
    if (!hasQuantityInfo) {
      throw new Error('Не удалось найти столбец с количеством товара');
    }
    
    // Parse all data lines for full import (not just preview)
    const allProducts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Handle quoted fields that might contain the separator
      const columns = parseCSVLine(line, separator);
      
      // Skip rows that don't have enough columns or don't have a product name
      if (columns.length <= 1 || !columns[nameIndex]?.trim()) continue;
      
      const name = columns[nameIndex]?.trim() || '';
      
      // Handle case with size-specific quantity columns
      if (Object.keys(sizeQuantityMap).length > 0) {
        // For each size in the map, check if there's a quantity in this row
        for (const [size, index] of Object.entries(sizeQuantityMap)) {
          if (columns.length <= index) continue;
          
          const quantityText = columns[index].trim();
          if (!quantityText) continue;
          
          // Parse the quantity, ensuring it's a valid number
          const quantity = parseQuantity(quantityText);
          if (quantity <= 0) continue;
          
          let locationId = manualLocationId || '';
          let locationName = '';
          
          // Try to find location from columns if location index exists
          if (locationIndex !== -1 && columns[locationIndex]?.trim()) {
            const locationText = columns[locationIndex].trim();
            const location = locations.find(loc => 
              normalizeText(loc.name).includes(normalizeText(locationText)) || 
              normalizeText(locationText).includes(normalizeText(loc.name))
            );
            
            if (location) {
              locationId = location.id;
              locationName = location.name;
            }
          }
          
          // If no location found and manual location selected, use that
          if (!locationId && manualLocationId && manualLocationId !== 'use-from-file') {
            locationId = manualLocationId;
            const location = locations.find(loc => loc.id === manualLocationId);
            locationName = location ? location.name : '';
          }
          
          // Skip if we don't have a locationId
          if (!locationId) continue;
          
          // Get type (defaulting to perfume)
          const type = typeIndex !== -1 && columns[typeIndex] 
            ? mapType(columns[typeIndex]) 
            : 'perfume';
          
          allProducts.push({
            name,
            size,
            type,
            locationId,
            locationName,
            quantity
          });
        }
      } else if (quantityIndex !== -1) {
        // Process as single product with one quantity
        const size = sizeIndex !== -1 && columns[sizeIndex] 
          ? mapSize(columns[sizeIndex]) 
          : '5';
          
        const type = typeIndex !== -1 && columns[typeIndex] 
          ? mapType(columns[typeIndex]) 
          : 'perfume';
        
        let locationId = manualLocationId || '';
        let locationName = '';
        
        if (locationIndex !== -1 && columns[locationIndex]?.trim()) {
          const locationText = columns[locationIndex].trim();
          const location = locations.find(loc => 
            normalizeText(loc.name).includes(normalizeText(locationText)) || 
            normalizeText(locationText).includes(normalizeText(loc.name))
          );
          
          if (location) {
            locationId = location.id;
            locationName = location.name;
          }
        }
        
        if (!locationId && manualLocationId && manualLocationId !== 'use-from-file') {
          locationId = manualLocationId;
          const location = locations.find(loc => loc.id === manualLocationId);
          locationName = location ? location.name : '';
        }
        
        // Parse quantity
        let quantity = 0;
        if (quantityIndex !== -1 && quantityIndex < columns.length) {
          const quantityText = columns[quantityIndex];
          quantity = parseQuantity(quantityText);
        }
        
        if (name && locationId && quantity > 0) {
          allProducts.push({
            name,
            size,
            type,
            locationId,
            locationName,
            quantity
          });
        }
      }
    }
    
    console.log(`Found ${allProducts.length} products to import`);
    
    // For preview, just show first 10 items
    setImportPreview(allProducts.slice(0, 10));
    
    // But store all products for actual import
    if (allProducts.length > 0) {
      // Store the full list separately for when user clicks import
      setFullImportData(allProducts);
    } else {
      throw new Error('Не удалось найти данные для импорта');
    }
    
  } catch (error) {
    console.error("Error parsing import data:", error);
    toast({
      title: "Ошибка импорта",
      description: error instanceof Error ? error.message : "Не удалось разобрать данные из файла. Проверьте формат.",
      variant: "destructive",
    });
    setImportPreview([]);
    setFullImportData([]);
  }
};

// Helper function to parse a CSV line that might contain quoted fields with separators
const parseCSVLine = (line: string, separator: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      // End of field
      result.push(currentField);
      currentField = '';
    } else {
      // Add character to current field
      currentField += char;
    }
  }
  
  // Add the last field
  result.push(currentField);
  
  return result;
};

// Enhanced parsing of quantity values from CSV fields
const parseQuantity = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // First, check if the value is already a clean number
  const directNumber = Number(value.trim());
  if (!isNaN(directNumber) && directNumber > 0) {
    return Math.round(directNumber);
  }
  
  // If not, clean it up more aggressively
  // Remove any non-numeric characters except decimal points and commas
  let cleanedValue = value.replace(/[^\d.,]/g, '')
                          .replace(/,/g, '.')  // Replace commas with dots for decimal
                          .replace(/(\..*)\./g, '$1'); // Keep only the first decimal point
  
  // If it's still empty after cleaning, return 0
  if (!cleanedValue) return.0;
  
  // Convert to number and round to integer
  const parsedNumber = parseFloat(cleanedValue);
  
  return isNaN(parsedNumber) ? 0 : Math.round(parsedNumber);
};
