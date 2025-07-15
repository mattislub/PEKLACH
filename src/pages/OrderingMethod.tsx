import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Wrench, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function OrderingMethod() {
  const { state, dispatch } = useApp();
  const { selectedOccasion, adminSettings, globalQuantity } = state;
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(globalQuantity);

  if (!selectedOccasion) {
    navigate('/');
    return null;
  }

  // Sync local quantity with global quantity when component mounts or global quantity changes
  useEffect(() => {
    setQuantity(globalQuantity);
  }, [globalQuantity]);

  const orderingMethods = [
    {
      id: 'ready-to-go',
      title: adminSettings.orderingMethods.readyToGo.title,
      description: adminSettings.orderingMethods.readyToGo.description,
      icon: Package,
      color: 'from-green-500 to-emerald-500',
      features: adminSettings.orderingMethods.readyToGo.features,
      route: '/ready-to-go'
    },
    {
      id: 'budget-choice',
      title: adminSettings.orderingMethods.budgetChoice.title,
      description: adminSettings.orderingMethods.budgetChoice.description,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      features: adminSettings.orderingMethods.budgetChoice.features,
      route: '/budget-choice'
    },
    {
      id: 'build-peckel',
      title: adminSettings.orderingMethods.buildPeckel.title,
      description: adminSettings.orderingMethods.buildPeckel.description,
      icon: Wrench,
      color: 'from-purple-500 to-indigo-500',
      features: adminSettings.orderingMethods.buildPeckel.features,
      route: '/build-peckel/bag-selection'
    }
  ];

  const handleMethodSelect = (method: typeof orderingMethods[0]) => {
    // Update global quantity before navigating
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: quantity });
    
    if (method.id === 'build-peckel') {
      // Start build peckel session with quantity
      dispatch({ 
        type: 'START_BUILD_PECKEL', 
        payload: { occasion: selectedOccasion, quantity } 
      });
      navigate(method.route);
    } else {
      navigate(method.route);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const updatedQuantity = Math.max(1, newQuantity);
    setQuantity(updatedQuantity);
    // Update global quantity immediately
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: updatedQuantity });
  };

  const handleManualQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    const updatedQuantity = Math.max(1, newQuantity);
    setQuantity(updatedQuantity);
    // Update global quantity immediately
    dispatch({ type: 'SET_GLOBAL_QUANTITY', payload: updatedQuantity });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark transition-colors font-medium text-lg mr-8"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Occasions</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How would you like to order?</h1>
          <p className="text-xl text-gray-600 mb-2">
            Selected occasion: <span className="font-bold text-brand-teal" dir="rtl">{selectedOccasion}</span>
          </p>
          <p className="text-lg text-gray-500">Choose your preferred ordering method below</p>
        </div>

        {/* Quantity Selector */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How many Pecklech do you need?</h2>
            <p className="text-gray-600 mb-6">
              This quantity will apply to your entire order. You can adjust it at any step.
            </p>
            
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-4 rounded-2xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleManualQuantityChange(e.target.value)}
                  className="w-32 text-center text-4xl font-bold text-gray-900 py-3 px-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                />
                <div className="text-sm text-gray-500 mt-2">
                  {quantity === 1 ? 'Pecklech' : 'Pecklech'}
                </div>
              </div>
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-4 rounded-2xl border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Click +/- or type quantity directly
            </div>
          </div>
        </div>

        {/* Ordering Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {orderingMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`h-32 bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                <method.icon className="h-16 w-16 text-white" />
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{method.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{method.description}</p>
                
                <div className="space-y-3 mb-8">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-teal rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Quantity Display for Build-a-Peckel */}
                {method.id === 'build-peckel' && quantity > 1 && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-purple-800 text-sm font-medium">
                      You'll create {quantity} identical custom Pecklech
                    </p>
                  </div>
                )}

                {/* Quantity Display for other methods */}
                {method.id !== 'build-peckel' && quantity > 1 && (
                  <div className="mb-6 p-4 bg-primary-50 border border-brand-teal rounded-xl">
                    <p className="text-brand-teal text-sm font-medium">
                      Quantity: {quantity} Pecklech
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => handleMethodSelect(method)}
                  className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 text-lg shadow-lg hover:shadow-xl`}
                >
                  Choose This Method
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Deciding?</h3>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              Our team is here to help you choose the perfect Pecklech for your occasion. 
              Each method offers unique benefits to suit different preferences and timelines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-brand-teal font-bold text-lg mb-2">Quick & Easy</div>
                <div className="text-gray-600">{adminSettings.orderingMethods.readyToGo.title}</div>
              </div>
              <div className="p-4">
                <div className="text-brand-teal font-bold text-lg mb-2">Best Value</div>
                <div className="text-gray-600">{adminSettings.orderingMethods.budgetChoice.title}</div>
              </div>
              <div className="p-4">
                <div className="text-brand-teal font-bold text-lg mb-2">Most Personal</div>
                <div className="text-gray-600">{adminSettings.orderingMethods.buildPeckel.title}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}