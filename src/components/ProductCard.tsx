import React, { useState } from 'react';
import { ShoppingCart, Package, Star, Tag, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product.stock > 0 || product.allowCustomOrder) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: { product, quantity }
      });
      setQuantity(1); // Reset quantity after adding
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = product.allowCustomOrder ? 999 : product.stock;
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const handleManualQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const maxQuantity = product.allowCustomOrder ? 999 : product.stock;
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;
  const canOrder = product.stock > 0 || product.allowCustomOrder;
  const maxQuantity = product.allowCustomOrder ? 999 : product.stock;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Promotion Badge */}
        {product.isOnPromotion && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              SALE
            </span>
          </div>
        )}
        
        {/* Stock Status Badges */}
        {isOutOfStock && !product.allowCustomOrder && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
        {isOutOfStock && product.allowCustomOrder && (
          <div className="absolute top-3 left-3">
            <span className="bg-brand-teal text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Made to Order
            </span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Low Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <span className="text-sm text-brand-teal bg-primary-50 px-3 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            {isOutOfStock && product.allowCustomOrder ? (
              <span className="text-sm text-brand-teal font-medium">Custom Order Available</span>
            ) : (
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {product.isOnPromotion && product.originalPrice ? (
              <>
                <span className="text-lg text-gray-500 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  £{product.price.toFixed(2)}
                </span>
                <span className="text-xs text-red-600 font-medium">
                  Save £{(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                £{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Selector with Manual Input */}
        {canOrder && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleManualQuantityChange(e.target.value)}
                className="w-16 text-center font-semibold text-lg py-2 px-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-500 mb-3">
              Click +/- or type quantity directly
            </div>
          </div>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={!canOrder}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            !canOrder
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>
            {isOutOfStock && product.allowCustomOrder 
              ? `Order ${quantity} - £${(product.price * quantity).toFixed(2)}` 
              : `Add ${quantity} - £${(product.price * quantity).toFixed(2)}`
            }
          </span>
        </button>
        
        {isOutOfStock && product.allowCustomOrder && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            This item will be specially made for your order
          </p>
        )}
      </div>
    </div>
  );
}