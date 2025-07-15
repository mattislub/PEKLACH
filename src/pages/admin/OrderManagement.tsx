import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, Eye, Edit, Download, Upload, FileText, Trash2, Check, X, ExternalLink, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreateOrderModal } from '../../components/admin/CreateOrderModal';
import { exportToCSV, exportToExcel, importFromCSV, importFromExcel } from '../../utils/exportUtils';
import { exportOrdersToPDF } from '../../utils/pdfUtils';
import { Order, Customer } from '../../types';

export function OrderManagement() {
  const { state, dispatch } = useApp();
  const { orders, occasions } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.customer.phone && order.customer.phone.includes(searchTerm)) ||
                         (order.customer.phone2 && order.customer.phone2.includes(searchTerm)) ||
                         (order.customer.phone3 && order.customer.phone3.includes(searchTerm));
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesType = !typeFilter || order.orderType === typeFilter;
    const matchesOccasion = !occasionFilter || order.occasion === occasionFilter;
    return matchesSearch && matchesStatus && matchesType && matchesOccasion;
  });

  const updateOrderStatus = (orderId: string, status: any) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status }
    });
  };

  const handleViewOrder = (orderId: string) => {
    setViewOrderId(orderId);
  };

  const handleEditOrder = (orderId: string) => {
    setEditOrderId(orderId);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      // Implement delete order functionality
      alert('Order deleted successfully!');
    }
  };

  const exportOrdersCSV = () => {
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer.name,
      'Customer Email': order.customer.email,
      'Primary Phone': order.customer.phone,
      'Secondary Phone': order.customer.phone2 || '',
      'Third Phone': order.customer.phone3 || '',
      'Order Date': new Date(order.orderDate).toLocaleDateString('en-GB'),
      'Day of Week': order.dayOfWeek || '',
      'Hebrew Day': order.hebrewDayOfWeek || '',
      'Hebrew Date': order.hebrewDate || '',
      'Parsha': order.parsha || '',
      'Occasion': order.occasion || '',
      'Order Type': order.orderType,
      'Status': order.status,
      'Total': `£${order.total.toFixed(2)}`,
      'Items Count': order.items.length,
      'Notes': order.notes || '',
      'Address': `${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zipCode}`
    }));
    
    exportToCSV(exportData, 'orders');
  };

  const exportOrdersExcel = () => {
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer.name,
      'Customer Email': order.customer.email,
      'Primary Phone': order.customer.phone,
      'Secondary Phone': order.customer.phone2 || '',
      'Third Phone': order.customer.phone3 || '',
      'Order Date': new Date(order.orderDate).toLocaleDateString('en-GB'),
      'Day of Week': order.dayOfWeek || '',
      'Hebrew Day': order.hebrewDayOfWeek || '',
      'Hebrew Date': order.hebrewDate || '',
      'Parsha': order.parsha || '',
      'Occasion': order.occasion || '',
      'Order Type': order.orderType,
      'Status': order.status,
      'Total (£)': order.total,
      'Items Count': order.items.length,
      'Notes': order.notes || '',
      'Street': order.customer.address.street,
      'City': order.customer.address.city,
      'County': order.customer.address.state,
      'Postcode': order.customer.address.zipCode
    }));
    
    exportToExcel(exportData, 'orders', 'Orders');
  };

  const exportOrdersPDF = () => {
    exportOrdersToPDF(filteredOrders);
  };

  const handleImportOrders = async (file: File) => {
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

      const orders: Order[] = [];
      
      importedData.forEach((row: any, index: number) => {
        try {
          // Parse customer data
          const customer: Customer = {
            id: row['Customer ID'] || `imported-customer-${Date.now()}-${index}`,
            name: row['Customer Name'] || row['Name'] || 'Unknown Customer',
            email: row['Customer Email'] || row['Email'] || '',
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

          // Parse order data
          const order: Order = {
            id: row['Order ID'] || `imported-order-${Date.now()}-${index}`,
            customer,
            items: [], // Items would need to be parsed from a JSON column or separate import
            total: parseFloat(row['Total'] || row['Total (£)'] || '0'),
            status: (row['Status'] || 'pending') as Order['status'],
            orderDate: row['Order Date'] ? new Date(row['Order Date']).toISOString() : new Date().toISOString(),
            orderType: (row['Order Type'] || 'online') as Order['orderType'],
            notes: row['Notes'] || '',
            occasion: row['Occasion'] || '',
            hebrewDate: row['Hebrew Date'] || '',
            parsha: row['Parsha'] || '',
            dayOfWeek: row['Day of Week'] || '',
            hebrewDayOfWeek: row['Hebrew Day'] || ''
          };

          orders.push(order);
        } catch (rowError) {
          console.warn(`Error processing order row ${index}:`, rowError);
        }
      });

      if (orders.length > 0) {
        dispatch({ type: 'IMPORT_ORDERS_BATCH', payload: orders });
        alert(`Successfully imported ${orders.length} orders!`);
      } else {
        alert('No valid orders found in the import file.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'in-person': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get order details for view modal
  const viewOrder = viewOrderId ? orders.find(order => order.id === viewOrderId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage all customer orders and track fulfillment</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={exportOrdersCSV}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportOrdersExcel}
              className="bg-brand-lime hover:bg-brand-lime-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={exportOrdersPDF}
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-6 py-3 rounded-2xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add Manual Order</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleImportOrders(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="phone">Phone</option>
              <option value="in-person">In-Person</option>
            </select>

            <select
              value={occasionFilter}
              onChange={(e) => setOccasionFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Occasions</option>
              {occasions.map(occasion => (
                <option key={occasion.id} value={occasion.name}>
                  {occasion.name}
                </option>
              ))}
            </select>

            <div className="flex items-center text-lg text-gray-600 bg-primary-50 px-4 py-3 rounded-xl">
              <Filter className="h-5 w-5 mr-2 text-brand-teal" />
              {filteredOrders.length} orders found
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-brand-teal to-brand-lime text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Date & Hebrew Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Occasion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customer.phone}
                        </div>
                        {order.customer.phone2 && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customer.phone2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.dayOfWeek} / {order.hebrewDayOfWeek}
                        </div>
                        {order.hebrewDate && (
                          <div className="text-xs text-brand-teal font-medium mt-1">
                            {order.hebrewDate}
                          </div>
                        )}
                        {order.parsha && (
                          <div className="text-xs text-gray-500">
                            {order.parsha}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.occasion && (
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-accent-100 text-brand-lime-dark">
                          {order.occasion}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(order.orderType)}`}>
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-sm font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)} focus:ring-2 focus:ring-brand-teal`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">£{order.total.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="text-brand-teal hover:text-brand-teal-dark transition-colors p-2 hover:bg-primary-50 rounded-lg"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order.id)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-lg"
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setViewOrderId(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Order Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Order Information</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium">{viewOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(viewOrder.orderDate).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hebrew Date</p>
                        <p className="font-medium">{viewOrder.hebrewDate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Parsha</p>
                        <p className="font-medium">{viewOrder.parsha || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Occasion</p>
                        <p className="font-medium">{viewOrder.occasion || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Type</p>
                        <p className="font-medium capitalize">{viewOrder.orderType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">{viewOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-brand-teal">£{viewOrder.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {viewOrder.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="bg-yellow-50 p-3 rounded-lg text-gray-700 whitespace-pre-line">{viewOrder.notes}</p>
                    </div>
                  )}
                  
                  {/* Label Information */}
                  {viewOrder.selectedLabel && (
                    <div>
                      <p className="text-sm text-gray-500">Label</p>
                      <div className="bg-primary-50 p-3 rounded-lg">
                        <p className="font-medium">{viewOrder.selectedLabel.name}</p>
                        {viewOrder.customLabelDesign && (
                          <p className="text-sm text-gray-600 mt-1">{viewOrder.customLabelDesign}</p>
                        )}
                        {viewOrder.personalText && (
                          <p className="text-sm text-gray-600 mt-1">Personal Text: "{viewOrder.personalText}"</p>
                        )}
                        {viewOrder.simchaDate && (
                          <p className="text-sm text-gray-600 mt-1">Simcha Date: {viewOrder.simchaDate}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Bag Information */}
                  {viewOrder.selectedBag && (
                    <div>
                      <p className="text-sm text-gray-500">Bag</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium">{viewOrder.selectedBag.name}</p>
                        <p className="text-sm text-gray-600">{viewOrder.selectedBag.color} • {viewOrder.selectedBag.size}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Customer Information</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{viewOrder.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{viewOrder.customer.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Primary Phone</p>
                        <p className="font-medium">{viewOrder.customer.phone || 'N/A'}</p>
                      </div>
                      {viewOrder.customer.phone2 && (
                        <div>
                          <p className="text-sm text-gray-500">Secondary Phone</p>
                          <p className="font-medium">{viewOrder.customer.phone2}</p>
                        </div>
                      )}
                      {viewOrder.customer.phone3 && (
                        <div>
                          <p className="text-sm text-gray-500">Third Phone</p>
                          <p className="font-medium">{viewOrder.customer.phone3}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{viewOrder.customer.address.street}</p>
                        <p className="font-medium">
                          {viewOrder.customer.address.city}, {viewOrder.customer.address.state} {viewOrder.customer.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                                }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                <div className="text-xs text-gray-500">{item.product.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">£{item.product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">£{(item.product.price * item.quantity).toFixed(2)}</div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Add bag row if present */}
                      {viewOrder.selectedBag && (
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={viewOrder.selectedBag.image || 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500'} 
                                alt={viewOrder.selectedBag.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{viewOrder.selectedBag.name}</div>
                                <div className="text-xs text-gray-500">{viewOrder.selectedBag.color} • {viewOrder.selectedBag.size}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">£{viewOrder.selectedBag.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">1</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">£{viewOrder.selectedBag.price.toFixed(2)}</div>
                          </td>
                        </tr>
                      )}
                      
                      {/* Add label row if present */}
                      {viewOrder.selectedLabel && (
                        <tr className="bg-purple-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={viewOrder.selectedLabel.designImage || 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500'} 
                                alt={viewOrder.selectedLabel.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{viewOrder.selectedLabel.name}</div>
                                <div className="text-xs text-gray-500">
                                  {viewOrder.selectedLabel.isPreDesigned ? 'Pre-designed Label' : 'Custom Label'}
                                  {viewOrder.personalText && ` • "${viewOrder.personalText}"`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">£{viewOrder.selectedLabel.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">1</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">£{viewOrder.selectedLabel.price.toFixed(2)}</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">Total:</td>
                        <td className="px-6 py-4 font-bold text-brand-teal">£{viewOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setViewOrderId(null)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewOrderId(null);
                    handleEditOrder(viewOrder.id);
                  }}
                  className="px-6 py-3 text-white bg-brand-teal hover:bg-brand-teal-dark rounded-xl font-medium transition-colors"
                >
                  Edit Order
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Print Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
              <button
                onClick={() => setEditOrderId(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium">Order Editing Coming Soon</p>
                    <p className="text-yellow-700 text-sm">
                      The ability to edit existing orders is coming in a future update. For now, you can view order details and update the status.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setEditOrderId(null)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}