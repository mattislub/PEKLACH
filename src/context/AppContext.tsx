import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, CartItem, Order, Customer, AdminSettings, Occasion, Bag, Label, ReadyToGoPeckel, BudgetChoicePeckel, BuildPeckelSession, PaymentInfo } from '../types';
import { defaultOccasions } from '../data/occasions';
import { defaultBags } from '../data/bags';
import { defaultLabels } from '../data/labels';
import { defaultReadyToGoPeckels } from '../data/readyToGoPeckels';
import { defaultBudgetChoicePeckels } from '../data/budgetChoicePeckels';
import { sendStockAlert, requestNotificationPermission } from '../utils/emailService';
import { 
  fetchProducts, 
  saveProduct, 
  deleteProduct,
  fetchOrders,
  saveOrder,
  updateOrderStatus,
  fetchCustomers,
  saveCustomer,
  updateCustomer,
  fetchBags,
  saveBag,
  deleteBag,
  fetchLabels,
  saveLabel,
  deleteLabel,
  fetchOccasions,
  saveOccasion,
  deleteOccasion,
  fetchBudgetChoicePeckels,
  saveBudgetChoicePeckel,
  fetchReadyToGoPeckels,
  saveReadyToGoPeckel, 
  fetchAdminSettings, 
  saveAdminSettings,
  fetchProductBatches,
  saveProductBatch,
  deleteProductBatch,
  fetchBatchTransactions,
  saveBatchTransaction,
  fetchExpiringProducts
} from '../utils/localDb';

interface AppState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  customers: Customer[];
  currentView: 'customer' | 'admin';
  adminSettings: AdminSettings;
  occasions: Occasion[];
  bags: Bag[];
  labels: Label[];
  readyToGoPeckels: ReadyToGoPeckel[];
  budgetChoicePeckels: BudgetChoicePeckel[];
  buildPeckelSession: BuildPeckelSession | null;
  selectedOccasion: string | null;
  globalQuantity: number; // New field for global quantity persistence
  isLoading: boolean;
  dataInitialized: boolean;
}

type AppAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_PRODUCT_STOCK'; payload: { productId: string; newStock: number } }
  | { type: 'SET_VIEW'; payload: 'customer' | 'admin' }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'IMPORT_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'TOGGLE_PRODUCT_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_CUSTOM_ORDER'; payload: string }
  | { type: 'UPDATE_ADMIN_SETTINGS'; payload: Partial<AdminSettings> }
  | { type: 'ADD_OCCASION'; payload: Occasion }
  | { type: 'UPDATE_OCCASION'; payload: Occasion }
  | { type: 'DELETE_OCCASION'; payload: string }
  | { type: 'REORDER_OCCASIONS'; payload: Occasion[] }
  | { type: 'ADD_BAG'; payload: Bag }
  | { type: 'UPDATE_BAG'; payload: Bag }
  | { type: 'DELETE_BAG'; payload: string }
  | { type: 'IMPORT_BAGS'; payload: Bag[] }
  | { type: 'ADD_LABEL'; payload: Label }
  | { type: 'UPDATE_LABEL'; payload: Label }
  | { type: 'DELETE_LABEL'; payload: string }
  | { type: 'ADD_BUDGET_CHOICE_PECKEL'; payload: BudgetChoicePeckel }
  | { type: 'UPDATE_BUDGET_CHOICE_PECKEL'; payload: BudgetChoicePeckel }
  | { type: 'DELETE_BUDGET_CHOICE_PECKEL'; payload: string }
  | { type: 'SET_SELECTED_OCCASION'; payload: string | null }
  | { type: 'SET_GLOBAL_QUANTITY'; payload: number } // New action for global quantity
  | { type: 'START_BUILD_PECKEL'; payload: { occasion: string; quantity: number } }
  | { type: 'UPDATE_BUILD_PECKEL'; payload: Partial<BuildPeckelSession> }
  | { type: 'CLEAR_BUILD_PECKEL' }
  | { type: 'IMPORT_ORDERS_BATCH'; payload: Order[] }
  | { type: 'IMPORT_CUSTOMERS_BATCH'; payload: Customer[] }
  | { type: 'SET_PAYMENT_INFO'; payload: { orderId: string; paymentInfo: PaymentInfo } }
  | { type: 'UPDATE_ORDER_PAYMENT'; payload: { orderId: string; status: 'pending' | 'paid' | 'failed' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_DATA'; payload: Partial<AppState> }
  | { type: 'SET_DATA_INITIALIZED'; payload: boolean }
  | { type: 'ADD_DELIVERY_METHOD'; payload: DeliveryMethod }
  | { type: 'UPDATE_DELIVERY_METHOD'; payload: DeliveryMethod }
  | { type: 'DELETE_DELIVERY_METHOD'; payload: string }
  | { type: 'UPDATE_PRODUCT_BATCH_SETTINGS'; payload: { productId: string; hasExpiry: boolean; expiryNotificationDays?: number; useFifo?: boolean } };

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Chocolate Wafers',
    description: 'Delicious chocolate wafers perfect for any peckel',
    price: 2.99,
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Chocolates & Wafers',
    stock: 100,
    sku: 'CHW-001',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: true,
    minimumStock: 20,
    visibleOccasions: [], // Empty means visible for all occasions
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: true,
      showInBuildPeckel: true,
      showInItemSelection: true,
      showInPrePackedPeckels: true,
      showInCustomOrders: true
    }
  },
  {
    id: '2',
    name: 'Assorted Gummy Bears',
    description: 'Colorful gummy bears loved by children',
    price: 1.99,
    image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Sweets',
    stock: 150,
    sku: 'GUM-002',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: true,
    minimumStock: 30,
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: true,
      showInBuildPeckel: true,
      showInItemSelection: true,
      showInPrePackedPeckels: false,
      showInCustomOrders: true
    }
  },
  {
    id: '3',
    name: 'Kosher Marshmallows',
    description: 'Soft kosher marshmallows for special occasions',
    price: 3.49,
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Sweets',
    stock: 80,
    sku: 'MAR-003',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: false,
    minimumStock: 15,
    visibilitySettings: {
      showInReadyToGo: false,
      showInBudgetChoice: true,
      showInBuildPeckel: true,
      showInItemSelection: true,
      showInPrePackedPeckels: true,
      showInCustomOrders: false
    }
  },
  {
    id: '4',
    name: 'Premium Nuts Mix',
    description: 'High-quality mixed nuts for adult preferences',
    price: 4.99,
    image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Nuts & Snacks',
    stock: 60,
    sku: 'NUT-004',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: false,
    minimumStock: 10,
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: false,
      showInBuildPeckel: true,
      showInItemSelection: true,
      showInPrePackedPeckels: true,
      showInCustomOrders: true
    }
  },
  {
    id: '5',
    name: 'Bulk Candy Mix (Admin Only)',
    description: 'Bulk candy for creating custom pecklech - not sold individually to customers',
    price: 2.50,
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Bulk Items',
    stock: 100,
    sku: 'BCM-005',
    isVisible: false,
    customerVisible: false,
    allowCustomOrder: false,
    minimumStock: 50,
    visibilitySettings: {
      showInReadyToGo: false,
      showInBudgetChoice: false,
      showInBuildPeckel: false,
      showInItemSelection: false,
      showInPrePackedPeckels: false,
      showInCustomOrders: false
    }
  },
  // Add some Pre-Packed Pecklech products for Ready-to-Go
  {
    id: '6',
    name: 'אפשערן Special Peckel',
    description: 'Pre-packed peckel specially designed for אפשערן celebrations',
    price: 8.99,
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Pre-Packed Pecklech',
    stock: 25,
    sku: 'PPP-006',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: false,
    minimumStock: 5,
    visibleOccasions: ['אפשערן'], // Specific to אפשערן
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: false,
      showInBuildPeckel: false,
      showInItemSelection: false,
      showInPrePackedPeckels: true,
      showInCustomOrders: false
    }
  },
  {
    id: '7',
    name: 'Universal Celebration Peckel',
    description: 'Perfect for any Jewish celebration - beautifully pre-packed',
    price: 12.99,
    image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Pre-Packed Pecklech',
    stock: 40,
    sku: 'PPP-007',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: true,
    minimumStock: 10,
    visibleOccasions: [], // Available for all occasions
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: true,
      showInBuildPeckel: false,
      showInItemSelection: false,
      showInPrePackedPeckels: true,
      showInCustomOrders: true
    }
  },
  {
    id: '8',
    name: 'Premium Lifecycle Peckel',
    description: 'Elegant pre-packed peckel for special lifecycle events',
    price: 15.99,
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Pre-Packed Pecklech',
    stock: 20,
    sku: 'PPP-008',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: true,
    minimumStock: 5,
    visibleOccasions: ['אפשערן', 'אויפריף', 'הכנסת', 'חתן כל הנערים'], // Multiple lifecycle events
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: true,
      showInBuildPeckel: false,
      showInItemSelection: false,
      showInPrePackedPeckels: true,
      showInCustomOrders: true
    }
  },
  {
    id: '9',
    name: 'Deluxe Mixed Treats Peckel',
    description: 'Our finest selection of treats in a beautiful package',
    price: 18.99,
    image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'Pre-Packed Pecklech',
    stock: 15,
    sku: 'PPP-009',
    isVisible: true,
    customerVisible: true,
    allowCustomOrder: false,
    minimumStock: 3,
    visibleOccasions: [], // Available for all occasions
    visibilitySettings: {
      showInReadyToGo: true,
      showInBudgetChoice: false,
      showInBuildPeckel: false,
      showInItemSelection: false,
      showInPrePackedPeckels: true,
      showInCustomOrders: false
    }
  }
];

