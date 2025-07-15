import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Star, Plus, Minus, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ReadyToGoPeckels() {
  const { state, dispatch } = useApp();
  const { selectedOccasion, readyToGoPeckels, globalQuantity, products } = state;
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  if (!selectedOccasion) {
    navigate('/');
    return null;
  }

  // Filter ready-to-go peckels for the selected occasion
  const availableReadyToGoPeckels = useMemo(() => 
    readyToGoPeckels.filter(peckel => 
      peckel.isVisible && (
        peckel.occasions.length === 0 || 
        peckel.occasions.includes(selectedOccasion)
      )
    ), [readyToGoPeckels, selectedOccasion]
  );

  // Filter pre-packed products that should appear in Ready-to-Go
  const prePackedPeckels = useMemo(() => 
    products.filter(product => {
      // Must be customer visible
      if (!product.customerVisible) return false;
      
      // Must be set to show in Ready-to-Go
      if (!product.visibilitySettings?.showInReadyToGo) return false;
      
      // Must be in Pre-Packed Pecklech category
      if (product.category !== 'Pre-Packed Pecklech') return false;
      
      // Check occasion visibility
      if (product.visibleOccasions && product.visibleOccasions.length > 0) {
        if (!product.visibleOccasions.includes(selectedOccasion)) return false;
      }
      
      return true;
    }), [products, selectedOccasion]
  );

  // Combine both types of peckels
  const allAvailablePeckels = useMemo(() => [
    ...availableReadyToGoPeckels.map(peckel => ({ ...peckel, type: 'ready-to-go' as const })),
    ...prePackedPeckels.map(product => ({ ...product, type: 'pre-packed' as const }))
  ], [availableReadyToGoPeckels, prePackedPeckels]);

  // Initialize all quantities to 0 when component mounts or when peckels change
  useEffect(() => {
    const initialQuantities: { [key: string]: number } = {};
    allAvailablePeckels.forEach(peckel => {
      initialQuantities[peckel.id] = 0;
    });
    setQuantities(initialQuantities);
  }, [allAvailablePeckels.length]); // Only depend on length to avoid infinite loops

  const handleGlobalQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: quantity });
  };

  const handleGlobalManualQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 1;
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: Math.max(1, quantity) });
  };

  const handleQuantityChange = (peckelId: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity);
    setQuantities(prev => ({
      ...prev,
      [peckelId]: newQuantity
    }));
  };

  const handleManualQuantityChange = (peckelId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const newQuantity = Math.max(0, quantity);
    setQuantities(prev => ({
      ...prev,
      [peckelId]: newQuantity
    }));
  };

  const handlePeckelClick = (peckelId: string) => {
    // When clicking on a peckel, set its quantity to the global quantity
    // Only if it's currently 0
    if (quantities[peckelId] === 0) {
      setQuantities(prev => ({
        ...prev,
        [peckelId]: globalQuantity
      }));
    }
  };

  const handleAddToCart = (peckel: any) => {
    const quantity = quantities[peckel.id] || 0;
    
    if (quantity === 0) {
      alert('Please select a quantity first by clicking on the peckel or adjusting the quantity.');
      return;
    }
    
    // Create a product-like object for the cart
    let peckelProduct;
    
    if (peckel.type === 'ready-to-go') {
      // Ready-to-go peckel
      peckelProduct = {
        id: `rtg-${peckel.id}`,
        name: peckel.name,
        description: peckel.description,
        price: peckel.price,
        image: peckel.image,
        category: 'Ready to Go Pecklech',
        stock: peckel.stock,
        sku: `RTG-${peckel.id}`,
        isVisible: true,
        allowCustomOrder: false
      };
    } else {
      // Pre-packed product
      peckelProduct = {
        id: peckel.id,
        name: peckel.name,
        description: peckel.description,
        price: peckel.price,
        image: peckel.image,
        category: peckel.category,
        stock: peckel.stock,
        sku: peckel.sku,
        isVisible: true,
        allowCustomOrder: peckel.allowCustomOrder || false
      };
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product: peckelProduct, quantity }
    });

    // Reset quantity to 0 after adding to cart
    setQuantities(prev => ({ ...prev, [peckel.id]: 0 }));
  };

  const getQuantity = (peckelId: string) => quantities[peckelId] || 0;

  const getStockInfo = (peckel: any) => {
    if (peckel.type === 'ready-to-go') {
      return {
        stock: peckel.stock,
        allowCustomOrder: false,
        isOutOfStock: peckel.stock === 0,
        isLowStock: peckel.stock <= 5 && peckel.stock > 0
      };
    } else {
      return {
        stock: peckel.stock,
        allowCustomOrder: peckel.allowCustomOrder || false,
        isOutOfStock: peckel.stock === 0 && !peckel.allowCustomOrder,
        isLowStock: peckel.stock <= 5 && peckel.stock > 0
      };
    }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Go Pecklech</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <span className="font-bold text-brand-teal" dir="rtl">{selectedOccasion}</span>
          </p>
          <p className="text-lg text-gray-500">Pre-packed and ready for immediate purchase</p>
        </div>

        {/* Global Quantity Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Default Quantity</h3>
            <p className="text-gray-600 mb-4">This quantity will be applied when you click on a peckel</p>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleGlobalQuantityChange(globalQuantity - 1)}
                disabled={globalQuantity <= 1}
                className="p-3 rounded-xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-5 w-5" />
              </button>
              
              <input
                type="number"
                min="1"
                value={globalQuantity}
                onChange={(e) => handleGlobalManualQuantityChange(e.target.value)}
                className="w-24 text-center font-bold text-2xl py-3 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              
              <button
                onClick={() => handleGlobalQuantityChange(globalQuantity + 1)}
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

        {/* Peckels Grid */}
        {allAvailablePeckels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allAvailablePeckels.map((peckel) => {
              const currentQuantity = getQuantity(peckel.id);
              const isSelected = currentQuantity > 0;
              const stockInfo = getStockInfo(peckel);
              
              return (
                <div 
                  key={`${peckel.type}-${peckel.id}`} 
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden border-2 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    isSelected ? 'border-brand-teal' : 'border-gray-100 hover:border-brand-teal'
                  }`}
                  onClick={() => handlePeckelClick(peckel.id)}
                >
                  <div className="relative">
                    <img
                      src={peckel.image}
                      alt={peckel.name}
                      className="w-full h-64 object-cover"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${
                        peckel.type === 'ready-to-go' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        <Package className="h-3 w-3 mr-1" />
                        {peckel.type === 'ready-to-go' ? 'Ready Now' : 'Pre-Packed'}
                      </span>
                    </div>
                    
                    {/* Stock Status Badges */}
                    {stockInfo.isLowStock && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Only {stockInfo.stock} left
                        </span>
                      </div>
                    )}
                    
                    {stockInfo.isOutOfStock && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {stockInfo.allowCustomOrder && stockInfo.stock === 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-brand-teal text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Made to Order
                        </span>
                      </div>
                    )}
                    
                    {/* Promotion Badge for pre-packed products */}
                    {peckel.type === 'pre-packed' && peckel.isOnPromotion && (
                      <div className="absolute top-16 right-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          SALE
                        </span>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-brand-teal text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                          {currentQuantity}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{peckel.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{peckel.description}</p>
                    
                    {/* Content Information */}
                    <div className="bg-primary-50 p-4 rounded-2xl mb-6">
                      <div className="flex items-center mb-2">
                        <Package className="h-4 w-4 text-brand-teal mr-2" />
                        <span className="font-medium text-gray-900 text-sm">
                          {peckel.type === 'ready-to-go' ? 'Includes:' : 'Product Details:'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {peckel.type === 'ready-to-go' ? (
                          <>
                            <p>• {peckel.bag?.name} ({peckel.bag?.color})</p>
                            <p>• Carefully selected premium items</p>
                            <p>• Professional packaging</p>
                            <p>• Ready for gifting</p>
                          </>
                        ) : (
                          <>
                            <p>• Category: {peckel.category}</p>
                            <p>• SKU: {peckel.sku}</p>
                            <p>• Professional packaging</p>
                            {stockInfo.allowCustomOrder && <p>• Custom orders available</p>}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        {peckel.type === 'pre-packed' && peckel.isOnPromotion && peckel.originalPrice ? (
                          <div>
                            <div className="text-lg text-gray-500 line-through">
                              £{peckel.originalPrice.toFixed(2)}
                            </div>
                            <div className="text-3xl font-bold text-red-600">
                              £{peckel.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-red-600 font-medium">
                              Save £{(peckel.originalPrice - peckel.price).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-gray-900">
                            £{peckel.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {stockInfo.allowCustomOrder && stockInfo.stock === 0 ? (
                          <span className="text-brand-teal font-medium">Made to Order</span>
                        ) : (
                          <span>Stock: {stockInfo.stock}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Selector - Only show if selected */}
                    {isSelected && (
                      <div className="mb-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(peckel.id, currentQuantity - 1);
                              }}
                              className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal"
                              disabled={currentQuantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              max={stockInfo.allowCustomOrder ? 999 : stockInfo.stock}
                              value={currentQuantity}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleManualQuantityChange(peckel.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-16 text-center font-semibold text-lg py-2 px-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                            />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(peckel.id, currentQuantity + 1);
                              }}
                              className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal"
                              disabled={!stockInfo.allowCustomOrder && currentQuantity >= stockInfo.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          Click +/- or type quantity directly
                        </div>
                      </div>
                    )}
                    
                    {isSelected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(peckel);
                        }}
                        disabled={stockInfo.isOutOfStock}
                        className={`w-full py-4 px-6 rounded-2xl font-medium transition-all duration-200 text-lg flex items-center justify-center space-x-2 ${
                          stockInfo.isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>
                          {stockInfo.isOutOfStock 
                            ? 'Out of Stock' 
                            : `Add to Cart - £${(peckel.price * currentQuantity).toFixed(2)}`
                          }
                        </span>
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="w-full py-4 px-6 rounded-2xl font-medium text-lg border-2 border-dashed border-brand-teal text-brand-teal bg-primary-50">
                          Click to select {globalQuantity} Pecklech
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Will add {globalQuantity} × £{peckel.price.toFixed(2)} = £{(peckel.price * globalQuantity).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Ready-to-Go Pecklech Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We don't currently have pre-packed Pecklech for <span className="font-bold" dir="rtl">{selectedOccasion}</span>.
              Try our other ordering methods!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/budget-choice')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Your Budget, Our Choice
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
      </div>
    </div>
  );
}