import { ReadyToGoPeckel } from '../types';

export const defaultReadyToGoPeckels: ReadyToGoPeckel[] = [
  {
    id: 'rtg-1',
    name: 'Bar Mitzvah Special',
    description: 'Pre-packed peckel perfect for Bar Mitzvah celebrations',
    price: 12.99,
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    items: [], // Would reference actual products
    bag: {
      id: 'bag-3',
      name: 'Medium Gift Bag - Gold',
      description: 'Great for medium occasions',
      price: 2.50,
      image: '',
      color: 'Gold',
      size: 'Medium',
      stock: 80,
      isVisible: true
    },
    stock: 25,
    isVisible: true,
    occasions: ['בר מצוה', 'חתן כל הנערים']
  },
  {
    id: 'rtg-2',
    name: 'Wedding Celebration Pack',
    description: 'Elegant pre-packed peckel for wedding celebrations',
    price: 18.99,
    image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
    items: [],
    bag: {
      id: 'bag-5',
      name: 'Large Gift Bag - Royal Blue',
      description: 'Perfect for large celebrations',
      price: 4.00,
      image: '',
      color: 'Royal Blue',
      size: 'Large',
      stock: 50,
      isVisible: true
    },
    stock: 15,
    isVisible: true,
    occasions: ['חתונה']
  },
  {
    id: 'rtg-3',
    name: 'Shabbat Delight',
    description: 'Perfect peckel for Shabbat celebrations',
    price: 8.99,
    image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500',
    items: [],
    bag: {
      id: 'bag-1',
      name: 'Small Gift Bag - Blue',
      description: 'Perfect for small occasions',
      price: 1.50,
      image: '',
      color: 'Blue',
      size: 'Small',
      stock: 100,
      isVisible: true
    },
    stock: 40,
    isVisible: true,
    occasions: ['שבת שלום']
  }
];