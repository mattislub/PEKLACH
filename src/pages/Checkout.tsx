import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Loader2, Phone, Truck, Store, Zap, Clock, Info, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Customer, Order, DeliveryMethod } from '../types';
import { getHebrewDateInfo } from '../utils/hebrewCalendar';
import { createPaymentLink, generateInvoice } from '../utils/sumupService';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/deliveryUtils';

export function Checkout() {
  const { state, dispatch } = useApp();
  const { state: authState } = useAuth();
  const { cart, selectedOccasion, adminSettings, customers } = state;
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('');
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);

  const [formData, setFormData] = useState({
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

  // Get active delivery methods
  const activeDeliveryMethods = adminSettings.deliveryMethods.filter(method => method.isActive);

  // Populate form with user data if logged in
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setFormData({
        name: authState.user.name || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
        phone2: authState.user.phone2 || '',
        phone3: authState.user.phone3 || '',
        street: authState.user.address?.street || '',
        city: authState.user.address?.city || '',
        county: authState.user.address?.state || '',
        postcode: authState.user.address?.zipCode || ''
      });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Calculate distance when address changes
  useEffect(() => {
    if (formData.street && formData.city && formData.postcode) {
      const customerAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.county,
        zipCode: formData.postcode
      };
      
      // Calculate distance from store
      const calculatedDistance = calculateDistance(
        adminSettings.storeAddress,
        customerAddress
      );
      
      setDistance(calculatedDistance);
      
      // Update delivery price if a method is selected
      if (selectedDeliveryMethod) {
        updateDeliveryPrice(selectedDeliveryMethod, calculatedDistance, subtotal);
      }
    }
  }, [formData.street, formData.city, formData.county, formData.postcode]);

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const subtotal = total;

  // Calculate delivery price based on method, distance, and order value
  const updateDeliveryPrice = (methodId: string, distance: number | null, orderValue: number) => {
    const method = adminSettings.deliveryMethods.find(m => m.id === methodId);
    
    if (!method) {
      setDeliveryPrice(0);
      return;
    }
    
    // Free pickup
    if (method.id === 'pickup') {
      setDeliveryPrice(0);
      return;
    }
    
    // Check free shipping threshold
    if (method.freeShippingThreshold && orderValue >= method.freeShippingThreshold) {
      setDeliveryPrice(0);
      return;
    }
    
    // Distance-based pricing
    if (method.isDistanceBased && distance !== null && method.distancePricing) {
      // Find the appropriate price tier based on distance
      const distanceTiers = Object.keys(method.distancePricing)
        .map(Number)
        .sort((a, b) => a - b);
      
      let price = method.basePrice; // Default to base price
      
      // Find the highest tier that's less than or equal to the distance
      for (const tier of distanceTiers) {
        if (distance <= tier) {
          price = method.distancePricing[tier.toString()];
          break;
        }
      }
      
      // If distance is greater than all tiers, use the highest tier price
      if (distance > Math.max(...distanceTiers)) {
        price = method.distancePricing[Math.max(...distanceTiers).toString()];
      }
      
      setDeliveryPrice(price);
      return;
    }
    
    // Value-based pricing
    if (method.isValueBased && method.valuePricing) {
      const valueTiers = Object.keys(method.valuePricing)
        .map(Number)
        .sort((a, b) => a - b);
      
      let price = method.basePrice; // Default to base price
      
      // Find the highest tier that's less than or equal to the order value
      for (const tier of valueTiers) {
        if (orderValue >= tier) {
          price = method.valuePricing[tier.toString()];
        }
      }
      
      setDeliveryPrice(price);
      return;
    }
    
    // Default to base price if no special pricing applies
    setDeliveryPrice(method.basePrice);
  };

  const handleDeliveryMethodChange = (methodId: string) => {
    setSelectedDeliveryMethod(methodId);
    updateDeliveryPrice(methodId, distance, subtotal);
  };

  const getDeliveryMethodIcon = (iconName?: string) => {
    switch (iconName) {
      case 'truck':
        return <Truck className="h-5 w-5" />;
      case 'store':
        return <Store className="h-5 w-5" />;
      case 'zap':
        return <Zap className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate delivery method selection
    if (!selectedDeliveryMethod) {
      alert('Please select a delivery method');
      setIsProcessing(false);
      return;
    }

    try {
      const customer: Customer = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phone2: formData.phone2 || undefined,
        phone3: formData.phone3 || undefined,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.county,
          zipCode: formData.postcode
        }
      };

      // Get selected delivery method
      const deliveryMethod = adminSettings.deliveryMethods.find(
        method => method.id === selectedDeliveryMethod
      );

      // Calculate delivery address with distance
      const deliveryAddress = {
        ...customer.address,
        distance: distance || undefined
      };

      // Get Hebrew date info for the order
      const hebrewInfo = getHebrewDateInfo();
      
      // Generate a unique order ID
      const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Create the order object
      const order: Order = {
        id: orderId,
        customer,
        items: cart,
        total,
        status: 'pending',
        orderDate: new Date().toISOString(),
        orderType: 'online',
        occasion: selectedOccasion || undefined,
        deliveryMethod: deliveryMethod,
        deliveryPrice: deliveryPrice,
        deliveryAddress: deliveryAddress,
        hebrewDate: hebrewInfo.hebrewDate,
        parsha: hebrewInfo.parsha,
        dayOfWeek: hebrewInfo.dayOfWeek,
        hebrewDayOfWeek: hebrewInfo.hebrewDayOfWeek
      };

      // If SumUp integration is enabled, create payment link
      if (adminSettings.sumupEnabled) {
        try {
          // Create payment link
          const paymentResponse = await createPaymentLink(
            total,
            `YH Pecklech Order ${orderId}`,
            adminSettings.sumupMerchantCode,
            adminSettings.sumupApiKey,
            formData.email,
            orderId
          );
          
          // Add payment info to order
          order.paymentId = paymentResponse.id;
          order.paymentLink = paymentResponse.payment_link;
          order.paymentStatus = 'pending';
          
          // Generate invoice if enabled
          if (adminSettings.autoGenerateInvoices) {
            try {
              const invoiceResponse = await generateInvoice(
                formData.name,
                formData.email,
                cart.map(item => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price
                })),
                total,
                adminSettings.sumupMerchantCode,
                adminSettings.sumupApiKey,
                {
                  street: formData.street,
                  city: formData.city,
                  state: formData.county,
                  zipCode: formData.postcode
                },
                `Order ID: ${orderId}`,
                orderId
              );
              
              // Add invoice URL to order
              order.invoiceUrl = invoiceResponse.invoice_url;
            } catch (invoiceError) {
              console.error('Failed to generate invoice:', invoiceError);
            }
          }
          
          // Save order and customer data
          dispatch({ type: 'ADD_CUSTOMER', payload: customer });
          dispatch({ type: 'ADD_ORDER', payload: order });
          dispatch({ type: 'CLEAR_CART' });
          
          // Redirect directly to payment link
          window.location.href = paymentResponse.payment_link;
        } catch (paymentError) {
          console.error('Failed to create payment link:', paymentError);
          
          // Fallback: proceed to order success if payment link creation fails
          dispatch({ type: 'ADD_CUSTOMER', payload: customer });
          dispatch({ type: 'ADD_ORDER', payload: order });
          dispatch({ type: 'CLEAR_CART' });
          navigate('/order-success', { state: { orderId: order.id } });
        }
      } else {
        // SumUp not enabled, just save order and proceed
        dispatch({ type: 'ADD_CUSTOMER', payload: customer });
        dispatch({ type: 'ADD_ORDER', payload: order });
        dispatch({ type: 'CLEAR_CART' });
        navigate('/order-success', { state: { orderId: order.id } });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
              <User className="h-6 w-6 mr-3 text-brand-teal" />
              Customer Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Phone Number *
                </label>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Phone Number (Optional)
                </label>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Third Phone Number (Optional)
                </label>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone3"
                    value={formData.phone3}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  />
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                  <Truck className="h-5 w-5 mr-3 text-brand-teal" />
                  Delivery Method
                </h3>
                
                <div className="space-y-4">
                  {activeDeliveryMethods.map(method => {
                    // Calculate price for this method
                    let methodPrice = method.basePrice;
                    let isFree = false;
                    
                    // Free pickup
                    if (method.id === 'pickup') {
                      methodPrice = 0;
                      isFree = true;
                    }
                    
                    // Check free shipping threshold
                    if (method.freeShippingThreshold && subtotal >= method.freeShippingThreshold) {
                      methodPrice = 0;
                      isFree = true;
                    }
                    
                    // Distance-based pricing
                    if (method.isDistanceBased && distance !== null && method.distancePricing) {
                      const distanceTiers = Object.keys(method.distancePricing)
                        .map(Number)
                        .sort((a, b) => a - b);
                      
                      // Find the appropriate price tier based on distance
                      for (const tier of distanceTiers) {
                        if (distance <= tier) {
                          methodPrice = method.distancePricing[tier.toString()];
                          break;
                        }
                      }
                      
                      // If distance is greater than all tiers, use the highest tier price
                      if (distance > Math.max(...distanceTiers)) {
                        methodPrice = method.distancePricing[Math.max(...distanceTiers).toString()];
                      }
                    }
                    
                    return (
                      <div 
                        key={method.id}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          selectedDeliveryMethod === method.id 
                            ? 'border-brand-teal bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDeliveryMethodChange(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              selectedDeliveryMethod === method.id 
                                ? 'bg-brand-teal text-white' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {getDeliveryMethodIcon(method.icon)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                              {method.estimatedDeliveryDays && (
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {method.estimatedDeliveryDays}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {isFree ? (
                              <span className="font-bold text-green-600">Free</span>
                            ) : (
                              <span className="font-bold text-gray-900">£{methodPrice.toFixed(2)}</span>
                            )}
                            {method.freeShippingThreshold && !isFree && (
                              <div className="text-xs text-gray-500">
                                Free over £{method.freeShippingThreshold.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Distance information for distance-based methods */}
                        {method.isDistanceBased && distance !== null && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <Info className="h-3 w-3 mr-1" />
                            Distance: {distance.toFixed(1)} miles from our store
                          </div>
                        )}
                        
                        {/* Selected indicator */}
                        {selectedDeliveryMethod === method.id && (
                          <div className="mt-2 text-xs text-brand-teal flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {!selectedDeliveryMethod && (
                  <div className="mt-2 text-sm text-red-600">
                    Please select a delivery method to continue
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                  <MapPin className="h-5 w-5 mr-3 text-brand-teal" />
                  Delivery Address
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <input
                        type="text"
                        name="county"
                        required
                        value={formData.county}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        required
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-3 text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Place Order & Pay - £{total.toFixed(2)}</span>
                    </>
                  )}
                </button>
                
                {adminSettings.sumupEnabled && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Payment Method:</strong> Online Payment via SumUp
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You'll be redirected to a secure payment page after placing your order
                    </p>
                  </div>
                )}
                
                {selectedDeliveryMethod && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-800 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <strong>Delivery Method:</strong> {adminSettings.deliveryMethods.find(m => m.id === selectedDeliveryMethod)?.name}
                    </p>
                    {distance !== null && (
                      <p className="text-xs text-green-700 mt-1">
                        Delivery distance: {distance.toFixed(1)} miles
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Order Summary</h2>
            
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">
                      £{item.product.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-lg">
                    £{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-8 pt-8">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600 text-lg">
                  <span>Subtotal</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-lg">
                  <span>Delivery</span>
                  {deliveryPrice > 0 ? (
                    <span>£{deliveryPrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-brand-teal font-medium">Free</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600 text-lg">
                  <span>Total</span>
                  <span>£{(total + deliveryPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOccasion && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-brand-teal font-medium">
                  Occasion: <span dir="rtl">{selectedOccasion}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}