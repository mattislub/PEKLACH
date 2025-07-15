import { BudgetChoicePeckel } from '../types';

export const defaultBudgetChoicePeckels: BudgetChoicePeckel[] = [
  {
    id: 'bc-1',
    name: 'Budget Friendly - £5',
    description: 'Great value peckel with 6-8 quality items in a small bag',
    price: 5.00,
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    sampleItems: [],
    bag: {
      id: 'bag-1',
      name: 'Small Gift Bag',
      description: 'Small colorful bag',
      price: 1.50,
      image: '',
      color: 'Various',
      size: 'Small',
      stock: 100,
      isVisible: true
    },
    color: 'Blue',
    isVisible: true,
    occasions: [],
    features: [
      'Expert-selected items',
      'Made to order',
      'Best value guarantee',
      'Quality assurance'
    ]
  },
  {
    id: 'bc-2',
    name: 'Standard Choice - £10',
    description: 'Popular choice with 10-12 items in a medium bag',
    price: 10.00,
    image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
    sampleItems: [],
    bag: {
      id: 'bag-3',
      name: 'Medium Gift Bag',
      description: 'Medium sized bag',
      price: 2.50,
      image: '',
      color: 'Various',
      size: 'Medium',
      stock: 80,
      isVisible: true
    },
    color: 'Gold',
    isVisible: true,
    occasions: [],
    features: [
      'Popular selection',
      'Medium variety',
      'Professional packaging',
      'Great for most occasions'
    ]
  },
  {
    id: 'bc-3',
    name: 'Premium Selection - £15',
    description: 'Premium peckel with 15-18 high-quality items in a large bag',
    price: 15.00,
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500',
    sampleItems: [],
    bag: {
      id: 'bag-5',
      name: 'Large Gift Bag',
      description: 'Large premium bag',
      price: 4.00,
      image: '',
      color: 'Various',
      size: 'Large',
      stock: 50,
      isVisible: true
    },
    color: 'Royal Blue',
    isVisible: true,
    occasions: [],
    features: [
      'Premium quality items',
      'Large variety',
      'Elegant presentation',
      'Perfect for special occasions'
    ]
  },
  {
    id: 'bc-4',
    name: 'Deluxe Package - £25',
    description: 'Our finest peckel with 20+ premium items in a deluxe bag',
    price: 25.00,
    image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500',
    sampleItems: [],
    bag: {
      id: 'bag-6',
      name: 'Large Gift Bag - Deluxe',
      description: 'Deluxe large bag',
      price: 4.00,
      image: '',
      color: 'Various',
      size: 'Large',
      stock: 50,
      isVisible: true
    },
    color: 'Burgundy',
    isVisible: true,
    occasions: [],
    features: [
      'Luxury items selection',
      'Maximum variety',
      'Premium packaging',
      'Ultimate value'
    ]
  }
];