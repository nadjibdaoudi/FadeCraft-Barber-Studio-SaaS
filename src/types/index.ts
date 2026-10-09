export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'arrived' 
  | 'in_chair' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type ReminderChannel = 'sms' | 'whatsapp' | 'email';

export interface BreakSlot {
  id: string;
  label: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DayShift {
  dayOfWeek: DayOfWeek;
  isWorking: boolean;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  breaks: BreakSlot[];
}

export interface Barber {
  id: string;
  name: string;
  chairNumber: number;
  avatarUrl: string;
  specialty: string;
  rating: number;
  cutsCompleted: number;
  status: 'active' | 'in_service' | 'on_break' | 'offline';
  weeklyHours?: number;
  shifts: DayShift[];
}

export interface Service {
  id: string;
  name: string;
  category: 'hair' | 'beard' | 'combo' | 'treatment';
  price: number;
  durationMinutes: number;
  description: string;
  popular?: boolean;
}

export interface CutFormulaNote {
  date: string;
  barberName: string;
  notes: string;
  guardSizes: string;
  finishProduct: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  joinedDate: string;
  lastVisitDate: string;
  preferredBarberId: string;
  totalVisits: number;
  totalSpend: number;
  loyaltyTier: 'Regular' | 'Silver VIP' | 'Gold VIP' | 'Black Diamond VIP';
  loyaltyProgress: {
    currentVisits: number;
    targetVisits: number;
  };
  stylePreferences: {
    hairStyle: string;
    guardSides: string;
    topLength: string;
    beardStyle: string;
    hairType: string;
    sensitivities: string;
    preferredBeverage?: string;
  };
  cutHistory: CutFormulaNote[];
  reminderPreferences: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    hoursNotice: number;
  };
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  barberId: string;
  barberName: string;
  chairNumber: number;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  reminderStatus: {
    sent24h: boolean;
    sent2h: boolean;
    lastSentChannel?: ReminderChannel;
    lastSentTimestamp?: string;
  };
}

export interface AutomationRule {
  id: string;
  title: string;
  triggerEvent: '24h_before' | '2h_before' | 'post_service_2h' | 'inactive_28d';
  channels: ReminderChannel[];
  active: boolean;
  templateMessage: string;
  description: string;
  stats: {
    sentCount: number;
    confirmedCount: number;
    rebookedCount: number;
  };
}

export interface ReminderLog {
  id: string;
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  barberName: string;
  timeSlot: string;
  channel: ReminderChannel;
  ruleTitle: string;
  timestamp: string;
  status: 'delivered' | 'confirmed' | 'failed' | 'clicked';
  messagePreview: string;
}

export type InventoryCategory = 'blades' | 'styling' | 'shave' | 'hygiene' | 'care';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  currentStock: number;
  minStockThreshold: number;
  unit: string; // 'boxes', 'tins', 'bottles', 'cans', 'packs'
  costPrice: number;
  retailPrice?: number;
  supplier: string;
  lastRestockedDate: string;
  usagePerDayEstimated: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface WalkInQueueItem {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMinutes: number;
  preferredBarberId: string; // 'any' or specific barber id
  suggestedBarberId: string;
  suggestedBarberName: string;
  suggestedChairNumber: number;
  estimatedWaitMinutes: number;
  joinedTime: string; // e.g. "14:15"
  status: 'waiting' | 'called' | 'seated' | 'cancelled';
  notes?: string;
}

export interface MonthlyFinancialRecord {
  month: string;
  name: string;
  fullMonth: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  payroll: number;
  rent: number;
  supplies: number;
  operations: number;
  cutsCount: number;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export type PaymentMethod = 'card' | 'apple_pay' | 'cash' | 'gift_card';
export type InvoiceStatus = 'paid' | 'pending' | 'refunded' | 'cancelled';

export interface BillingLineItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. "INV-2026-0842"
  appointmentId?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  barberName: string;
  chairNumber: number;
  items: BillingLineItem[];
  subtotal: number;
  taxAmount: number; // 7%
  tipAmount: number;
  discountAmount: number; // loyalty discount
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardBrand?: string; // "Visa", "Mastercard", "Amex"
    cardLast4?: string; // "4242"
    transactionRef?: string;
  };
  status: InvoiceStatus;
  date: string; // "2026-09-29"
  time: string; // "14:45"
  notes?: string;
  receiptSentVia?: 'sms' | 'email' | 'none';
}


