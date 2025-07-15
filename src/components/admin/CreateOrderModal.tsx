import React, { useState } from 'react';
import { X, Plus, Minus, User, Phone, Mail, MapPin, Search, Calendar, Package, Tag, Palette, Filter, Upload, Check, Star, Type } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Customer, Order, CartItem, Bag, Label } from '../../types';
import { getHebrewDateInfo, parseHebrewDate } from '../../utils/hebrewCalendar';

interface CreateOrderModalProps {
  onClose: () => void;
}

export function CreateOrderModal({ onClose }: CreateOrderModalProps) {
  const { state, dispatch } = useApp();
  const { products, occasions, bags, labels } = state;
  
  const [orderType, setOrderType] = useState<'phone' | 'in-person'>('phone');
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    phone2: '',
    phone3: '',
    street: '',
    city: '',
    county: '',
    postcode: ''
  });
  const [notes, setNotes] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [hebrewDateInput, setHebrewDateInput] = useState('');
  const [dateInputType, setDateInputType] = useState<'gregorian' | 'hebrew'>('gregorian');
  
  // New state for bag and label selection
  const [selectedBag, setSelectedBag] = useState<Bag | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [personalText, setPersonalText] = useState('');
  const [simchaDate, setSimchaDate] = useState('');
  const [customLabelDesign, setCustomLabelDesign] = useState('');
  const [customLabelUpload, setCustomLabelUpload] = useState('');
  
  // Search and filter states
  const [bagSearch, setBagSearch] = useState('');
  const [bagColorFilter, setBagColorFilter] = useState('');
  const [bagSizeFilter, setBagSizeFilter] = useState('');
  const [labelSearch, setLabelSearch] = useState('');
  const [labelTypeFilter, setLabelTypeFilter] = useState('all'); // 'all', 'pre-designed', 'custom'

  // Get unique product categories
  const productCategories = Array.from(new Set(products.map(p => p.category))).sort();
  
  // Get unique bag colors and sizes
  const bagColors = Array.from(new Set(bags.map(b => b.color))).sort();
  const bagSizes = Array.from(new Set(bags.map(b => b.size))).sort();

  // Filter products based on search and category
  const filteredProducts = products.filter(product =>
    (product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
     product.description.toLowerCase().includes(productSearch.toLowerCase())) &&
    (productCategoryFilter === '' || product.category === productCategoryFilter)
  );

  // Filter bags based on search, color, and size
  const filteredBags = bags.filter(bag =>
    (bag.name.toLowerCase().includes(bagSearch.toLowerCase()) ||
     bag.description.toLowerCase().includes(bagSearch.toLowerCase())) &&
    (bagColorFilter === '' || bag.color === bagColorFilter) &&
    (bagSizeFilter === '' || bag.size === bagSizeFilter) &&
    bag.isVisible
  );

  // Filter labels based on search, type, and occasion
  const filteredLabels = labels.filter(label => {
    const matchesSearch = label.name.toLowerCase().includes(labelSearch.toLowerCase()) ||
                         label.description.toLowerCase().includes(labelSearch.toLowerCase());
    
    const matchesType = labelTypeFilter === 'all' ||
                       (labelTypeFilter === 'pre-designed' && label.isPreDesigned) ||
                       (labelTypeFilter === 'custom' && !label.isPreDesigned);
    
    const matchesOccasion = !selectedOccasion || 
                           !label.visibleOccasions || 
                           label.visibleOccasions.length === 0 || 
                           label.visibleOccasions.includes(selectedOccasion);
    
    return matchesSearch && matchesType && matchesOccasion && label.isVisible;
  });

  const addItem = (product: Product) => {
    const existingItem = selectedItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setSelectedItems(items =>
        items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.allowCustomOrder ? 999 : product.stock) }
            : item
        )
      );
    } else {
      setSelectedItems(items => [...items, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedItems(items => items.filter(item => item.product.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && (newQuantity <= product.stock || product.allowCustomOrder)) {
        setSelectedItems(items =>
          items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    }
  };

  const handleDateChange = (value: string, type: 'gregorian' | 'hebrew') => {
    if (type === 'gregorian') {
      setOrderDate(value);
      const hebrewInfo = getHebrewDateInfo(new Date(value));
      setHebrewDateInput(hebrewInfo.hebrewDate);
    } else {
      setHebrewDateInput(value);
      const gregorianDate = parseHebrewDate(value);
      if (gregorianDate) {
        setOrderDate(gregorianDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleCustomLabelUpload = (file: File) => {
    // In a real application, you would upload this to a file storage service
    // For demo purposes, we'll create a local URL
    const url = URL.createObjectURL(file);
    setCustomLabelUpload(url);
  };

  const shouldShowSimchaDateField = () => {
    if (!selectedLabel || !selectedLabel.showSimchaDateField) return false;
    
    // If no specific occasions are set, show for all occasions
    if (!selectedLabel.simchaDateOccasions || selectedLabel.simchaDateOccasions.length === 0) return true;
    
    // Check if current occasion is in the list
    return selectedLabel.simchaDateOccasions.includes(selectedOccasion);
  };

  // Calculate total price including bag and label if selected
  const calculateTotal = () => {
    let total = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Add bag price if selected
    if (selectedBag) {
      total += selectedBag.price;
    }
    
    // Add label price if selected
    if (selectedLabel) {
      total += selectedLabel.price;
    }
    
    return total;
  };

  const total = calculateTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0 && !selectedBag) {
      alert('Please add at least one item or bag to the order');
      return;
    }

    if (!selectedOccasion) {
      alert('Please select an occasion for this order');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      phone2: customerData.phone2 || undefined,
      phone3: customerData.phone3 || undefined,
      address: {
        street: customerData.street,
        city: customerData.city,
        state: customerData.county,
        zipCode: customerData.postcode
      }
    };

    // Get Hebrew date info for the order date
    const selectedDate = new Date(orderDate);
    const hebrewInfo = getHebrewDateInfo(selectedDate);

    // Create order notes with additional information
    let orderNotes = notes;
    
    // Add personal text if provided
    if (personalText) {
      orderNotes += orderNotes ? `\nPersonal Text: ${personalText}` : `Personal Text: ${personalText}`;
    }
    
    // Add simcha date if provided
    if (simchaDate) {
      orderNotes += orderNotes ? `\nSimcha Date: ${simchaDate}` : `Simcha Date: ${simchaDate}`;
    }
    
    // Add custom label text if provided
    if (customLabelDesign) {
      orderNotes += orderNotes ? `\nCustom Label Text: ${customLabelDesign}` : `Custom Label Text: ${customLabelDesign}`;
    }
    
    // Add custom label upload info if provided
    if (customLabelUpload) {
      orderNotes += orderNotes ? `\nCustom Label Design: Uploaded by customer` : `Custom Label Design: Uploaded by customer`;
    }

    // Create custom label design string
    let customLabelInfo = '';
    if (selectedLabel) {
      if (selectedLabel.isPreDesigned) {
        if (personalText) {
          customLabelInfo += `Personal Text: "${personalText}"`;
        }
      } else {
        // Custom label
        if (customLabelDesign) {
          customLabelInfo += `Custom Text: ${customLabelDesign}`;
        }
        if (customLabelUpload) {
          customLabelInfo += customLabelInfo ? ` | Custom Design: Uploaded` : `Custom Design: Uploaded`;
        }
      }
      
      if (simchaDate) {
        customLabelInfo += customLabelInfo ? ` | Simcha Date: ${simchaDate}` : `Simcha Date: ${simchaDate}`;
      }
    }

    const order: Order = {
      id: `ORD-${Date.now()}`,
      customer,
      items: selectedItems,
      total,
      status: 'pending',
      orderDate: selectedDate.toISOString(),
      orderType,
      notes: orderNotes,
      occasion: selectedOccasion,
      hebrewDate: hebrewInfo.hebrewDate,
      parsha: hebrewInfo.parsha,
      dayOfWeek: hebrewInfo.dayOfWeek,
      hebrewDayOfWeek: hebrewInfo.hebrewDayOfWeek,
      selectedBag: selectedBag || undefined,
      selectedLabel: selectedLabel || undefined,
      customLabelDesign: customLabelInfo || undefined,
      personalText: personalText || undefined,
      simchaDate: simchaDate || undefined
    };

    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    dispatch({ type: 'ADD_ORDER', payload: order });
    onClose();
  };

  const currentHebrewInfo = getHebrewDateInfo(new Date(orderDate));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Manual Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Customer & Order Info */}
            <div className="space-y-8">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Order Type *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="phone"
                      checked={orderType === 'phone'}
                      onChange={(e) => setOrderType(e.target.value as 'phone')}
                      className="mr-3 text-brand-teal focus:ring-brand-teal"
                    />
                    <Phone className="h-4 w-4 mr-2 text-brand-teal" />
                    Phone Order
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in-person"
                      checked={orderType === 'in-person'}
                      onChange={(e) => setOrderType(e.target.value as 'in-person')}
                      className="mr-3 text-brand-teal focus:ring-brand-teal"
                    />
                    <User className="h-4 w-4 mr-2 text-brand-teal" />
                    In-Person
                  </label>
                </div>
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Date *
                </label>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={dateInputType === 'gregorian'}
                        onChange={() => setDateInputType('gregorian')}
                        className="mr-2 text-brand-teal focus:ring-brand-teal"
                      />
                      English Date
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={dateInputType === 'hebrew'}
                        onChange={() => setDateInputType('hebrew')}
                        className="mr-2 text-brand-teal focus:ring-brand-teal"
                      />
                      Hebrew Date
                    </label>
                  </div>
                  
                  {dateInputType === 'gregorian' ? (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={(e) => handleDateChange(e.target.value, 'gregorian')}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g., כ״ט סיון תשפ״ה"
                      value={hebrewDateInput}
                      onChange={(e) => handleDateChange(e.target.value, 'hebrew')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      dir="rtl"
                    />
                  )}
                </div>
                
                <div className="mt-3 text-sm text-gray-600 bg-primary-50 p-4 rounded-lg">
                  <p><strong>English Date:</strong> {new Date(orderDate).toLocaleDateString('en-GB')}</p>
                  <p><strong>Day of Week:</strong> {currentHebrewInfo.dayOfWeek} / {currentHebrewInfo.hebrewDayOfWeek}</p>
                  <p><strong>Hebrew Date:</strong> {currentHebrewInfo.hebrewDate}</p>
                  <p><strong>Parsha:</strong> {currentHebrewInfo.parsha}</p>
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  required
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  <option value="">Select an occasion...</option>
                  {occasions.map(occasion => (
                    <option key={occasion.id} value={occasion.name}>
                      {occasion.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-brand-teal" />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone2}
                    onChange={(e) => setCustomerData({...customerData, phone2: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Third Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone3}
                    onChange={(e) => setCustomerData({...customerData, phone3: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>

                {/* Address - Always show for both order types */}
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-brand-teal" />
                    {orderType === 'phone' ? 'Delivery Address' : 'Customer Address (Optional)'}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address {orderType === 'phone' ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      required={orderType === 'phone'}
                      value={customerData.street}
                      onChange={(e) => setCustomerData({...customerData, street: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City {orderType === 'phone' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        required={orderType === 'phone'}
                        value={customerData.city}
                        onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County {orderType === 'phone' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        required={orderType === 'phone'}
                        value={customerData.county}
                        onChange={(e) => setCustomerData({...customerData, county: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode {orderType === 'phone' ? '*' : ''}
                      </label>
                      <input
                        type="text"
                        required={orderType === 'phone'}
                        value={customerData.postcode}
                        onChange={(e) => setCustomerData({...customerData, postcode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Special instructions, payment method, etc."
                />
              </div>
            </div>

            {/* Right Column - Products, Bags, and Labels */}
            <div className="space-y-8">
              {/* Bag Selection */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="h-6 w-6 mr-3 text-brand-teal" />
                  Bag Selection (Optional)
                </h3>
                
                {/* Bag Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search bags..."
                      value={bagSearch}
                      onChange={(e) => setBagSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={bagColorFilter}
                      onChange={(e) => setBagColorFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
                    >
                      <option value="">All Colors</option>
                      {bagColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={bagSizeFilter}
                      onChange={(e) => setBagSizeFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
                    >
                      <option value="">All Sizes</option>
                      {bagSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-gray-600">
                    Select a bag for this order. The bag price will be added to the total.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 max-h-64 overflow-y-auto">
                  {filteredBags.length > 0 ? (
                    filteredBags.map(bag => (
                      <div 
                        key={bag.id}
                        onClick={() => setSelectedBag(selectedBag?.id === bag.id ? null : bag)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedBag?.id === bag.id 
                            ? 'bg-primary-100 border-2 border-brand-teal' 
                            : 'bg-white border border-gray-200 hover:border-brand-teal'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={bag.image || 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500'}
                            alt={bag.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{bag.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{bag.color}</span>
                              <span>•</span>
                              <span>{bag.size}</span>
                              <span>•</span>
                              <span className="font-bold">£{bag.price.toFixed(2)}</span>
                            </div>
                            <div className="text-xs mt-1">
                              Stock: {bag.stock}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-8 text-center text-gray-500">
                      No bags found matching your search criteria.
                    </div>
                  )}
                </div>
                
                {selectedBag && (
                  <div className="bg-primary-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-brand-teal">
                      Selected: {selectedBag.name} - {selectedBag.color} {selectedBag.size} - £{selectedBag.price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Palette className="h-6 w-6 mr-3 text-brand-teal" />
                  Item Selection
                </h3>
                
                {/* Product Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or description..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
                    >
                      <option value="">All Categories</option>
                      {productCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Product List */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-2xl">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
                      const canAddToOrder = product.stock > 0 || product.allowCustomOrder;
                      return (
                        <div key={product.id} className="p-6 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-xl"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                                }}
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <div className="text-sm text-gray-500">
                                  {product.isOnPromotion && product.originalPrice ? (
                                    <>
                                      <span className="line-through">£{product.originalPrice.toFixed(2)}</span>
                                      <span className="text-red-600 font-bold ml-2">£{product.price.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span>£{product.price.toFixed(2)}</span>
                                  )}
                                  {product.allowCustomOrder && product.stock === 0 ? ' - Made to Order' : ` - Stock: ${product.stock}`}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs bg-primary-100 text-brand-teal px-2 py-1 rounded">
                                    {product.category}
                                  </span>
                                  {!product.isVisible && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      Admin Only
                                    </span>
                                  )}
                                  {product.allowCustomOrder && (
                                    <span className="text-xs bg-brand-teal text-white px-2 py-1 rounded">
                                      Custom Order
                                    </span>
                                  )}
                                  {product.isOnPromotion && (
                                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                      On Sale
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => addItem(product)}
                              disabled={!canAddToOrder}
                              className={`px-4 py-2 rounded-xl text-sm transition-colors flex items-center space-x-2 ${
                                canAddToOrder
                                  ? 'bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      {productSearch || productCategoryFilter ? 'No products found matching your search criteria.' : 'No products available.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Items */}
              {selectedItems.length > 0 && (
                <div className="border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-6">Selected Items ({selectedItems.length})</h4>
                  <div className="space-y-4">
                    {selectedItems.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">£{item.product.price.toFixed(2)} each</p>
                          <p className="text-xs text-gray-400">Total: £{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={!item.product.allowCustomOrder && item.quantity >= item.product.stock}
                            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Label Selection */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-6 w-6 mr-3 text-brand-teal" />
                  Label Selection (Optional)
                </h3>
                
                {/* Label Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search labels..."
                      value={labelSearch}
                      onChange={(e) => setLabelSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={labelTypeFilter}
                      onChange={(e) => setLabelTypeFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none"
                    >
                      <option value="all">All Label Types</option>
                      <option value="pre-designed">Pre-designed Labels</option>
                      <option value="custom">Custom Design Labels</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-gray-600">
                    Select a label for this order. The label price will be added to the total.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 max-h-64 overflow-y-auto">
                  {filteredLabels.length > 0 ? (
                    filteredLabels.map(label => (
                      <div 
                        key={label.id}
                        onClick={() => setSelectedLabel(selectedLabel?.id === label.id ? null : label)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedLabel?.id === label.id 
                            ? 'bg-primary-100 border-2 border-brand-teal' 
                            : 'bg-white border border-gray-200 hover:border-brand-teal'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {label.designImage ? (
                            <img 
                              src={label.designImage}
                              alt={label.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Tag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{label.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{label.isPreDesigned ? 'Pre-designed' : 'Custom'}</span>
                              <span>•</span>
                              <span className="font-bold">£{label.price.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {label.showSimchaDateField && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  Simcha Date
                                </span>
                              )}
                              {label.isPreDesigned && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Personal Text
                                </span>
                              )}
                              {!label.isPreDesigned && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Custom Upload
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-8 text-center text-gray-500">
                      No labels found matching your search criteria.
                    </div>
                  )}
                </div>
                
                {selectedLabel && (
                  <div className="space-y-4">
                    <div className="bg-primary-50 p-4 rounded-xl">
                      <p className="text-sm font-medium text-brand-teal">
                        Selected: {selectedLabel.name} - £{selectedLabel.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Personal Text for Pre-designed Labels */}
                    {selectedLabel.isPreDesigned && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personal Text (Optional)
                        </label>
                        <textarea
                          placeholder="Enter personal text for the label..."
                          value={personalText}
                          onChange={(e) => setPersonalText(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This text will be added to the pre-designed label
                        </p>
                      </div>
                    )}
                    
                    {/* Custom Label Options */}
                    {!selectedLabel.isPreDesigned && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Custom Label Text (Optional)
                            </label>
                            <textarea
                              placeholder="Enter text for the custom label..."
                              value={customLabelDesign}
                              onChange={(e) => setCustomLabelDesign(e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer's Design (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-teal transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleCustomLabelUpload(file);
                                  }
                                }}
                                className="hidden"
                                id="custom-label-upload"
                              />
                              <label htmlFor="custom-label-upload" className="cursor-pointer">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  Upload customer's design
                                </p>
                              </label>
                            </div>
                            
                            {customLabelUpload && (
                              <div className="mt-2">
                                <img
                                  src={customLabelUpload}
                                  alt="Custom label preview"
                                  className="w-full h-24 object-contain rounded-lg border border-gray-200"
                                />
                                <div className="flex justify-end mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setCustomLabelUpload('')}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Simcha Date Field */}
                    {shouldShowSimchaDateField() && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Simcha Date in Hebrew (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="כ״ט סיון תשפ״ה"
                          value={simchaDate}
                          onChange={(e) => setSimchaDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                          dir="rtl"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This date will appear on the label under the main text
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  {selectedBag && ` + ${selectedBag.name}`}
                  {selectedLabel && ` + ${selectedLabel.name} Label`}
                </div>
                
                {/* Summary of customizations */}
                {(personalText || simchaDate || customLabelDesign || customLabelUpload) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h5 className="font-medium text-gray-900 mb-2">Label Customizations:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {personalText && <li>• Personal Text: "{personalText}"</li>}
                      {simchaDate && <li>• Simcha Date: {simchaDate}</li>}
                      {customLabelDesign && <li>• Custom Text: "{customLabelDesign}"</li>}
                      {customLabelUpload && <li>• Custom Design: Uploaded by customer</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedItems.length === 0 && !selectedBag}
              className="px-6 py-3 text-white bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Order {(selectedItems.length > 0 || selectedBag) && `(£${total.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}