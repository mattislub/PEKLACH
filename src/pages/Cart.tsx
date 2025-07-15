import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import { CartItem } from '../components/CartItem';
import { useApp } from '../context/AppContext';

export function Cart() {
  const { state } = useApp();
  const { cart } = state;
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Check if cart contains budget choice or ready-to-go items
  const hasBudgetChoiceItems = cart.some(item => 
    item.product.category === 'Budget Choice Pecklech'
  );
  const hasReadyToGoItems = cart.some(item => 
    item.product.category === 'Ready to Go Pecklech' || 
    item.product.category === 'Pre-Packed Pecklech'
  );

  const handleAddAnotherPeckel = () => {
    // Navigate back to ordering method selection
    navigate('/ordering-method');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-3 text-gray-600 text-lg">Start shopping to add items to your cart.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-8 py-4 rounded-2xl transition-all duration-200 font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            to="/"
            className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark transition-colors font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl h-fit border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 text-lg">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-lg">
                <span>Delivery</span>
                <span className="text-brand-teal font-medium">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-2xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Add Another Peckel Button - Show for Budget Choice and Ready-to-Go items */}
            {(hasBudgetChoiceItems || hasReadyToGoItems) && (
              <button
                onClick={handleAddAnotherPeckel}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 text-center text-lg shadow-lg hover:shadow-xl mb-4 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Another Peckel</span>
              </button>
            )}

            <Link
              to="/checkout"
              className="w-full bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 text-center block text-lg shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}