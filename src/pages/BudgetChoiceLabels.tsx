import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Tag, Upload, Check, Star, Type, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function BudgetChoiceLabels() {
  const { state, dispatch } = useApp();
  const { labels } = state;
  const navigate = useNavigate();
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [customUpload, setCustomUpload] = useState('');
  const [personalText, setPersonalText] = useState(''); // New state for personal text on pre-designed labels
  const [simchaDate, setSimchaDate] = useState(''); // New state for Hebrew Simcha date
  const [budgetPeckelData, setBudgetPeckelData] = useState<any>(null);

  useEffect(() => {
    // Get the selected budget peckel data from session storage
    const storedData = sessionStorage.getItem('selectedBudgetPeckel');
    if (storedData) {
      setBudgetPeckelData(JSON.parse(storedData));
    } else {
      // If no data found, redirect back to budget choice
      navigate('/budget-choice');
    }
  }, [navigate]);

  if (!budgetPeckelData) {
    return null; // Loading or redirecting
  }

  const { peckel, quantity, occasion } = budgetPeckelData;

  // Filter labels for the selected occasion
  const availableLabels = labels.filter(label => {
    if (!label.isVisible) return false;
    if (!label.visibleOccasions || label.visibleOccasions.length === 0) return true;
    return label.visibleOccasions.includes(occasion);
  });

  const handleLabelSelect = (labelId: string | null) => {
    setSelectedLabelId(labelId);
    
    // Clear custom options when selecting a different label
    if (labelId !== 'label-custom') {
      setCustomText('');
      setCustomUpload('');
    }
    
    // Clear personal text and simcha date when changing labels
    setPersonalText('');
    setSimchaDate('');
  };

  const handleCustomUpload = (file: File) => {
    // In a real application, you would upload this to a file storage service
    // For demo purposes, we'll create a local URL
    const url = URL.createObjectURL(file);
    setCustomUpload(url);
  };

  const shouldShowSimchaDateField = () => {
    const selectedLabel = selectedLabelId ? availableLabels.find(label => label.id === selectedLabelId) : null;
    if (!selectedLabel || !selectedLabel.showSimchaDateField) return false;
    
    // If no specific occasions are set, show for all occasions
    if (!selectedLabel.simchaDateOccasions || selectedLabel.simchaDateOccasions.length === 0) return true;
    
    // Check if current occasion is in the list
    return selectedLabel.simchaDateOccasions.includes(occasion);
  };

  const handleContinue = () => {
    const selectedLabel = selectedLabelId ? availableLabels.find(label => label.id === selectedLabelId) : null;
    
    let labelDescription = '';
    if (selectedLabelId === 'label-custom') {
      if (customText) {
        labelDescription = `Custom Text: ${customText}`;
      }
      if (customUpload) {
        labelDescription += labelDescription ? ` | Custom Upload: ${customUpload}` : `Custom Upload: ${customUpload}`;
      }
    } else if (selectedLabel && personalText.trim()) {
      // Add personal text to pre-designed label
      labelDescription = `Personal Text: "${personalText.trim()}"`;
    }

    // Add Simcha date if provided
    if (simchaDate.trim()) {
      labelDescription += labelDescription ? ` | Simcha Date: ${simchaDate.trim()}` : `Simcha Date: ${simchaDate.trim()}`;
    }

    // Calculate total price including label
    let totalPrice = peckel.price;
    if (selectedLabel) {
      totalPrice += selectedLabel.price;
    }

    // Create product name with label selection if applicable
    let productName = peckel.name;
    if (selectedLabel) {
      if (selectedLabel.id === 'label-custom') {
        productName += ' (Custom Label)';
      } else {
        productName += ` (${selectedLabel.name} Label)`;
        if (personalText.trim()) {
          productName += ` with Personal Text`;
        }
      }
      if (simchaDate.trim()) {
        productName += ` - ${simchaDate.trim()}`;
      }
    }

    // Create a product-like object for the cart
    const peckelProduct = {
      id: `bc-${peckel.id}${selectedLabelId ? `-${selectedLabelId}` : ''}${personalText ? '-personal' : ''}${simchaDate ? '-simcha' : ''}`,
      name: productName,
      description: peckel.description + (selectedLabel ? ` • Includes ${selectedLabel.name}` : '') + (labelDescription ? ` • ${labelDescription}` : ''),
      price: totalPrice,
      image: peckel.image,
      category: 'Budget Choice Pecklech',
      stock: 999, // Budget choice is made to order
      sku: `BC-${peckel.id}`,
      isVisible: true,
      allowCustomOrder: true
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product: peckelProduct, quantity }
    });

    // Clear session storage
    sessionStorage.removeItem('selectedBudgetPeckel');

    // Navigate to cart
    navigate('/cart');
  };

  const handleSkipLabel = () => {
    // Add to cart without label
    const peckelProduct = {
      id: `bc-${peckel.id}`,
      name: peckel.name,
      description: peckel.description,
      price: peckel.price,
      image: peckel.image,
      category: 'Budget Choice Pecklech',
      stock: 999, // Budget choice is made to order
      sku: `BC-${peckel.id}`,
      isVisible: true,
      allowCustomOrder: true
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product: peckelProduct, quantity }
    });

    // Clear session storage
    sessionStorage.removeItem('selectedBudgetPeckel');

    // Navigate to cart
    navigate('/cart');
  };

  const getTotalPrice = () => {
    let total = peckel.price;
    const selectedLabel = selectedLabelId ? availableLabels.find(label => label.id === selectedLabelId) : null;
    if (selectedLabel) {
      total += selectedLabel.price;
    }
    return total * quantity;
  };

  const getLabelPrice = () => {
    const selectedLabel = selectedLabelId ? availableLabels.find(label => label.id === selectedLabelId) : null;
    return selectedLabel ? selectedLabel.price * quantity : 0;
  };

  const selectedLabel = selectedLabelId ? availableLabels.find(label => label.id === selectedLabelId) : null;
  const isCustomLabel = selectedLabelId === 'label-custom';
  const isPreDesignedLabel = selectedLabel && selectedLabel.isPreDesigned && !isCustomLabel;
  const showSimchaField = shouldShowSimchaDateField();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/budget-choice')}
            className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark transition-colors font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Budget Choice</span>
          </button>
          
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View Cart</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Label (Optional)</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <span className="font-bold text-brand-teal" dir="rtl">{occasion}</span>
          </p>
          <p className="text-lg text-gray-500">
            Selected: <span className="font-medium text-gray-700">{peckel.name} × {quantity}</span>
          </p>
          <p className="text-sm text-gray-500">Add a personalized touch to your Pecklech or continue without a label</p>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Tag className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Label Options:</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Choose from our pre-designed label templates</li>
                <li>• Add your personal text to any pre-designed label</li>
                <li>• Add Hebrew Simcha date for special occasions</li>
                <li>• Upload your own custom design</li>
                <li>• Add personalized text to custom designs</li>
                <li>• Skip this step if you prefer no label</li>
                <li>• Labels are completely optional and can be added later</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Label Options Grid */}
        {availableLabels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {availableLabels.map((label) => {
              const isSelected = selectedLabelId === label.id;
              const isCustom = label.id === 'label-custom';
              
              return (
                <div 
                  key={label.id} 
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden border-4 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                    isSelected 
                      ? 'border-brand-teal shadow-2xl' 
                      : 'border-gray-100 hover:border-brand-teal hover:shadow-xl'
                  }`}
                  onClick={() => handleLabelSelect(label.id)}
                >
                  <div className="relative">
                    {label.designImage ? (
                      <img
                        src={label.designImage}
                        alt={label.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <Upload className="h-16 w-16 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-brand-teal text-white p-2 rounded-full">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                    
                    {/* Label Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${
                        isCustom 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {isCustom ? (
                          <>
                            <Star className="h-3 w-3 mr-1" />
                            Custom
                          </>
                        ) : (
                          <>
                            <Tag className="h-3 w-3 mr-1" />
                            Template
                          </>
                        )}
                      </span>
                    </div>

                    {/* Personal Text Indicator */}
                    {label.isPreDesigned && !isCustom && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <Type className="h-3 w-3 mr-1" />
                          + Personal Text
                        </span>
                      </div>
                    )}

                    {/* Simcha Date Indicator */}
                    {label.showSimchaDateField && (!label.simchaDateOccasions || label.simchaDateOccasions.length === 0 || label.simchaDateOccasions.includes(occasion)) && (
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          + Date
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{label.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{label.description}</p>
                    
                    {/* Personal Text Feature for Pre-designed Labels */}
                    {label.isPreDesigned && !isCustom && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800 text-sm font-medium mb-1">
                          <Type className="h-4 w-4 mr-1" />
                          Add Your Personal Text
                        </div>
                        <p className="text-xs text-green-700">
                          Customize this design with your own text
                        </p>
                      </div>
                    )}

                    {/* Simcha Date Feature */}
                    {label.showSimchaDateField && (!label.simchaDateOccasions || label.simchaDateOccasions.length === 0 || label.simchaDateOccasions.includes(occasion)) && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center text-purple-800 text-sm font-medium mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Add Simcha Date
                        </div>
                        <p className="text-xs text-purple-700">
                          Include Hebrew date for your special occasion
                        </p>
                      </div>
                    )}
                    
                    {/* Pricing */}
                    <div className="mb-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        £{label.price.toFixed(2)}
                      </div>
                      {quantity > 1 && (
                        <div className="text-sm text-gray-600">
                          Total: £{(label.price * quantity).toFixed(2)} for {quantity} labels
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLabelSelect(label.id);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-200 text-sm flex items-center justify-center space-x-2 ${
                        isSelected
                          ? 'bg-brand-teal text-white'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Tag className="h-4 w-4" />
                          <span>Select This Label</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <Tag className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Labels Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              There are currently no label designs available for <span className="font-bold" dir="rtl">{occasion}</span>.
              You can continue without a label.
            </p>
          </div>
        )}

        {/* Personal Text for Pre-designed Labels */}
        {isPreDesignedLabel && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Type className="h-6 w-6 mr-3 text-brand-teal" />
              Add Your Personal Text
            </h3>
            <p className="text-gray-600 mb-6">
              Customize the selected "{selectedLabel?.name}" design with your personal message
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Text (Optional)
              </label>
              <textarea
                placeholder="Enter your personal text to be added to the label design..."
                value={personalText}
                onChange={(e) => setPersonalText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                This text will be professionally added to your selected label design. 
                Examples: "Mazel Tov Sarah!", "Happy Birthday David", "With Love from the Goldberg Family"
              </p>
              
              {personalText.trim() && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">Preview:</p>
                  <p className="text-green-700 italic">"{personalText.trim()}"</p>
                  <p className="text-xs text-green-600 mt-1">
                    This text will be added to your {selectedLabel?.name} design
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simcha Date Field */}
        {showSimchaField && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-purple-600" />
              Simcha Date (in Hebrew)
            </h3>
            <p className="text-gray-600 mb-6">
              Add the Hebrew date of your special occasion to the label
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hebrew Date (Optional)
              </label>
              <input
                type="text"
                placeholder="כ״ט סיון תשפ״ה"
                value={simchaDate}
                onChange={(e) => setSimchaDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the Hebrew date in Hebrew characters. This will appear on the final label under the main text.
                {selectedLabel?.simchaDateExampleText ? selectedLabel.simchaDateExampleText : 'Examples: "כ״ט סיון תשפ״ה", "ט״ו אב תשפ״ה", "ח׳ טבת תשפ״ה"'}
              </p>
              
              {simchaDate.trim() && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 mb-1">Hebrew Date Preview:</p>
                  <p className="text-purple-700 text-lg" dir="rtl">{simchaDate.trim()}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    This date will appear on your label under the main text
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Label Options */}
        {isCustomLabel && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Customize Your Label</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Text (Optional)
                </label>
                <textarea
                  placeholder="Enter your custom text for the label"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text will be added to your custom label design
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Custom Design (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-teal transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCustomUpload(file);
                      }
                    }}
                    className="hidden"
                    id="custom-upload"
                  />
                  <label htmlFor="custom-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                      Click to upload your design
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
                
                {customUpload && (
                  <div className="mt-4">
                    <img
                      src={customUpload}
                      alt="Custom label preview"
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Summary & Continue */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>{peckel.name} × {quantity}</span>
              <span>£{(peckel.price * quantity).toFixed(2)}</span>
            </div>
            {selectedLabelId && (
              <div className="flex justify-between">
                <span>
                  Label: {availableLabels.find(l => l.id === selectedLabelId)?.name} × {quantity}
                  {personalText.trim() && <span className="text-green-600"> (with personal text)</span>}
                  {simchaDate.trim() && <span className="text-purple-600"> (with Hebrew date)</span>}
                </span>
                <span>£{getLabelPrice().toFixed(2)}</span>
              </div>
            )}
            {personalText.trim() && (
              <div className="text-sm text-gray-600 italic bg-green-50 p-3 rounded-lg">
                Personal text: "{personalText.trim()}"
              </div>
            )}
            {simchaDate.trim() && (
              <div className="text-sm text-gray-600 italic bg-purple-50 p-3 rounded-lg" dir="rtl">
                Hebrew date: {simchaDate.trim()}
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>£{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSkipLabel}
              className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            >
              Skip Label
            </button>
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white rounded-2xl font-medium text-lg transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Add to Cart</span>
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}