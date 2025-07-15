import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF export function for any data
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  options: {
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'a3' | 'letter';
    fontSize?: number;
    includeDate?: boolean;
    customHeaders?: string[];
  } = {}
) {
  const {
    orientation = 'landscape',
    pageSize = 'a4',
    fontSize = 10,
    includeDate = true,
    customHeaders
  } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  // Add export date if requested
  if (includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 14, 30);
  }

  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('No data available', 14, includeDate ? 40 : 30);
  } else {
    // Get headers from first object or use custom headers
    const headers = customHeaders || Object.keys(data[0]);
    
    // Prepare table data
    const tableData = data.map(item => 
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: includeDate ? 35 : 25,
      styles: {
        fontSize: fontSize,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [13, 148, 136], // brand-teal color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 253, 250] // primary-50 color
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
      tableWidth: 'auto',
      columnStyles: {
        // Auto-adjust column widths
      }
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    }
  }

  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}

// PDF export for products
export function exportProductsToPDF(products: any[]) {
  const productData = products.map(product => ({
    'Name': product.name,
    'SKU': product.sku,
    'Category': product.category,
    'Price (£)': product.price.toFixed(2),
    'Original Price (£)': product.originalPrice ? product.originalPrice.toFixed(2) : '',
    'On Promotion': product.isOnPromotion ? 'Yes' : 'No',
    'Stock': product.stock,
    'Min Stock': product.minimumStock || 0,
    'Admin Visible': product.isVisible ? 'Yes' : 'No',
    'Customer Visible': product.customerVisible ? 'Yes' : 'No',
    'Custom Order': product.allowCustomOrder ? 'Yes' : 'No',
    'Case Size': product.caseSize || 1,
    'Wholesale Cost (£)': product.wholesaleCost ? product.wholesaleCost.toFixed(2) : '0.00',
    'VAT Rate (%)': product.vatRate || 20,
    'VAT Status': product.isVatable !== false ? 'Applicable' : 'Exempt',
    'Cost Per Unit (ex VAT) (£)': product.costPerUnit ? product.costPerUnit.toFixed(2) : '0.00',
    'Sale Price (ex VAT) (£)': product.saleExVat ? product.saleExVat.toFixed(2) : '0.00',
    'Profit Margin (%)': product.profitMargin || 30,
    'Description': product.description
  }));

  exportToPDF(productData, 'pecklech-products', 'YH Pecklech - Product Inventory', {
    orientation: 'landscape',
    fontSize: 6
  });
}

// PDF export for orders
export function exportOrdersToPDF(orders: any[]) {
  const orderData = orders.map(order => ({
    'Order ID': order.id,
    'Customer': order.customer.name,
    'Email': order.customer.email,
    'Phone': order.customer.phone,
    'Date': new Date(order.orderDate).toLocaleDateString('en-GB'),
    'Day': order.dayOfWeek || '',
    'Hebrew Date': order.hebrewDate || '',
    'Parsha': order.parsha || '',
    'Occasion': order.occasion || '',
    'Type': order.orderType,
    'Status': order.status,
    'Items': order.items.length,
    'Total (£)': order.total.toFixed(2),
    'Address': `${order.customer.address.street}, ${order.customer.address.city}`,
    'Notes': order.notes || ''
  }));

  exportToPDF(orderData, 'pecklech-orders', 'YH Pecklech - Order Management', {
    orientation: 'landscape',
    fontSize: 7
  });
}

// PDF export for customers
export function exportCustomersToPDF(customers: any[]) {
  const customerData = customers.map(customer => ({
    'ID': customer.id,
    'Name': customer.name,
    'Email': customer.email,
    'Phone': customer.phone,
    'Street': customer.address.street,
    'City': customer.address.city,
    'County': customer.address.state,
    'Postcode': customer.address.zipCode
  }));

  exportToPDF(customerData, 'pecklech-customers', 'YH Pecklech - Customer Database', {
    orientation: 'landscape'
  });
}

// PDF export for occasions
export function exportOccasionsToPDF(occasions: any[]) {
  const occasionData = occasions.map(occasion => ({
    'ID': occasion.id,
    'Name (Yiddish)': occasion.name,
    'Category': occasion.category,
    'Description': occasion.description || '',
    'Visible': occasion.isVisibleOnStorefront ? 'Yes' : 'No',
    'Display Order': occasion.displayOrder
  }));

  exportToPDF(occasionData, 'pecklech-occasions', 'YH Pecklech - Occasions List', {
    orientation: 'portrait'
  });
}

// PDF export for bags
export function exportBagsToPDF(bags: any[]) {
  const bagData = bags.map(bag => ({
    'ID': bag.id,
    'Name': bag.name,
    'Description': bag.description,
    'Color': bag.color,
    'Size': bag.size,
    'Price (£)': bag.price.toFixed(2),
    'Stock': bag.stock,
    'Min Stock': bag.minimumStock || 0,
    'Visible': bag.isVisible ? 'Yes' : 'No'
  }));

  exportToPDF(bagData, 'pecklech-bags', 'YH Pecklech - Bags Inventory', {
    orientation: 'landscape'
  });
}

// PDF export for dashboard summary
export function exportDashboardToPDF(summary: any) {
  const summaryData = [{
    'Total Revenue': `£${summary.totalRevenue}`,
    'Pending Orders': summary.pendingOrders,
    'Total Products': summary.totalProducts,
    'Low Stock Alerts': summary.lowStockAlerts,
    'Total Customers': summary.totalCustomers,
    'Total Orders': summary.totalOrders,
    'Export Date': new Date().toLocaleDateString('en-GB')
  }];

  exportToPDF(summaryData, 'pecklech-dashboard', 'YH Pecklech - Dashboard Summary', {
    orientation: 'portrait',
    fontSize: 12
  });
}

// Simple PDF import function (for structured data)
export async function importFromPDF(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // Note: PDF parsing is complex and limited in browser environment
        // This is a basic implementation that would work better with server-side processing
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For now, we'll show an informative message
        // In production, you'd want to use a more sophisticated PDF parsing library
        // or handle this server-side
        
        alert('PDF import is currently limited. For best results, please convert your PDF to CSV or Excel format first. PDF export functionality is fully available.');
        
        resolve([]);
      } catch (error) {
        reject(new Error('Failed to parse PDF file. Please try converting to CSV or Excel format.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
}