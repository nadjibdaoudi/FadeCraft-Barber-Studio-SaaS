import { Barber, Client, Service, Appointment, AutomationRule, ReminderLog, DayShift, DayOfWeek, BreakSlot, InventoryItem, WalkInQueueItem, MonthlyFinancialRecord, Invoice } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const createDefaultShifts = (
  startTime: string = '09:00',
  endTime: string = '18:00',
  breaks: BreakSlot[] = [
    { id: 'b1', label: 'Lunch Break', startTime: '13:00', endTime: '14:00' }
  ],
  offDays: DayOfWeek[] = ['Sunday']
): DayShift[] => {
  return DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day,
    isWorking: !offDays.includes(day),
    startTime,
    endTime,
    breaks: offDays.includes(day) ? [] : breaks
  }));
};

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-1',
    name: 'Marcus Vance',
    chairNumber: 1,
    avatarUrl: '/src/assets/images/barber_avatar_marcus_1790833013027.jpg',
    specialty: 'Skin Tapers & Razor Fades',
    rating: 4.98,
    cutsCompleted: 1420,
    status: 'in_service',
    weeklyHours: 40,
    shifts: createDefaultShifts('09:00', '18:00', [
      { id: 'm-b1', label: 'Lunch Break', startTime: '13:00', endTime: '14:00' },
      { id: 'm-b2', label: 'Afternoon Rest', startTime: '16:00', endTime: '16:30' }
    ], ['Sunday'])
  },
  {
    id: 'barber-2',
    name: 'Tariq Al-Mansoor',
    chairNumber: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Resilient fallback
    specialty: 'Beard Sculpting & Hot Towel',
    rating: 4.95,
    cutsCompleted: 980,
    status: 'in_service',
    weeklyHours: 38,
    shifts: createDefaultShifts('10:00', '19:30', [
      { id: 't-b1', label: 'Lunch & Rest', startTime: '14:00', endTime: '15:00' }
    ], ['Sunday', 'Monday'])
  },
  {
    id: 'barber-3',
    name: 'Leo Rossi',
    chairNumber: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    specialty: 'Classic Scissor Cuts & Pompadours',
    rating: 4.92,
    cutsCompleted: 1150,
    status: 'active',
    weeklyHours: 42,
    shifts: createDefaultShifts('09:30', '18:30', [
      { id: 'l-b1', label: 'Mid-Day Lunch', startTime: '13:30', endTime: '14:30' },
      { id: 'l-b2', label: 'Tool Sanitize & Break', startTime: '17:00', endTime: '17:15' }
    ], ['Sunday'])
  },
  {
    id: 'barber-4',
    name: 'Sarah Cole',
    chairNumber: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    specialty: 'Textured Crops & Modern Styling',
    rating: 4.96,
    cutsCompleted: 870,
    status: 'active',
    weeklyHours: 36,
    shifts: createDefaultShifts('11:00', '20:00', [
      { id: 's-b1', label: 'Dinner Break', startTime: '15:30', endTime: '16:30' }
    ], ['Wednesday', 'Sunday'])
  },
  {
    id: 'barber-5',
    name: 'Damon West',
    chairNumber: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    specialty: 'Line-ups, Hair Graphics & Color',
    rating: 4.89,
    cutsCompleted: 640,
    status: 'on_break',
    weeklyHours: 35,
    shifts: createDefaultShifts('10:00', '18:00', [
      { id: 'd-b1', label: 'Coffee & Break', startTime: '14:30', endTime: '15:15' }
    ], ['Monday', 'Tuesday'])
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Signature Skin Fade & Haircut',
    category: 'hair',
    price: 45,
    durationMinutes: 45,
    description: 'Precision scissor work, foil shaver skin taper, straight razor neck cleanup, styled with premium matte pomade.',
    popular: true
  },
  {
    id: 'srv-2',
    name: 'Beard Sculpt & Lineup',
    category: 'beard',
    price: 30,
    durationMinutes: 30,
    description: 'Hot lather edge lining, clipper reduction, beard oil conditioning, cold eucalyptus towel.',
    popular: true
  },
  {
    id: 'srv-3',
    name: 'The Deluxe Fade & Beard Duo',
    category: 'combo',
    price: 65,
    durationMinutes: 60,
    description: 'Full signature haircut, complete beard sculpting, double hot towel steam treatment, and scalp massage.',
    popular: true
  },
  {
    id: 'srv-4',
    name: 'Traditional Hot Towel Straight Razor Shave',
    category: 'treatment',
    price: 50,
    durationMinutes: 45,
    description: 'Pre-shave essential oils, multi-layer steam towels, badger brush warm lather, feather blade shave, aftershave balm.'
  },
  {
    id: 'srv-5',
    name: 'Junior / Student Precision Cut',
    category: 'hair',
    price: 35,
    durationMinutes: 30,
    description: 'Ages 5-17. Modern cut, razor neck tape (optional), blowout and clay styling.'
  },
  {
    id: 'srv-6',
    name: 'Executive Grooming Package',
    category: 'combo',
    price: 95,
    durationMinutes: 75,
    description: 'Deluxe haircut, hot lather shave, deep detox scalp treatment, ear/nose waxing, and signature espresso or beverage.'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Elena Ruiz',
    phone: '+1 (305) 555-0142',
    email: 'elena.ruiz@designcraft.co',
    avatarUrl: '/src/assets/images/client_avatar_elena_1790833024834.jpg',
    joinedDate: '2024-03-12',
    lastVisitDate: '2026-09-15',
    preferredBarberId: 'barber-1',
    totalVisits: 10,
    totalSpend: 540,
    loyaltyTier: 'Gold VIP',
    loyaltyProgress: {
      currentVisits: 10,
      targetVisits: 11
    },
    stylePreferences: {
      hairStyle: 'Textured Crop / High Skin Taper',
      guardSides: '#1 into foil bald fade',
      topLength: '2.5 inches scissors texture',
      beardStyle: 'N/A Clean finish',
      hairType: 'Straight / Dense',
      sensitivities: 'Prefers alcohol-free tea tree tonic on neck',
      preferredBeverage: 'Cold brew coffee'
    },
    cutHistory: [
      {
        date: '2026-09-15',
        barberName: 'Marcus Vance',
        notes: 'Tightened temple taper, kept texture on crown, used matte sea salt spray.',
        guardSizes: '#1 down to zero foil',
        finishProduct: 'Matte Clay Cream'
      },
      {
        date: '2026-08-18',
        barberName: 'Marcus Vance',
        notes: 'Mid-summer refresh, cleaned neckline with straight razor.',
        guardSizes: '#1.5 down to zero',
        finishProduct: 'Texture Dust'
      }
    ],
    reminderPreferences: {
      sms: true,
      whatsapp: true,
      email: false,
      hoursNotice: 24
    }
  },
  {
    id: 'client-2',
    name: 'Tom Whitfield',
    phone: '+1 (305) 555-0189',
    email: 'tom.whitfield@bayfrontcapital.com',
    avatarUrl: '/src/assets/images/client_avatar_tom_1790833034605.jpg',
    joinedDate: '2023-11-04',
    lastVisitDate: '2026-09-08',
    preferredBarberId: 'barber-2',
    totalVisits: 18,
    totalSpend: 810,
    loyaltyTier: 'Black Diamond VIP',
    loyaltyProgress: {
      currentVisits: 9,
      targetVisits: 11
    },
    stylePreferences: {
      hairStyle: 'Executive Low Taper & Side Part',
      guardSides: '#2 tapered to #1 at ears',
      topLength: '3.5 inches natural scissor sweep',
      beardStyle: 'Full boxed beard, faded at cheeks',
      hairType: 'Wavy / Medium',
      sensitivities: 'Sensitive neck skin - always apply warm eucalyptus oil first',
      preferredBeverage: 'San Pellegrino Sparkling'
    },
    cutHistory: [
      {
        date: '2026-09-08',
        barberName: 'Tariq Al-Mansoor',
        notes: 'Preserved crown length, sculpted mustache away from lip line, cedarwood beard balm.',
        guardSizes: '#2 taper',
        finishProduct: 'Cedarwood Beard Balm & Pomade'
      }
    ],
    reminderPreferences: {
      sms: true,
      whatsapp: false,
      email: true,
      hoursNotice: 24
    }
  },
  {
    id: 'client-3',
    name: 'Rafael Duarte',
    phone: '+1 (305) 555-0218',
    email: 'rafael.duarte@edgewaterarch.com',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-07-22',
    lastVisitDate: '2026-09-02',
    preferredBarberId: 'barber-1',
    totalVisits: 6,
    totalSpend: 390,
    loyaltyTier: 'Silver VIP',
    loyaltyProgress: {
      currentVisits: 6,
      targetVisits: 11
    },
    stylePreferences: {
      hairStyle: 'Low Drop Fade & Textured Spikes',
      guardSides: '#0.5 blend',
      topLength: '2 inches point cut',
      beardStyle: 'Designer heavy stubble with crisp lineup',
      hairType: 'Thick / Coarse',
      sensitivities: 'None',
      preferredBeverage: 'Double Espresso'
    },
    cutHistory: [
      {
        date: '2026-09-02',
        barberName: 'Marcus Vance',
        notes: 'Low fade kept dark around the parietal ridge. Finished with styling powder.',
        guardSizes: '#0.5 to skin',
        finishProduct: 'Matte Volumizing Powder'
      }
    ],
    reminderPreferences: {
      sms: true,
      whatsapp: true,
      email: false,
      hoursNotice: 2
    }
  },
  {
    id: 'client-4',
    name: 'James Chen',
    phone: '+1 (305) 555-0374',
    email: 'james.chen@brickelltech.io',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-01-15',
    lastVisitDate: '2026-09-12',
    preferredBarberId: 'barber-3',
    totalVisits: 7,
    totalSpend: 525,
    loyaltyTier: 'Silver VIP',
    loyaltyProgress: {
      currentVisits: 7,
      targetVisits: 11
    },
    stylePreferences: {
      hairStyle: 'Modern French Crop & Natural Fade',
      guardSides: '#1.5 taper',
      topLength: 'Blunt fringe with chopped crown',
      beardStyle: 'Clean shaved',
      hairType: 'Fine / Straight',
      sensitivities: 'Prone to ingrown hairs on lower neck',
      preferredBeverage: 'Green tea'
    },
    cutHistory: [
      {
        date: '2026-09-12',
        barberName: 'Leo Rossi',
        notes: 'Father & son booking. Blended hairline naturally, minimal product.',
        guardSizes: '#1.5',
        finishProduct: 'Light Styling Cream'
      }
    ],
    reminderPreferences: {
      sms: true,
      whatsapp: true,
      email: true,
      hoursNotice: 24
    }
  },
  {
    id: 'client-5',
    name: 'Hannah Berg',
    phone: '+1 (305) 555-0451',
    email: 'hannah.b@artbaselagency.org',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2025-02-10',
    lastVisitDate: '2026-09-01',
    preferredBarberId: 'barber-4',
    totalVisits: 4,
    totalSpend: 240,
    loyaltyTier: 'Regular',
    loyaltyProgress: {
      currentVisits: 4,
      targetVisits: 11
    },
    stylePreferences: {
      hairStyle: 'Precision Tapered Pixie Cut',
      guardSides: '#2 soft shear tapering around ears',
      topLength: 'Sleek swept texture',
      beardStyle: 'N/A',
      hairType: 'Fine / Silky',
      sensitivities: 'Prefers organic unscented oils',
      preferredBeverage: 'Sparkling Water with lemon'
    },
    cutHistory: [
      {
        date: '2026-09-01',
        barberName: 'Sarah Cole',
        notes: 'Ultra-clean nape graduation with feather razor.',
        guardSizes: '#2 clipper over comb',
        finishProduct: 'Silkening Argan Drops'
      }
    ],
    reminderPreferences: {
      sms: false,
      whatsapp: true,
      email: true,
      hoursNotice: 24
    }
  },
  {
    id: 'client-6',
    name: 'Dominic Sterling',
    phone: '+1 (305) 555-0892',
    email: 'dominic@sterlinglaw.com',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-05-19',
    lastVisitDate: '2026-08-20',
    preferredBarberId: 'barber-1',
    totalVisits: 12,
    totalSpend: 780,
    loyaltyTier: 'Gold VIP',
    loyaltyProgress: {
      currentVisits: 12,
      targetVisits: 15
    },
    stylePreferences: {
      hairStyle: 'Mid Skin Fade & Pompadour',
      guardSides: 'Skin to #2',
      topLength: '4 inches blow-dried back',
      beardStyle: 'Sculpted stubble fade',
      hairType: 'Wavy',
      sensitivities: 'None',
      preferredBeverage: 'Bourbon or black coffee'
    },
    cutHistory: [],
    reminderPreferences: {
      sms: true,
      whatsapp: true,
      email: false,
      hoursNotice: 24
    }
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientId: 'client-1',
    clientName: 'Elena Ruiz',
    clientAvatar: '/src/assets/images/client_avatar_elena_1790833024834.jpg',
    clientPhone: '+1 (305) 555-0142',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    serviceId: 'srv-1',
    serviceName: 'Signature Skin Fade & Haircut',
    price: 45,
    date: '2026-09-29',
    time: '14:30',
    durationMinutes: 45,
    status: 'arrived',
    notes: 'Keep top textured, skin taper on nape. Client in waiting lounge.',
    reminderStatus: {
      sent24h: true,
      sent2h: true,
      lastSentChannel: 'sms',
      lastSentTimestamp: '12:30 PM (2h notice)'
    }
  },
  {
    id: 'apt-2',
    clientId: 'client-2',
    clientName: 'Tom Whitfield',
    clientAvatar: '/src/assets/images/client_avatar_tom_1790833034605.jpg',
    clientPhone: '+1 (305) 555-0189',
    barberId: 'barber-2',
    barberName: 'Tariq Al-Mansoor',
    chairNumber: 2,
    serviceId: 'srv-3',
    serviceName: 'The Deluxe Fade & Beard Duo',
    price: 65,
    date: '2026-09-29',
    time: '15:00',
    durationMinutes: 60,
    status: 'in_chair',
    notes: 'Hot eucalyptus towel first, side part styling with pomade.',
    reminderStatus: {
      sent24h: true,
      sent2h: true,
      lastSentChannel: 'sms',
      lastSentTimestamp: '1:00 PM (2h notice)'
    }
  },
  {
    id: 'apt-3',
    clientId: 'client-3',
    clientName: 'Rafael Duarte',
    clientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    clientPhone: '+1 (305) 555-0218',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    serviceId: 'srv-4',
    serviceName: 'Hot Towel Straight Razor Shave',
    price: 50,
    date: '2026-09-29',
    time: '16:00',
    durationMinutes: 45,
    status: 'confirmed',
    notes: 'Special request: pre-shave sandalwood oil.',
    reminderStatus: {
      sent24h: true,
      sent2h: false,
      lastSentChannel: 'whatsapp',
      lastSentTimestamp: 'Yesterday 4:00 PM (Confirmed via WhatsApp)'
    }
  },
  {
    id: 'apt-4',
    clientId: 'client-4',
    clientName: 'James Chen',
    clientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    clientPhone: '+1 (305) 555-0374',
    barberId: 'barber-3',
    barberName: 'Leo Rossi',
    chairNumber: 3,
    serviceId: 'srv-1',
    serviceName: 'Signature Skin Fade & Haircut',
    price: 45,
    date: '2026-09-29',
    time: '16:30',
    durationMinutes: 45,
    status: 'scheduled',
    notes: 'Coming straight from office in Brickell.',
    reminderStatus: {
      sent24h: true,
      sent2h: false,
      lastSentChannel: 'sms',
      lastSentTimestamp: 'Yesterday 4:30 PM (Delivered)'
    }
  },
  {
    id: 'apt-5',
    clientId: 'client-5',
    clientName: 'Hannah Berg',
    clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    clientPhone: '+1 (305) 555-0451',
    barberId: 'barber-4',
    barberName: 'Sarah Cole',
    chairNumber: 4,
    serviceId: 'srv-5',
    serviceName: 'Junior / Student Precision Cut',
    price: 35,
    date: '2026-09-29',
    time: '17:15',
    durationMinutes: 30,
    status: 'scheduled',
    notes: 'Precision nape taper.',
    reminderStatus: {
      sent24h: true,
      sent2h: false,
      lastSentChannel: 'whatsapp',
      lastSentTimestamp: 'Yesterday 5:15 PM (Delivered)'
    }
  },
  {
    id: 'apt-6',
    clientId: 'client-6',
    clientName: 'Dominic Sterling',
    clientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    clientPhone: '+1 (305) 555-0892',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    serviceId: 'srv-6',
    serviceName: 'Executive Grooming Package',
    price: 95,
    date: '2026-09-30',
    time: '11:00',
    durationMinutes: 75,
    status: 'confirmed',
    notes: 'Full package with cold beverage upon arrival.',
    reminderStatus: {
      sent24h: true,
      sent2h: false,
      lastSentChannel: 'sms',
      lastSentTimestamp: 'Today 11:00 AM'
    }
  }
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'rule-1',
    title: '24-Hour Smart Advance Confirmation',
    triggerEvent: '24h_before',
    channels: ['sms', 'whatsapp'],
    active: true,
    description: 'Sends automated interactive confirmation SMS / WhatsApp 24 hours prior to appointment with instant 1-tap confirmation.',
    templateMessage: 'Hi {client_name}, this is FadeCraft Studio! Reminder: your appointment for {service_name} with {barber_name} is tomorrow at {appointment_time}. Reply 1 to CONFIRM or 2 to reschedule.',
    stats: {
      sentCount: 684,
      confirmedCount: 612,
      rebookedCount: 42
    }
  },
  {
    id: 'rule-2',
    title: '2-Hour "Chair Ready" & Traffic Notice',
    triggerEvent: '2h_before',
    channels: ['sms'],
    active: true,
    description: 'Sends a heads-up 2 hours prior with studio parking info, express check-in link, and assigned chair number.',
    templateMessage: 'Hey {client_name}, your chair #{chair_number} with {barber_name} will be ready at {appointment_time}. Validated parking is available in the rear alley. See you soon!',
    stats: {
      sentCount: 590,
      confirmedCount: 574,
      rebookedCount: 8
    }
  },
  {
    id: 'rule-3',
    title: 'Post-Cut Review & 10% Rebook Incentive',
    triggerEvent: 'post_service_2h',
    channels: ['whatsapp', 'sms'],
    active: true,
    description: 'Triggers 2 hours after haircut completion. Thanks the client, requests a Google rating, and offers 10% off their next booking if reserved within 14 days.',
    templateMessage: 'Looking sharp, {client_name}! Thank you for visiting FadeCraft today. How was your cut with {barber_name}? Tap here to rate us or book your next fade in 2 weeks for 10% off: {booking_link}',
    stats: {
      sentCount: 512,
      confirmedCount: 420,
      rebookedCount: 238
    }
  },
  {
    id: 'rule-4',
    title: '28-Day "Time for a Fresh Fade" Recall',
    triggerEvent: 'inactive_28d',
    channels: ['sms', 'whatsapp'],
    active: true,
    description: 'Automatically targets regular clients who have not booked in 28 days based on their personal grooming cycle.',
    templateMessage: "Hey {client_name}, it's been 4 weeks since your last cut at FadeCraft! Keep that neckline crisp—Marcus has 2 slots left this Thursday: {quick_book_url}",
    stats: {
      sentCount: 310,
      confirmedCount: 198,
      rebookedCount: 145
    }
  }
];

