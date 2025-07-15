import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { ProductBatch, BatchTransaction } from '../../types';
import { saveBatchTransaction } from '../../utils/localDb';
import { v4 as uuidv4 } from 'uuid';

interface BatchTransactionModalProps {
  batch: ProductBatch;
  onClose: () => void;
  onSave: () => void;
}

export function BatchTransactionModal({ batch, onClose, onSave }: BatchTransactionModalProps) {
  const [formData, setFormData] = useState<Partial<BatchTransaction>>({
    batchId: batch.id,
    quantity: 1,
    transactionType: 'adjustment',
    notes: ''
  });

  const handleInputChange = (field: keyof BatchTransaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.transactionType) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.quantity > batch.quantity && formData.transactionType !== 'return') {
      alert(`Cannot remove more than the available quantity (${batch.quantity})`);
      return;
    }

    try {
      const transactionData: BatchTransaction = {
        id: uuidv4(),
        batchId: batch.id,
        orderId: formData.orderId,
        quantity: Number(formData.quantity),
        transactionType: formData.transactionType as 'sale' | 'adjustment' | 'return' | 'waste',
        notes: formData.notes,
        createdAt: new Date().toISOString()
      };

      await saveBatchTransaction(transactionData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-brand-teal" />
            Add Batch Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Batch:</span> {batch.batchNumber}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Available Quantity:</span> {batch.quantity}
              </p>
              {batch.hasExpiry && batch.expiryDate && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Expiry Date:</span> {new Date(batch.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <select
                required
                value={formData.transactionType}
                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              >
                <option value="adjustment">Adjustment</option>
                <option value="sale">Sale</option>
                <option value="return">Return</option>
                <option value="waste">Waste/Damage</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                max={formData.transactionType === 'return' ? 999 : batch.quantity}
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.transactionType === 'return' 
                  ? 'Enter the quantity being returned to this batch'
                  : 'Enter the quantity being removed from this batch'}
              </p>
            </div>
            
            {formData.transactionType === 'sale' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.orderId || ''}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter order ID if applicable"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Enter any additional notes about this transaction"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark rounded-xl font-medium transition-colors"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}