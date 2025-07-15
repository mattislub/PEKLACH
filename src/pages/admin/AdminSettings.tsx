import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Bell,
  Phone,
  MessageSquare,
  CreditCard, 
  Save, 
  Plus, 
  Trash2, 
  Truck, 
  Store, 
  Zap, 
  MapPin,
  Tag,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryMethod } from '../../types';

export function AdminSettings() {
  const { state, dispatch } = useApp();
  const { adminSettings } = state;
  
  const [formData, setFormData] = useState({
    alertEmail: adminSettings.alertEmail || '',
    emailNotifications: adminSettings.emailNotifications !== false,
    contactEmail: adminSettings.contactEmail || '',
    contactPhone: adminSettings.contactPhone || '',
    contactPhone2: adminSettings.contactPhone2 || '',
    messageDestinationEmail: adminSettings.messageDestinationEmail || '',
    sumupEnabled: adminSettings.sumupEnabled !== false,
    sumupMerchantCode: adminSettings.sumupMerchantCode || '',
    sumupApiKey: adminSettings.sumupApiKey || '',
    autoGenerateInvoices: adminSettings.autoGenerateInvoices !== false
  });
  
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>(
    adminSettings.deliveryMethods || []
  );
  
  const [storeAddress, setStoreAddress] = useState({
    street: adminSettings.storeAddress?.street || '',
    city: adminSettings.storeAddress?.city || '',
    state: adminSettings.storeAddress?.state || '',
    zipCode: adminSettings.storeAddress?.zipCode || '',
    latitude: adminSettings.storeAddress?.latitude || 51.5074,
    longitude: adminSettings.storeAddress?.longitude || -0.1278
  });
  
  const [editingDeliveryMethod, setEditingDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [showDeliveryMethodModal, setShowDeliveryMethodModal] = useState(false);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{index: number, value: string} | null>(null);
  
  // Extract unique categories from products
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(
      state.products.map(product => product.category)
    )).filter(Boolean);
    
    setCategories(uniqueCategories as string[]);
  }, [state.products]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleStoreAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setStoreAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings = {
      ...adminSettings,
      ...formData,
      deliveryMethods,
      storeAddress
    };
    
    dispatch({
      type: 'UPDATE_ADMIN_SETTINGS',
      payload: updatedSettings
    });
    
    alert('Settings saved successfully!');
  };
  
  const handleAddDeliveryMethod = () => {
    setEditingDeliveryMethod({
      id: `method-${Date.now()}`,
      name: '',
      description: '',
      basePrice: 0,
      isActive: true,
      isDistanceBased: false,
      isValueBased: false,
      estimatedDeliveryDays: '',
      icon: 'truck'
    });
    setShowDeliveryMethodModal(true);
  };
  
  const handleEditDeliveryMethod = (method: DeliveryMethod) => {
    setEditingDeliveryMethod({...method});
    setShowDeliveryMethodModal(true);
  };
  
  const handleDeleteDeliveryMethod = (methodId: string) => {
    if (confirm('Are you sure you want to delete this delivery method?')) {
      setDeliveryMethods(prev => prev.filter(method => method.id !== methodId));
    }
  };
  
  const handleSaveDeliveryMethod = (method: DeliveryMethod) => {
    if (!method.name) {
      alert('Please enter a name for the delivery method');
      return;
    }
    
    if (method.isDistanceBased && (!method.distancePricing || Object.keys(method.distancePricing).length === 0)) {
      alert('Please add at least one distance pricing tier');
      return;
    }
    
    if (method.isValueBased && (!method.valuePricing || Object.keys(method.valuePricing).length === 0)) {
      alert('Please add at least one value pricing tier');
      return;
    }
    
    const isNew = !deliveryMethods.some(m => m.id === method.id);
    
    if (isNew) {
      setDeliveryMethods(prev => [...prev, method]);
    } else {
      setDeliveryMethods(prev => prev.map(m => m.id === method.id ? method : m));
    }
    
    setShowDeliveryMethodModal(false);
    setEditingDeliveryMethod(null);
  };
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      alert('This category already exists');
      return;
    }
    
    setCategories(prev => [...prev, newCategory.trim()]);
    setNewCategory('');
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    if (!editingCategory.value.trim()) {
      alert('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(editingCategory.value.trim()) && 
        categories[editingCategory.index] !== editingCategory.value.trim()) {
      alert('This category already exists');
      return;
    }
    
    setCategories(prev => {
      const updated = [...prev];
      updated[editingCategory.index] = editingCategory.value.trim();
      return updated;
    });
    
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (index: number) => {
    if (confirm('Are you sure you want to delete this category? This will not affect existing products.')) {
      setCategories(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2 text-lg">Configure system-wide settings for your Pecklech platform</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-brand-teal" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="alertEmail"
                      value={formData.alertEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="alerts@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock alerts and order notifications will be sent to this email
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-3 text-sm font-medium text-gray-700">
                    Enable email notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-brand-teal" />
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="info@yhpecklech.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This email will be displayed on the website for customers to contact you
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="contactPhone2"
                      value={formData.contactPhone2}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="+44 20 8765 4321"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message Destination */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-brand-teal" />
                Contact Form Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Destination Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="messageDestinationEmail"
                      value={formData.messageDestinationEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="contact@yhpecklech.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Messages from the contact form will be sent to this email address
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Contact Form Configuration</p>
                      <p className="text-xs text-blue-700 mt-1">
                        When customers submit the contact form on your website, their messages will be sent to the email address specified above. Make sure to check this inbox regularly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-brand-teal" />
                Payment Settings
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sumupEnabled"
                    name="sumupEnabled"
                    checked={formData.sumupEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                  />
                  <label htmlFor="sumupEnabled" className="ml-3 text-sm font-medium text-gray-700">
                    Enable SumUp integration
                  </label>
                </div>
                
                {formData.sumupEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SumUp Merchant Code
                      </label>
                      <input
                        type="text"
                        name="sumupMerchantCode"
                        value={formData.sumupMerchantCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        placeholder="Your SumUp merchant code"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SumUp API Key
                      </label>
                      <input
                        type="password"
                        name="sumupApiKey"
                        value={formData.sumupApiKey}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        placeholder="Your SumUp API key"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoGenerateInvoices"
                        name="autoGenerateInvoices"
                        checked={formData.autoGenerateInvoices}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                      />
                      <label htmlFor="autoGenerateInvoices" className="ml-3 text-sm font-medium text-gray-700">
                        Auto-generate invoices
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Store Address */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-teal" />
                Store Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={storeAddress.street}
                    onChange={handleStoreAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={storeAddress.city}
                      onChange={handleStoreAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="London"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County/State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={storeAddress.state}
                      onChange={handleStoreAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="Greater London"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={storeAddress.zipCode}
                    onChange={handleStoreAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="NW1 6XE"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={storeAddress.latitude}
                      onChange={(e) => setStoreAddress(prev => ({
                        ...prev,
                        latitude: parseFloat(e.target.value)
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="51.5074"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={storeAddress.longitude}
                      onChange={(e) => setStoreAddress(prev => ({
                        ...prev,
                        longitude: parseFloat(e.target.value)
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      placeholder="-0.1278"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates are used for distance-based delivery pricing calculations
                </p>
              </div>
            </div>
            
            {/* Product Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-brand-teal" />
                Product Categories
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    placeholder="New category name"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="p-3 bg-brand-teal text-white rounded-xl hover:bg-brand-teal-dark transition-colors"
                  >
                    <FolderPlus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        {editingCategory && editingCategory.index === index ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingCategory.value}
                              onChange={(e) => setEditingCategory({...editingCategory, value: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleUpdateCategory}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-700">{category}</span>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {!(editingCategory && editingCategory.index === index) && (
                            <button
                              type="button"
                              onClick={() => setEditingCategory({index, value: category})}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No categories defined yet
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  These categories will be available when creating or editing products
                </p>
              </div>
            </div>
            
            {/* Delivery Methods */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-brand-teal" />
                  Delivery Methods
                </h2>
                
                <button
                  type="button"
                  onClick={handleAddDeliveryMethod}
                  className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Method</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {deliveryMethods.length > 0 ? (
                  deliveryMethods.map(method => (
                    <div key={method.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl ${
                            method.isActive ? 'bg-brand-teal text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {method.icon === 'truck' && <Truck className="h-6 w-6" />}
                            {method.icon === 'store' && <Store className="h-6 w-6" />}
                            {method.icon === 'zap' && <Zap className="h-6 w-6" />}
                            {!method.icon && <Truck className="h-6 w-6" />}
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                            
                            <div className="mt-2 space-y-1">
                              {method.id === 'pickup' ? (
                                <p className="text-sm font-medium text-green-600">Free Pickup</p>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-700">
                                    Base Price: £{method.basePrice.toFixed(2)}
                                  </p>
                                  
                                  {method.freeShippingThreshold && (
                                    <p className="text-sm text-green-600">
                                      Free for orders over £{method.freeShippingThreshold.toFixed(2)}
                                    </p>
                                  )}
                                  
                                  {method.isDistanceBased && method.distancePricing && (
                                    <div className="text-xs text-gray-600">
                                      <p>Distance-based pricing:</p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                        {Object.entries(method.distancePricing).map(([distance, price]) => (
                                          <p key={distance}>Up to {distance} miles: £{Number(price).toFixed(2)}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {method.isValueBased && method.valuePricing && (
                                    <div className="text-xs text-gray-600">
                                      <p>Value-based pricing:</p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                        {Object.entries(method.valuePricing).map(([value, price]) => (
                                          <p key={value}>Orders over £{value}: £{Number(price).toFixed(2)}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {method.estimatedDeliveryDays && (
                                <p className="text-xs text-gray-500">
                                  Estimated delivery: {method.estimatedDeliveryDays}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditDeliveryMethod(method)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Settings className="h-5 w-5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteDeliveryMethod(method.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Truck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No delivery methods configured</p>
                    <button
                      type="button"
                      onClick={handleAddDeliveryMethod}
                      className="mt-4 bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      Add Your First Delivery Method
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Save className="h-5 w-5" />
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
        
        {/* Delivery Method Modal */}
        {showDeliveryMethodModal && editingDeliveryMethod && (
          <DeliveryMethodModal
            method={editingDeliveryMethod}
            onSave={handleSaveDeliveryMethod}
            onCancel={() => {
              setShowDeliveryMethodModal(false);
              setEditingDeliveryMethod(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Delivery Method Modal Component
function DeliveryMethodModal({ 
  method, 
  onSave, 
  onCancel 
}: { 
  method: DeliveryMethod; 
  onSave: (method: DeliveryMethod) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<DeliveryMethod>({...method});
  const [newDistanceTier, setNewDistanceTier] = useState({ distance: '', price: '' });
  const [newValueTier, setNewValueTier] = useState({ value: '', price: '' });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddDistanceTier = () => {
    if (!newDistanceTier.distance || !newDistanceTier.price) {
      alert('Please enter both distance and price');
      return;
    }
    
    const distance = parseFloat(newDistanceTier.distance);
    const price = parseFloat(newDistanceTier.price);
    
    if (isNaN(distance) || isNaN(price) || distance <= 0 || price < 0) {
      alert('Please enter valid numbers');
      return;
    }
    
    const distancePricing = formData.distancePricing || {};
    
    setFormData(prev => ({
      ...prev,
      distancePricing: {
        ...distancePricing,
        [distance.toString()]: price
      }
    }));
    
    setNewDistanceTier({ distance: '', price: '' });
  };
  
  const handleRemoveDistanceTier = (distance: string) => {
    if (!formData.distancePricing) return;
    
    const updatedPricing = {...formData.distancePricing};
    delete updatedPricing[distance];
    
    setFormData(prev => ({
      ...prev,
      distancePricing: updatedPricing
    }));
  };
  
  const handleAddValueTier = () => {
    if (!newValueTier.value || !newValueTier.price) {
      alert('Please enter both order value and price');
      return;
    }
    
    const value = parseFloat(newValueTier.value);
    const price = parseFloat(newValueTier.price);
    
    if (isNaN(value) || isNaN(price) || value <= 0 || price < 0) {
      alert('Please enter valid numbers');
      return;
    }
    
    const valuePricing = formData.valuePricing || {};
    
    setFormData(prev => ({
      ...prev,
      valuePricing: {
        ...valuePricing,
        [value.toString()]: price
      }
    }));
    
    setNewValueTier({ value: '', price: '' });
  };
  
  const handleRemoveValueTier = (value: string) => {
    if (!formData.valuePricing) return;
    
    const updatedPricing = {...formData.valuePricing};
    delete updatedPricing[value];
    
    setFormData(prev => ({
      ...prev,
      valuePricing: updatedPricing
    }));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {method.id ? 'Edit Delivery Method' : 'Add Delivery Method'}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="e.g., Standard Delivery"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon || 'truck'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  <option value="truck">Truck</option>
                  <option value="store">Store</option>
                  <option value="zap">Express</option>
                </select>
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
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="e.g., Delivery within 3-5 business days"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basePrice: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  name="estimatedDeliveryDays"
                  value={formData.estimatedDeliveryDays}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="e.g., 3-5 days"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Leave empty for no free shipping"
              />
              <p className="text-xs text-gray-500 mt-1">
                Orders above this amount will qualify for free shipping
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                Active (available to customers)
              </label>
            </div>
            
            {/* Distance-based Pricing */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isDistanceBased"
                  name="isDistanceBased"
                  checked={formData.isDistanceBased}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                />
                <label htmlFor="isDistanceBased" className="ml-3 text-sm font-medium text-gray-700">
                  Enable distance-based pricing
                </label>
              </div>
              
              {formData.isDistanceBased && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Distance Pricing Tiers</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Distance (miles)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={newDistanceTier.distance}
                          onChange={(e) => setNewDistanceTier(prev => ({...prev, distance: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          placeholder="e.g., 5"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Price (£)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newDistanceTier.price}
                          onChange={(e) => setNewDistanceTier(prev => ({...prev, price: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          placeholder="e.g., 4.99"
                        />
                      </div>
                      
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={handleAddDistanceTier}
                          className="px-3 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal-dark transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {formData.distancePricing && Object.keys(formData.distancePricing).length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.entries(formData.distancePricing)
                          .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                          .map(([distance, price]) => (
                            <div key={distance} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <span className="text-sm">Up to {distance} miles</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium">£{Number(price).toFixed(2)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDistanceTier(distance)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No distance tiers added yet</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Add tiers for different distance ranges. Prices will apply up to the specified distance.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Value-based Pricing */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isValueBased"
                  name="isValueBased"
                  checked={formData.isValueBased}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                />
                <label htmlFor="isValueBased" className="ml-3 text-sm font-medium text-gray-700">
                  Enable order value-based pricing
                </label>
              </div>
              
              {formData.isValueBased && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Value Pricing Tiers</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Order Value (£)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={newValueTier.value}
                          onChange={(e) => setNewValueTier(prev => ({...prev, value: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          placeholder="e.g., 50"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Delivery Price (£)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newValueTier.price}
                          onChange={(e) => setNewValueTier(prev => ({...prev, price: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          placeholder="e.g., 2.99"
                        />
                      </div>
                      
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={handleAddValueTier}
                          className="px-3 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal-dark transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {formData.valuePricing && Object.keys(formData.valuePricing).length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.entries(formData.valuePricing)
                          .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                          .map(([value, price]) => (
                            <div key={value} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <span className="text-sm">Orders over £{value}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium">£{Number(price).toFixed(2)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveValueTier(value)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No value tiers added yet</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Add tiers for different order values. Prices will apply to orders above the specified value.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              className="px-6 py-3 text-white bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark rounded-xl font-medium transition-colors"
            >
              Save Delivery Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}