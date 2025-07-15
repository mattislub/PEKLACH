export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For promotions
  isOnPromotion?: boolean;
  image: string;
  category: string;
  stock: number;
  sku: string;
  isVisible: boolean;
  allow_custom_order?: boolean;
  minimumStock?: number;
  // New fields for customer visibility and occasion filtering
  customerVisible?: boolean;
  visibleOccasions?: string[]; // If empty, shows for all occasions
  // New visibility system for different sections
  visibilitySettings?: {
    showInReadyToGo?: boolean;
    showInBudgetChoice?: boolean;
    showInBuildPeckel?: boolean;
    showInItemSelection?: boolean;
    showInPrePackedPeckels?: boolean;
    showInCustomOrders?: boolean;
  };
  // New fields for cost and pricing calculations
  caseSize?: number; // Number of items in a case
  wholesaleCost?: number; // Cost per case excluding VAT
  promotionWholesaleCost?: number; // Promotion cost per case excluding VAT
  vatRate?: number; // VAT rate (e.g., 20 for 20%)
  isVatable?: boolean; // Whether the product is subject to VAT
  profitMargin?: number; // Profit margin percentage
  costPerUnit?: number; // Cost per unit excluding VAT
  costPerUnitIncVat?: number; // Cost per unit including VAT
  saleExVat?: number; // Sale price excluding VAT
  profitPerUnit?: number; // Profit per unit (saleExVat - costPerUnit)
  // Batch management fields
  hasExpiry?: boolean; // Whether the product has an expiry date
  expiryNotificationDays?: number; // Days before expiry to notify
  useFifo?: boolean; // Whether to use First In First Out for inventory
  // Batch management fields
  hasExpiry?: boolean; // Whether the product has an expiry date
  expiryNotificationDays?: number; // Days before expiry to notify
  useFifo?: boolean; // Whether to use First In First Out for inventory
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  // Distance-based pricing
  isDistanceBased: boolean;
  distancePricing?: {
    [key: string]: number; // key is distance in miles, value is price
  };
  // Order value-based pricing
  isValueBased: boolean;
  valuePricing?: {
    [key: string]: number; // key is minimum order value, value is price
  };
  // Free shipping threshold
  freeShippingThreshold?: number;
  estimatedDeliveryDays?: string;
  icon?: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  receivedDate: string; // ISO date string
  expiryDate?: string; // ISO date string, optional
  hasExpiry: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchTransaction {
  id: string;
  batchId: string;
  orderId?: string;
  quantity: number;
  transactionType: 'sale' | 'adjustment' | 'return' | 'waste';
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone2?: string; // Second phone number (optional)
  phone3?: string; // Third phone number (optional)
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface PaymentInfo {
  paymentId: string;
  paymentLink: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  invoiceUrl?: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  orderType: 'online' | 'phone' | 'in-person';
  notes?: string;
  occasion?: string;
  deliveryMethod?: DeliveryMethod;
  deliveryPrice?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    distance?: number; // Distance in miles from store
  };
  hebrewDate?: string;
  parsha?: string;
  dayOfWeek?: string;
  hebrewDayOfWeek?: string;
  // New fields for custom orders
  orderingMethod?: 'ready-to-go' | 'budget-choice' | 'build-peckel';
  selectedBag?: Bag;
  selectedLabel?: Label;
  customLabelDesign?: string;
  personalText?: string; // New field for personal text on pre-designed labels
  simchaDate?: string; // New field for Hebrew Simcha date
  deliveryDate?: string;
  // New field for Build-a-Peckel quantity
  peckelQuantity?: number;
  // Payment information
  paymentLink?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  invoiceUrl?: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
}

export interface OrderingMethodSettings {
  readyToGo: {
    title: string;
    description: string;
    features: string[];
  };
  budgetChoice: {
    title: string;
    description: string;
    features: string[];
  };
  buildPeckel: {
    title: string;
    description: string;
    features: string[];
  };
}

export interface AdminSettings {
  alertEmail: string;
  emailNotifications: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactPhone2?: string;
  messageDestinationEmail?: string;
  orderingMethods: OrderingMethodSettings;
  // SumUp integration settings
  sumupEnabled: boolean;
  sumupMerchantCode: string;
  sumupApiKey: string;
  deliveryMethods: DeliveryMethod[];
  storeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  autoGenerateInvoices: boolean;
}

export interface HebrewCalendarSchedule {
  useHebrewCalendar: boolean;
  hebrewStartMonth?: string; // Hebrew month name
  hebrewEndMonth?: string;
  hebrewStartDay?: number;
  hebrewEndDay?: number;
  specificParshiot?: string[]; // Array of parsha names
  hebrewYear?: number; // Optional specific year
  recurring?: boolean; // If true, applies every year
}

export interface Occasion {
  id: string;
  name: string;
  category: string;
  // Enhanced management fields
  isVisibleOnStorefront: boolean;
  displayOrder: number;
  scheduledVisibility?: {
    startDate?: string;
    endDate?: string;
    isScheduled: boolean;
    // New Hebrew calendar scheduling
    hebrewSchedule?: HebrewCalendarSchedule;
  };
  description?: string;
  color?: string;
  image?: string; // New field for occasion image
  // Manual override for immediate visibility control
  manualOverride?: {
    isActive: boolean;
    forceVisible?: boolean;
    forceHidden?: boolean;
    overrideUntil?: string;
  };
}

export interface HebrewDate {
  hebrewDate: string;
  parsha: string;
  gregorianDate: string;
  dayOfWeek: string;
  hebrewDayOfWeek: string;
}

// New interfaces for the redesigned storefront
export interface Bag {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  color: string;
  size: string;
  stock: number;
  isVisible: boolean;
  minimumStock?: number; // New field for stock alerts
}

export interface Label {
  id: string;
  name: string;
  description: string;
  price: number;
  designImage: string;
  isPreDesigned: boolean;
  isVisible: boolean;
  // New field for occasion visibility
  visibleOccasions?: string[]; // If empty, shows for all occasions
  // New fields for Simcha Date functionality
  showSimchaDateField?: boolean; // Toggle to show/hide the Simcha Date field
  simchaDateOccasions?: string[]; // Occasions where the date field should appear
  simchaDateExampleText?: string; // Example text to show in the Simcha date field
}

export interface ReadyToGoPeckel {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  items: Product[];
  bag: Bag;
  stock: number;
  isVisible: boolean;
  occasions: string[];
  features: string[]; // New field for customizable features
  allowBagSelection?: boolean; // New field for bag selection control
}

export interface BudgetChoicePeckel {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sampleItems: Product[];
  bag: Bag;
  color: string;
  isVisible: boolean;
  occasions: string[];
  features: string[]; // New field for customizable features
  allowBagSelection?: boolean; // New field for bag selection control
}

export interface BuildPeckelSession {
  occasion: string;
  selectedBag?: Bag;
  selectedItems: CartItem[];
  selectedLabel?: Label;
  customLabelDesign?: string;
  personalText?: string; // New field for personal text on pre-designed labels
  simchaDate?: string; // New field for Hebrew Simcha date
  deliveryDate?: string;
  total: number;
  quantity: number;
}

// User authentication interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'staff';
  phone?: string;
  phone2?: string; // Second phone number (optional)
  phone3?: string; // Third phone number (optional)
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}