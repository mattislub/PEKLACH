import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Clock, Package, Truck, CheckCircle, X, Calendar, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function CustomerOrders() {
  const { state: authState } = useAuth();
  const { state: appState } = useApp();
  const { orders } = appState;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Filter orders for the current user
  const userOrders = orders.filter(order => 
    order.customer.email === authState.user?.email
  );
  
  // Apply filters and search
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.occasion && order.occasion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.orderDate).getTime();
    const dateB = new Date(b.orderDate).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            View and track all your orders
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {sortedOrders.length} of {userOrders.length} orders
          </div>
        </div>
        
        {/* Orders List */}
        {sortedOrders.length > 0 ? (
          <div className="space-y-6">
            {sortedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {new Date(order.orderDate).toLocaleDateString('en-GB')}
                      </p>
                      {order.occasion && (
                        <p className="text-xs text-brand-teal font-medium mt-1">
                          {order.occasion}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <p className="font-bold text-gray-900 text-lg">£{order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.customer.address.street}<br />
                        {order.customer.address.city}, {order.customer.address.state}<br />
                        {order.customer.address.zipCode}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <li key={index} className="truncate">
                            {item.quantity}x {item.product.name}
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="text-brand-teal">
                            +{order.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      {/* Payment Status */}
                      {order.paymentStatus && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Status</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </>
                            ) : order.paymentStatus === 'failed' ? (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                          
                          {order.paymentStatus === 'pending' && order.paymentLink && (
                            <a 
                              href={order.paymentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-teal hover:text-brand-teal-dark flex items-center mt-1"
                            >
                              Complete Payment
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      )}
                      
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {userOrders.length > 0 
                ? 'No orders match your current filters. Try adjusting your search criteria.'
                : 'You haven\'t placed any orders yet. Start shopping to see your orders here.'}
            </p>
            <Link
              to="/"
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}