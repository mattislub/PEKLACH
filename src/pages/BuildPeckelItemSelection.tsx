import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Search, Filter, Plus, Minus, Package, Star, Tag, SortAsc, SortDesc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';

export function BuildPeckelItemSelection() {
  const { state, dispatch } = useApp();
  const { selectedOccasion, products, buildPeckelSession, globalQuantity, labels } = state;
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<CartItem[]>(
    buildPeckelSession?.selectedItems || []
  );

  if (!selectedOccasion || !buildPeckelSession?.selectedBag) {
    navigate('/build-peckel/bag-selection');
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

  // Filter products that are available for Build-a-Peckel and item selection
  const availableProducts = products.filter(product => {
    // Must be customer visible
    if (!product.customerVisible) return false;
    
    // Must be available for Build-a-Peckel and item selection
    if (!product.visibilitySettings?.showInBuildPeckel || !product.visibilitySettings?.showInItemSelection) return false;
    
    // Check occasion visibility
    if (product.visibleOccasions && product.visibleOccasions.length > 0) {
      if (!product.visibleOccasions.includes(selectedOccasion)) return false;
    }
    
    return true;
  });

  // Check if there are labels available for this occasion
  const availableLabels = labels.filter(label => {
    if (!label.isVisible) return false;
    if (!label.visibleOccasions || label.visibleOccasions.length === 0) return true;
    return label.visibleOccasions.includes(selectedOccasion);
  });

  // Get unique categories from available products
  const categories = Array.from(new Set(availableProducts.map(p => p.category)));

  // Filter and sort products
  const filteredProducts = availableProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddItem = (product: any) => {
    const existingItem = selectedItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const maxQuantity = product.allowCustomOrder ? 999 : product.stock;
      if (existingItem.quantity < maxQuantity) {
        setSelectedItems(items =>
          items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      }
    } else {
      setSelectedItems(items => [...items, { product, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    const existingItem = selectedItems.find(item => item.product.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(items =>
        items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setSelectedItems(items => items.filter(item => item.product.id !== productId));
    }
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

  const handleItemQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const product = availableProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const maxQuantity = product.allowCustomOrder ? 999 : product.stock;
    const finalQuantity = Math.min(Math.max(0, quantity), maxQuantity);
    
    if (finalQuantity === 0) {
      setSelectedItems(items => items.filter(item => item.product.id !== productId));
    } else {
      const existingItem = selectedItems.find(item => item.product.id === productId);
      if (existingItem) {
        setSelectedItems(items =>
          items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: finalQuantity }
              : item
          )
        );
      } else {
        setSelectedItems(items => [...items, { product, quantity: finalQuantity }]);
      }
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = selectedItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const canAddItem = (product: any) => {
    const currentQuantity = getItemQuantity(product.id);
    const maxQuantity = product.allowCustomOrder ? 999 : product.stock;
    return currentQuantity < maxQuantity && (product.stock > 0 || product.allowCustomOrder);
  };

  const handleContinue = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item for your Pecklech');
      return;
    }

    // Update build peckel session
    dispatch({
      type: 'UPDATE_BUILD_PECKEL',
      payload: { selectedItems }
    });

    // Check if there are labels available for this occasion
    if (availableLabels.length > 0) {
      // Navigate to label selection if labels are available
      navigate('/build-peckel/label-selection');
    } else {
      // Add to cart directly if no labels available
      addToCart();
    }
  };

  const addToCart = () => {
    if (!buildPeckelSession.selectedBag || selectedItems.length === 0) {
      return;
    }

    // Calculate total price
    let unitPrice = buildPeckelSession.selectedBag.price;
    unitPrice += selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Create a product-like object for the cart
    const peckelProduct = {
      id: `build-peckel-${Date.now()}`,
      name: `Custom Peckel (${buildPeckelSession.selectedBag.color} ${buildPeckelSession.selectedBag.size})`,
      description: `Custom built peckel with ${selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items in a ${buildPeckelSession.selectedBag.color} ${buildPeckelSession.selectedBag.size} bag`,
      price: unitPrice,
      image: buildPeckelSession.selectedBag.image || selectedItems[0]?.product.image,
      category: 'Custom Pecklech',
      stock: 999, // Custom peckels are made to order
      sku: `CP-${Date.now()}`,
      isVisible: true,
      allowCustomOrder: true
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product: peckelProduct, quantity: buildPeckelSession.quantity }
    });

    // Clear build peckel session
    dispatch({ type: 'CLEAR_BUILD_PECKEL' });

    // Navigate to cart
    navigate('/cart');
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsPrice = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const bagPrice = buildPeckelSession.selectedBag.price;
  const unitTotal = bagPrice + itemsPrice;
  const grandTotal = unitTotal * buildPeckelSession.quantity;

  const getStockStatus = (product: any) => {
    if (product.stock === 0 && product.allowCustomOrder) {
      return { label: 'Made to Order', color: 'text-brand-teal bg-primary-100' };
    }
    if (product.stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    }
    if (product.stock <= 5) {
      return { label: 'Low Stock', color: 'text-amber-600 bg-amber-100' };
    }
    return { label: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/build-peckel/bag-selection')}
            className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark transition-colors font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Bag Selection</span>
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
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="ml-2 text-green-600 font-medium">Select Bag</span>
            </div>
            <div className="w-16 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-brand-teal font-medium">Select Items</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-gray-600">
                {availableLabels.length > 0 ? 'Select Label' : 'Add to Cart'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Items</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <span className="font-bold text-brand-teal" dir="rtl">{selectedOccasion}</span>
          </p>
          <p className="text-lg text-gray-500">
            Selected Bag: <span className="font-medium text-gray-700">{buildPeckelSession.selectedBag.name} - {buildPeckelSession.selectedBag.color} {buildPeckelSession.selectedBag.size}</span>
          </p>
        </div>

        {/* Quantity Control with Manual Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Order Quantity</h3>
              <p className="text-gray-600">Each Pecklech will contain the same items you select below</p>
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

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
              <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {availableProducts.length} items
            </div>
            {selectedItems.length > 0 && (
              <div className="bg-primary-50 px-4 py-2 rounded-lg">
                <span className="text-brand-teal font-medium">
                  {totalItems} items selected per Pecklech • £{itemsPrice.toFixed(2)} per Pecklech
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const quantity = getItemQuantity(product.id);
              const canAdd = canAddItem(product);
              
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                      }}
                    />
                    
                    {/* Promotion Badge */}
                    {product.isOnPromotion && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          SALE
                        </span>
                      </div>
                    )}
                    
                    {/* Stock Status */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    {/* Quantity Badge */}
                    {quantity > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-brand-teal text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {quantity}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                      <span className="text-xs text-brand-teal bg-primary-50 px-2 py-1 rounded-full font-medium ml-2">
                        {product.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    {/* Price */}
                    <div className="mb-4">
                      {product.isOnPromotion && product.originalPrice ? (
                        <div>
                          <span className="text-lg text-gray-500 line-through">
                            £{product.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-xl font-bold text-red-600 ml-2">
                            £{product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          £{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center mb-4 text-sm text-gray-500">
                      <Package className="h-4 w-4 mr-2" />
                      {product.allowCustomOrder && product.stock === 0 ? (
                        <span className="text-brand-teal font-medium">Made to Order</span>
                      ) : (
                        <span>Stock: {product.stock}</span>
                      )}
                      {product.allowCustomOrder && (
                        <Star className="h-3 w-3 ml-2 text-brand-teal" />
                      )}
                    </div>
                    
                    {/* Add/Remove Controls */}
                    <div className="flex items-center justify-between">
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-2 flex-1">
                          <button
                            onClick={() => handleRemoveItem(product.id)}
                            className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max={product.allowCustomOrder ? 999 : product.stock}
                            value={quantity}
                            onChange={(e) => handleItemQuantityChange(product.id, e.target.value)}
                            className="w-16 text-center font-bold text-lg py-1 px-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          />
                          
                          <button
                            onClick={() => handleAddItem(product)}
                            disabled={!canAdd}
                            className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(product)}
                          disabled={!canAdd}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2 ${
                            canAdd
                              ? 'bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                          <span>{product.stock === 0 && product.allowCustomOrder ? 'Order' : 'Add'}</span>
                        </button>
                      )}
                      
                      {quantity > 0 && (
                        <div className="ml-3 text-right">
                          <div className="text-sm font-bold text-gray-900">
                            £{(product.price * quantity).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Items Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || categoryFilter 
                ? 'No items match your search criteria. Try adjusting your filters.'
                : 'No items are currently available for Build-a-Peckel selection.'
              }
            </p>
            {(searchTerm || categoryFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Selected Items Summary & Continue */}
        {selectedItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Selected Items ({totalItems} per Pecklech)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedItems.map(item => (
                <div key={item.product.id} className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">£{item.product.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">£{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Per Pecklech</p>
                  <p className="text-lg font-bold text-gray-900">£{unitTotal.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Bag + Items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="text-lg font-bold text-brand-teal">{buildPeckelSession.quantity}</p>
                  <p className="text-xs text-gray-500">Pecklech</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Order</p>
                  <p className="text-2xl font-bold text-gray-900">£{grandTotal.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">All {buildPeckelSession.quantity} Pecklech</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white rounded-2xl font-medium text-lg transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>
                  {availableLabels.length > 0 ? 'Continue to Label Selection' : 'Add to Cart'}
                </span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Continue Button (when no items selected) */}
        {selectedItems.length === 0 && filteredProducts.length > 0 && (
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Select at least one item to continue</p>
              <button
                disabled
                className="px-8 py-4 bg-gray-300 text-gray-500 rounded-2xl font-medium text-lg cursor-not-allowed"
              >
                Continue to {availableLabels.length > 0 ? 'Label Selection' : 'Add to Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}