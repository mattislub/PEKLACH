import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, CreditCard, ExternalLink, Clock, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { verifyPaymentStatus } from '../utils/sumupService';

export function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: appState, dispatch } = useApp();
  const { adminSettings } = appState;
  
  const orderId = location.state?.orderId;
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  
  // Find the order in the state
  const order = orderId ? appState.orders.find(o => o.id === orderId) : null;
  
  // Redirect if no order found
  useEffect(() => {
    if (!orderId || !order) {
      navigate('/');
    }
  }, [orderId, order, navigate]);
  
  // Check payment status if SumUp is enabled and we have a payment ID
  useEffect(() => {
    if (adminSettings.sumupEnabled && order?.paymentId && order?.paymentStatus === 'pending') {
      checkPaymentStatus();
    }
  }, [order, adminSettings.sumupEnabled]);
  
  const checkPaymentStatus = async () => {
    if (!order?.paymentId) return;
    
    setIsCheckingPayment(true);
    try {
      const result = await verifyPaymentStatus(
        order.paymentId,
        adminSettings.sumupMerchantCode,
        adminSettings.sumupApiKey
      );
      
      if (result.status !== order.paymentStatus) {
        // Update payment status in state
        dispatch({
          type: 'UPDATE_ORDER_PAYMENT',
          payload: {
            orderId: order.id,
            status: result.status.toLowerCase() as 'pending' | 'paid' | 'failed'
          }
        });
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  };
  
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
        <CheckCircle className="mx-auto h-20 w-20 text-brand-teal mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for your order! We've received your order and will process it shortly.
        </p>

        {orderId && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-2xl mb-8">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono font-bold text-gray-900 text-lg">{orderId}</p>
          </div>
        )}
        
        {/* Payment Status */}
        {adminSettings.sumupEnabled && order.paymentLink && (
          <div className={`p-6 rounded-2xl mb-8 ${
            order.paymentStatus === 'paid' ? 'bg-green-50 border border-green-200' :
            order.paymentStatus === 'failed' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              {order.paymentStatus === 'paid' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : order.paymentStatus === 'failed' ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-500" />
              )}
              <h3 className="font-bold text-lg">
                {order.paymentStatus === 'paid' ? 'Payment Complete' :
                 order.paymentStatus === 'failed' ? 'Payment Failed' :
                 'Payment Pending'}
              </h3>
            </div>
            
            <p className="text-sm mb-4">
              {order.paymentStatus === 'paid' ? 
                'Your payment has been successfully processed. Thank you!' :
               order.paymentStatus === 'failed' ? 
                'There was an issue with your payment. Please try again using the payment link below.' :
                'Your payment is awaiting completion. Please use the payment link below to complete your purchase.'}
            </p>
            
            <div className="space-y-3">
              {order.paymentStatus !== 'paid' && (
                <a 
                  href={order.paymentLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pay Now</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {order.invoiceUrl && (
                <a 
                  href={order.invoiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>View Invoice</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {order.paymentStatus === 'pending' && !isCheckingPayment && (
                <button
                  onClick={checkPaymentStatus}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-2 px-4 rounded-xl font-medium transition-colors text-sm"
                >
                  Check Payment Status
                </button>
              )}
              
              {isCheckingPayment && (
                <div className="text-sm text-yellow-600 flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Checking payment status...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
          >
            <Home className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
          
          <Link
            to="/admin/orders"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl font-medium transition-colors flex items-center justify-center space-x-2 text-lg"
          >
            <Package className="h-5 w-5" />
            <span>View All Orders</span>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          You will receive an email confirmation shortly with your order details.
        </p>
      </div>
    </div>
  );
}