export const INITIAL_REMINDER_LOGS: ReminderLog[] = [
  {
    id: 'log-1',
    appointmentId: 'apt-1',
    clientName: 'Elena Ruiz',
    clientPhone: '+1 (305) 555-0142',
    barberName: 'Marcus Vance',
    timeSlot: 'Today 2:30 PM',
    channel: 'sms',
    ruleTitle: '2-Hour "Chair Ready" & Traffic Notice',
    timestamp: '12:30 PM (Today)',
    status: 'delivered',
    messagePreview: 'Hey Elena, your chair #1 with Marcus Vance will be ready at 14:30. Validated parking is available...'
  },
  {
    id: 'log-2',
    appointmentId: 'apt-2',
    clientName: 'Tom Whitfield',
    clientPhone: '+1 (305) 555-0189',
    barberName: 'Tariq Al-Mansoor',
    timeSlot: 'Today 3:00 PM',
    channel: 'sms',
    ruleTitle: '2-Hour "Chair Ready" & Traffic Notice',
    timestamp: '1:00 PM (Today)',
    status: 'confirmed',
    messagePreview: 'Hey Tom, your chair #2 with Tariq Al-Mansoor will be ready at 15:00...'
  },
  {
    id: 'log-3',
    appointmentId: 'apt-3',
    clientName: 'Rafael Duarte',
    clientPhone: '+1 (305) 555-0218',
    barberName: 'Marcus Vance',
    timeSlot: 'Today 4:00 PM',
    channel: 'whatsapp',
    ruleTitle: '24-Hour Smart Advance Confirmation',
    timestamp: 'Yesterday 4:00 PM',
    status: 'confirmed',
    messagePreview: 'Hi Rafael, this is FadeCraft Studio! Reminder: your appointment for Hot Towel Shave is tomorrow...'
  },
  {
    id: 'log-4',
    appointmentId: 'apt-6',
    clientName: 'Dominic Sterling',
    clientPhone: '+1 (305) 555-0892',
    barberName: 'Marcus Vance',
    timeSlot: 'Tomorrow 11:00 AM',
    channel: 'sms',
    ruleTitle: '24-Hour Smart Advance Confirmation',
    timestamp: 'Today 11:00 AM',
    status: 'delivered',
    messagePreview: 'Hi Dominic, this is FadeCraft Studio! Reminder: your Executive Grooming Package is tomorrow...'
  }
];

