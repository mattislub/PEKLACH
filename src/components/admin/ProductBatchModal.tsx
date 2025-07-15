import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Plus, Minus, Trash2, Save, Package } from 'lucide-react';
import { Product, ProductBatch } from '../../types';
import { saveProductBatch, deleteProductBatch } from '../../utils/localDb';
import { v4 as uuidv4 } from 'uuid';

interface ProductBatchModalProps {
  product: Product;
  batch?: ProductBatch;
  onClose: () => void;
  onSave: () => void;
}

export function ProductBatchModal({ product, batch, onClose, onSave }: ProductBatchModalProps) {
  const [formData, setFormData] = useState<Partial<ProductBatch>>({
    productId: product.id,
    batchNumber: '',
    quantity: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    hasExpiry: product.hasExpiry || false,
    notes: ''
  });

  const isEditing = !!batch;

  useEffect(() => {
    if (batch) {
      setFormData({
        ...batch,
        receivedDate: new Date(batch.receivedDate).toISOString().split('T')[0],
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''
      });
    } else {
      // Set default values for new batch
      setFormData({
        productId: product.id,
        batchNumber: `BATCH-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
        quantity: 0,
        receivedDate: new Date().toISOString().split('T')[0],
        expiryDate: product.hasExpiry ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
        hasExpiry: product.hasExpiry || false,
        notes: ''
      });
    }
  }, [batch, product]);

  const handleInputChange = (field: keyof ProductBatch, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.batchNumber || !formData.receivedDate || formData.quantity === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.hasExpiry && !formData.expiryDate) {
      alert('Please provide an expiry date for this batch');
      return;
    }

    try {
      const batchData: ProductBatch = {
        id: batch?.id || uuidv4(),
        productId: product.id,
        batchNumber: formData.batchNumber!,
        quantity: Number(formData.quantity),
        receivedDate: formData.receivedDate!,
        expiryDate: formData.hasExpiry ? formData.expiryDate : undefined,
        hasExpiry: formData.hasExpiry || false,
        notes: formData.notes,
        createdAt: batch?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveProductBatch(batchData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Failed to save batch. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!batch) return;
    
    if (confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        await deleteProductBatch(batch.id);
        onSave();
        onClose();
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Failed to delete batch. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Batch' : 'Add New Batch'}
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
            <div className="bg-primary-50 p-4 rounded-xl mb-6">
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-brand-teal mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-600">Current Total Stock: {product.stock}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter batch number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    required
                    value={formData.receivedDate}
                    onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Has Expiry Date
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="hasExpiry"
                      checked={formData.hasExpiry}
                      onChange={(e) => handleInputChange('hasExpiry', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="hasExpiry"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        formData.hasExpiry ? 'bg-brand-teal' : 'bg-gray-300'
                      }`}
                    ></label>
                  </div>
                </div>
                
                {formData.hasExpiry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        required={formData.hasExpiry}
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Enter any additional notes about this batch"
              />
            </div>
            
            {product.hasExpiry && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Expiry Notification</p>
                    <p className="text-xs text-amber-700">
                      You will be notified {product.expiryNotificationDays || 30} days before this batch expires.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
              >
                Delete Batch
              </button>
            )}
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
              {isEditing ? 'Update Batch' : 'Add Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}