import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Check, Star, AlertTriangle, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function BuildPeckelBagSelection() {
  const { state, dispatch } = useApp();
  const { selectedOccasion, bags, buildPeckelSession, globalQuantity } = state;
  const navigate = useNavigate();
  const [selectedBagId, setSelectedBagId] = useState<string | null>(
    buildPeckelSession?.selectedBag?.id || null
  );

  if (!selectedOccasion || !buildPeckelSession) {
    navigate('/ordering-method');
    return null;
  }

  // Sync build peckel quantity with global quantity when component mounts
  useEffect(() => {
    if (buildPeckelSession.quantity !== globalQuantity) {
      dispatch({
        type: 'UPDATE_BUILD_PECKEL',
        payload: { quantity: globalQuantity }
      });
    }
  }, [globalQuantity, buildPeckelSession.quantity, dispatch]);

  // Filter bags that are visible and available for this occasion
  const availableBags = bags.filter(bag => {
    if (!bag.isVisible) return false;
    
    // Check if bag has occasion-specific visibility (if implemented)
    // For now, show all visible bags
    return true;
  });

  const handleBagSelect = (bagId: string) => {
    setSelectedBagId(bagId);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    dispatch({
      type: 'SET_GLOBAL_QUANTITY',
      payload: quantity
    });
  };

  const handleManualQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 1;
    dispatch({
      type: 'SET_GLOBAL_QUANTITY',
      payload: Math.max(1, quantity)
    });
  };

  const handleContinue = () => {
    const selectedBag = availableBags.find(bag => bag.id === selectedBagId);
    
    if (!selectedBag) {
      alert('Please select a bag to continue');
      return;
    }

    dispatch({
      type: 'UPDATE_BUILD_PECKEL',
      payload: { selectedBag }
    });

    // Navigate to next step (item selection)
    navigate('/build-peckel/item-selection');
  };

  const getBagStockStatus = (bag: any) => {
    const requiredStock = buildPeckelSession.quantity;
    
    if (bag.stock === 0) return { 
      label: 'Out of Stock', 
      color: 'text-red-600 bg-red-100',
      canSelect: false
    };
    if (bag.stock < requiredStock) return { 
      label: `Only ${bag.stock} Available`, 
      color: 'text-red-600 bg-red-100',
      canSelect: false
    };
    if (bag.stock <= (bag.minimumStock || 0)) return { 
      label: 'Low Stock', 
      color: 'text-amber-600 bg-amber-100',
      canSelect: true
    };
    return { 
      label: 'In Stock', 
      color: 'text-green-600 bg-green-100',
      canSelect: true
    };
  };

  const getTotalPrice = () => {
    const selectedBag = availableBags.find(bag => bag.id === selectedBagId);
    if (!selectedBag) return 0;
    return selectedBag.price * buildPeckelSession.quantity;
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

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="ml-2 text-brand-teal font-medium">Select Bag</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-gray-600">Select Items</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-gray-600">Select Label</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Bag</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <span className="font-bold text-brand-teal" dir="rtl">{selectedOccasion}</span>
          </p>
          <p className="text-lg text-gray-500">Select the perfect bag for your custom Pecklech</p>
        </div>

        {/* Quantity Control with Manual Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Order Quantity</h3>
              <p className="text-gray-600">How many identical Pecklech do you want?</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(buildPeckelSession.quantity - 1)}
                disabled={buildPeckelSession.quantity <= 1}
                className="p-3 rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-5 w-5" />
              </button>
              
              <input
                type="number"
                min="1"
                value={buildPeckelSession.quantity}
                onChange={(e) => handleManualQuantityChange(e.target.value)}
                className="w-24 text-center font-bold text-3xl py-3 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              
              <button
                onClick={() => handleQuantityChange(buildPeckelSession.quantity + 1)}
                className="p-3 rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-4 text-sm text-gray-500">
            Click +/- or type quantity directly
          </div>
        </div>

        {/* Information Banner - Build-a-Peckel Specific */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Package className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Build Your Perfect Pecklech:</h3>
              <ul className="text-purple-800 space-y-1 text-sm">
                <li>• Choose your preferred bag size and color</li>
                <li>• Select individual items to fill your bag</li>
                <li>• Customize with a personalized label</li>
                <li>• You'll get {buildPeckelSession.quantity} identical Pecklech</li>
                <li>• You can adjust the quantity at any step</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bags Grid */}
        {availableBags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {availableBags.map((bag) => {
              const stockStatus = getBagStockStatus(bag);
              const isSelected = selectedBagId === bag.id;
              const unitPrice = bag.price;
              const totalPrice = unitPrice * buildPeckelSession.quantity;
              
              return (
                <div 
                  key={bag.id} 
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden border-4 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                    isSelected 
                      ? 'border-brand-teal shadow-2xl' 
                      : stockStatus.canSelect 
                        ? 'border-gray-100 hover:border-brand-teal hover:shadow-xl' 
                        : 'border-gray-100 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => stockStatus.canSelect && handleBagSelect(bag.id)}
                >
                  <div className="relative">
                    <img
                      src={bag.image}
                      alt={bag.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                      }}
                    />
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-brand-teal text-white p-2 rounded-full">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${stockStatus.color}`}>
                        {bag.stock <= (bag.minimumStock || 0) && bag.stock > 0 && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bag.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{bag.description}</p>
                    
                    {/* Bag Details */}
                    <div className="bg-primary-50 p-4 rounded-2xl mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Color:</span>
                          <p className="text-brand-teal font-bold">{bag.color}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Size:</span>
                          <p className="text-brand-teal font-bold">{bag.size}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Available:</span>
                          <p className="text-gray-600">{bag.stock} bags</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Need:</span>
                          <p className="text-gray-600">{buildPeckelSession.quantity} bags</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        £{unitPrice.toFixed(2)} each
                      </div>
                      {buildPeckelSession.quantity > 1 && (
                        <div className="text-sm text-gray-600">
                          Total: £{totalPrice.toFixed(2)} for {buildPeckelSession.quantity} bags
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stockStatus.canSelect) {
                          handleBagSelect(bag.id);
                        }
                      }}
                      disabled={!stockStatus.canSelect}
                      className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2 ${
                        isSelected
                          ? 'bg-brand-teal text-white'
                          : stockStatus.canSelect
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Selected</span>
                        </>
                      ) : stockStatus.canSelect ? (
                        <>
                          <Package className="h-4 w-4" />
                          <span>Select This Bag</span>
                        </>
                      ) : (
                        <span>Not Available</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Bags Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              There are currently no bags available for selection. Please contact us for custom options.
            </p>
            <button
              onClick={() => navigate('/ordering-method')}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              Try Other Methods
            </button>
          </div>
        )}

        {/* Continue Button */}
        {availableBags.length > 0 && (
          <div className="flex justify-center">
            <div className="text-center">
              {selectedBagId && (
                <div className="mb-4 p-4 bg-primary-50 rounded-xl">
                  <p className="text-brand-teal font-medium">
                    Bag cost: £{getTotalPrice().toFixed(2)} for {buildPeckelSession.quantity} bags
                  </p>
                </div>
              )}
              <button
                onClick={handleContinue}
                disabled={!selectedBagId}
                className={`px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 flex items-center space-x-3 ${
                  selectedBagId
                    ? 'bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continue to Item Selection</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}