import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image, Calendar, Settings, Plus, Trash2 } from 'lucide-react';
import { Label } from '../../types';
import { useApp } from '../../context/AppContext';

interface LabelModalProps {
  label?: Label;
  onClose: () => void;
}

export function LabelModal({ label, onClose }: LabelModalProps) {
  const { state, dispatch } = useApp();
  const { occasions } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Label>>({
    name: '',
    description: '',
    price: 0,
    designImage: '',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: [],
    showSimchaDateField: false,
    simchaDateOccasions: []
  });

  const [occasionVisibility, setOccasionVisibility] = useState<'all' | 'specific'>('all');
  const [simchaDateVisibility, setSimchaDateVisibility] = useState<'all' | 'specific'>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const isEditing = !!label;

  useEffect(() => {
    if (label) {
      setFormData(label);
      setOccasionVisibility(
        !label.visibleOccasions || label.visibleOccasions.length === 0 ? 'all' : 'specific'
      );
      setSimchaDateVisibility(
        !label.simchaDateOccasions || label.simchaDateOccasions.length === 0 ? 'all' : 'specific'
      );
      if (label.designImage) {
        setImagePreview(label.designImage);
      }
    }
  }, [label]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.isPreDesigned && !formData.designImage && !imageFile) {
      alert('Please provide a design image for pre-designed labels');
      return;
    }

    // Handle image upload
    let finalImageUrl = formData.designImage || '';
    if (imageFile) {
      // In a real application, you would upload this to a file storage service
      // For demo purposes, we'll create a local URL
      finalImageUrl = URL.createObjectURL(imageFile);
    }

    const labelData: Label = {
      id: label?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      price: Number(formData.price),
      designImage: finalImageUrl,
      isPreDesigned: formData.isPreDesigned !== false,
      isVisible: formData.isVisible !== false,
      visibleOccasions: occasionVisibility === 'all' ? [] : (formData.visibleOccasions || []),
      showSimchaDateField: formData.showSimchaDateField || false,
      simchaDateOccasions: formData.showSimchaDateField 
        ? (simchaDateVisibility === 'all' ? [] : (formData.simchaDateOccasions || []))
        : []
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_LABEL', payload: labelData });
    } else {
      dispatch({ type: 'ADD_LABEL', payload: labelData });
    }

    onClose();
  };

  const handleInputChange = (field: keyof Label, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      handleInputChange('designImage', url);
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

  const handleSimchaDateOccasionToggle = (occasionName: string) => {
    const currentOccasions = formData.simchaDateOccasions || [];
    const isSelected = currentOccasions.includes(occasionName);
    
    if (isSelected) {
      handleInputChange('simchaDateOccasions', currentOccasions.filter(o => o !== occasionName));
    } else {
      handleInputChange('simchaDateOccasions', [...currentOccasions, occasionName]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Label Design' : 'Add New Label Design'}
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
                  Label Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter label name"
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
                  placeholder="Enter label description"
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

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Label Type</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.isPreDesigned}
                        onChange={() => handleInputChange('isPreDesigned', true)}
                        className="mr-3 text-brand-teal focus:ring-brand-teal"
                      />
                      Pre-designed label (customers can customize text)
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.isPreDesigned}
                        onChange={() => handleInputChange('isPreDesigned', false)}
                        className="mr-3 text-brand-teal focus:ring-brand-teal"
                      />
                      Custom upload option (customers upload their own design)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
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

            {/* Right Column */}
            <div className="space-y-6">
              {formData.isPreDesigned && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Design Upload</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.designImage}
                        onChange={(e) => {
                          handleInputChange('designImage', e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        placeholder="https://example.com/design.jpg"
                      />
                    </div>

                    <div className="text-center">
                      <span className="text-gray-500">or</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Design File
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-teal transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="design-upload"
                        />
                        <label htmlFor="design-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm text-gray-600">
                            Click to upload design image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                      </div>
                    </div>

                    {imagePreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Design Preview
                        </label>
                        <div className="border border-gray-200 rounded-xl p-4 bg-white">
                          <img
                            src={imagePreview}
                            alt="Design preview"
                            className="w-full h-48 object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!formData.isPreDesigned && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <Image className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Custom Upload Option</h3>
                      <p className="text-blue-800 text-sm">
                        This option allows customers to upload their own label designs during the ordering process. 
                        No design image is needed for this option.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Simcha Date Field Settings */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-brand-teal" />
                  Simcha Date Field
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showSimchaDateField"
                      checked={formData.showSimchaDateField}
                      onChange={(e) => handleInputChange('showSimchaDateField', e.target.checked)}
                      className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                    />
                    <label htmlFor="showSimchaDateField" className="ml-3 text-sm font-medium text-gray-700">
                      Show Simcha Date field for this label
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    When enabled, customers will see an optional Hebrew date input field when selecting this label
                  </p>
                  
                  {formData.showSimchaDateField && (
                    <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Simcha Date Field Example Text
                      </label>
                      <textarea
                        placeholder="Enter example text to show in the Simcha date field (e.g., 'כ״ט סיון תשפ״ה', 'ט״ו אב תשפ״ה')"
                        value={formData.simchaDateExampleText || ''}
                        onChange={(e) => handleInputChange('simchaDateExampleText', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        dir="rtl"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This text will be shown as an example to help customers enter the correct format
                      </p>
                    </div>
                  )}
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

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Usage Guidelines</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Design should be high resolution (300 DPI minimum)</p>
                  <p>• Include bleed area for printing</p>
                  <p>• Leave space for customer text customization</p>
                  <p>• Leave space for Simcha date if enabled</p>
                  <p>• Use appropriate colors for the occasion</p>
                  <p>• Ensure text is readable and professional</p>
                </div>
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
              {isEditing ? 'Update Label' : 'Add Label'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}