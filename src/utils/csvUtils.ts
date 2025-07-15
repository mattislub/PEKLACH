import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Product } from '../types';

export const exportProductsToCSV = (products: Product[]) => {
  const csv = Papa.unparse(products.map(product => ({
    ID: product.id,
    Name: product.name,
    Description: product.description,
    Price: product.price,
    'Original Price': product.originalPrice || '',
    'On Promotion': product.isOnPromotion ? 'Yes' : 'No',
    Category: product.category,
    Stock: product.stock,
    SKU: product.sku,
    'Image URL': product.image,
    'Admin Visible': product.isVisible ? 'Yes' : 'No',
    'Customer Visible': product.customerVisible ? 'Yes' : 'No',
    'Custom Order': product.allowCustomOrder ? 'Yes' : 'No',
    'Minimum Stock': product.minimumStock || 0,
    'Visible Occasions': (product.visibleOccasions || []).join(';'),
    'Show in Ready to Go': product.visibilitySettings?.showInReadyToGo ? 'Yes' : 'No',
    'Show in Budget Choice': product.visibilitySettings?.showInBudgetChoice ? 'Yes' : 'No',
    'Show in Build Peckel': product.visibilitySettings?.showInBuildPeckel ? 'Yes' : 'No',
    'Show in Item Selection': product.visibilitySettings?.showInItemSelection ? 'Yes' : 'No',
    'Show in Pre-Packed': product.visibilitySettings?.showInPrePackedPeckels ? 'Yes' : 'No',
    'Show in Custom Orders': product.visibilitySettings?.showInCustomOrders ? 'Yes' : 'No',
    // Add pricing fields
    'Case Size': product.caseSize || 1,
    'Wholesale Cost': product.wholesaleCost || 0,
    'Promotion Wholesale Cost': product.promotionWholesaleCost || 0,
    'VAT Rate': product.vatRate || 20,
    'Is VATable': product.isVatable !== false ? 'Yes' : 'No',
    'Profit Margin': product.profitMargin || 30,
    'Cost Per Unit (ex VAT)': product.costPerUnit || 0,
    'Cost Per Unit (inc VAT)': product.costPerUnitIncVat || 0,
    'Sale Price (ex VAT)': product.saleExVat || 0
  })));

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pecklech-products-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProductsToExcel = (products: Product[]) => {
  const worksheet = XLSX.utils.json_to_sheet(products.map(product => ({
    ID: product.id,
    Name: product.name,
    Description: product.description,
    'Price (£)': product.price,
    'Original Price (£)': product.originalPrice || '',
    'On Promotion': product.isOnPromotion ? 'Yes' : 'No',
    Category: product.category,
    Stock: product.stock,
    SKU: product.sku,
    'Image URL': product.image,
    'Admin Visible': product.isVisible ? 'Yes' : 'No',
    'Customer Visible': product.customerVisible ? 'Yes' : 'No',
    'Custom Order Available': product.allowCustomOrder ? 'Yes' : 'No',
    'Minimum Stock': product.minimumStock || 0,
    'Visible Occasions': (product.visibleOccasions || []).join(';'),
    'Show in Ready to Go': product.visibilitySettings?.showInReadyToGo ? 'Yes' : 'No',
    'Show in Budget Choice': product.visibilitySettings?.showInBudgetChoice ? 'Yes' : 'No',
    'Show in Build Peckel': product.visibilitySettings?.showInBuildPeckel ? 'Yes' : 'No',
    'Show in Item Selection': product.visibilitySettings?.showInItemSelection ? 'Yes' : 'No',
    'Show in Pre-Packed': product.visibilitySettings?.showInPrePackedPeckels ? 'Yes' : 'No',
    'Show in Custom Orders': product.visibilitySettings?.showInCustomOrders ? 'Yes' : 'No',
    // Add pricing fields
    'Case Size': product.caseSize || 1,
    'Wholesale Cost (£)': product.wholesaleCost || 0,
    'Promotion Wholesale Cost (£)': product.promotionWholesaleCost || 0,
    'VAT Rate (%)': product.vatRate || 20,
    'Is VATable': product.isVatable !== false ? 'Yes' : 'No',
    'Profit Margin (%)': product.profitMargin || 30,
    'Cost Per Unit (ex VAT) (£)': product.costPerUnit || 0,
    'Cost Per Unit (inc VAT) (£)': product.costPerUnitIncVat || 0,
    'Sale Price (ex VAT) (£)': product.saleExVat || 0
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, `pecklech-products-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Helper function to clean and parse numeric values
const parseNumericValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal points
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to clean and parse integer values
const parseIntegerValue = (value: any): number => {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to parse boolean values
const parseBooleanValue = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'yes' || normalized === 'true' || normalized === '1';
  }
  return false;
};

// Helper function to generate a unique ID
const generateUniqueId = (index: number, name: string): string => {
  const timestamp = Date.now();
  const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  return `${nameHash}-${timestamp}-${index}`;
};

// Helper function to get default image
const getDefaultImage = (): string => {
  return 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
};

// Helper function to map category names
const mapCategory = (category: string): string => {
  if (!category || category.trim() === '') return 'Uncategorized';
  
  const categoryMap: { [key: string]: string } = {
    'Chocolates & Wafers': 'Chocolates & Wafers',
    'Packets': 'Snacks & Packets',
    'Pre Packed Pecklech': 'Pre-Packed Pecklech',
    'Bags': 'Bags & Packaging',
    'Large nush': 'Large Sweets',
    'Small nush': 'Small Sweets',
    'Drinks': 'Drinks',
    'Beverages': 'Drinks', // Map Beverages to Drinks
    'Labels & Cards': 'Labels & Cards',
    'Custem Pecklech': 'Custom Pecklech',
    'My Shelf': 'Miscellaneous'
  };

  return categoryMap[category] || category;
};

// Helper function to determine if product should be visible
const determineVisibility = (category: string, displayInStore: string): boolean => {
  // If explicitly set to display in store
  if (displayInStore && displayInStore.toLowerCase() === 'yes') {
    return true;
  }
  
  // Hide bulk items and admin-only categories by default
  const hiddenCategories = ['bulk items', 'my shelf', 'bags & packaging', 'labels & cards'];
  const normalizedCategory = category.toLowerCase();
  
  if (hiddenCategories.some(hidden => normalizedCategory.includes(hidden))) {
    return false;
  }
  
  // Default to visible for customer-facing products
  return true;
};

// Helper function to determine if custom orders should be allowed
const determineCustomOrder = (category: string): boolean => {
  // Categories that typically allow custom orders
  const customOrderCategories = [
    'gift boxes', 'celebration packs', 'pre-packed pecklech', 
    'custom pecklech', 'wedding favours'
  ];
  
  const normalizedCategory = category.toLowerCase();
  return customOrderCategories.some(cat => normalizedCategory.includes(cat));
};

// Helper function to parse visibility settings from import data
const parseVisibilitySettings = (row: any) => {
  return {
    showInReadyToGo: parseBooleanValue(row['Show in Ready to Go'] || row['Show in Ready-to-Go'] || 'Yes'),
    showInBudgetChoice: parseBooleanValue(row['Show in Budget Choice'] || 'Yes'),
    showInBuildPeckel: parseBooleanValue(row['Show in Build Peckel'] || 'Yes'),
    showInItemSelection: parseBooleanValue(row['Show in Item Selection'] || 'Yes'),
    showInPrePackedPeckels: parseBooleanValue(row['Show in Pre-Packed'] || row['Show in Pre-Packed Peckels'] || 'Yes'),
    showInCustomOrders: parseBooleanValue(row['Show in Custom Orders'] || 'Yes')
  };
};

// Helper function to parse pricing fields from import data
const parsePricingFields = (row: any) => {
  return {
    caseSize: parseIntegerValue(row['Case Size'] || 1),
    wholesaleCost: parseNumericValue(row['Wholesale Cost'] || row['Wholesale Cost (£)'] || 0),
    promotionWholesaleCost: parseNumericValue(row['Promotion Wholesale Cost'] || row['Promotion Wholesale Cost (£)'] || 0),
    vatRate: parseNumericValue(row['VAT Rate'] || row['VAT Rate (%)'] || 20),
    isVatable: parseBooleanValue(row['Is VATable'] || 'Yes'),
    profitMargin: parseNumericValue(row['Profit Margin'] || row['Profit Margin (%)'] || 30),
    costPerUnit: parseNumericValue(row['Cost Per Unit (ex VAT)'] || row['Cost Per Unit (ex VAT) (£)'] || 0),
    costPerUnitIncVat: parseNumericValue(row['Cost Per Unit (inc VAT)'] || row['Cost Per Unit (inc VAT) (£)'] || 0),
    saleExVat: parseNumericValue(row['Sale Price (ex VAT)'] || row['Sale Price (ex VAT) (£)'] || 0)
  };
};

export const importProductsFromCSV = (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('CSV Parse Results:', results);
          
          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          const products: Product[] = [];
          
          results.data.forEach((row: any, index: number) => {
            try {
              // Handle different possible column names for item name
              const itemName = row['Item name'] || row['Name'] || row['Product Name'] || row['Item Name'] || '';
              
              // Skip empty rows or rows without a name
              if (!itemName || itemName.trim() === '') {
                return;
              }

              // Get price - try multiple possible column names
              const priceValue = row['Price'] || row['Regular price (before sale)'] || row['price'] || row['Price (£)'] || '0';
              const price = parseNumericValue(priceValue);

              // Get original price for promotions
              const originalPriceValue = row['Original Price'] || row['Original Price (£)'] || '';
              const originalPrice = originalPriceValue ? parseNumericValue(originalPriceValue) : undefined;

              // Check if on promotion
              const isOnPromotion = parseBooleanValue(row['On Promotion'] || '');

              // Get stock/quantity
              const stockValue = row['Quantity'] || row['Stock'] || row['quantity'] || row['stock'] || '0';
              const stock = parseIntegerValue(stockValue);

              // Get category
              const category = mapCategory(row['Category'] || row['category'] || '');

              // Get SKU (make it optional)
              const sku = row['SKU'] || row['sku'] || row['Barcode'] || '';

              // Get description
              const description = row['Description (Online Store and Invoices only)'] || 
                                row['Description'] || 
                                row['description'] || 
                                `${itemName} - Available for purchase`;

              // Get image URL
              let imageUrl = row['Image 1'] || row['Image'] || row['image'] || row['Image URL'] || '';
              
              // Validate image URL or use default
              if (!imageUrl || !imageUrl.startsWith('http')) {
                imageUrl = getDefaultImage();
              }

              // Determine visibility
              const displayInStore = row['Display item in Online Store? (Yes/No)'] || row['Customer Visible'] || row['Visible'] || '';
              const isVisible = parseBooleanValue(row['Admin Visible'] || 'Yes');
              const customerVisible = determineVisibility(category, displayInStore) || parseBooleanValue(displayInStore);

              // Determine custom order availability
              const customOrderValue = row['Custom Order'] || row['Custom Order Available'] || '';
              const allowCustomOrder = parseBooleanValue(customOrderValue) || determineCustomOrder(category);

              // Get minimum stock
              const minimumStock = parseIntegerValue(row['Minimum Stock'] || row['Min Stock'] || '0');

              // Parse visible occasions
              const visibleOccasionsStr = row['Visible Occasions'] || '';
              const visibleOccasions = visibleOccasionsStr ? visibleOccasionsStr.split(';').filter(o => o.trim()) : [];

              // Parse visibility settings (with defaults if not present)
              const visibilitySettings = parseVisibilitySettings(row);

              // Parse pricing fields
              const pricingFields = parsePricingFields(row);

              // Generate SKU if not provided
              const finalSku = sku && sku.trim() 
                ? sku.trim() 
                : `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

              // Create product object
              const product: Product = {
                id: generateUniqueId(index, itemName),
                name: itemName.trim(),
                description: description.trim(),
                price: price,
                originalPrice: originalPrice,
                isOnPromotion: isOnPromotion,
                category: category,
                stock: stock,
                sku: finalSku,
                image: imageUrl,
                isVisible: isVisible,
                customerVisible: customerVisible,
                allowCustomOrder: allowCustomOrder,
                minimumStock: minimumStock,
                visibleOccasions: visibleOccasions,
                visibilitySettings: visibilitySettings,
                ...pricingFields
              };

              // Only add products with valid names and non-negative prices
              if (product.name && product.price >= 0) {
                products.push(product);
              }
            } catch (rowError) {
              console.warn(`Error processing row ${index}:`, rowError);
              // Continue processing other rows
            }
          });

          console.log(`Successfully processed ${products.length} products from CSV`);
          
          if (products.length === 0) {
            reject(new Error('No valid products found in CSV file. Please check the file format.'));
            return;
          }

          resolve(products);
        } catch (error) {
          console.error('CSV processing error:', error);
          reject(new Error('Failed to parse CSV file. Please check the file format.'));
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const importProductsFromExcel = (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Excel Parse Results:', jsonData);

        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in Excel file'));
          return;
        }

        const products: Product[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            // Handle different possible column names for item name
            const itemName = row['Item name'] || row['Name'] || row['Product Name'] || row['Item Name'] || '';
            
            // Skip empty rows or rows without a name
            if (!itemName || itemName.trim() === '') {
              return;
            }

            // Get price - try multiple possible column names
            const priceValue = row['Price'] || row['Regular price (before sale)'] || row['price'] || row['Price (£)'] || '0';
            const price = parseNumericValue(priceValue);

            // Get original price for promotions
            const originalPriceValue = row['Original Price'] || row['Original Price (£)'] || '';
            const originalPrice = originalPriceValue ? parseNumericValue(originalPriceValue) : undefined;

            // Check if on promotion
            const isOnPromotion = parseBooleanValue(row['On Promotion'] || '');

            // Get stock/quantity
            const stockValue = row['Quantity'] || row['Stock'] || row['quantity'] || row['stock'] || '0';
            const stock = parseIntegerValue(stockValue);

            // Get category
            const category = mapCategory(row['Category'] || row['category'] || '');

            // Get SKU (make it optional)
            const sku = row['SKU'] || row['sku'] || row['Barcode'] || '';

            // Get description
            const description = row['Description (Online Store and Invoices only)'] || 
                              row['Description'] || 
                              row['description'] || 
                              `${itemName} - Available for purchase`;

            // Get image URL
            let imageUrl = row['Image 1'] || row['Image'] || row['image'] || row['Image URL'] || '';
            
            // Validate image URL or use default
            if (!imageUrl || !imageUrl.startsWith('http')) {
              imageUrl = getDefaultImage();
            }

            // Determine visibility
            const displayInStore = row['Display item in Online Store? (Yes/No)'] || row['Customer Visible'] || row['Visible'] || '';
            const isVisible = parseBooleanValue(row['Admin Visible'] || 'Yes');
            const customerVisible = determineVisibility(category, displayInStore) || parseBooleanValue(displayInStore);

            // Determine custom order availability
            const customOrderValue = row['Custom Order'] || row['Custom Order Available'] || '';
            const allowCustomOrder = parseBooleanValue(customOrderValue) || determineCustomOrder(category);

            // Get minimum stock
            const minimumStock = parseIntegerValue(row['Minimum Stock'] || row['Min Stock'] || '0');

            // Parse visible occasions
            const visibleOccasionsStr = row['Visible Occasions'] || '';
            const visibleOccasions = visibleOccasionsStr ? visibleOccasionsStr.split(';').filter(o => o.trim()) : [];

            // Parse visibility settings (with defaults if not present)
            const visibilitySettings = parseVisibilitySettings(row);

            // Parse pricing fields
            const pricingFields = parsePricingFields(row);

            // Generate SKU if not provided
            const finalSku = sku && sku.trim() 
              ? sku.trim() 
              : `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Create product object
            const product: Product = {
              id: generateUniqueId(index, itemName),
              name: itemName.trim(),
              description: description.trim(),
              price: price,
              originalPrice: originalPrice,
              isOnPromotion: isOnPromotion,
              category: category,
              stock: stock,
              sku: finalSku,
              image: imageUrl,
              isVisible: isVisible,
              customerVisible: customerVisible,
              allowCustomOrder: allowCustomOrder,
              minimumStock: minimumStock,
              visibleOccasions: visibleOccasions,
              visibilitySettings: visibilitySettings,
              ...pricingFields
            };

            // Only add products with valid names and non-negative prices
            if (product.name && product.price >= 0) {
              products.push(product);
            }
          } catch (rowError) {
            console.warn(`Error processing row ${index}:`, rowError);
            // Continue processing other rows
          }
        });

        console.log(`Successfully processed ${products.length} products from Excel`);
        
        if (products.length === 0) {
          reject(new Error('No valid products found in Excel file. Please check the file format.'));
          return;
        }

        resolve(products);
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(new Error('Failed to parse Excel file. Please check the file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};