import { Occasion } from '../types';

// Yiddish occasions for Jewish celebrations with enhanced management features
export const defaultOccasions: Occasion[] = [
  { 
    id: '1', 
    name: 'אפשערן', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 1,
    scheduledVisibility: { isScheduled: false },
    description: 'Traditional upsherin celebration',
    color: '#0d9488',
    image: '' // No default image
  },
  { 
    id: '2', 
    name: 'אויפריף', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 2,
    scheduledVisibility: { isScheduled: false },
    description: 'Torah honor celebration',
    color: '#84cc16',
    image: '' // No default image
  },
  { 
    id: '3', 
    name: 'הכנסת', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 3,
    scheduledVisibility: { isScheduled: false },
    description: 'Welcoming ceremony',
    color: '#8b5cf6',
    image: '' // No default image
  },
  { 
    id: '4', 
    name: 'חתן כל הנערים', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 4,
    scheduledVisibility: { isScheduled: false },
    description: 'Special honor for young men',
    color: '#f59e0b',
    image: '' // No default image
  },
  { 
    id: '5', 
    name: 'קוסטאם פעקלעך', 
    category: 'custom',
    isVisibleOnStorefront: true,
    displayOrder: 5,
    scheduledVisibility: { isScheduled: false },
    description: 'Custom occasion packages',
    color: '#ef4444',
    image: '' // No default image
  },
  { 
    id: '6', 
    name: 'חומש סעודה', 
    category: 'religious',
    isVisibleOnStorefront: true,
    displayOrder: 6,
    scheduledVisibility: { isScheduled: false },
    description: 'Torah study celebration',
    color: '#06b6d4',
    image: '' // No default image
  },
  { 
    id: '7', 
    name: 'קר״ש', 
    category: 'religious',
    isVisibleOnStorefront: true,
    displayOrder: 7,
    scheduledVisibility: { isScheduled: false },
    description: 'Shema learning milestone',
    color: '#10b981',
    image: '' // No default image
  },
  { 
    id: '8', 
    name: 'בר מצוה', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 8,
    scheduledVisibility: { isScheduled: false },
    description: 'Bar Mitzvah celebration',
    color: '#3b82f6',
    image: '' // No default image
  },
  { 
    id: '9', 
    name: 'בת מצוה', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 9,
    scheduledVisibility: { isScheduled: false },
    description: 'Bat Mitzvah celebration',
    color: '#ec4899',
    image: '' // No default image
  },
  { 
    id: '10', 
    name: 'חתונה', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 10,
    scheduledVisibility: { isScheduled: false },
    description: 'Wedding celebration',
    color: '#f97316',
    image: '' // No default image
  },
  { 
    id: '11', 
    name: 'ברית מילה', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 11,
    scheduledVisibility: { isScheduled: false },
    description: 'Brit Milah ceremony',
    color: '#6366f1',
    image: '' // No default image
  },
  { 
    id: '12', 
    name: 'פדיון הבן', 
    category: 'lifecycle',
    isVisibleOnStorefront: true,
    displayOrder: 12,
    scheduledVisibility: { isScheduled: false },
    description: 'Pidyon HaBen ceremony',
    color: '#8b5cf6',
    image: '' // No default image
  },
  { 
    id: '13', 
    name: 'שבת שלום', 
    category: 'weekly',
    isVisibleOnStorefront: true,
    displayOrder: 13,
    scheduledVisibility: { isScheduled: false },
    description: 'Shabbat celebration',
    color: '#0d9488',
    image: '' // No default image
  },
  { 
    id: '14', 
    name: 'יום טוב', 
    category: 'holiday',
    isVisibleOnStorefront: true,
    displayOrder: 14,
    scheduledVisibility: { isScheduled: false },
    description: 'General Jewish holiday',
    color: '#84cc16',
    image: '' // No default image
  },
  { 
    id: '15', 
    name: 'ראש השנה', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 15,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-09-01',
      endDate: '2025-09-30'
    },
    description: 'Jewish New Year',
    color: '#f59e0b',
    image: '' // No default image
  },
  { 
    id: '16', 
    name: 'יום כפור', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 16,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-09-01',
      endDate: '2025-10-15'
    },
    description: 'Day of Atonement',
    color: '#6b7280',
    image: '' // No default image
  },
  { 
    id: '17', 
    name: 'סוכות', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 17,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-09-15',
      endDate: '2025-10-31'
    },
    description: 'Festival of Booths',
    color: '#16a34a',
    image: '' // No default image
  },
  { 
    id: '18', 
    name: 'שמחת תורה', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 18,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    },
    description: 'Rejoicing with the Torah',
    color: '#dc2626',
    image: '' // No default image
  },
  { 
    id: '19', 
    name: 'חנוכה', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 19,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-11-15',
      endDate: '2025-12-31'
    },
    description: 'Festival of Lights',
    color: '#2563eb',
    image: '' // No default image
  },
  { 
    id: '20', 
    name: 'ט״ו בשבט', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 20,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-01-01',
      endDate: '2025-02-28'
    },
    description: 'New Year of the Trees',
    color: '#059669',
    image: '' // No default image
  },
  { 
    id: '21', 
    name: 'פורים', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 21,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-02-01',
      endDate: '2025-03-31'
    },
    description: 'Festival of Lots',
    color: '#7c3aed',
    image: '' // No default image
  },
  { 
    id: '22', 
    name: 'פסח', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 22,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-03-01',
      endDate: '2025-04-30'
    },
    description: 'Passover',
    color: '#dc2626',
    image: '' // No default image
  },
  { 
    id: '23', 
    name: 'ל״ג בעומר', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 23,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-04-15',
      endDate: '2025-05-31'
    },
    description: 'Lag BaOmer',
    color: '#ea580c',
    image: '' // No default image
  },
  { 
    id: '24', 
    name: 'שבועות', 
    category: 'holiday',
    isVisibleOnStorefront: false,
    displayOrder: 24,
    scheduledVisibility: { 
      isScheduled: true,
      startDate: '2025-05-01',
      endDate: '2025-06-30'
    },
    description: 'Festival of Weeks',
    color: '#0891b2',
    image: '' // No default image
  },
  { 
    id: '25', 
    name: 'משלוח מנות', 
    category: 'custom',
    isVisibleOnStorefront: true,
    displayOrder: 25,
    scheduledVisibility: { isScheduled: false },
    description: 'Purim gift packages',
    color: '#be185d',
    image: '' // No default image
  }
];