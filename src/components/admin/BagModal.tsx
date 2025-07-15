import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Upload, AlertTriangle } from 'lucide-react';
import { Bag } from '../../types';
import { useApp } from '../../context/AppContext';

interface BagModalProps {
  bag?: Bag;
  onClose: () => void;
}

export function BagModal({ bag, onClose }: BagModalProps) {
  const { state, dispatch } = useApp();
  const { bags, occasions } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Bag & { visibleOccasions?: string[] }>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    color: '',
    size: '',
    stock: 0,
    isVisible: true,
    visibleOccasions: [],
    minimumStock: 0
  });

  const [occasionVisibility, setOccasionVisibility] = useState<'all' | 'specific'>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const isEditing = !!bag;

  useEffect(() => {
    if (bag) {
      setFormData({
        ...bag,
        visibleOccasions: (bag as any).visibleOccasions || [],
        minimumStock: bag.minimumStock || 0
      });
      setOccasionVisibility(
        !(bag as any).visibleOccasions || (bag as any).visibleOccasions.length === 0 ? 'all' : 'specific'
      );
      if (bag.image) {
        setImagePreview(bag.image);
      }
    }
  }, [bag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.color || !formData.size || formData.price === undefined) {
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

    const bagData: Bag & { visibleOccasions?: string[] } = {
      id: bag?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      price: Number(formData.price),
      image: finalImageUrl,
      color: formData.color!,
      size: formData.size!,
      stock: Number(formData.stock),
      isVisible: formData.isVisible !== false,
      visibleOccasions: occasionVisibility === 'all' ? [] : (formData.visibleOccasions || []),
      minimumStock: Number(formData.minimumStock) || 0
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_BAG', payload: bagData });
    } else {
      dispatch({ type: 'ADD_BAG', payload: bagData });
    }

    onClose();
  };

  const handleInputChange = (field: keyof (Bag & { visibleOccasions?: string[] }), value: any) => {
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
    const currentOccasions = formData.visibleOccasions || [];
    const isSelected = currentOccasions.includes(occasionName);
    
    if (isSelected) {
      handleInputChange('visibleOccasions', currentOccasions.filter(o => o !== occasionName));
    } else {
      handleInputChange('visibleOccasions', [...currentOccasions, occasionName]);
    }
  };

  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const colorOptions = ['Blue', 'Pink', 'Gold', 'Silver', 'Royal Blue', 'Burgundy', 'Green', 'Purple', 'Red', 'Black', 'White'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Bag' : 'Add New Bag'}
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
                  Bag Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter bag name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter bag description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <select
                    required
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  >
                    <option value="">Select color...</option>
                    {colorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size *
                  </label>
                  <select
                    required
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  >
                    <option value="">Select size...</option>
                    {sizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bag Image
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
                          className="w-32 h-32 object-cover rounded-xl border border-gray-200"
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
              {/* Pricing & Inventory */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing & Inventory</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Minimum Stock Alert */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Minimum Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStock}
                    onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="Alert when stock reaches this level"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You'll receive an alert when stock falls to or below this level
                  </p>
                </div>
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
                                checked={(formData.visibleOccasions || []).includes(occasion.name)}
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
              {isEditing ? 'Update Bag' : 'Add Bag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}