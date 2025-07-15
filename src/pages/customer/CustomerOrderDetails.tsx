import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  X, 
  Calendar, 
  CreditCard, 
  ExternalLink, 
  FileText,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function CustomerOrderDetails() {
  const { state: authState } = useAuth();
  const { state: appState } = useApp();
  const { orders } = appState;
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // Find the order
  const order = orders.find(o => o.id === orderId);
  
  // Check if order exists and belongs to the current user
  if (!order || order.customer.email !== authState.user?.email) {
    // Redirect to orders page if order not found or doesn't belong to user
    navigate('/account/orders');
    return null;
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/account/orders" className="flex items-center text-brand-teal hover:text-brand-teal-dark mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">
                Order ID: {order.id}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <span className={`flex items-center px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 font-medium capitalize">{order.status}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Order Date</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
                
                {order.occasion && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Occasion</span>
                    <span className="font-medium text-gray-900" dir="rtl">
                      {order.occasion}
                    </span>
                  </div>
                )}
                
                {order.hebrewDate && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Hebrew Date</span>
                    <span className="font-medium text-gray-900" dir="rtl">
                      {order.hebrewDate}
                    </span>
                  </div>
                )}
                
                {order.deliveryMethod && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Delivery Method</span>
                    <span className="font-medium text-gray-900">
                      {order.deliveryMethod.name}
                    </span>
                  </div>
                )}
                
                {order.deliveryPrice !== undefined && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-gray-900">
                      {order.deliveryPrice > 0 ? `£${order.deliveryPrice.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                )}
                
                {order.paymentStatus && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Payment Status</span>
                    <div className="flex items-center">
                      <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusIcon(order.paymentStatus)}
                        <span className="ml-1 capitalize">{order.paymentStatus}</span>
                      </span>
                      
                      {order.paymentStatus === 'pending' && order.paymentLink && (
                        <a 
                          href={order.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-xs text-brand-teal hover:text-brand-teal-dark flex items-center"
                        >
                          Pay Now
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {order.invoiceUrl && (
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Invoice</span>
                    <a 
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal hover:text-brand-teal-dark flex items-center font-medium"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Invoice
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-gray-100">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × £{item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        £{(item.quantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Add bag if present */}
                {order.selectedBag && (
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <img 
                      src={order.selectedBag.image || 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500'} 
                      alt={order.selectedBag.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{order.selectedBag.name}</h3>
                      <p className="text-sm text-gray-500">
                        {order.selectedBag.color} • {order.selectedBag.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        £{order.selectedBag.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Add label if present */}
                {order.selectedLabel && (
                  <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                    <img 
                      src={order.selectedLabel.designImage || 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500'} 
                      alt={order.selectedLabel.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{order.selectedLabel.name}</h3>
                      <p className="text-sm text-gray-500">
                        {order.selectedLabel.isPreDesigned ? 'Pre-designed Label' : 'Custom Label'}
                      </p>
                      {order.personalText && (
                        <p className="text-xs text-purple-600 italic mt-1">
                          "{order.personalText}"
                        </p>
                      )}
                      {order.simchaDate && (
                        <p className="text-xs text-purple-600 mt-1" dir="rtl">
                          {order.simchaDate}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        £{order.selectedLabel.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>£{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Shipping</span>
                    {order.deliveryPrice !== undefined ? (
                      order.deliveryPrice > 0 ? (
                        <span>£{order.deliveryPrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-brand-teal font-medium">Free</span>
                      )
                    ) : (
                      <span className="text-brand-teal font-medium">Free</span>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>£{((order.total || 0) + (order.deliveryPrice || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping & Payment Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700">{order.customer.name}</p>
                    <p className="text-gray-700">{order.customer.address.street}</p>
                    <p className="text-gray-700">
                      {order.customer.address.city}, {order.customer.address.state}
                    </p>
                    <p className="text-gray-700">{order.customer.address.zipCode}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700">
                      <strong>Email:</strong> {order.customer.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-700">
                        <strong>Primary Phone:</strong> {order.customer.phone}
                      </p>
                    </div>
                    {order.customer.phone2 && (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-700">
                          <strong>Secondary Phone:</strong> {order.customer.phone2}
                        </p>
                      </div>
                    )}
                    {order.customer.phone3 && (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-700">
                          <strong>Third Phone:</strong> {order.customer.phone3}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {order.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Order Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Information */}
            {order.paymentStatus && (
              <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-brand-teal" />
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Payment Method</span>
                    <span className="font-medium text-gray-900">
                      Online Payment
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span>Payment Date</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentStatus === 'paid' 
                        ? new Date(order.orderDate).toLocaleDateString('en-GB')
                        : 'Pending'}
                    </span>
                  </div>
                  
                  {order.paymentStatus === 'pending' && order.paymentLink && (
                    <a 
                      href={order.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white py-3 px-4 rounded-xl font-medium transition-colors text-center mt-4"
                    >
                      Complete Payment
                    </a>
                  )}
                  
                  {order.invoiceUrl && (
                    <a 
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors text-center mt-4 flex items-center justify-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Invoice
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Need Help? */}
            <div className="bg-primary-50 rounded-2xl p-6 border border-brand-teal-dark">
              <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                If you have any questions about your order, please contact our customer service team.
              </p>
              <Link
                to="/contact"
                className="block w-full bg-brand-teal hover:bg-brand-teal-dark text-white py-2 px-4 rounded-lg font-medium transition-colors text-center text-sm"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}