import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image, Calendar, Globe, Star } from 'lucide-react';
import { Occasion } from '../../types';
import { useApp } from '../../context/AppContext';
import { getHebrewMonths, getAllParshiot } from '../../utils/hebrewCalendar';

interface OccasionModalProps {
  occasion?: Occasion;
  onClose: () => void;
}

export function OccasionModal({ occasion, onClose }: OccasionModalProps) {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Occasion>>({
    name: '',
    category: 'custom',
    description: '',
    color: '#0d9488',
    image: '',
    isVisibleOnStorefront: true,
    scheduledVisibility: { 
      isScheduled: false,
      startDate: '',
      endDate: '',
      hebrewSchedule: {
        useHebrewCalendar: false,
        hebrewStartMonth: '',
        hebrewEndMonth: '',
        hebrewStartDay: 1,
        hebrewEndDay: 30,
        specificParshiot: [],
        recurring: true
      }
    },
    manualOverride: {
      isActive: false,
      forceVisible: false,
      forceHidden: false,
      overrideUntil: ''
    }
  });

  const isEditing = !!occasion;
  const hebrewMonths = getHebrewMonths();
  const allParshiot = getAllParshiot();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (occasion) {
      setFormData(occasion);
      if (occasion.image) {
        setImagePreview(occasion.image);
      }
    }
  }, [occasion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
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

    const occasionData: Occasion = {
      id: occasion?.id || Date.now().toString(),
      name: formData.name!,
      category: formData.category!,
      description: formData.description || '',
      color: formData.color || '#0d9488',
      image: finalImageUrl,
      isVisibleOnStorefront: formData.isVisibleOnStorefront !== false,
      displayOrder: occasion?.displayOrder || Math.max(...state.occasions.map(o => o.displayOrder), 0) + 1,
      scheduledVisibility: formData.scheduledVisibility || { isScheduled: false },
      manualOverride: formData.manualOverride
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_OCCASION', payload: occasionData });
    } else {
      dispatch({ type: 'ADD_OCCASION', payload: occasionData });
    }

    onClose();
  };

  const handleInputChange = (field: keyof Occasion, value: any) => {
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

  const occasionCategories = [
    { value: 'lifecycle', label: 'Lifecycle Events' },
    { value: 'religious', label: 'Religious Occasions' },
    { value: 'holiday', label: 'Jewish Holidays' },
    { value: 'weekly', label: 'Weekly Events' },
    { value: 'custom', label: 'Custom' }
  ];

  const colorOptions = [
    '#0d9488', '#84cc16', '#3b82f6', '#8b5cf6', '#f59e0b',
    '#ef4444', '#ec4899', '#06b6d4', '#10b981', '#f97316'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Occasion' : 'Add New Occasion'}
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
                  Occasion Name (Yiddish) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter occasion name in Yiddish"
                  dir="rtl"
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
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter description that will appear underneath the occasion name"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This description will appear underneath the occasion name on the storefront
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  {occasionCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion Image
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

                  {imagePreview ? (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <img
                          src={imagePreview}
                          alt="Occasion preview"
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview (No Image)
                      </label>
                      <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <div 
                          className="w-full h-32 flex items-center justify-center rounded-lg"
                          style={{ backgroundColor: (formData.color || '#0d9488') + '20' }}
                        >
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Visibility Settings */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Visibility Settings</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisibleOnStorefront}
                    onChange={(e) => handleInputChange('isVisibleOnStorefront', e.target.checked)}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="isVisible" className="ml-3 text-sm font-medium text-gray-700">
                    Visible on storefront
                  </label>
                </div>
              </div>

              {/* Scheduling Options */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="checkbox"
                    id="scheduleVisibility"
                    checked={formData.scheduledVisibility?.isScheduled}
                    onChange={(e) => handleInputChange('scheduledVisibility', { 
                      ...formData.scheduledVisibility, 
                      isScheduled: e.target.checked 
                    })}
                    className="text-brand-teal focus:ring-brand-teal"
                  />
                  <label htmlFor="scheduleVisibility" className="text-sm font-medium">Schedule visibility dates</label>
                </div>
                
                {formData.scheduledVisibility?.isScheduled && (
                  <div className="space-y-4 bg-white p-4 rounded-lg">
                    {/* Calendar Type Selection */}
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.scheduledVisibility.hebrewSchedule?.useHebrewCalendar}
                          onChange={() => handleInputChange('scheduledVisibility', {
                            ...formData.scheduledVisibility,
                            hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, useHebrewCalendar: false }
                          })}
                          className="mr-2 text-brand-teal focus:ring-brand-teal"
                        />
                        <Globe className="h-4 w-4 mr-1" />
                        English Calendar
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.scheduledVisibility.hebrewSchedule?.useHebrewCalendar}
                          onChange={() => handleInputChange('scheduledVisibility', {
                            ...formData.scheduledVisibility,
                            hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, useHebrewCalendar: true }
                          })}
                          className="mr-2 text-brand-teal focus:ring-brand-teal"
                        />
                        <Calendar className="h-4 w-4 mr-1" />
                        Hebrew Calendar
                      </label>
                    </div>
                    
                    {!formData.scheduledVisibility.hebrewSchedule?.useHebrewCalendar ? (
                      // English Calendar Scheduling
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={formData.scheduledVisibility.startDate}
                            onChange={(e) => handleInputChange('scheduledVisibility', { 
                              ...formData.scheduledVisibility, 
                              startDate: e.target.value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={formData.scheduledVisibility.endDate}
                            onChange={(e) => handleInputChange('scheduledVisibility', { 
                              ...formData.scheduledVisibility, 
                              endDate: e.target.value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      // Hebrew Calendar Scheduling
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="recurring"
                            checked={formData.scheduledVisibility.hebrewSchedule?.recurring}
                            onChange={(e) => handleInputChange('scheduledVisibility', {
                              ...formData.scheduledVisibility,
                              hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, recurring: e.target.checked }
                            })}
                            className="mr-2 text-brand-teal focus:ring-brand-teal"
                          />
                          <label htmlFor="recurring" className="text-sm">Recurring every year</label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
                            <select
                              value={formData.scheduledVisibility.hebrewSchedule?.hebrewStartMonth || ''}
                              onChange={(e) => handleInputChange('scheduledVisibility', {
                                ...formData.scheduledVisibility,
                                hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, hebrewStartMonth: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                            >
                              <option value="">Select month...</option>
                              {hebrewMonths.map(month => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Month</label>
                            <select
                              value={formData.scheduledVisibility.hebrewSchedule?.hebrewEndMonth || ''}
                              onChange={(e) => handleInputChange('scheduledVisibility', {
                                ...formData.scheduledVisibility,
                                hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, hebrewEndMonth: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                            >
                              <option value="">Select month...</option>
                              {hebrewMonths.map(month => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Specific Parshiot (optional)</label>
                          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            <div className="grid grid-cols-2 gap-1">
                              {allParshiot.map(parsha => (
                                <label key={parsha} className="flex items-center text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.scheduledVisibility.hebrewSchedule?.specificParshiot?.includes(parsha) || false}
                                    onChange={(e) => {
                                      const currentParshiot = formData.scheduledVisibility.hebrewSchedule?.specificParshiot || [];
                                      const updatedParshiot = e.target.checked
                                        ? [...currentParshiot, parsha]
                                        : currentParshiot.filter(p => p !== parsha);
                                      handleInputChange('scheduledVisibility', {
                                        ...formData.scheduledVisibility,
                                        hebrewSchedule: { ...formData.scheduledVisibility.hebrewSchedule!, specificParshiot: updatedParshiot }
                                      });
                                    }}
                                    className="mr-1 text-brand-teal focus:ring-brand-teal"
                                  />
                                  {parsha}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Override */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-brand-teal" />
                  Manual Override
                </h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="manualOverride"
                    checked={formData.manualOverride?.isActive}
                    onChange={(e) => handleInputChange('manualOverride', {
                      ...formData.manualOverride,
                      isActive: e.target.checked
                    })}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="manualOverride" className="ml-3 text-sm font-medium text-gray-700">
                    Enable manual override
                  </label>
                </div>

                {formData.manualOverride?.isActive && (
                  <div className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.manualOverride?.forceVisible}
                          onChange={() => handleInputChange('manualOverride', {
                            ...formData.manualOverride,
                            forceVisible: true,
                            forceHidden: false
                          })}
                          className="mr-2 text-brand-teal focus:ring-brand-teal"
                        />
                        Force Visible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.manualOverride?.forceHidden}
                          onChange={() => handleInputChange('manualOverride', {
                            ...formData.manualOverride,
                            forceVisible: false,
                            forceHidden: true
                          })}
                          className="mr-2 text-brand-teal focus:ring-brand-teal"
                        />
                        Force Hidden
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Override Until</label>
                      <input
                        type="date"
                        value={formData.manualOverride?.overrideUntil}
                        onChange={(e) => handleInputChange('manualOverride', {
                          ...formData.manualOverride,
                          overrideUntil: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
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
              {isEditing ? 'Update Occasion' : 'Add Occasion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}