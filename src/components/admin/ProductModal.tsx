import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Star, Eye, EyeOff, Calendar, Settings, DollarSign, Percent, Calculator, Clock, AlertTriangle, Package } from 'lucide-react';
import { Product, ProductBatch } from '../../types';
import { useApp } from '../../context/AppContext';
import { BatchManagementPanel } from './BatchManagementPanel';

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    isOnPromotion: false,
    image: '',
    category: '',
    stock: '',
    sku: '',
    isVisible: true,
    customerVisible: true,
    allow_custom_order: false,
    minimumStock: '',
    visibleOccasions: [] as string[],
    visibilitySettings: {
      showInReadyToGo: true,
      showInBestsellers: false,
      showInNewArrivals: false,
      occasions: {}
    },
    profitMargin: 30,
    costPerUnit: 0,
    costPerUnitIncVat: 0,
    saleExVat: 0,
    profitPerUnit: 0,
    hasExpiry: false,
    expiryNotificationDays: 30,
    useFifo: true
  });

  const [occasionVisibility, setOccasionVisibility] = useState({
    christmas: true,
    valentines: true,
    easter: true,
    halloween: true,
    birthday: true,
    anniversary: true,
    graduation: true,
    wedding: true,
    babyShower: true,
    housewarming: true,
    getWell: true,
    sympathy: true,
    justBecause: true
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'visibility'>('basic');
  const [pricingMode, setPricingMode] = useState<'margin' | 'price'>('margin');
  const [showBatchManagement, setShowBatchManagement] = useState(false);

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        minimumStock: product.minimumStock?.toString() || '',
        profitMargin: product.profitMargin || 30,
        costPerUnit: product.costPerUnit || 0,
        costPerUnitIncVat: product.costPerUnitIncVat || 0,
        saleExVat: product.saleExVat || 0,
        profitPerUnit: product.profitPerUnit || 0,
        hasExpiry: product.hasExpiry || false,
        expiryNotificationDays: product.expiryNotificationDays || 30,
        useFifo: product.useFifo !== false
      });
      setOccasionVisibility(
        product.visibilitySettings?.occasions || {
          christmas: true,
          valentines: true,
          easter: true,
          halloween: true,
          birthday: true,
          anniversary: true,
          graduation: true,
          wedding: true,
          babyShower: true,
          housewarming: true,
          getWell: true,
          sympathy: true,
          justBecause: true
        }
      );
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePricingChange = (field: string, value: number) => {
    const newData = { ...formData };
    const vatRate = 0.2;
    
    if (field === 'costPerUnit' || field === 'costPerUnitIncVat') {
      if (field === 'costPerUnit') {
        const costPerUnit = value;
        const costPerUnitIncVat = costPerUnit * (1 + vatRate);
        newData.costPerUnit = parseFloat(costPerUnit.toFixed(2));
        newData.costPerUnitIncVat = parseFloat(costPerUnitIncVat.toFixed(2));
      } else {
        const costPerUnitIncVat = value;
        const costPerUnit = costPerUnitIncVat / (1 + vatRate);
        newData.costPerUnit = parseFloat(costPerUnit.toFixed(2));
        newData.costPerUnitIncVat = parseFloat(costPerUnitIncVat.toFixed(2));
      }
      
      if (pricingMode === 'margin') {
        const saleExVat = newData.costPerUnit / (1 - (newData.profitMargin / 100));
        newData.saleExVat = parseFloat(saleExVat.toFixed(2));
        const finalPrice = saleExVat * (1 + vatRate);
        newData.price = finalPrice.toFixed(2);
      }
      
      const profitPerUnit = newData.saleExVat - newData.costPerUnit;
      newData.profitPerUnit = parseFloat(profitPerUnit.toFixed(2));
    }
    
    if (field === 'profitMargin') {
      newData.profitMargin = value;
      if (pricingMode === 'margin' && newData.costPerUnit > 0) {
        const saleExVat = newData.costPerUnit / (1 - (value / 100));
        newData.saleExVat = parseFloat(saleExVat.toFixed(2));
        const finalPrice = saleExVat * (1 + vatRate);
        newData.price = finalPrice.toFixed(2);
        const profitPerUnit = saleExVat - newData.costPerUnit;
        newData.profitPerUnit = parseFloat(profitPerUnit.toFixed(2));
      }
    }
    
    if (field === 'price') {
      newData.price = value.toFixed(2);
      const saleExVat = value / (1 + vatRate);
      newData.saleExVat = parseFloat(saleExVat.toFixed(2));
      if (newData.costPerUnit > 0) {
        const profitPerUnit = saleExVat - newData.costPerUnit;
        newData.profitPerUnit = parseFloat(profitPerUnit.toFixed(2));
        const margin = (profitPerUnit / saleExVat) * 100;
        newData.profitMargin = parseFloat(margin.toFixed(2));
      }
    }
    
    setFormData(newData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOccasionToggle = (occasion: string) => {
    setOccasionVisibility(prev => ({
      ...prev,
      [occasion]: !prev[occasion as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || undefined,
      stock: Number(formData.stock) || 0,
      minimumStock: Number(formData.minimumStock) || 0,
      visibilitySettings: {
        ...formData.visibilitySettings,
        occasions: occasionVisibility
      },
      profitMargin: Number(formData.profitMargin) || 0,
      costPerUnit: Number(formData.costPerUnit) || 0,
      costPerUnitIncVat: Number(formData.costPerUnitIncVat) || 0,
      saleExVat: Number(formData.saleExVat) || 0,
      profitPerUnit: Number(formData.profitPerUnit) || 0,
      hasExpiry: formData.hasExpiry || false,
      expiryNotificationDays: Number(formData.expiryNotificationDays) || 30,
      useFifo: formData.useFifo !== false
    };

    if (isEditing && product) {
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: { ...productData, id: product.id }
      });
    } else {
      dispatch({
        type: 'ADD_PRODUCT',
        payload: { ...productData, id: Date.now().toString() }
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('basic');
                setShowBatchManagement(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                activeTab === 'basic' && !showBatchManagement
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4 mr-1" />
              Basic Info
            </button>
            <button
              onClick={() => {
                setActiveTab('pricing');
                setShowBatchManagement(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                activeTab === 'pricing' && !showBatchManagement
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Pricing
            </button>
            <button
              onClick={() => {
                setActiveTab('visibility');
                setShowBatchManagement(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                activeTab === 'visibility' && !showBatchManagement
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Eye className="h-4 w-4 mr-1" />
              Visibility
            </button>
            <button
              onClick={() => {
                setActiveTab('basic');
                setShowBatchManagement(!showBatchManagement);
              }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                showBatchManagement 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-4 w-4 mr-1" />
              Batch Management
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && !showBatchManagement && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="sweets">Sweets</option>
                    <option value="chocolates">Chocolates</option>
                    <option value="nuts">Nuts</option>
                    <option value="dried-fruits">Dried Fruits</option>
                    <option value="kosher">Kosher</option>
                    <option value="gifts">Gifts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visible to staff</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="customerVisible"
                    checked={formData.customerVisible}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visible to customers</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allow_custom_order"
                    checked={formData.allow_custom_order}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow custom orders</span>
                </label>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && !showBatchManagement && (
            <div className="space-y-6">
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPricingMode('margin')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    pricingMode === 'margin'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Percent className="h-4 w-4 mr-1" />
                  Margin Based
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('price')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    pricingMode === 'price'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Price Based
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Per Unit (Ex VAT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={(e) => handlePricingChange('costPerUnit', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Per Unit (Inc VAT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerUnitIncVat}
                    onChange={(e) => handlePricingChange('costPerUnitIncVat', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    readOnly={pricingMode === 'margin'}
                  />
                </div>
              </div>

              {pricingMode === 'margin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profit Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.profitMargin}
                    onChange={(e) => handlePricingChange('profitMargin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price (Ex VAT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saleExVat}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Price (Inc VAT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handlePricingChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={pricingMode === 'margin'}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h5 className="font-medium text-gray-900 mb-2">Profit Analysis</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Profit Margin:</p>
                    <p className="text-lg font-bold text-green-600">{formData.profitMargin?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profit Per Unit:</p>
                    <p className="text-lg font-bold text-green-600">
                      £{formData.profitPerUnit?.toFixed(2) || ((formData.saleExVat || 0) - (formData.costPerUnit || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (for promotions)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOnPromotion"
                    checked={formData.isOnPromotion}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Currently on promotion</span>
                </label>
              </div>
            </div>
          )}

          {/* Visibility Tab */}
          {activeTab === 'visibility' && !showBatchManagement && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.visibilitySettings.showInReadyToGo}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        visibilitySettings: {
                          ...prev.visibilitySettings,
                          showInReadyToGo: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show in Ready-to-Go section</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.visibilitySettings.showInBestsellers}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        visibilitySettings: {
                          ...prev.visibilitySettings,
                          showInBestsellers: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show in Bestsellers</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.visibilitySettings.showInNewArrivals}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        visibilitySettings: {
                          ...prev.visibilitySettings,
                          showInNewArrivals: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show in New Arrivals</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Occasion Visibility</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(occasionVisibility).map(([occasion, isVisible]) => (
                    <label key={occasion} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => handleOccasionToggle(occasion)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {occasion.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Batch Management Panel */}
          {showBatchManagement && (
            <BatchManagementPanel 
              product={product || {
                ...formData,
                id: 'new-product',
                name: formData.name || 'New Product',
                description: formData.description || '',
                price: Number(formData.price) || 0,
                image: '',
                category: formData.category || '',
                stock: 0,
                sku: '',
                isVisible: true
              } as Product}
              onUpdateBatchSettings={(settings) => {
                if (product) {
                  dispatch({
                    type: 'UPDATE_PRODUCT_BATCH_SETTINGS',
                    payload: {
                      productId: product.id,
                      ...settings
                    }
                  });
                }
                setFormData(prev => ({
                  ...prev,
                  hasExpiry: settings.hasExpiry,
                  expiryNotificationDays: settings.expiryNotificationDays,
                  useFifo: settings.useFifo
                }));
              }}
            />
          )}

          <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}