import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Settings, Package, Clock, CheckCircle, Truck, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function CustomerAccount() {
  const { state: authState } = useAuth();
  const { state: appState } = useApp();
  const { orders } = appState;
  
  // Filter orders for the current user
  const userOrders = orders.filter(order => 
    order.customer.email === authState.user?.email
  );
  
  // Get recent orders (last 3)
  const recentOrders = userOrders.slice(0, 3);
  
  // Count orders by status
  const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
  const processingOrders = userOrders.filter(order => order.status === 'processing').length;
  const shippedOrders = userOrders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = userOrders.filter(order => order.status === 'delivered').length;
  
  // Calculate total spent
  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {authState.user?.name}!
          </p>
        </div>
        
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Total Orders</h3>
              <ShoppingBag className="h-6 w-6 text-brand-teal" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{userOrders.length}</p>
            <Link to="/account/orders" className="text-sm text-brand-teal hover:text-brand-teal-dark mt-2 inline-block">
              View all orders
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Pending</h3>
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingOrders + processingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              {pendingOrders} pending, {processingOrders} processing
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Delivered</h3>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{deliveredOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              {shippedOrders} in transit
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Total Spent</h3>
              <CreditCard className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">£{totalSpent.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">
              Across all orders
            </p>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link 
              to="/account/orders" 
              className="text-brand-teal hover:text-brand-teal-dark font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-6">
              {recentOrders.map(order => (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="mb-4 md:mb-0">
                    <p className="font-bold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString('en-GB')}
                    </p>
                    {order.occasion && (
                      <p className="text-xs text-brand-teal mt-1">
                        {order.occasion}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="font-bold text-gray-900">£{order.total.toFixed(2)}</p>
                  </div>
                  
                  <div className="mb-4 md:mb-0 flex items-center">
                    {order.status === 'pending' && (
                      <span className="flex items-center text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                    {order.status === 'processing' && (
                      <span className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm">
                        <Package className="h-4 w-4 mr-1" />
                        Processing
                      </span>
                    )}
                    {order.status === 'shipped' && (
                      <span className="flex items-center text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Shipped
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Delivered
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancelled
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
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
        
        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
            <Link 
              to="/account/settings" 
              className="flex items-center text-brand-teal hover:text-brand-teal-dark font-medium"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Personal Details</h3>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700"><strong>Name:</strong> {authState.user?.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {authState.user?.email}</p>
                <p className="text-gray-700"><strong>Primary Phone:</strong> {authState.user?.phone || 'Not provided'}</p>
                {authState.user?.phone2 && (
                  <p className="text-gray-700"><strong>Secondary Phone:</strong> {authState.user.phone2}</p>
                )}
                {authState.user?.phone3 && (
                  <p className="text-gray-700"><strong>Third Phone:</strong> {authState.user.phone3}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Shipping Address</h3>
              {authState.user?.address ? (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700">{authState.user.address.street}</p>
                  <p className="text-gray-700">{authState.user.address.city}, {authState.user.address.state}</p>
                  <p className="text-gray-700">{authState.user.address.zipCode}</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-gray-500">
                  No shipping address saved. Add one in your account settings.
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Account created on {new Date(authState.user?.createdAt || '').toLocaleDateString('en-GB')}
                </p>
                {authState.user?.lastLogin && (
                  <p className="text-sm text-gray-500">
                    Last login: {new Date(authState.user.lastLogin).toLocaleDateString('en-GB')} at {new Date(authState.user.lastLogin).toLocaleTimeString('en-GB')}
                  </p>
                )}
              </div>
              
              <Link
                to="/account/settings"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}