export const MONTHLY_METRICS = [
  { month: 'J', name: 'Jan', revenue: 14200, cuts: 280, isCompleted: true },
  { month: 'F', name: 'Feb', revenue: 15400, cuts: 305, isCompleted: true },
  { month: 'M', name: 'Mar', revenue: 16800, cuts: 330, isCompleted: true },
  { month: 'A', name: 'Apr', revenue: 18100, cuts: 360, isCompleted: true },
  { month: 'M', name: 'May', revenue: 19500, cuts: 388, isCompleted: true },
  { month: 'J', name: 'Jun', revenue: 21200, cuts: 410, isCompleted: true },
  { month: 'J', name: 'Jul', revenue: 22800, cuts: 435, isCompleted: true },
  { month: 'A', name: 'Aug', revenue: 25020, cuts: 450, isCompleted: true },
  { month: 'S', name: 'Sep', revenue: 33400, cuts: 492, isCompleted: true, isCurrent: true },
  { month: 'O', name: 'Oct', revenue: 24500, cuts: 0, isCompleted: false },
  { month: 'N', name: 'Nov', revenue: 26000, cuts: 0, isCompleted: false },
  { month: 'D', name: 'Dec', revenue: 28500, cuts: 0, isCompleted: false }
];

export const FINANCIAL_PERFORMANCE_METRICS: MonthlyFinancialRecord[] = [
  { month: 'J', name: 'Jan', fullMonth: 'January 2026', revenue: 14200, expenses: 8400, netProfit: 5800, profitMargin: 40.8, payroll: 4600, rent: 1800, supplies: 1200, operations: 800, cutsCount: 280, isCompleted: true },
  { month: 'F', name: 'Feb', fullMonth: 'February 2026', revenue: 15400, expenses: 8900, netProfit: 6500, profitMargin: 42.2, payroll: 4900, rent: 1800, supplies: 1300, operations: 900, cutsCount: 305, isCompleted: true },
  { month: 'M', name: 'Mar', fullMonth: 'March 2026', revenue: 16800, expenses: 9550, netProfit: 7250, profitMargin: 43.2, payroll: 5350, rent: 1800, supplies: 1450, operations: 950, cutsCount: 330, isCompleted: true },
  { month: 'A', name: 'Apr', fullMonth: 'April 2026', revenue: 18100, expenses: 10200, netProfit: 7900, profitMargin: 43.6, payroll: 5800, rent: 1800, supplies: 1550, operations: 1050, cutsCount: 360, isCompleted: true },
  { month: 'M', name: 'May', fullMonth: 'May 2026', revenue: 19500, expenses: 10900, netProfit: 8600, profitMargin: 44.1, payroll: 6250, rent: 1800, supplies: 1700, operations: 1150, cutsCount: 388, isCompleted: true },
  { month: 'J', name: 'Jun', fullMonth: 'June 2026', revenue: 21200, expenses: 11800, netProfit: 9400, profitMargin: 44.3, payroll: 6800, rent: 1800, supplies: 1950, operations: 1250, cutsCount: 410, isCompleted: true },
  { month: 'J', name: 'Jul', fullMonth: 'July 2026', revenue: 22800, expenses: 12650, netProfit: 10150, profitMargin: 44.5, payroll: 7350, rent: 1800, supplies: 2150, operations: 1350, cutsCount: 435, isCompleted: true },
  { month: 'A', name: 'Aug', fullMonth: 'August 2026', revenue: 25020, expenses: 13800, netProfit: 11220, profitMargin: 44.8, payroll: 8100, rent: 1800, supplies: 2400, operations: 1500, cutsCount: 450, isCompleted: true },
  { month: 'S', name: 'Sep', fullMonth: 'September 2026', revenue: 33400, expenses: 17800, netProfit: 15600, profitMargin: 46.7, payroll: 10900, rent: 1800, supplies: 3400, operations: 1700, cutsCount: 492, isCompleted: true, isCurrent: true },
  { month: 'O', name: 'Oct', fullMonth: 'October 2026 (Projected)', revenue: 24500, expenses: 13600, netProfit: 10900, profitMargin: 44.5, payroll: 7950, rent: 1800, supplies: 2350, operations: 1500, cutsCount: 460, isCompleted: false },
  { month: 'N', name: 'Nov', fullMonth: 'November 2026 (Projected)', revenue: 26000, expenses: 14300, netProfit: 11700, profitMargin: 45.0, payroll: 8450, rent: 1800, supplies: 2500, operations: 1550, cutsCount: 480, isCompleted: false },
  { month: 'D', name: 'Dec', fullMonth: 'December 2026 (Projected)', revenue: 28500, expenses: 15500, netProfit: 13000, profitMargin: 45.6, payroll: 9300, rent: 1800, supplies: 2750, operations: 1650, cutsCount: 520, isCompleted: false }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Feather Hi-Stainless Japanese Blades (100pk)',
    sku: 'BLD-FTH-100',
    category: 'blades',
    currentStock: 2,
    minStockThreshold: 5,
    unit: 'boxes',
    costPrice: 28.50,
    retailPrice: 38.00,
    supplier: 'Tokyo Barber Imports Co.',
    lastRestockedDate: '2026-08-20',
    usagePerDayEstimated: 0.4,
    status: 'low_stock'
  },
  {
    id: 'inv-2',
    name: 'Derby Extra Single-Edge Pre-Cut Shavette Blades (100pk)',
    sku: 'BLD-DRB-100',
    category: 'blades',
    currentStock: 14,
    minStockThreshold: 4,
    unit: 'boxes',
    costPrice: 9.20,
    retailPrice: 15.00,
    supplier: 'Empire Barber Wholesale',
    lastRestockedDate: '2026-09-12',
    usagePerDayEstimated: 0.6,
    status: 'in_stock'
  },
  {
    id: 'inv-3',
    name: 'Suavecito Original Hold Water-Soluble Pomade (4oz)',
    sku: 'POM-SVC-004',
    category: 'styling',
    currentStock: 18,
    minStockThreshold: 6,
    unit: 'jars',
    costPrice: 8.50,
    retailPrice: 16.00,
    supplier: 'Suavecito Grooming Dist.',
    lastRestockedDate: '2026-09-18',
    usagePerDayEstimated: 1.2,
    status: 'in_stock'
  },
  {
    id: 'inv-4',
    name: 'Uppercut Deluxe Matte Clay Cream (2.1oz)',
    sku: 'POM-UDC-002',
    category: 'styling',
    currentStock: 3,
    minStockThreshold: 8,
    unit: 'tins',
    costPrice: 11.20,
    retailPrice: 22.00,
    supplier: 'Deluxe Hair Supplies Ltd.',
    lastRestockedDate: '2026-08-28',
    usagePerDayEstimated: 0.8,
    status: 'low_stock'
  },
  {
    id: 'inv-5',
    name: 'Slick Gorilla Texturizing Styling Powder (20g)',
    sku: 'POM-SG-020',
    category: 'styling',
    currentStock: 11,
    minStockThreshold: 5,
    unit: 'bottles',
    costPrice: 10.00,
    retailPrice: 20.00,
    supplier: 'Empire Barber Wholesale',
    lastRestockedDate: '2026-09-05',
    usagePerDayEstimated: 0.5,
    status: 'in_stock'
  },
  {
    id: 'inv-6',
    name: 'Proraso Eucalyptus & Menthol Pre-Shave Cream (3.4oz)',
    sku: 'SHV-PRO-003',
    category: 'shave',
    currentStock: 1,
    minStockThreshold: 4,
    unit: 'jars',
    costPrice: 7.80,
    retailPrice: 14.00,
    supplier: 'Italian Grooming Imports',
    lastRestockedDate: '2026-08-15',
    usagePerDayEstimated: 0.3,
    status: 'low_stock'
  },
  {
    id: 'inv-7',
    name: 'Clubman Pinaud Virgin Island Bay Rum Aftershave (12oz)',
    sku: 'SHV-CPB-012',
    category: 'shave',
    currentStock: 7,
    minStockThreshold: 3,
    unit: 'bottles',
    costPrice: 9.50,
    retailPrice: 18.00,
    supplier: 'Empire Barber Wholesale',
    lastRestockedDate: '2026-09-08',
    usagePerDayEstimated: 0.2,
    status: 'in_stock'
  },
  {
    id: 'inv-8',
    name: 'Grave Before Shave Sandalwood Beard Conditioning Oil (1oz)',
    sku: 'BRD-GBS-001',
    category: 'care',
    currentStock: 12,
    minStockThreshold: 4,
    unit: 'bottles',
    costPrice: 8.00,
    retailPrice: 17.50,
    supplier: 'Artisan Barber Depot',
    lastRestockedDate: '2026-09-14',
    usagePerDayEstimated: 0.4,
    status: 'in_stock'
  },
  {
    id: 'inv-9',
    name: 'Barbicide Hospital Grade Disinfectant Concentrate (64oz)',
    sku: 'HYG-BAR-064',
    category: 'hygiene',
    currentStock: 4,
    minStockThreshold: 2,
    unit: 'jugs',
    costPrice: 22.00,
    supplier: 'Blue Ribbon Sanitation',
    lastRestockedDate: '2026-09-01',
    usagePerDayEstimated: 0.1,
    status: 'in_stock'
  },
  {
    id: 'inv-10',
    name: 'Andis Cool Care Plus 5-in-1 Clipper Spray (15.5oz)',
    sku: 'HYG-AND-015',
    category: 'hygiene',
    currentStock: 8,
    minStockThreshold: 3,
    unit: 'cans',
    costPrice: 7.25,
    supplier: 'Empire Barber Wholesale',
    lastRestockedDate: '2026-09-20',
    usagePerDayEstimated: 0.5,
    status: 'in_stock'
  },
  {
    id: 'inv-11',
    name: 'Sanek Neck Strips Dispenser Box (12 rolls / 720 strips)',
    sku: 'HYG-SNK-720',
    category: 'hygiene',
    currentStock: 2,
    minStockThreshold: 5,
    unit: 'boxes',
    costPrice: 14.50,
    supplier: 'Empire Barber Wholesale',
    lastRestockedDate: '2026-08-22',
    usagePerDayEstimated: 0.7,
    status: 'low_stock'
  }
];

