import React from 'react';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Users, DollarSign, Download, Upload, FileText, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import { exportDashboardToPDF } from '../../utils/pdfUtils';
import { fetchExpiringProducts } from '../../utils/supabaseClient';

export function AdminDashboard() {
  const { state } = useApp();
  const { products, orders, customers } = state;
  const [expiringProducts, setExpiringProducts] = React.useState<any[]>([]);
  const [isLoadingExpiring, setIsLoadingExpiring] = React.useState(false);

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.stock <= (product.minimumStock || 5));
  const totalProducts = products.length;

  // Load expiring products
  React.useEffect(() => {
    const loadExpiringProducts = async () => {
      setIsLoadingExpiring(true);
      try {
        const data = await fetchExpiringProducts();
        setExpiringProducts(data);
      } catch (error) {
        console.error('Error loading expiring products:', error);
      } finally {
        setIsLoadingExpiring(false);
      }
    };
    
    loadExpiringProducts();
  }, []);

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue',
      value: `£${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-brand-teal',
      bgColor: 'bg-primary-100'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: ShoppingCart,
      color: 'text-brand-lime',
      bgColor: 'bg-accent-100'
    },
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      label: 'Expiring Soon',
      value: expiringProducts.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  const exportAllData = () => {
    const dashboardData = {
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders,
        totalProducts,
        lowStockAlerts: lowStockProducts.length,
        totalCustomers: customers.length,
        totalOrders: orders.length,
        exportDate: new Date().toISOString()
      },
      recentOrders: recentOrders.map(order => ({
        'Order ID': order.id,
        'Customer': order.customer.name,
        'Date': new Date(order.orderDate).toLocaleDateString('en-GB'),
        'Status': order.status,
        'Total': `£${order.total.toFixed(2)}`
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        'Product Name': product.name,
        'SKU': product.sku,
        'Current Stock': product.stock,
        'Minimum Stock': product.minimumStock || 0,
        'Category': product.category
      }))
    };

    exportToCSV([dashboardData.summary], 'dashboard-summary');
  };

  const exportAllDataExcel = () => {
    const summaryData = [{
      'Total Revenue': `£${totalRevenue.toFixed(2)}`,
      'Pending Orders': pendingOrders,
      'Total Products': totalProducts,
      'Low Stock Alerts': lowStockProducts.length,
      'Total Customers': customers.length,
      'Total Orders': orders.length,
      'Export Date': new Date().toLocaleDateString('en-GB')
    }];

    exportToExcel(summaryData, 'dashboard-data', 'Dashboard Summary');
  };

  const exportAllDataPDF = () => {
    const summary = {
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders,
      totalProducts,
      lowStockAlerts: lowStockProducts.length,
      totalCustomers: customers.length,
      totalOrders: orders.length
    };

    exportDashboardToPDF(summary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-3 text-lg">Welcome back! Here's an overview of your Pecklech business.</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={exportAllData}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportAllDataExcel}
              className="bg-brand-lime hover:bg-brand-lime-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={exportAllDataPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-8">
              {recentOrders.length > 0 ? (
                <div className="space-y-6">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{order.id}</p>
                        <p className="text-gray-600">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('en-GB')}
                        </p>
                        {order.occasion && (
                          <p className="text-xs text-brand-teal font-medium mt-1">
                            {order.occasion}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">£{order.total.toFixed(2)}</p>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12 text-lg">No orders yet</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
                Low Stock Alerts
              </h2>
            </div>
            <div className="p-8">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-6">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-6 bg-amber-50 rounded-2xl border border-amber-200">
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-gray-600">SKU: {product.sku}</p>
                        {product.isOnPromotion && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            On Sale
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-800 text-lg">
                          {product.stock} left
                        </p>
                        <p className="text-sm text-amber-600">
                          Min: {product.minimumStock || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12 text-lg">All products are well stocked</p>
              )}
            </div>
          </div>
          
          {/* Expiring Products */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 text-orange-600 mr-3" />
                Expiring Products
              </h2>
            </div>
            <div className="p-8">
              {isLoadingExpiring ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-brand-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading expiring products...</p>
                </div>
              ) : expiringProducts.length > 0 ? (
                <div className="space-y-6">
                  {expiringProducts.map(product => (
                    <div key={product.batch_id} className="flex items-center justify-between p-6 bg-orange-50 rounded-2xl border border-orange-200">
                      <div>
                        <p className="font-bold text-gray-900">{product.product_name}</p>
                        <p className="text-gray-600">Batch: {product.batch_number}</p>
                        <p className="text-sm text-orange-600 font-medium">
                          Expires in {product.days_until_expiry} days ({new Date(product.expiry_date).toLocaleDateString()})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-800 text-lg">
                          {product.quantity} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12 text-lg">No products expiring soon</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}