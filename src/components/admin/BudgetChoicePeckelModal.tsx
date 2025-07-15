import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, DollarSign, Package, Plus, Trash2, Calendar, Image } from 'lucide-react';
import { BudgetChoicePeckel } from '../../types';
import { useApp } from '../../context/AppContext';

interface BudgetChoicePeckelModalProps {
  peckel?: BudgetChoicePeckel;
  onClose: () => void;
}

export function BudgetChoicePeckelModal({ peckel, onClose }: BudgetChoicePeckelModalProps) {
  const { state, dispatch } = useApp();
  const { budgetChoicePeckels, occasions, bags } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<BudgetChoicePeckel & { allowBagSelection?: boolean }>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    color: 'Blue',
    isVisible: true,
    occasions: [],
    features: ['Expert-selected items', 'Made to order', 'Best value guarantee'],
    allowBagSelection: false
  });

  const [occasionVisibility, setOccasionVisibility] = useState<'all' | 'specific'>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const isEditing = !!peckel;

  useEffect(() => {
    if (peckel) {
      setFormData({
        ...peckel,
        allowBagSelection: (peckel as any).allowBagSelection || false
      });
      setOccasionVisibility(
        !peckel.occasions || peckel.occasions.length === 0 ? 'all' : 'specific'
      );
      if (peckel.image) {
        setImagePreview(peckel.image);
      }
    }
  }, [peckel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price === undefined || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle image upload
    let finalImageUrl = formData.image || '';
    if (imageFile) {
      // In a real application, you would upload this to a file storage service
      // For demo purposes, we'll create a local URL
      finalImageUrl = URL.createObjectURL(imageFile);
    }

    // If no image is provided, use a default image
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
    }

    const peckelData: BudgetChoicePeckel & { allowBagSelection?: boolean } = {
      id: peckel?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      price: Number(formData.price),
      image: finalImageUrl,
      sampleItems: formData.sampleItems || [],
      bag: formData.bag || bags[0] || {
        id: 'default-bag',
        name: 'Default Bag',
        description: 'Default bag',
        price: 2.00,
        image: '',
        color: 'Various',
        size: 'Medium',
        stock: 100,
        isVisible: true
      },
      color: formData.color || 'Blue',
      isVisible: formData.isVisible !== false,
      occasions: occasionVisibility === 'all' ? [] : (formData.occasions || []),
      features: formData.features || [],
      allowBagSelection: formData.allowBagSelection || false
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_BUDGET_CHOICE_PECKEL', payload: peckelData });
    } else {
      dispatch({ type: 'ADD_BUDGET_CHOICE_PECKEL', payload: peckelData });
    }

    onClose();
  };

  const handleInputChange = (field: keyof (BudgetChoicePeckel & { allowBagSelection?: boolean }), value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      handleInputChange('image', url);
    }
  };

  const handleOccasionToggle = (occasionName: string) => {
    const currentOccasions = formData.occasions || [];
    const isSelected = currentOccasions.includes(occasionName);
    
    if (isSelected) {
      handleInputChange('occasions', currentOccasions.filter(o => o !== occasionName));
    } else {
      handleInputChange('occasions', [...currentOccasions, occasionName]);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    handleInputChange('features', newFeatures);
  };

  const addFeature = () => {
    const newFeatures = [...(formData.features || []), ''];
    handleInputChange('features', newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    handleInputChange('features', newFeatures);
  };

  const colorOptions = ['Blue', 'Pink', 'Gold', 'Silver', 'Royal Blue', 'Burgundy', 'Green', 'Purple', 'Red', 'Black', 'White'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Budget Choice Peckel' : 'Add New Budget Choice Peckel'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peckel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter peckel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter peckel description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peckel Image
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      handleInputChange('image', e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  <div className="text-center">
                    <span className="text-gray-500">or</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-teal transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Features */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add features that will be displayed to customers
                </p>
                
                <div className="space-y-3">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        placeholder="Enter feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-brand-teal hover:text-brand-teal-dark text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Customer Options */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Options</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="allowBagSelection"
                    checked={formData.allowBagSelection}
                    onChange={(e) => handleInputChange('allowBagSelection', e.target.checked)}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="allowBagSelection" className="ml-3 text-sm font-medium text-gray-700">
                    Allow customers to choose bag color/style
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, customers can select from available bag options instead of using the default bag
                </p>
              </div>

              {/* Visibility Settings */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Visibility Settings</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="isVisible" className="ml-3 text-sm font-medium text-gray-700">
                    Visible to customers
                  </label>
                </div>
              </div>

              {/* Occasion Visibility */}
              {formData.isVisible && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-brand-teal" />
                    Occasion Availability
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={occasionVisibility === 'all'}
                          onChange={() => setOccasionVisibility('all')}
                          className="mr-3 text-brand-teal focus:ring-brand-teal"
                        />
                        Available for all occasions
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={occasionVisibility === 'specific'}
                          onChange={() => setOccasionVisibility('specific')}
                          className="mr-3 text-brand-teal focus:ring-brand-teal"
                        />
                        Available only for specific occasions
                      </label>
                    </div>

                    {occasionVisibility === 'specific' && (
                      <div className="mt-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {occasions.map(occasion => (
                            <label key={occasion.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(formData.occasions || []).includes(occasion.name)}
                                onChange={() => handleOccasionToggle(occasion.name)}
                                className="mr-3 text-brand-teal focus:ring-brand-teal"
                              />
                              <span className="text-sm" dir="rtl">{occasion.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Default Bag Selection */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-brand-teal" />
                  Default Bag
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formData.allowBagSelection 
                    ? 'This will be the default bag option shown to customers'
                    : 'This bag will be used for all orders of this budget choice'
                  }
                </p>
                
                <select
                  value={formData.bag?.id || ''}
                  onChange={(e) => {
                    const selectedBag = bags.find(bag => bag.id === e.target.value);
                    handleInputChange('bag', selectedBag);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  <option value="">Select a bag...</option>
                  {bags.filter(bag => bag.isVisible).map(bag => (
                    <option key={bag.id} value={bag.id}>
                      {bag.name} - {bag.size} - {bag.color} (£{bag.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
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
              {isEditing ? 'Update Peckel' : 'Add Peckel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}