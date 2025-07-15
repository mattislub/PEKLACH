import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, DollarSign, Package, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function BudgetChoicePeckels() {
  const { state, dispatch } = useApp();
  const { selectedOccasion, budgetChoicePeckels, labels, globalQuantity } = state;
  const navigate = useNavigate();
  const [selectedPeckelId, setSelectedPeckelId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(globalQuantity);

  if (!selectedOccasion) {
    navigate('/');
    return null;
  }

  // Filter peckels for the selected occasion
  const availablePeckels = budgetChoicePeckels.filter(peckel => 
    peckel.isVisible && (
      peckel.occasions.length === 0 || 
      peckel.occasions.includes(selectedOccasion)
    )
  );

  // Filter labels for the selected occasion
  const availableLabels = labels.filter(label => {
    if (!label.isVisible) return false;
    if (!label.visibleOccasions || label.visibleOccasions.length === 0) return true;
    return label.visibleOccasions.includes(selectedOccasion);
  });

  const handleGlobalQuantityChange = (newQuantity: number) => {
    const updatedQuantity = Math.max(1, newQuantity);
    setQuantity(updatedQuantity);
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: updatedQuantity });
  };

  const handleGlobalManualQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const updatedQuantity = Math.max(1, newQuantity);
    setQuantity(updatedQuantity);
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: updatedQuantity });
  };

  const handlePeckelSelect = (peckelId: string) => {
    // Only allow one selection at a time
    setSelectedPeckelId(peckelId);
  };

  const handleContinue = () => {
    if (!selectedPeckelId) {
      alert('Please select a budget choice option first.');
      return;
    }

    const selectedPeckel = availablePeckels.find(p => p.id === selectedPeckelId);
    if (!selectedPeckel) return;

    // Store the selected peckel and quantity in session storage for label selection
    sessionStorage.setItem('selectedBudgetPeckel', JSON.stringify({
      peckel: selectedPeckel,
      quantity,
      occasion: selectedOccasion
    }));

    // Check if there are labels available for this occasion
    if (availableLabels.length > 0) {
      // Navigate to label selection
      navigate('/budget-choice-labels');
    } else {
      // No labels available, add directly to cart
      addToCartDirectly(selectedPeckel, quantity);
    }
  };

  const addToCartDirectly = (peckel: any, quantity: number) => {
    // Create a product-like object for the cart
    const peckelProduct = {
      id: `bc-${peckel.id}`,
      name: peckel.name,
      description: peckel.description,
      price: peckel.price,
      image: peckel.image,
      category: 'Budget Choice Pecklech',
      stock: 999, // Budget choice is made to order
      sku: `BC-${peckel.id}`,
      isVisible: true,
      allowCustomOrder: true
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product: peckelProduct, quantity }
    });

    // Reset selection
    setSelectedPeckelId(null);
    
    // Navigate to cart
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/ordering-method')}
            className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark transition-colors font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Ordering Methods</span>
          </button>
          
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View Cart</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Budget, Our Choice</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <span className="font-bold text-brand-teal" dir="rtl">{selectedOccasion}</span>
          </p>
          <p className="text-lg text-gray-500">Choose your budget - we'll create the perfect Pecklech for you</p>
        </div>

        {/* Quantity Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">How many Pecklech do you need?</h3>
            <p className="text-gray-600 mb-4">Select your quantity first, then choose your budget option</p>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleGlobalQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-3 rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-5 w-5" />
              </button>
              
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleGlobalManualQuantityChange(e.target.value)}
                className="w-24 text-center font-bold text-2xl py-3 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              
              <button
                onClick={() => handleGlobalQuantityChange(quantity + 1)}
                className="p-3 rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center mt-3 text-sm text-gray-500">
              Click +/- or type quantity directly
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <DollarSign className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Choose your preferred budget range</li>
                <li>• {availableLabels.length > 0 ? 'Optionally select a personalized label' : 'Continue to checkout'}</li>
                <li>• Our experts will select the best items to match your budget</li>
                <li>• Each Pecklech is freshly packed to order</li>
                <li>• You get maximum value for your chosen price point</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Budget Options Grid */}
        {availablePeckels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {availablePeckels.map((peckel) => {
              const isSelected = selectedPeckelId === peckel.id;
              
              return (
                <div 
                  key={peckel.id} 
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden border-4 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    isSelected ? 'border-brand-teal shadow-2xl' : 'border-gray-100 hover:border-brand-teal'
                  }`}
                  onClick={() => handlePeckelSelect(peckel.id)}
                >
                  <div className="relative">
                    <img
                      src={peckel.image}
                      alt={peckel.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Budget Choice
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-brand-teal bg-opacity-20 flex items-center justify-center">
                        <div className="bg-brand-teal text-white w-16 h-16 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{peckel.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{peckel.description}</p>
                    
                    {/* Features */}
                    <div className="bg-primary-50 p-4 rounded-2xl mb-4">
                      <div className="flex items-center mb-2">
                        <Package className="h-4 w-4 text-brand-teal mr-2" />
                        <span className="font-medium text-gray-900 text-sm">What you get:</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {peckel.features.map((feature, index) => (
                          <p key={index}>• {feature}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        £{peckel.price.toFixed(2)}
                      </div>
                      {quantity > 1 && (
                        <div className="text-sm text-gray-600">
                          Total: £{(peckel.price * quantity).toFixed(2)} for {quantity} Pecklech
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Made to order
                      </div>
                    </div>
                    
                    <div className={`w-full py-3 px-4 rounded-2xl font-medium text-sm text-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-brand-teal text-white' 
                        : 'border-2 border-dashed border-brand-teal text-brand-teal bg-primary-50 hover:bg-primary-100'
                    }`}>
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 mb-8">
            <DollarSign className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Budget Choice Options Coming Soon</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We're preparing budget choice options for <span className="font-bold" dir="rtl">{selectedOccasion}</span>.
              Try our other ordering methods!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/ready-to-go')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Ready to Go Pecklech
              </button>
              <button
                onClick={() => navigate('/build-peckel/bag-selection')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Build a Peckel
              </button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {availablePeckels.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedPeckelId}
              className={`px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 flex items-center space-x-3 ${
                selectedPeckelId
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {availableLabels.length > 0 
                  ? 'Continue to Label Selection'
                  : 'Add to Cart'
                }
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}