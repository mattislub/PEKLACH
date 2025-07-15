import React, { useState, useRef } from 'react';
import { Search, Users, Mail, Phone, MapPin, Download, FileText, FileSpreadsheet, Upload, Edit, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToExcel, importFromCSV, importFromExcel } from '../../utils/exportUtils';
import { exportCustomersToPDF } from '../../utils/pdfUtils';
import { Customer } from '../../types';

export function CustomerManagement() {
  const { state, dispatch } = useApp();
  const { customers, orders } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.phone2 && customer.phone2.includes(searchTerm)) ||
    (customer.phone3 && customer.phone3.includes(searchTerm))
  );

  const getCustomerOrderCount = (customerId: string) => {
    return orders.filter(order => order.customer.id === customerId).length;
  };

  const getCustomerTotalSpent = (customerId: string) => {
    return orders
      .filter(order => order.customer.id === customerId)
      .reduce((sum, order) => sum + order.total, 0);
  };

  const exportCustomersCSV = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Customer ID': customer.id,
      'Name': customer.name,
      'Email': customer.email,
      'Primary Phone': customer.phone,
      'Secondary Phone': customer.phone2 || '',
      'Third Phone': customer.phone3 || '',
      'Street': customer.address.street,
      'City': customer.address.city,
      'County': customer.address.state,
      'Postcode': customer.address.zipCode,
      'Total Orders': getCustomerOrderCount(customer.id),
      'Total Spent': `£${getCustomerTotalSpent(customer.id).toFixed(2)}`
    }));
    
    exportToCSV(exportData, 'customers');
  };

  const exportCustomersExcel = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Customer ID': customer.id,
      'Name': customer.name,
      'Email': customer.email,
      'Primary Phone': customer.phone,
      'Secondary Phone': customer.phone2 || '',
      'Third Phone': customer.phone3 || '',
      'Street': customer.address.street,
      'City': customer.address.city,
      'County': customer.address.state,
      'Postcode': customer.address.zipCode,
      'Total Orders': getCustomerOrderCount(customer.id),
      'Total Spent (£)': getCustomerTotalSpent(customer.id)
    }));
    
    exportToExcel(exportData, 'customers', 'Customers');
  };

  const exportCustomersPDF = () => {
    exportCustomersToPDF(filteredCustomers);
  };

  const handleImportCustomers = async (file: File) => {
    setImporting(true);
    try {
      let importedData;
      if (file.name.endsWith('.csv')) {
        importedData = await importFromCSV<any>(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedData = await importFromExcel<any>(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      const customers: Customer[] = [];
      
      importedData.forEach((row: any, index: number) => {
        try {
          const customer: Customer = {
            id: row['Customer ID'] || row['ID'] || `imported-customer-${Date.now()}-${index}`,
            name: row['Name'] || row['Customer Name'] || 'Unknown Customer',
            email: row['Email'] || row['Customer Email'] || '',
            phone: row['Primary Phone'] || row['Phone'] || row['Customer Phone'] || '',
            phone2: row['Secondary Phone'] || row['Phone 2'] || row['Second Phone'] || '',
            phone3: row['Third Phone'] || row['Phone 3'] || '',
            address: {
              street: row['Street'] || row['Address'] || '',
              city: row['City'] || '',
              state: row['County'] || row['State'] || '',
              zipCode: row['Postcode'] || row['ZipCode'] || row['Zip Code'] || ''
            }
          };

          // Only add customers with valid names
          if (customer.name && customer.name !== 'Unknown Customer') {
            customers.push(customer);
          }
        } catch (rowError) {
          console.warn(`Error processing customer row ${index}:`, rowError);
        }
      });

      if (customers.length > 0) {
        dispatch({ type: 'IMPORT_CUSTOMERS_BATCH', payload: customers });
        alert(`Successfully imported ${customers.length} customers!`);
      } else {
        alert('No valid customers found in the import file.');
      }
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({...customer});
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    
    dispatch({ 
      type: 'UPDATE_CUSTOMER', 
      payload: editingCustomer 
    });
    
    setEditingCustomer(null);
  };

  const handleCustomerInputChange = (field: string, value: string) => {
    if (!editingCustomer) return;
    
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setEditingCustomer({
        ...editingCustomer,
        address: {
          ...editingCustomer.address,
          [addressField]: value
        }
      });
    } else {
      setEditingCustomer({
        ...editingCustomer,
        [field]: value
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-2  text-lg">View and manage customer information</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={exportCustomersCSV}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportCustomersExcel}
              className="bg-brand-lime hover:bg-brand-lime-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={exportCustomersPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{importing ? 'Importing...' : 'Import'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleImportCustomers(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
          </div>
          <div className="mt-6 flex items-center text-lg text-gray-600 bg-primary-50 px-4 py-3 rounded-xl w-fit">
            <Users className="h-5 w-5 mr-2 text-brand-teal" />
            {filteredCustomers.length} customers found
          </div>
        </div>

        {/* Edit Customer Modal */}
        {editingCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) => handleCustomerInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => handleCustomerInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Phone
                      </label>
                      <input
                        type="tel"
                        value={editingCustomer.phone}
                        onChange={(e) => handleCustomerInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Phone
                      </label>
                      <input
                        type="tel"
                        value={editingCustomer.phone2 || ''}
                        onChange={(e) => handleCustomerInputChange('phone2', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Third Phone
                      </label>
                      <input
                        type="tel"
                        value={editingCustomer.phone3 || ''}
                        onChange={(e) => handleCustomerInputChange('phone3', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.address.street}
                      onChange={(e) => handleCustomerInputChange('address.street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editingCustomer.address.city}
                        onChange={(e) => handleCustomerInputChange('address.city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        type="text"
                        value={editingCustomer.address.state}
                        onChange={(e) => handleCustomerInputChange('address.state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode
                      </label>
                      <input
                        type="text"
                        value={editingCustomer.address.zipCode}
                        onChange={(e) => handleCustomerInputChange('address.zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCustomer}
                    className="px-6 py-3 text-white bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark rounded-xl font-medium transition-colors"
                  >
                    Update Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-teal">
                      {getCustomerOrderCount(customer.id)} orders
                    </p>
                    <p className="text-sm text-gray-500">
                      £{getCustomerTotalSpent(customer.id).toFixed(2)} spent
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.phone2 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{customer.phone2}</span>
                    </div>
                  )}
                  {customer.phone3 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{customer.phone3}</span>
                    </div>
                  )}
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p>{customer.address.street}</p>
                      <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button 
                      className="flex-1 bg-primary-50 hover:bg-primary-100 text-brand-teal py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                      onClick={() => {
                        // Filter orders for this customer and navigate to orders page
                        alert(`View Orders functionality will be implemented in a future update.`);
                      }}
                    >
                      View Orders
                    </button>
                    <button 
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Customer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <Users className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-6 text-xl font-medium text-gray-900">No customers found</h3>
            <p className="mt-3 text-gray-500 text-lg">
              {searchTerm ? 'No customers match your search criteria.' : 'Customers will appear here as orders are placed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}