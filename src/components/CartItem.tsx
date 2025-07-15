import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useApp } from '../context/AppContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { dispatch } = useApp();

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id });
    } else if (newQuantity <= item.product.stock || item.product.allowCustomOrder) {
      dispatch({
        type: 'UPDATE_CART_QUANTITY',
        payload: { productId: item.product.id, quantity: newQuantity }
      });
    }
  };

  const handleManualQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 0;
    const maxQuantity = item.product.allowCustomOrder ? 999 : item.product.stock;
    const finalQuantity = Math.min(Math.max(0, newQuantity), maxQuantity);
    updateQuantity(finalQuantity);
  };

  const removeItem = () => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id });
  };

  const maxQuantity = item.product.allowCustomOrder ? 999 : item.product.stock;

  return (
    <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded-xl"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">{item.product.name}</h3>
        <p className="text-gray-600">£{item.product.price.toFixed(2)} each</p>
        <p className="text-xs text-gray-500">
          {item.product.allowCustomOrder && item.product.stock === 0 
            ? 'Made to Order' 
            : `Stock: ${item.product.stock}`
          }
        </p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-2">
          <button
            onClick={() => updateQuantity(item.quantity - 1)}
            className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal hover:text-brand-teal-dark"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <input
            type="number"
            min="1"
            max={maxQuantity}
            value={item.quantity}
            onChange={(e) => handleManualQuantityChange(e.target.value)}
            className="w-16 text-center font-semibold text-lg py-1 px-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          />
          
          <button
            onClick={() => updateQuantity(item.quantity + 1)}
            className="p-2 rounded-lg hover:bg-white transition-colors text-brand-teal hover:text-brand-teal-dark"
            disabled={item.quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          Click +/- or type directly
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-gray-900 text-lg">
          £{(item.product.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={removeItem}
          className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}