const initialState: AppState = {
  products: initialProducts,
  cart: [],
  orders: [],
  customers: [],
  currentView: 'customer',
  adminSettings: {
    alertEmail: '',
    emailNotifications: true,
    orderingMethods: {
      readyToGo: {
        title: 'Ready to Go Pecklech',
        description: 'Pre-packed Pecklech ready for immediate purchase. Choose from our selection of beautifully prepared packages.',
        features: [
          'Immediately available',
          'Pre-selected quality items',
          'Professional packaging',
          'Quick checkout process'
        ]
      },
      budgetChoice: {
        title: 'Your Budget, Our Choice',
        description: 'Tell us your budget and preferred style, and we\'ll create the perfect Pecklech for you.',
        features: [
          'Budget-friendly options',
          'Expert item selection',
          'Various price ranges',
          'Surprise element'
        ]
      },
      buildPeckel: {
        title: 'Build a Peckel',
        description: 'Create your own custom Pecklech step by step. Choose your bag, items, and personalization options.',
        features: [
          'Complete customization',
          'Choose every item',
          'Select bag and label',
          'Personal touch'
        ]
      }
    },
    // SumUp integration settings
    sumupEnabled: true,
    sumupMerchantCode: 'demo_merchant_code',
    sumupApiKey: 'demo_api_key',
    deliveryMethods: [
      {
        id: 'pickup',
        name: 'Store Pickup',
        description: 'Pick up your order from our store',
        basePrice: 0,
        isActive: true,
        isDistanceBased: false,
        isValueBased: false,
        estimatedDeliveryDays: 'Same day',
        icon: 'store'
      },
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Delivery within 3-5 business days',
        basePrice: 4.99,
        isActive: true,
        isDistanceBased: true,
        distancePricing: {
          '5': 4.99,
          '10': 6.99,
          '15': 8.99,
          '20': 10.99
        },
        isValueBased: false,
        freeShippingThreshold: 50,
        estimatedDeliveryDays: '3-5 days',
        icon: 'truck'
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Next day delivery',
        basePrice: 9.99,
        isActive: true,
        isDistanceBased: true,
        distancePricing: {
          '5': 9.99,
          '10': 12.99,
          '15': 14.99,
          '20': 19.99
        },
        isValueBased: false,
        freeShippingThreshold: 100,
        estimatedDeliveryDays: 'Next day',
        icon: 'zap'
      }
    ],
    storeAddress: {
      street: '123 Main Street',
      city: 'London',
      state: 'Greater London',
      zipCode: 'NW1 6XE',
      latitude: 51.5074,
      longitude: -0.1278
    },
    autoGenerateInvoices: true
  },
  occasions: defaultOccasions,
  bags: defaultBags,
  labels: defaultLabels,
  readyToGoPeckels: defaultReadyToGoPeckels,
  budgetChoicePeckels: defaultBudgetChoicePeckels,
  buildPeckelSession: null,
  selectedOccasion: null,
  globalQuantity: 1, // Initialize global quantity
  isLoading: false,
  dataInitialized: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'INITIALIZE_DATA':
      return {
        ...state,
        ...action.payload,
        dataInitialized: true
      };
      
    case 'SET_DATA_INITIALIZED':
      return {
        ...state,
        dataInitialized: action.payload
      };
      
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.product.id === action.payload.product.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload.product, quantity: action.payload.quantity }]
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload)
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'ADD_ORDER':
      const updatedProducts = state.products.map(product => {
        const orderItem = action.payload.items.find(item => item.product.id === product.id);
        if (orderItem && !product.allowCustomOrder) {
          const newStock = product.stock - orderItem.quantity;
          
          // Check for stock alert
          if (newStock <= (product.minimumStock || 0) && state.adminSettings.emailNotifications && state.adminSettings.alertEmail) {
            sendStockAlert({
              to: state.adminSettings.alertEmail,
              subject: `Stock Alert: ${product.name}`,
              body: `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${newStock}, Minimum stock: ${product.minimumStock || 0}`,
              productName: product.name,
              currentStock: newStock,
              minimumStock: product.minimumStock || 0
            });
          }
          
          // Update product stock in database
          saveProduct({ ...product, stock: newStock });
          
          return { ...product, stock: newStock };
        }
        return product;
      });

      // Also check bag stock if order contains bags
      const updatedBags = state.bags.map(bag => {
        // Check if this bag was used in the order (for budget choice or build peckel orders)
        if (action.payload.selectedBag && action.payload.selectedBag.id === bag.id) {
          const orderQuantity = action.payload.peckelQuantity || 1; // Use peckel quantity for bag consumption
          const newStock = bag.stock - orderQuantity;
          
          // Check for bag stock alert
          if (newStock <= (bag.minimumStock || 0) && state.adminSettings.emailNotifications && state.adminSettings.alertEmail) {
            sendStockAlert({
              to: state.adminSettings.alertEmail,
              subject: `Bag Stock Alert: ${bag.name}`,
              body: `${bag.name} (${bag.color} ${bag.size}) is running low. Current stock: ${newStock}, Minimum stock: ${bag.minimumStock || 0}`,
              productName: bag.name,
              currentStock: newStock,
              minimumStock: bag.minimumStock || 0
            });
          }
          
          // Update bag stock in database
          saveBag({ ...bag, stock: newStock });
          
          return { ...bag, stock: newStock };
        }
        return bag;
      });
      
      // Save order to database
      saveOrder(action.payload);
      
      // Save customer to database
      saveCustomer(action.payload.customer);
      
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        products: updatedProducts,
        bags: updatedBags
      };
    
    case 'UPDATE_ORDER_STATUS':
      // Update order status in database
      updateOrderStatus(action.payload.orderId, action.payload.status);
      
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    
    case 'UPDATE_PRODUCT_STOCK':
      const updatedProductsStock = state.products.map(product => {
        if (product.id === action.payload.productId) {
          const newStock = action.payload.newStock;
          
          // Check for stock alert
          if (newStock <= (product.minimumStock || 0) && state.adminSettings.emailNotifications && state.adminSettings.alertEmail) {
            sendStockAlert({
              to: state.adminSettings.alertEmail,
              subject: `Stock Alert: ${product.name}`,
              body: `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${newStock}, Minimum stock: ${product.minimumStock || 0}`,
              productName: product.name,
              currentStock: newStock,
              minimumStock: product.minimumStock || 0
            });
          }
          
          // Update product stock in database
          saveProduct({ ...product, stock: newStock });
          
          return { ...product, stock: newStock };
        }
        return product;
      });
      
      return {
        ...state,
        products: updatedProductsStock
      };
    
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'ADD_CUSTOMER':
      // Save customer to database
      saveCustomer(action.payload);
      
      return {
        ...state,
        customers: [action.payload, ...state.customers]
      };

    case 'UPDATE_CUSTOMER':
      // Update customer in database
      updateCustomer(action.payload);
      
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };

    case 'IMPORT_PRODUCTS':
      // Save all products to database
      action.payload.forEach(product => {
        saveProduct(product);
      });
      
      return {
        ...state,
        products: action.payload
      };

    case 'ADD_PRODUCT':
      // Save product to database
      saveProduct(action.payload);
      
      return {
        ...state,
        products: [action.payload, ...state.products]
      };

    case 'UPDATE_PRODUCT':
      // Update product in database
      saveProduct(action.payload);
      
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
      
    case 'UPDATE_PRODUCT_BATCH_SETTINGS':
      const productToUpdate = state.products.find(p => p.id === action.payload.productId);
      if (productToUpdate) {
        const updatedProduct = { 
          ...productToUpdate, 
          hasExpiry: action.payload.hasExpiry,
          expiryNotificationDays: action.payload.expiryNotificationDays || 30,
          useFifo: action.payload.useFifo !== false
        };
        
        // Update product in database
        saveProduct(updatedProduct);
        
        return {
          ...state,
          products: state.products.map(product =>
            product.id === action.payload.productId ? updatedProduct : product
          )
        };
      }
      return {
        ...state,
        products: state.products
      };
      
    case 'ADD_DELIVERY_METHOD':
      return {
        ...state,
        adminSettings: {
          ...state.adminSettings,
          deliveryMethods: [...state.adminSettings.deliveryMethods, action.payload]
        }
      };
      
    case 'UPDATE_DELIVERY_METHOD':
      return {
        ...state,
        adminSettings: {
          ...state.adminSettings,
          deliveryMethods: state.adminSettings.deliveryMethods.map(method => 
            method.id === action.payload.id ? action.payload : method
          )
        }
      };
      
    case 'DELETE_DELIVERY_METHOD':
      return {
        ...state,
        adminSettings: {
          ...state.adminSettings,
          deliveryMethods: state.adminSettings.deliveryMethods.filter(method => 
            method.id !== action.payload
          )
        }
      };

    case 'DELETE_PRODUCT':
      // Delete product from database
      deleteProduct(action.payload);
      
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };

    case 'TOGGLE_PRODUCT_VISIBILITY':
      const productToToggle = state.products.find(p => p.id === action.payload);
      if (productToToggle) {
        const updatedProduct = { ...productToToggle, isVisible: !productToToggle.isVisible };
        
        // Update product in database
        saveProduct(updatedProduct);
        
        return {
          ...state,
          products: state.products.map(product =>
            product.id === action.payload
              ? updatedProduct
              : product
          )
        };
      }
      return state;

    case 'TOGGLE_CUSTOM_ORDER':
      const productToToggleCustomOrder = state.products.find(p => p.id === action.payload);
      if (productToToggleCustomOrder) {
        const updatedProduct = { 
          ...productToToggleCustomOrder, 
          allowCustomOrder: !productToToggleCustomOrder.allowCustomOrder 
        };
        
        // Update product in database
        saveProduct(updatedProduct);
        
        return {
          ...state,
          products: state.products.map(product =>
            product.id === action.payload
              ? updatedProduct
              : product
          )
        };
      }
      return state;

    case 'UPDATE_ADMIN_SETTINGS':
      const updatedSettings = { ...state.adminSettings, ...action.payload };
      
      // Save admin settings to database
      saveAdminSettings(updatedSettings);
      
      return {
        ...state,
        adminSettings: updatedSettings
      };

    case 'ADD_OCCASION':
      const newOccasion = {
        ...action.payload,
        displayOrder: Math.max(...state.occasions.map(o => o.displayOrder), 0) + 1
      };
      
      // Save occasion to database
      saveOccasion(newOccasion);
      
      return {
        ...state,
        occasions: [...state.occasions, newOccasion]
      };

    case 'UPDATE_OCCASION':
      // Update occasion in database
      saveOccasion(action.payload);
      
      return {
        ...state,
        occasions: state.occasions.map(occasion =>
          occasion.id === action.payload.id ? action.payload : occasion
        )
      };

    case 'DELETE_OCCASION':
      // Delete occasion from database
      deleteOccasion(action.payload);
      
      return {
        ...state,
        occasions: state.occasions.filter(occasion => occasion.id !== action.payload)
      };

    case 'REORDER_OCCASIONS':
      const reorderedOccasions = action.payload.map((occasion, index) => ({
        ...occasion,
        displayOrder: index + 1
      }));
      
      // Update all occasions in database
      reorderedOccasions.forEach(occasion => {
        saveOccasion(occasion);
      });
      
      return {
        ...state,
        occasions: reorderedOccasions
      };

    case 'ADD_BAG':
      // Save bag to database
      saveBag(action.payload);
      
      return {
        ...state,
        bags: [action.payload, ...state.bags]
      };

    case 'UPDATE_BAG':
      // Update bag in database
      saveBag(action.payload);
      
      return {
        ...state,
        bags: state.bags.map(bag =>
          bag.id === action.payload.id ? action.payload : bag
        )
      };

    case 'DELETE_BAG':
      // Delete bag from database
      deleteBag(action.payload);
      
      return {
        ...state,
        bags: state.bags.filter(bag => bag.id !== action.payload)
      };

    case 'IMPORT_BAGS':
      // Save all bags to database
      action.payload.forEach(bag => {
        saveBag(bag);
      });
      
      return {
        ...state,
        bags: action.payload
      };

    case 'ADD_LABEL':
      // Save label to database
      saveLabel(action.payload);
      
      return {
        ...state,
        labels: [action.payload, ...state.labels]
      };

    case 'UPDATE_LABEL':
      // Update label in database
      saveLabel(action.payload);
      
      return {
        ...state,
        labels: state.labels.map(label =>
          label.id === action.payload.id ? action.payload : label
        )
      };

    case 'DELETE_LABEL':
      // Delete label from database
      deleteLabel(action.payload);
      
      return {
        ...state,
        labels: state.labels.filter(label => label.id !== action.payload)
      };

    case 'ADD_BUDGET_CHOICE_PECKEL':
      // Save budget choice peckel to database
      saveBudgetChoicePeckel(action.payload);
      
      return {
        ...state,
        budgetChoicePeckels: [action.payload, ...state.budgetChoicePeckels]
      };

    case 'UPDATE_BUDGET_CHOICE_PECKEL':
      // Update budget choice peckel in database
      saveBudgetChoicePeckel(action.payload);
      
      return {
        ...state,
        budgetChoicePeckels: state.budgetChoicePeckels.map(peckel =>
          peckel.id === action.payload.id ? action.payload : peckel
        )
      };

    case 'DELETE_BUDGET_CHOICE_PECKEL':
      return {
        ...state,
        budgetChoicePeckels: state.budgetChoicePeckels.filter(peckel => peckel.id !== action.payload)
      };

    case 'SET_SELECTED_OCCASION':
      return {
        ...state,
        selectedOccasion: action.payload,
        // Reset global quantity when changing occasion
        globalQuantity: 1
      };

    case 'SET_GLOBAL_QUANTITY':
      return {
        ...state,
        globalQuantity: action.payload,
        // Also update build peckel session if it exists
        buildPeckelSession: state.buildPeckelSession ? {
          ...state.buildPeckelSession,
          quantity: action.payload
        } : null
      };

    case 'START_BUILD_PECKEL':
      return {
        ...state,
        buildPeckelSession: {
          occasion: action.payload.occasion,
          selectedItems: [],
          total: 0,
          quantity: action.payload.quantity
        },
        globalQuantity: action.payload.quantity
      };

    case 'UPDATE_BUILD_PECKEL':
      if (!state.buildPeckelSession) return state;
      
      const updatedSession = { ...state.buildPeckelSession, ...action.payload };
      
      // Recalculate total based on quantity
      let unitTotal = 0;
      if (updatedSession.selectedBag) unitTotal += updatedSession.selectedBag.price;
      if (updatedSession.selectedLabel) unitTotal += updatedSession.selectedLabel.price;
      unitTotal += updatedSession.selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const total = unitTotal * updatedSession.quantity;
      
      return {
        ...state,
        buildPeckelSession: { ...updatedSession, total },
        // Sync global quantity with build peckel quantity
        globalQuantity: updatedSession.quantity
      };

    case 'CLEAR_BUILD_PECKEL':
      return {
        ...state,
        buildPeckelSession: null
      };

    case 'IMPORT_ORDERS_BATCH':
      // Merge imported orders with existing ones, avoiding duplicates
      const existingOrderIds = new Set(state.orders.map(order => order.id));
      const newOrders = action.payload.filter(order => !existingOrderIds.has(order.id));
      
      // Save all new orders to database
      newOrders.forEach(order => {
        saveOrder(order);
      });
      
      return {
        ...state,
        orders: [...newOrders, ...state.orders]
      };

    case 'IMPORT_CUSTOMERS_BATCH':
      // Merge imported customers with existing ones, avoiding duplicates
      const existingCustomerIds = new Set(state.customers.map(customer => customer.id));
      const newCustomers = action.payload.filter(customer => !existingCustomerIds.has(customer.id));
      
      // Save all new customers to database
      newCustomers.forEach(customer => {
        saveCustomer(customer);
      });
      
      return {
        ...state,
        customers: [...newCustomers, ...state.customers]
      };
      
    case 'SET_PAYMENT_INFO':
      // Update order with payment info in database
      const orderToUpdate = state.orders.find(order => order.id === action.payload.orderId);
      if (orderToUpdate) {
        const updatedOrder = { 
          ...orderToUpdate, 
          paymentId: action.payload.paymentInfo.paymentId,
          paymentLink: action.payload.paymentInfo.paymentLink,
          paymentStatus: action.payload.paymentInfo.paymentStatus,
          invoiceUrl: action.payload.paymentInfo.invoiceUrl
        };
        
        saveOrder(updatedOrder);
      }
      
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.orderId
            ? { 
                ...order, 
                paymentId: action.payload.paymentInfo.paymentId,
                paymentLink: action.payload.paymentInfo.paymentLink,
                paymentStatus: action.payload.paymentInfo.paymentStatus,
                invoiceUrl: action.payload.paymentInfo.invoiceUrl
              }
            : order
        )
      };
      
    case 'UPDATE_ORDER_PAYMENT':
      // Update order payment status in database
      const orderToUpdatePayment = state.orders.find(order => order.id === action.payload.orderId);
      if (orderToUpdatePayment) {
        const updatedOrder = { 
          ...orderToUpdatePayment, 
          paymentStatus: action.payload.status
        };
        
        saveOrder(updatedOrder);
      }
      
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.orderId
            ? { ...order, paymentStatus: action.payload.status }
            : order
        )
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Load data from local storage on initial render
  useEffect(() => {
    const loadData = async () => {
      if (state.dataInitialized) return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Fetch all data in parallel
        const [
          productsData,
          ordersData,
          customersData,
          occasionsData,
          bagsData,
          labelsData,
          budgetChoicePeckelsData,
          readyToGoPeckelsData,
          adminSettingsData
        ] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchCustomers(),
          fetchOccasions(),
          fetchBags(),
          fetchLabels(),
          fetchBudgetChoicePeckels(),
          fetchReadyToGoPeckels(),
          fetchAdminSettings()
        ]);
        
        // Initialize state with data from database
        dispatch({ 
          type: 'INITIALIZE_DATA', 
          payload: {
            products: productsData.length > 0 ? productsData : initialState.products,
            orders: ordersData,
            customers: customersData,
            occasions: occasionsData.length > 0 ? occasionsData : initialState.occasions,
            bags: bagsData.length > 0 ? bagsData : initialState.bags,
            labels: labelsData.length > 0 ? labelsData : initialState.labels,
            budgetChoicePeckels: budgetChoicePeckelsData.length > 0 ? budgetChoicePeckelsData : initialState.budgetChoicePeckels,
            readyToGoPeckels: readyToGoPeckelsData.length > 0 ? readyToGoPeckelsData : initialState.readyToGoPeckels,
            adminSettings: adminSettingsData ? { ...initialState.adminSettings, ...adminSettingsData } : initialState.adminSettings
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        
        // If there's an error, use initial state data
        dispatch({ 
          type: 'SET_DATA_INITIALIZED', 
          payload: true 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, [state.dataInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}