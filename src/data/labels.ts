import { Label } from '../types';

export const defaultLabels: Label[] = [
  {
    id: 'label-1',
    name: 'Bar Mitzvah Design',
    description: 'Traditional Bar Mitzvah label design',
    price: 0.50,
    designImage: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: ['בר מצוה', 'חתן כל הנערים'], // Specific to Bar Mitzvah occasions
    showSimchaDateField: true,
    simchaDateOccasions: ['בר מצוה', 'חתן כל הנערים'] // Show date field for these occasions
  },
  {
    id: 'label-2',
    name: 'Bat Mitzvah Design',
    description: 'Beautiful Bat Mitzvah label design',
    price: 0.50,
    designImage: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: ['בת מצוה'], // Specific to Bat Mitzvah
    showSimchaDateField: true,
    simchaDateOccasions: ['בת מצוה'] // Show date field for Bat Mitzvah
  },
  {
    id: 'label-3',
    name: 'Wedding Design',
    description: 'Elegant wedding celebration label',
    price: 0.75,
    designImage: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: ['חתונה'], // Specific to weddings
    showSimchaDateField: true,
    simchaDateOccasions: ['חתונה'] // Show date field for weddings
  },
  {
    id: 'label-4',
    name: 'Shabbat Design',
    description: 'Traditional Shabbat label design',
    price: 0.50,
    designImage: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: ['שבת שלום'], // Specific to Shabbat
    showSimchaDateField: false, // No date field for Shabbat (weekly occurrence)
    simchaDateOccasions: []
  },
  {
    id: 'label-5',
    name: 'Holiday Design',
    description: 'General Jewish holiday label design',
    price: 0.50,
    designImage: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: ['יום טוב', 'ראש השנה', 'יום כפור', 'סוכות', 'חנוכה', 'פורים', 'פסח', 'שבועות'], // Multiple holidays
    showSimchaDateField: true,
    simchaDateOccasions: ['ראש השנה', 'יום כפור', 'סוכות', 'חנוכה', 'פורים', 'פסח', 'שבועות'] // Show for specific holidays
  },
  {
    id: 'label-6',
    name: 'Universal Design',
    description: 'Versatile label design suitable for any occasion',
    price: 0.50,
    designImage: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500',
    isPreDesigned: true,
    isVisible: true,
    visibleOccasions: [], // Empty means available for all occasions
    showSimchaDateField: true,
    simchaDateOccasions: [] // Show for all occasions when this label is selected
  },
  {
    id: 'label-custom',
    name: 'Custom Design Upload',
    description: 'Upload your own custom label design',
    price: 1.00,
    designImage: '',
    isPreDesigned: false,
    isVisible: true,
    visibleOccasions: [], // Available for all occasions
    showSimchaDateField: true,
    simchaDateOccasions: [] // Show for all occasions when this label is selected
  }
];