export const INITIAL_WALKINS: WalkInQueueItem[] = [
  {
    id: 'walkin-1',
    clientName: 'Julian Hayes',
    clientPhone: '+1 (305) 555-0812',
    serviceId: 'srv-1',
    serviceName: 'Signature Skin Fade & Haircut',
    servicePrice: 45,
    serviceDurationMinutes: 45,
    preferredBarberId: 'any',
    suggestedBarberId: 'barber-3',
    suggestedBarberName: 'Leo Rossi',
    suggestedChairNumber: 3,
    estimatedWaitMinutes: 5,
    joinedTime: '14:15',
    status: 'waiting',
    notes: 'Low skin taper, textured top. Waiting in lounge with espresso.'
  },
  {
    id: 'walkin-2',
    clientName: 'Mateo Silva',
    clientPhone: '+1 (305) 555-0943',
    serviceId: 'srv-2',
    serviceName: 'Beard Sculpt & Lineup',
    servicePrice: 30,
    serviceDurationMinutes: 30,
    preferredBarberId: 'any',
    suggestedBarberId: 'barber-4',
    suggestedBarberName: 'Sarah Cole',
    suggestedChairNumber: 4,
    estimatedWaitMinutes: 15,
    joinedTime: '14:22',
    status: 'waiting',
    notes: 'Crisp cheek lines, hot towel finish.'
  },
  {
    id: 'walkin-3',
    clientName: 'Christian Cole',
    clientPhone: '+1 (305) 555-0671',
    serviceId: 'srv-5',
    serviceName: 'Junior / Student Precision Cut',
    servicePrice: 35,
    serviceDurationMinutes: 30,
    preferredBarberId: 'barber-1',
    suggestedBarberId: 'barber-1',
    suggestedBarberName: 'Marcus Vance',
    suggestedChairNumber: 1,
    estimatedWaitMinutes: 20,
    joinedTime: '14:26',
    status: 'waiting',
    notes: 'Father requested Marcus Vance specifically.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0842',
    appointmentId: 'apt-1',
    clientId: 'client-1',
    clientName: 'Elena Ruiz',
    clientPhone: '+1 (305) 555-0142',
    clientEmail: 'elena.ruiz@designcraft.co',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    items: [
      { id: 'item-1', type: 'service', name: 'Signature Skin Fade & Haircut', quantity: 1, unitPrice: 45, total: 45 },
      { id: 'item-2', type: 'product', name: 'Uppercut Deluxe Matte Clay (2.1oz)', quantity: 1, unitPrice: 22, total: 22 }
    ],
    subtotal: 67,
    taxAmount: 4.69,
    tipAmount: 15.00,
    discountAmount: 0,
    totalAmount: 86.69,
    paymentMethod: 'card',
    paymentDetails: {
      cardBrand: 'Visa',
      cardLast4: '4242',
      transactionRef: 'tx_live_9a7f82b1c4'
    },
    status: 'paid',
    date: '2026-09-29',
    time: '15:15',
    notes: 'Gold VIP Member · 22% tip for Marcus',
    receiptSentVia: 'sms'
  },
  {
    id: 'INV-2026-0841',
    appointmentId: 'apt-2',
    clientId: 'client-2',
    clientName: 'Tom Whitfield',
    clientPhone: '+1 (305) 555-0189',
    clientEmail: 'tom.whitfield@gmail.com',
    barberId: 'barber-2',
    barberName: 'Tariq Al-Mansoor',
    chairNumber: 2,
    items: [
      { id: 'item-3', type: 'service', name: 'Beard Sculpt & Razor Shape', quantity: 1, unitPrice: 30, total: 30 },
      { id: 'item-4', type: 'product', name: 'Suavecito Original Hold Pomade', quantity: 1, unitPrice: 16, total: 16 }
    ],
    subtotal: 46,
    taxAmount: 3.22,
    tipAmount: 10.00,
    discountAmount: 0,
    totalAmount: 59.22,
    paymentMethod: 'apple_pay',
    paymentDetails: {
      cardBrand: 'Apple Pay',
      cardLast4: '9012',
      transactionRef: 'tx_live_ap_6b1e84'
    },
    status: 'paid',
    date: '2026-09-29',
    time: '14:45',
    notes: 'Pre-wedding beard lineup',
    receiptSentVia: 'sms'
  },
  {
    id: 'INV-2026-0840',
    appointmentId: 'apt-3',
    clientId: 'client-3',
    clientName: 'Rafael Duarte',
    clientPhone: '+1 (305) 555-0218',
    clientEmail: 'rafael.duarte@studio.io',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    items: [
      { id: 'item-5', type: 'service', name: 'Hot Towel Straight Razor Shave', quantity: 1, unitPrice: 50, total: 50 }
    ],
    subtotal: 50,
    taxAmount: 3.50,
    tipAmount: 12.00,
    discountAmount: 0,
    totalAmount: 65.50,
    paymentMethod: 'card',
    paymentDetails: {
      cardBrand: 'Amex',
      cardLast4: '1008',
      transactionRef: 'tx_live_ax_3d7890'
    },
    status: 'paid',
    date: '2026-09-29',
    time: '13:50',
    notes: 'Complimentary espresso provided',
    receiptSentVia: 'email'
  },
  {
    id: 'INV-2026-0839',
    appointmentId: 'apt-4',
    clientId: 'client-4',
    clientName: 'James Chen',
    clientPhone: '+1 (305) 555-0374',
    clientEmail: 'j.chen@apex.tech',
    barberId: 'barber-3',
    barberName: 'Leo Rossi',
    chairNumber: 3,
    items: [
      { id: 'item-6', type: 'service', name: 'Signature Skin Fade & Haircut', quantity: 1, unitPrice: 45, total: 45 }
    ],
    subtotal: 45,
    taxAmount: 3.15,
    tipAmount: 0,
    discountAmount: 0,
    totalAmount: 48.15,
    paymentMethod: 'card',
    status: 'pending',
    date: '2026-09-29',
    time: '16:30',
    notes: 'Currently in chair #3 · Tap to settle payment',
    receiptSentVia: 'none'
  },
  {
    id: 'INV-2026-0838',
    appointmentId: 'apt-5',
    clientId: 'client-5',
    clientName: 'Hannah Berg',
    clientPhone: '+1 (305) 555-0451',
    clientEmail: 'hannah.berg@law.com',
    barberId: 'barber-4',
    barberName: 'Sarah Cole',
    chairNumber: 4,
    items: [
      { id: 'item-7', type: 'service', name: 'Junior / Student Precision Cut', quantity: 1, unitPrice: 35, total: 35 }
    ],
    subtotal: 35,
    taxAmount: 2.45,
    tipAmount: 8.00,
    discountAmount: 0,
    totalAmount: 45.45,
    paymentMethod: 'cash',
    status: 'paid',
    date: '2026-09-29',
    time: '12:15',
    notes: 'Paid cash at front register',
    receiptSentVia: 'sms'
  },
  {
    id: 'INV-2026-0837',
    appointmentId: 'apt-6',
    clientId: 'client-6',
    clientName: 'Dominic Sterling',
    clientPhone: '+1 (305) 555-0892',
    clientEmail: 'sterling@venture.vc',
    barberId: 'barber-1',
    barberName: 'Marcus Vance',
    chairNumber: 1,
    items: [
      { id: 'item-8', type: 'service', name: 'Executive Grooming Package', quantity: 1, unitPrice: 95, total: 95 },
      { id: 'item-9', type: 'product', name: 'Slick Gorilla Texturizing Styling Powder', quantity: 1, unitPrice: 20, total: 20 }
    ],
    subtotal: 115,
    taxAmount: 8.05,
    tipAmount: 25.00,
    discountAmount: 0,
    totalAmount: 148.05,
    paymentMethod: 'card',
    paymentDetails: {
      cardBrand: 'Mastercard',
      cardLast4: '8821',
      transactionRef: 'tx_live_mc_5e9821'
    },
    status: 'paid',
    date: '2026-09-28',
    time: '17:30',
    notes: 'Black Diamond VIP · Top spender',
    receiptSentVia: 'email'
  }
];


