import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Bag } from '../types';

// Export bags to CSV
export function exportBagsToCSV(bags: Bag[]) {
  const exportData = bags.map(bag => ({
    'ID': bag.id,
    'Name': bag.name,
    'Description': bag.description,
    'Price (£)': bag.price,
    'Color': bag.color,
    'Size': bag.size,
    'Stock': bag.stock,
    'Minimum Stock': bag.minimumStock || 0,
    'Visible': bag.isVisible ? 'Yes' : 'No',
    'Image URL': bag.image
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `bags-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export bags to Excel
export function exportBagsToExcel(bags: Bag[]) {
  const exportData = bags.map(bag => ({
    'ID': bag.id,
    'Name': bag.name,
    'Description': bag.description,
    'Price (£)': bag.price,
    'Color': bag.color,
    'Size': bag.size,
    'Stock': bag.stock,
    'Minimum Stock': bag.minimumStock || 0,
    'Visible': bag.isVisible ? 'Yes' : 'No',
    'Image URL': bag.image
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bags');
  XLSX.writeFile(workbook, `bags-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Helper functions for parsing
const parseNumericValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const parseIntegerValue = (value: any): number => {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const parseBooleanValue = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'yes' || normalized === 'true' || normalized === '1';
  }
  return false;
};

const generateUniqueId = (index: number, name: string): string => {
  const timestamp = Date.now();
  const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  return `bag-${nameHash}-${timestamp}-${index}`;
};

const getDefaultImage = (): string => {
  return 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
};

// Import bags from CSV
export function importBagsFromCSV(file: File): Promise<Bag[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          const bags: Bag[] = [];
          
          results.data.forEach((row: any, index: number) => {
            try {
              const name = row['Name'] || row['Bag Name'] || row['name'] || '';
              
              if (!name || name.trim() === '') {
                return;
              }

              const price = parseNumericValue(row['Price'] || row['Price (£)'] || '0');
              const stock = parseIntegerValue(row['Stock'] || row['Quantity'] || '0');
              const minimumStock = parseIntegerValue(row['Minimum Stock'] || row['Min Stock'] || '0');
              const color = row['Color'] || row['color'] || 'Blue';
              const size = row['Size'] || row['size'] || 'Medium';
              const description = row['Description'] || row['description'] || '';
              const isVisible = parseBooleanValue(row['Visible'] || 'Yes');
              
              let imageUrl = row['Image URL'] || row['Image'] || row['image'] || '';
              if (!imageUrl || !imageUrl.startsWith('http')) {
                imageUrl = getDefaultImage();
              }

              const bag: Bag = {
                id: generateUniqueId(index, name),
                name: name.trim(),
                description: description.trim(),
                price: price,
                image: imageUrl,
                color: color,
                size: size,
                stock: stock,
                isVisible: isVisible,
                minimumStock: minimumStock
              };

              if (bag.name && bag.price >= 0) {
                bags.push(bag);
              }
            } catch (rowError) {
              console.warn(`Error processing bag row ${index}:`, rowError);
            }
          });

          if (bags.length === 0) {
            reject(new Error('No valid bags found in CSV file. Please check the file format.'));
            return;
          }

          resolve(bags);
        } catch (error) {
          reject(new Error('Failed to parse CSV file. Please check the file format.'));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

// Import bags from Excel
export function importBagsFromExcel(file: File): Promise<Bag[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in Excel file'));
          return;
        }

        const bags: Bag[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            const name = row['Name'] || row['Bag Name'] || row['name'] || '';
            
            if (!name || name.trim() === '') {
              return;
            }

            const price = parseNumericValue(row['Price'] || row['Price (£)'] || '0');
            const stock = parseIntegerValue(row['Stock'] || row['Quantity'] || '0');
            const minimumStock = parseIntegerValue(row['Minimum Stock'] || row['Min Stock'] || '0');
            const color = row['Color'] || row['color'] || 'Blue';
            const size = row['Size'] || row['size'] || 'Medium';
            const description = row['Description'] || row['description'] || '';
            const isVisible = parseBooleanValue(row['Visible'] || 'Yes');
            
            let imageUrl = row['Image URL'] || row['Image'] || row['image'] || '';
            if (!imageUrl || !imageUrl.startsWith('http')) {
              imageUrl = getDefaultImage();
            }

            const bag: Bag = {
              id: generateUniqueId(index, name),
              name: name.trim(),
              description: description.trim(),
              price: price,
              image: imageUrl,
              color: color,
              size: size,
              stock: stock,
              isVisible: isVisible,
              minimumStock: minimumStock
            };

            if (bag.name && bag.price >= 0) {
              bags.push(bag);
            }
          } catch (rowError) {
            console.warn(`Error processing bag row ${index}:`, rowError);
          }
        });

        if (bags.length === 0) {
          reject(new Error('No valid bags found in Excel file. Please check the file format.'));
          return;
        }

        resolve(bags);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}