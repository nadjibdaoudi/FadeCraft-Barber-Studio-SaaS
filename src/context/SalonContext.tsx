import { supabase } from '../supabaseClient';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  Appointment,
  Barber,
  Client,
  Service,
  AutomationRule,
  ReminderLog,
  AppointmentStatus,
  ReminderChannel,
  CutFormulaNote,
  DayShift,
  DayOfWeek,
  BreakSlot,
  InventoryItem,
  WalkInQueueItem,
  Invoice,
  PaymentMethod
} from '../types';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

interface Toast {
  id: string;
  type: 'sms' | 'whatsapp' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface SalonContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appointments: Appointment[];
  barbers: Barber[];
  clients: Client[];
  services: Service[];
  automations: AutomationRule[];
  reminderLogs: ReminderLog[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  refreshData: () => Promise<void>;

  // Actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'reminderStatus'>) => void | Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addClient: (client: Omit<Client, 'id' | 'joinedDate' | 'lastVisitDate' | 'totalVisits' | 'totalSpend' | 'loyaltyTier' | 'loyaltyProgress' | 'cutHistory'>) => Client;
  updateClientNotes: (clientId: string, note: CutFormulaNote) => void;
  toggleAutomationRule: (ruleId: string) => void;
  sendSimulatedReminder: (appointmentId: string, channel: ReminderChannel, ruleTitle: string) => void;

  // Barber Shift Management Actions
  updateBarberShifts: (barberId: string, shifts: DayShift[]) => void;
  updateBarberDayShift: (barberId: string, dayOfWeek: DayOfWeek, updates: Partial<DayShift>) => void;
  addBarberBreak: (barberId: string, dayOfWeek: DayOfWeek, breakSlot: Omit<BreakSlot, 'id'>) => void;
  removeBarberBreak: (barberId: string, dayOfWeek: DayOfWeek, breakId: string) => void;
  updateBarberStatus: (barberId: string, status: Barber['status']) => void;

  // Inventory & Supply Management Actions
  inventory: InventoryItem[];
  lowStockCount: number;
  isAddInventoryModalOpen: boolean;
  setIsAddInventoryModalOpen: (open: boolean) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
  adjustInventoryStock: (id: string, delta: number) => void;
  restockInventoryItem: (id: string, quantityToAdd: number) => void;
  deleteInventoryItem: (id: string) => void;

  // Walk-in Waitlist Queue Actions
  walkIns: WalkInQueueItem[];
  isAddWalkInModalOpen: boolean;
  setIsAddWalkInModalOpen: (open: boolean) => void;
  suggestNextAvailableBarber: (preferredBarberId?: string) => {
    barber: Barber;
    estimatedWaitMinutes: number;
    reason: string;
  };
  addWalkIn: (walkInData: {
    clientName: string;
    clientPhone: string;
    serviceId: string;
    preferredBarberId: string;
    notes?: string;
  }) => void;
  seatWalkIn: (walkInId: string) => void;
  callWalkIn: (walkInId: string) => void;
  cancelWalkIn: (walkInId: string) => void;

  // Customer Billing & Invoices
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutAppointment: Appointment | null;
  setCheckoutAppointment: (apt: Appointment | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'date' | 'time'>) => Invoice;
  settleInvoice: (invoiceId: string, paymentMethod: PaymentMethod, tipAmount: number) => void;
  refundInvoice: (invoiceId: string) => void;
  sendReceiptSms: (invoiceId: string) => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// ---------------------------------------------------------------------
// Helpers (pure)
// ---------------------------------------------------------------------

type Row = Record<string, any>;

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const REALTIME_TABLES = [
  'barbers',
  'clients',
  'bookings',
  'inventory',
  'services',
  'automations',
  'reminder_logs',
  'walk_ins',
  'invoices'
];

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const todayStr = () => localDate(new Date());
const nowTime = () => localTime(new Date());
const todayName = (): DayOfWeek => DAYS[(new Date().getDay() + 6) % 7];

const avatarFor = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=161618&color=ffffff&size=100`;

// DB ids are positive integers. Anything else (temporary ids) returns null.
const dbId = (id: string | number | null | undefined): number | null => {
  if (id === null || id === undefined || id === '') return null;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const APPOINTMENT_STATUSES: string[] = [
  'scheduled',
  'confirmed',
  'arrived',
  'in_chair',
  'completed',
  'cancelled',
  'no_show'
];

const normalizeStatus = (s: string | null | undefined): AppointmentStatus => {
  if (s && APPOINTMENT_STATUSES.includes(s)) return s as AppointmentStatus;
  if (s === 'walk_in') return 'arrived';
  if (s === 'seated') return 'in_chair';
  return 'scheduled';
};

const stockStatus = (stock: number, min: number): InventoryItem['status'] =>
  stock <= 0 ? 'out_of_stock' : stock <= min ? 'low_stock' : 'in_stock';

// Accepts "14:30" or "02:30 PM" and returns an ISO timestamp for the DB.
const toBookingTimestamp = (date: string, time: string): string => {
  const m = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec((time || '').trim());
  const now = new Date();
  let h = m ? parseInt(m[1], 10) : now.getHours();
  const min = m ? parseInt(m[2], 10) : now.getMinutes();
  if (m && m[3]) {
    const pm = m[3].toLowerCase() === 'pm';
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  const [y, mo, d] = (date || todayStr()).split('-').map(Number);
  const dt = new Date(y, (mo || 1) - 1, d || 1, h, min, 0);
  return isNaN(dt.getTime()) ? now.toISOString() : dt.toISOString();
};

const defaultShifts = (): DayShift[] =>
  DAYS.map((d) => ({
    dayOfWeek: d,
    isWorking: d !== 'Sunday',
    startTime: '09:00',
    endTime: '18:00',
    breaks: []
  }));

const PLACEHOLDER_BARBER: Barber = {
  id: '',
  name: 'No barber available',
  chairNumber: 0,
  avatarUrl: '',
  specialty: '',
  rating: 0,
  cutsCompleted: 0,
  status: 'offline',
  shifts: []
};

// ---------------------------------------------------------------------
// Mappers: DB row (snake_case) -> app object (camelCase)
// ---------------------------------------------------------------------

const mapBarber = (r: Row): Barber => ({
  id: String(r.id),
  name: r.name ?? '',
  chairNumber: r.chair_number ?? 0,
  avatarUrl: r.avatar_url || avatarFor(r.name ?? ''),
  specialty: r.specialty ?? '',
  rating: Number(r.rating ?? 5),
  cutsCompleted: r.cuts_completed ?? 0,
  status: (r.status as Barber['status']) ?? 'active',
  weeklyHours: r.weekly_hours ?? undefined,
  shifts: Array.isArray(r.shifts) && r.shifts.length > 0 ? r.shifts : defaultShifts()
});

const mapClient = (r: Row): Client => {
  const created = typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : todayStr();
  return {
    id: String(r.id),
    name: r.full_name ?? '',
    phone: r.phone ?? '',
    email: r.email ?? '',
    avatarUrl: r.avatar_url || avatarFor(r.full_name ?? ''),
    joinedDate: created,
    lastVisitDate: r.last_visit_date ?? created,
    preferredBarberId: r.preferred_barber_id != null ? String(r.preferred_barber_id) : '',
    totalVisits: r.total_cuts ?? 0,
    totalSpend: Number(r.total_spend ?? 0),
    loyaltyTier: (r.loyalty_tier as Client['loyaltyTier']) ?? 'Regular',
    loyaltyProgress: {
      currentVisits: r.loyalty_current ?? 0,
      targetVisits: r.loyalty_target || 10
    },
    stylePreferences: {
      hairStyle: '',
      guardSides: '',
      topLength: '',
      beardStyle: '',
      hairType: '',
      sensitivities: '',
      ...(r.style_preferences ?? {})
    },
    cutHistory: Array.isArray(r.cut_history) ? r.cut_history : [],
    reminderPreferences: {
      sms: true,
      whatsapp: false,
      email: false,
      hoursNotice: 24,
      ...(r.reminder_preferences ?? {})
    }
  };
};

const clientToRow = (c: Client): Row => ({
  full_name: c.name,
  phone: c.phone,
  email: c.email,
  avatar_url: c.avatarUrl,
  last_visit_date: c.lastVisitDate || null,
  preferred_barber_id: dbId(c.preferredBarberId),
  total_cuts: c.totalVisits,
  total_spend: c.totalSpend,
  loyalty_tier: c.loyaltyTier,
  loyalty_current: c.loyaltyProgress.currentVisits,
  loyalty_target: c.loyaltyProgress.targetVisits,
  style_preferences: c.stylePreferences,
  cut_history: c.cutHistory,
  reminder_preferences: c.reminderPreferences
});

const mapBooking = (r: Row, barbers: Barber[], clients: Client[]): Appointment => {
  const d = new Date(r.booking_time ?? r.created_at ?? Date.now());
  const barber = barbers.find((b) => b.id === String(r.barber_id));
  const client =
    r.client_id != null
      ? clients.find((c) => c.id === String(r.client_id))
      : clients.find((c) => !!r.client_phone && c.phone === r.client_phone);
  const name = r.client_name ?? '';
  return {
    id: String(r.id),
    clientId: client?.id ?? (r.client_id != null ? String(r.client_id) : ''),
    clientName: name,
    clientAvatar: client?.avatarUrl || avatarFor(name),
    clientPhone: r.client_phone ?? '',
    barberId: r.barber_id != null ? String(r.barber_id) : '',
    barberName: barber?.name || r.barber_name || '',
    chairNumber: r.chair_number ?? barber?.chairNumber ?? 0,
    serviceId: r.service_id != null ? String(r.service_id) : '',
    serviceName: r.service_name ?? '',
    price: Number(r.price ?? 0),
    date: localDate(d),
    time: localTime(d),
    durationMinutes: r.duration_minutes ?? 30,
    status: normalizeStatus(r.status),
    notes: r.notes ?? undefined,
    reminderStatus: {
      sent24h: false,
      sent2h: false,
      lastSentTimestamp: '',
      ...(r.reminder_status ?? {})
    }
  };
};

const mapService = (r: Row): Service => ({
  id: String(r.id),
  name: r.name ?? '',
  category: (r.category as Service['category']) ?? 'hair',
  price: Number(r.price ?? 0),
  durationMinutes: r.duration_minutes ?? 30,
  description: r.description ?? '',
  popular: !!r.popular
});

const mapAutomation = (r: Row): AutomationRule => ({
  id: String(r.id),
  title: r.title ?? '',
  triggerEvent: r.trigger_event as AutomationRule['triggerEvent'],
  channels: Array.isArray(r.channels) ? r.channels : ['sms'],
  active: r.active ?? true,
  templateMessage: r.template_message ?? '',
  description: r.description ?? '',
  stats: { sentCount: 0, confirmedCount: 0, rebookedCount: 0, ...(r.stats ?? {}) }
});

const mapReminderLog = (r: Row): ReminderLog => {
  const d = new Date(r.created_at ?? Date.now());
  return {
    id: String(r.id),
    appointmentId: r.appointment_id != null ? String(r.appointment_id) : '',
    clientName: r.client_name ?? '',
    clientPhone: r.client_phone ?? '',
    barberName: r.barber_name ?? '',
    timeSlot: r.time_slot ?? '',
    channel: (r.channel as ReminderChannel) ?? 'sms',
    ruleTitle: r.rule_title ?? '',
    timestamp: `${localDate(d)} ${localTime(d)}`,
    status: (r.status as ReminderLog['status']) ?? 'delivered',
    messagePreview: r.message_preview ?? ''
  };
};

const mapInventory = (r: Row): InventoryItem => {
  const stock = r.quantity ?? 0;
  const min = r.min_required ?? 5;
  return {
    id: String(r.id),
    name: r.item_name ?? '',
    sku: r.sku ?? '',
    category: (r.category as InventoryItem['category']) ?? 'care',
    currentStock: stock,
    minStockThreshold: min,
    unit: r.unit ?? 'units',
    costPrice: Number(r.cost_price ?? 0),
    retailPrice: r.retail_price != null ? Number(r.retail_price) : undefined,
    supplier: r.supplier ?? '',
    lastRestockedDate:
      r.last_restocked_date ??
      (typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : todayStr()),
    usagePerDayEstimated: Number(r.usage_per_day ?? 0),
    status: stockStatus(stock, min)
  };
};

const inventoryToRow = (i: InventoryItem): Row => ({
  item_name: i.name,
  quantity: i.currentStock,
  min_required: i.minStockThreshold,
  status: i.status,
  sku: i.sku,
  category: i.category,
  unit: i.unit,
  cost_price: i.costPrice,
  retail_price: i.retailPrice ?? null,
  supplier: i.supplier,
  last_restocked_date: i.lastRestockedDate || null,
  usage_per_day: i.usagePerDayEstimated
});

const mapWalkIn = (r: Row): WalkInQueueItem => ({
  id: String(r.id),
  clientName: r.client_name ?? '',
  clientPhone: r.client_phone ?? '',
  serviceId: r.service_id != null ? String(r.service_id) : '',
  serviceName: r.service_name ?? '',
  servicePrice: Number(r.service_price ?? 0),
  serviceDurationMinutes: r.service_duration_minutes ?? 30,
  preferredBarberId: r.preferred_barber_id ?? 'any',
  suggestedBarberId: r.suggested_barber_id != null ? String(r.suggested_barber_id) : '',
  suggestedBarberName: r.suggested_barber_name ?? '',
  suggestedChairNumber: r.suggested_chair_number ?? 0,
  estimatedWaitMinutes: r.estimated_wait_minutes ?? 0,
  joinedTime: r.joined_time ?? '',
  status: (r.status as WalkInQueueItem['status']) ?? 'waiting',
  notes: r.notes ?? undefined
});

const walkInToRow = (w: WalkInQueueItem): Row => ({
  client_name: w.clientName,
  client_phone: w.clientPhone,
  service_id: dbId(w.serviceId),
  service_name: w.serviceName,
  service_price: w.servicePrice,
  service_duration_minutes: w.serviceDurationMinutes,
  preferred_barber_id: w.preferredBarberId || 'any',
  suggested_barber_id: dbId(w.suggestedBarberId),
  suggested_barber_name: w.suggestedBarberName,
  suggested_chair_number: w.suggestedChairNumber,
  estimated_wait_minutes: w.estimatedWaitMinutes,
  joined_time: w.joinedTime,
  status: w.status,
  notes: w.notes ?? null
});

const mapInvoice = (r: Row): Invoice => ({
  id: r.invoice_number,
  appointmentId: r.appointment_id != null ? String(r.appointment_id) : undefined,
  clientId: r.client_id != null ? String(r.client_id) : '',
  clientName: r.client_name ?? '',
  clientPhone: r.client_phone ?? '',
  clientEmail: r.client_email ?? undefined,
  barberId: r.barber_id != null ? String(r.barber_id) : '',
  barberName: r.barber_name ?? '',
  chairNumber: r.chair_number ?? 0,
  items: Array.isArray(r.items) ? r.items : [],
  subtotal: Number(r.subtotal ?? 0),
  taxAmount: Number(r.tax_amount ?? 0),
  tipAmount: Number(r.tip_amount ?? 0),
  discountAmount: Number(r.discount_amount ?? 0),
  totalAmount: Number(r.total_amount ?? 0),
  paymentMethod: (r.payment_method as PaymentMethod) ?? 'cash',
  paymentDetails: r.payment_details ?? undefined,
  status: (r.status as Invoice['status']) ?? 'pending',
  date: r.invoice_date ?? todayStr(),
  time: r.invoice_time ?? '',
  notes: r.notes ?? undefined,
  receiptSentVia: (r.receipt_sent_via as Invoice['receiptSentVia']) ?? 'none'
});

const invoiceToRow = (inv: Invoice): Row => ({
  invoice_number: inv.id,
  appointment_id: dbId(inv.appointmentId),
  client_id: dbId(inv.clientId),
  client_name: inv.clientName,
  client_phone: inv.clientPhone,
  client_email: inv.clientEmail ?? null,
  barber_id: dbId(inv.barberId),
  barber_name: inv.barberName,
  chair_number: inv.chairNumber,
  items: inv.items,
  subtotal: inv.subtotal,
  tax_amount: inv.taxAmount,
  tip_amount: inv.tipAmount,
  discount_amount: inv.discountAmount,
  total_amount: inv.totalAmount,
  payment_method: inv.paymentMethod,
  payment_details: inv.paymentDetails ?? null,
  status: inv.status,
  invoice_date: inv.date,
  invoice_time: inv.time,
  notes: inv.notes ?? null,
  receipt_sent_via: inv.receiptSentVia ?? 'none'
});

// ---------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Data (loaded from Supabase)
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [walkIns, setWalkIns] = useState<WalkInQueueItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // UI state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState<boolean>(false);
  const [isAddWalkInModalOpen, setIsAddWalkInModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs always hold the latest list, so several actions in the same tick don't overwrite each other.
  const barbersRef = useRef<Barber[]>([]);
  const clientsRef = useRef<Client[]>([]);
  const inventoryRef = useRef<InventoryItem[]>([]);
  const invoicesRef = useRef<Invoice[]>([]);
  const barberTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const reloadRef = useRef<() => Promise<void>>(async () => {});

  barbersRef.current = barbers;
  clientsRef.current = clients;
  inventoryRef.current = inventory;
  invoicesRef.current = invoices;

  const lowStockCount = inventory.filter((item) => item.currentStock <= item.minStockThreshold).length;

  // ---- Toasts & error reporting ----

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
    setTimeout(() => dismissToast(id), 4500);
  };

  const reportError = (label: string, error: any) => {
    console.error(label, error);
    addToast({
      type: 'info',
      title: 'Sync error',
      message: `${label}${error?.message ? ': ' + error.message : ''}`
    });
  };

  // Runs a Supabase write and reports a failure. Returns true on success.
  const run = async (label: string, p: PromiseLike<{ error: any }>): Promise<boolean> => {
    const { error } = await p;
    if (error) {
      reportError(label, error);
      return false;
    }
    return true;
  };

  // ---- Load + realtime ----

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadAll = async () => {
      try {
        const [b, c, bk, sv, au, rl, inv, wi, iv] = await Promise.all([
          supabase.from('barbers').select('*').order('id'),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('bookings').select('*').order('booking_time', { ascending: false }),
          supabase.from('services').select('*').order('id'),
          supabase.from('automations').select('*').order('id'),
          supabase.from('reminder_logs').select('*').order('created_at', { ascending: false }).limit(200),
          supabase.from('inventory').select('*').order('id'),
          supabase.from('walk_ins').select('*').in('status', ['waiting', 'called']).order('created_at'),
          supabase.from('invoices').select('*').order('created_at', { ascending: false })
        ]);
        if (cancelled) return;

        const results: [string, { error: any }][] = [
          ['barbers', b], ['clients', c], ['bookings', bk], ['services', sv], ['automations', au],
          ['reminder_logs', rl], ['inventory', inv], ['walk_ins', wi], ['invoices', iv]
        ];
        results.forEach(([name, res]) => {
          if (res.error) console.error(`load ${name}:`, res.error);
        });

        // A failed table keeps its previous state instead of being wiped.
        const barberList: Barber[] = b.error ? barbersRef.current : (b.data ?? []).map(mapBarber);
        const clientList: Client[] = c.error ? clientsRef.current : (c.data ?? []).map(mapClient);

        // Don't overwrite barbers while a local edit is still waiting to be saved.
        if (!b.error && Object.keys(barberTimers.current).length === 0) setBarbers(barberList);
        if (!c.error) setClients(clientList);
        if (!bk.error) {
          setAppointments((bk.data ?? []).map((r: Row) => mapBooking(r, barberList, clientList)));
        }
        if (!sv.error) setServices((sv.data ?? []).map(mapService));
        if (!au.error) setAutomations((au.data ?? []).map(mapAutomation));
        if (!rl.error) setReminderLogs((rl.data ?? []).map(mapReminderLog));
        if (!inv.error) setInventory((inv.data ?? []).map(mapInventory));
        if (!wi.error) setWalkIns((wi.data ?? []).map(mapWalkIn));
        if (!iv.error) setInvoices((iv.data ?? []).map(mapInvoice));
      } catch (e) {
        console.error('loadAll failed:', e);
      }
    };

    reloadRef.current = loadAll;
    loadAll();

    // Any change in any table -> reload (debounced). Simple and always consistent.
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(loadAll, 300);
    };

    const channel = supabase.channel('salon-live');
    REALTIME_TABLES.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule);
    });
    channel.subscribe();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshData = async () => {
    await reloadRef.current();
  };

  // Keep the open client card in sync with reloaded data.
  useEffect(() => {
    if (!selectedClient) return;
    const fresh = clients.find((c) => c.id === selectedClient.id);
    if (fresh && fresh !== selectedClient) setSelectedClient(fresh);
  }, [clients]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---- Shared mutation helpers ----

  const mutateClient = (
    match: (c: Client) => boolean,
    fn: (c: Client) => Client
  ): Client | undefined => {
    const current = clientsRef.current.find(match);
    if (!current) return undefined;
    const updated = fn(current);
    const list = clientsRef.current.map((x) => (x.id === current.id ? updated : x));
    clientsRef.current = list;
    setClients(list);
    const id = dbId(current.id);
    if (id !== null) {
      void run('Updating client', supabase.from('clients').update(clientToRow(updated)).eq('id', id));
    }
    return updated;
  };

  const persistBarber = (barberId: string, immediate: boolean) => {
    const id = dbId(barberId);
    if (id === null) return;
    const send = () => {
      delete barberTimers.current[barberId];
      const b = barbersRef.current.find((x) => x.id === barberId);
      if (!b) return;
      void run(
        'Saving barber',
        supabase
          .from('barbers')
          .update({ shifts: b.shifts, status: b.status, is_available: b.status !== 'offline' })
          .eq('id', id)
      );
    };
    if (barberTimers.current[barberId]) clearTimeout(barberTimers.current[barberId]);
    if (immediate) {
      send();
    } else {
      barberTimers.current[barberId] = setTimeout(send, 600);
    }
  };

  const mutateBarber = (barberId: string, fn: (b: Barber) => Barber, immediate = false) => {
    const current = barbersRef.current.find((b) => b.id === barberId);
    if (!current) return;
    const updated = fn(current);
    const list = barbersRef.current.map((b) => (b.id === barberId ? updated : b));
    barbersRef.current = list;
    setBarbers(list);
    persistBarber(barberId, immediate);
  };

  const mutateInventory = (id: string, fn: (i: InventoryItem) => InventoryItem) => {
    const current = inventoryRef.current.find((i) => i.id === id);
    if (!current) return;
    const updated = fn(current);
    const list = inventoryRef.current.map((i) => (i.id === id ? updated : i));
    inventoryRef.current = list;
    setInventory(list);
    const n = dbId(id);
    if (n !== null) {
      void run('Updating inventory', supabase.from('inventory').update(inventoryToRow(updated)).eq('id', n));
    }
  };

  const pushReminderLog = (log: Omit<ReminderLog, 'id' | 'timestamp'>) => {
    const entry: ReminderLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: 'Just now'
    };
    setReminderLogs((prev) => [entry, ...prev]);
    void run(
      'Saving reminder log',
      supabase.from('reminder_logs').insert([
        {
          appointment_id: dbId(log.appointmentId),
          client_name: log.clientName,
          client_phone: log.clientPhone,
          barber_name: log.barberName,
          time_slot: log.timeSlot,
          channel: log.channel,
          rule_title: log.ruleTitle,
          status: log.status,
          message_preview: log.messagePreview
        }
      ])
    );
  };

  const markAppointmentCompleted = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'completed' } : a))
    );
    const n = dbId(appointmentId);
    if (n !== null) {
      void run('Completing booking', supabase.from('bookings').update({ status: 'completed' }).eq('id', n));
    }
  };

  // ---- Appointments ----

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'reminderStatus'>) => {
    const reminderStatus: Appointment['reminderStatus'] = {
      sent24h: false,
      sent2h: false,
      lastSentChannel: 'sms',
      lastSentTimestamp: 'Scheduled automatically'
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: dbId(appointmentData.clientId),
          client_name: appointmentData.clientName,
          client_phone: appointmentData.clientPhone,
          service_id: dbId(appointmentData.serviceId),
          service_name: appointmentData.serviceName,
          price: appointmentData.price,
          barber_id: dbId(appointmentData.barberId),
          barber_name: appointmentData.barberName,
          chair_number: appointmentData.chairNumber,
          duration_minutes: appointmentData.durationMinutes,
          status: appointmentData.status,
          notes: appointmentData.notes ?? null,
          booking_time: toBookingTimestamp(appointmentData.date, appointmentData.time),
          reminder_status: reminderStatus
        }
      ])
      .select()
      .single();

    if (error || !data) {
      reportError('Saving booking failed', error);
      return;
    }

    const newAppointment: Appointment = {
      ...appointmentData,
      id: String(data.id),
      reminderStatus
    };

    setAppointments((prev) =>
      prev.some((a) => a.id === newAppointment.id) ? prev : [newAppointment, ...prev]
    );

    addToast({
      type: 'sms',
      title: 'Appointment Scheduled & Reminder Queued',
      message: `Confirmed booking for ${appointmentData.clientName} with ${appointmentData.barberName} at ${appointmentData.time}.`
    });

    pushReminderLog({
      appointmentId: newAppointment.id,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      barberName: appointmentData.barberName,
      timeSlot: `${appointmentData.date} ${appointmentData.time}`,
      channel: 'sms',
      ruleTitle: 'Instant Booking Confirmation',
      status: 'delivered',
      messagePreview: `Hi ${appointmentData.clientName}, your cut with ${appointmentData.barberName} is set for ${appointmentData.date} at ${appointmentData.time}!`
    });
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    const n = dbId(id);
    if (n !== null) {
      void run('Updating booking status', supabase.from('bookings').update({ status }).eq('id', n));
    }

    if (status === 'completed' && apt.status !== 'completed') {
      mutateClient(
        (c) => c.id === apt.clientId || (!!apt.clientPhone && c.phone === apt.clientPhone),
        (c) => {
          const target = c.loyaltyProgress.targetVisits || 10;
          return {
            ...c,
            totalVisits: c.totalVisits + 1,
            totalSpend: c.totalSpend + apt.price,
            lastVisitDate: todayStr(),
            loyaltyProgress: {
              currentVisits: (c.loyaltyProgress.currentVisits + 1) % target,
              targetVisits: target
            }
          };
        }
      );

      setTimeout(() => {
        addToast({
          type: 'whatsapp',
          title: 'Post-Cut Loyalty Message Dispatched',
          message: `Sent WhatsApp feedback & 10% rebook incentive to ${apt.clientName}.`
        });
      }, 1000);
    }
  };

  // ---- Clients ----

  const addClient = (
    clientData: Omit<Client, 'id' | 'joinedDate' | 'lastVisitDate' | 'totalVisits' | 'totalSpend' | 'loyaltyTier' | 'loyaltyProgress' | 'cutHistory'>
  ): Client => {
    const tempId = 'client-tmp-' + Date.now();
    const today = todayStr();
    const barberName =
      barbers.find((b) => b.id === clientData.preferredBarberId)?.name || barbers[0]?.name || '';

    const newClient: Client = {
      ...clientData,
      id: tempId,
      avatarUrl: clientData.avatarUrl || avatarFor(clientData.name),
      joinedDate: today,
      lastVisitDate: today,
      totalVisits: 0,
      totalSpend: 0,
      loyaltyTier: 'Regular',
      loyaltyProgress: { currentVisits: 0, targetVisits: 10 },
      cutHistory: [
        {
          date: today,
          barberName,
          notes: 'Initial styling consultation and profile setup.',
          guardSizes: clientData.stylePreferences.guardSides,
          finishProduct: 'Matte Clay Cream'
        }
      ]
    };

    setClients((prev) => [newClient, ...prev]);
    addToast({
      type: 'success',
      title: 'Customer Profile Created',
      message: `${newClient.name} added with style specifications & reminder preferences.`
    });

    (async () => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientToRow(newClient)])
        .select()
        .single();
      if (error || !data) {
        setClients((prev) => prev.filter((c) => c.id !== tempId));
        reportError('Saving client failed', error);
        return;
      }
      const saved = mapClient(data);
      setClients((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
      setSelectedClient((cur) => (cur && cur.id === tempId ? saved : cur));
    })();

    return newClient;
  };

  const updateClientNotes = (clientId: string, note: CutFormulaNote) => {
    const updated = mutateClient(
      (c) => c.id === clientId,
      (c) => ({ ...c, cutHistory: [note, ...c.cutHistory] })
    );
    if (updated && selectedClient && selectedClient.id === clientId) {
      setSelectedClient(updated);
    }
    addToast({
      type: 'info',
      title: 'Cut Formula Saved',
      message: `Updated barber formula specs for ${updated?.name || selectedClient?.name || 'client'}.`
    });
  };
  const deleteClient = (clientId: string) => {
  const c = clientsRef.current.find((x) => x.id === clientId);
  const list = clientsRef.current.filter((x) => x.id !== clientId);
  clientsRef.current = list;
  setClients(list);
  setSelectedClient((cur) => (cur && cur.id === clientId ? null : cur));
  const n = dbId(clientId);
  if (n !== null) {
    void run('Deleting client', supabase.from('clients').delete().eq('id', n));
  }
  addToast({
    type: 'info',
    title: 'Client Removed',
    message: `${c?.name || 'Client'} was removed from the directory.`
  });
};
  // ---- Automations & reminders ----

  const toggleAutomationRule = (ruleId: string) => {
    const rule = automations.find((r) => r.id === ruleId);
    if (!rule) return;
    const active = !rule.active;
    setAutomations((prev) => prev.map((r) => (r.id === ruleId ? { ...r, active } : r)));
    const n = dbId(ruleId);
    if (n !== null) {
      void run('Updating automation', supabase.from('automations').update({ active }).eq('id', n));
    }
  };

  const sendSimulatedReminder = (appointmentId: string, channel: ReminderChannel, ruleTitle: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    pushReminderLog({
      appointmentId,
      clientName: apt.clientName,
      clientPhone: apt.clientPhone,
      barberName: apt.barberName,
      timeSlot: `${apt.date} ${apt.time}`,
      channel,
      ruleTitle,
      status: 'delivered',
      messagePreview: `Hi ${apt.clientName}, this is FadeCraft Studio! Reminder for your ${apt.serviceName} with ${apt.barberName} at ${apt.time}. Reply 1 to CONFIRM.`
    });

    const reminderStatus = {
      ...apt.reminderStatus,
      lastSentChannel: channel,
      lastSentTimestamp: `Sent just now via ${channel.toUpperCase()}`
    };
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, reminderStatus } : a)));
    const n = dbId(appointmentId);
    if (n !== null) {
      void run(
        'Updating reminder status',
        supabase.from('bookings').update({ reminder_status: reminderStatus }).eq('id', n)
      );
    }

    addToast({
      type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      title: `Instant ${channel.toUpperCase()} Reminder Sent`,
      message: `Dispatched to ${apt.clientName} (${apt.clientPhone}) for Chair #${apt.chairNumber}.`
    });
  };

  // ---- Barbers ----

  const updateBarberShifts = (barberId: string, shifts: DayShift[]) => {
    mutateBarber(barberId, (b) => ({ ...b, shifts }), true);
    addToast({
      type: 'success',
      title: 'Shift Schedule Updated',
      message: 'Weekly work hours and break slots saved.'
    });
  };

  const updateBarberDayShift = (barberId: string, dayOfWeek: DayOfWeek, updates: Partial<DayShift>) => {
    mutateBarber(barberId, (b) => ({
      ...b,
      shifts: b.shifts.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, ...updates } : s))
    }));
  };

  const addBarberBreak = (barberId: string, dayOfWeek: DayOfWeek, breakSlot: Omit<BreakSlot, 'id'>) => {
    const newBreak: BreakSlot = { ...breakSlot, id: 'brk-' + Date.now() };
    mutateBarber(
      barberId,
      (b) => ({
        ...b,
        shifts: b.shifts.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, breaks: [...s.breaks, newBreak] } : s
        )
      }),
      true
    );
    addToast({
      type: 'info',
      title: 'Break Scheduled',
      message: `${breakSlot.label} added (${breakSlot.startTime} - ${breakSlot.endTime}) for ${dayOfWeek}.`
    });
  };

  const removeBarberBreak = (barberId: string, dayOfWeek: DayOfWeek, breakId: string) => {
    mutateBarber(
      barberId,
      (b) => ({
        ...b,
        shifts: b.shifts.map((s) =>
          s.dayOfWeek === dayOfWeek
            ? { ...s, breaks: s.breaks.filter((brk) => brk.id !== breakId) }
            : s
        )
      }),
      true
    );
    addToast({
      type: 'info',
      title: 'Break Removed',
      message: `Break period deleted from ${dayOfWeek} schedule.`
    });
  };

  const updateBarberStatus = (barberId: string, status: Barber['status']) => {
    const barber = barbers.find((b) => b.id === barberId);
    mutateBarber(barberId, (b) => ({ ...b, status }), true);
    addToast({
      type: status === 'on_break' ? 'info' : 'success',
      title: 'Barber Status Changed',
      message: `${barber?.name || 'Barber'} is now marked as ${status.replace('_', ' ').toUpperCase()}.`
    });
  };

  // ---- Inventory ----

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    const tempId = 'inv-tmp-' + Date.now();
    const newItem: InventoryItem = {
      ...itemData,
      id: tempId,
      status: stockStatus(itemData.currentStock, itemData.minStockThreshold)
    };

    setInventory((prev) => [newItem, ...prev]);
    addToast({
      type: 'success',
      title: 'Supply Item Added',
      message: `${newItem.name} registered under ${newItem.category.toUpperCase()}.`
    });

    (async () => {
      const { data, error } = await supabase
        .from('inventory')
        .insert([inventoryToRow(newItem)])
        .select()
        .single();
      if (error || !data) {
        setInventory((prev) => prev.filter((i) => i.id !== tempId));
        reportError('Saving inventory item failed', error);
        return;
      }
      const saved = mapInventory(data);
      setInventory((prev) => prev.map((i) => (i.id === tempId ? saved : i)));
    })();
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    mutateInventory(id, (item) => {
      const validStock = Math.max(0, newStock);
      return {
        ...item,
        currentStock: validStock,
        status: stockStatus(validStock, item.minStockThreshold)
      };
    });
  };

  const adjustInventoryStock = (id: string, delta: number) => {
    const item = inventoryRef.current.find((i) => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.currentStock + delta);

    if (newStock <= item.minStockThreshold && item.currentStock > item.minStockThreshold) {
      addToast({
        type: 'sms',
        title: 'Low Stock Alert Triggered',
        message: `${item.name} is down to ${newStock} ${item.unit} (Threshold: ${item.minStockThreshold}).`
      });
    }

    mutateInventory(id, (i) => ({
      ...i,
      currentStock: newStock,
      status: stockStatus(newStock, i.minStockThreshold)
    }));
  };

  const restockInventoryItem = (id: string, quantityToAdd: number) => {
    const item = inventoryRef.current.find((i) => i.id === id);
    mutateInventory(id, (i) => {
      const newStock = i.currentStock + quantityToAdd;
      return {
        ...i,
        currentStock: newStock,
        lastRestockedDate: todayStr(),
        status: stockStatus(newStock, i.minStockThreshold)
      };
    });
    addToast({
      type: 'success',
      title: 'Stock Replenished',
      message: `Added +${quantityToAdd} ${item?.unit || 'units'} to ${item?.name || 'supply item'}.`
    });
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    const n = dbId(id);
    if (n !== null) {
      void run('Deleting inventory item', supabase.from('inventory').delete().eq('id', n));
    }
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Supply item was removed from salon inventory.'
    });
  };

  // ---- Walk-in queue ----

  const suggestNextAvailableBarber = (preferredBarberId: string = 'any') => {
    if (barbers.length === 0) {
      return { barber: PLACEHOLDER_BARBER, estimatedWaitMinutes: 0, reason: 'No barbers configured yet' };
    }

    const today = todayName();
    const availableBarbers = barbers.filter((b) => {
      const shift = b.shifts.find((s) => s.dayOfWeek === today);
      return shift?.isWorking && b.status !== 'offline';
    });

    if (availableBarbers.length === 0) {
      return { barber: barbers[0], estimatedWaitMinutes: 25, reason: 'All chairs offline' };
    }

    if (preferredBarberId && preferredBarberId !== 'any') {
      const requested = barbers.find((b) => b.id === preferredBarberId) || barbers[0];
      let wait = 0;
      let reason = 'Chair is ready immediately';

      if (requested.status === 'in_service') {
        wait = 18;
        reason = 'Currently in chair with client (~18 mins left)';
      } else if (requested.status === 'on_break') {
        wait = 25;
        reason = 'On scheduled break (~25 mins)';
      }

      return { barber: requested, estimatedWaitMinutes: wait, reason };
    }

    const freeBarber = availableBarbers.find((b) => b.status === 'active');
    if (freeBarber) {
      return {
        barber: freeBarber,
        estimatedWaitMinutes: 0,
        reason: `Chair #${freeBarber.chairNumber} is open and ready immediately`
      };
    }

    const ranked = [...availableBarbers].sort((a, b) => {
      const waitA = a.status === 'in_service' ? 12 : 25;
      const waitB = b.status === 'in_service' ? 12 : 25;
      return waitA - waitB;
    });

    const bestChoice = ranked[0];
    const estimatedWait = bestChoice.status === 'in_service' ? 10 : 20;

    return {
      barber: bestChoice,
      estimatedWaitMinutes: estimatedWait,
      reason: `Chair #${bestChoice.chairNumber} (${bestChoice.name}) finishes current service in ~${estimatedWait}m`
    };
  };

  const addWalkIn = (walkInData: {
    clientName: string;
    clientPhone: string;
    serviceId: string;
    preferredBarberId: string;
    notes?: string;
  }) => {
    const service = services.find((s) => s.id === walkInData.serviceId) || services[0];
    if (!service) {
      addToast({
        type: 'info',
        title: 'No services configured',
        message: 'Add at least one service (table: services) before adding walk-ins.'
      });
      return;
    }

    const suggestion = suggestNextAvailableBarber(walkInData.preferredBarberId);
    const tempId = 'walkin-tmp-' + Date.now();

    const newWalkIn: WalkInQueueItem = {
      id: tempId,
      clientName: walkInData.clientName,
      clientPhone: walkInData.clientPhone,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDurationMinutes: service.durationMinutes,
      preferredBarberId: walkInData.preferredBarberId,
      suggestedBarberId: suggestion.barber.id,
      suggestedBarberName: suggestion.barber.name,
      suggestedChairNumber: suggestion.barber.chairNumber,
      estimatedWaitMinutes: suggestion.estimatedWaitMinutes,
      joinedTime: nowTime(),
      status: 'waiting',
      notes: walkInData.notes || 'In-shop walk-in guest'
    };

    setWalkIns((prev) => [...prev, newWalkIn]);

    addToast({
      type: 'success',
      title: 'Walk-in Added to Queue',
      message: `${newWalkIn.clientName} added. Auto-suggested: ${suggestion.barber.name} (Chair #${suggestion.barber.chairNumber} · ~${suggestion.estimatedWaitMinutes}m wait).`
    });

    (async () => {
      const { data, error } = await supabase
        .from('walk_ins')
        .insert([walkInToRow(newWalkIn)])
        .select()
        .single();
      if (error || !data) {
        setWalkIns((prev) => prev.filter((w) => w.id !== tempId));
        reportError('Saving walk-in failed', error);
        return;
      }
      const saved = mapWalkIn(data);
      setWalkIns((prev) => prev.map((w) => (w.id === tempId ? saved : w)));
    })();
  };

  const setWalkInStatus = (walkInId: string, status: WalkInQueueItem['status']) => {
    const n = dbId(walkInId);
    if (n !== null) {
      void run('Updating walk-in', supabase.from('walk_ins').update({ status }).eq('id', n));
    }
  };

  const seatWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    if (!item) return;

    setWalkIns((prev) => prev.filter((w) => w.id !== walkInId));
    setWalkInStatus(walkInId, 'seated');

    addAppointment({
      clientId: '',
      clientName: item.clientName,
      clientPhone: item.clientPhone,
      clientAvatar: avatarFor(item.clientName),
      barberId: item.suggestedBarberId,
      barberName: item.suggestedBarberName,
      chairNumber: item.suggestedChairNumber,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      price: item.servicePrice,
      date: todayStr(),
      time: nowTime(),
      durationMinutes: item.serviceDurationMinutes,
      status: 'in_chair',
      notes: item.notes || 'Walk-in guest seated from waitlist queue'
    });

    if (item.suggestedBarberId) {
      mutateBarber(item.suggestedBarberId, (b) => ({ ...b, status: 'in_service' }), true);
    }

    addToast({
      type: 'success',
      title: 'Guest Seated in Chair',
      message: `${item.clientName} is now in Chair #${item.suggestedChairNumber} with ${item.suggestedBarberName}.`
    });
  };

  const callWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    if (!item) return;

    setWalkIns((prev) => prev.map((w) => (w.id === walkInId ? { ...w, status: 'called' } : w)));
    setWalkInStatus(walkInId, 'called');

    addToast({
      type: 'sms',
      title: 'Buzzer SMS Dispatched to Client',
      message: `Sent to ${item.clientName} (${item.clientPhone}): "Your chair with ${item.suggestedBarberName} is ready now!"`
    });
  };

  const cancelWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    setWalkIns((prev) => prev.filter((w) => w.id !== walkInId));
    setWalkInStatus(walkInId, 'cancelled');
    addToast({
      type: 'info',
      title: 'Walk-in Removed',
      message: `${item?.clientName || 'Guest'} removed from waiting queue.`
    });
  };

  // ---- Billing ----

  const nextInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const max = invoicesRef.current.reduce((m, i) => {
      const n = parseInt(String(i.id).split('-').pop() ?? '0', 10);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 842);
    return `INV-${year}-${String(max + 1).padStart(4, '0')}`;
  };

  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'date' | 'time'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: nextInvoiceNumber(),
      date: todayStr(),
      time: nowTime(),
      receiptSentVia: invoiceData.receiptSentVia || 'none'
    };

    const list = [newInvoice, ...invoicesRef.current];
    invoicesRef.current = list;
    setInvoices(list);

    void run('Saving invoice', supabase.from('invoices').insert([invoiceToRow(newInvoice)]));

    if (newInvoice.status === 'paid') {
      mutateClient(
        (c) =>
          (!!newInvoice.clientId && c.id === newInvoice.clientId) ||
          (!!newInvoice.clientPhone && c.phone === newInvoice.clientPhone),
        (c) => ({
          ...c,
          totalSpend: c.totalSpend + newInvoice.totalAmount,
          totalVisits: c.totalVisits + 1,
          lastVisitDate: todayStr()
        })
      );

      if (newInvoice.appointmentId) markAppointmentCompleted(newInvoice.appointmentId);

      addToast({
        type: 'success',
        title: 'Payment Processed Successfully',
        message: `${newInvoice.clientName} paid $${newInvoice.totalAmount.toFixed(2)} via ${newInvoice.paymentMethod.replace('_', ' ').toUpperCase()}`
      });
    }

    return newInvoice;
  };

  const patchInvoice = (invoiceId: string, patch: Row) => {
    void run('Updating invoice', supabase.from('invoices').update(patch).eq('invoice_number', invoiceId));
  };

  const settleInvoice = (invoiceId: string, paymentMethod: PaymentMethod, tipAmount: number) => {
    const inv = invoicesRef.current.find((i) => i.id === invoiceId);
    if (!inv) return;

    const updatedTotal = inv.subtotal + inv.taxAmount + tipAmount - inv.discountAmount;
    const updated: Invoice = {
      ...inv,
      status: 'paid',
      paymentMethod,
      tipAmount,
      totalAmount: updatedTotal,
      paymentDetails: {
        cardBrand: paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'card' ? 'Visa' : 'Cash',
        cardLast4: paymentMethod === 'cash' ? undefined : '5521',
        transactionRef: `tx_live_${Math.random().toString(36).substring(2, 9)}`
      }
    };

    const list = invoicesRef.current.map((i) => (i.id === invoiceId ? updated : i));
    invoicesRef.current = list;
    setInvoices(list);

    patchInvoice(invoiceId, {
      status: updated.status,
      payment_method: updated.paymentMethod,
      tip_amount: updated.tipAmount,
      total_amount: updated.totalAmount,
      payment_details: updated.paymentDetails ?? null
    });

    mutateClient(
      (c) => (!!inv.clientId && c.id === inv.clientId) || (!!inv.clientPhone && c.phone === inv.clientPhone),
      (c) => ({
        ...c,
        totalSpend: c.totalSpend + updatedTotal,
        totalVisits: c.totalVisits + 1,
        lastVisitDate: todayStr()
      })
    );

    if (inv.appointmentId) markAppointmentCompleted(inv.appointmentId);

    addToast({
      type: 'success',
      title: `Invoice ${inv.id} Settled`,
      message: `Received $${updatedTotal.toFixed(2)} from ${inv.clientName} (Chair #${inv.chairNumber}).`
    });
  };

  const refundInvoice = (invoiceId: string) => {
    const inv = invoicesRef.current.find((i) => i.id === invoiceId);
    if (!inv) return;

    const list = invoicesRef.current.map((i) =>
      i.id === invoiceId ? { ...i, status: 'refunded' as Invoice['status'] } : i
    );
    invoicesRef.current = list;
    setInvoices(list);
    patchInvoice(invoiceId, { status: 'refunded' });

    addToast({
      type: 'info',
      title: `Invoice ${inv.id} Refunded`,
      message: `Refund of $${inv.totalAmount.toFixed(2)} issued to ${inv.clientName}.`
    });
  };

  const sendReceiptSms = (invoiceId: string) => {
    const inv = invoicesRef.current.find((i) => i.id === invoiceId);
    if (!inv) return;

    const list = invoicesRef.current.map((i) =>
      i.id === invoiceId ? { ...i, receiptSentVia: 'sms' as Invoice['receiptSentVia'] } : i
    );
    invoicesRef.current = list;
    setInvoices(list);
    patchInvoice(invoiceId, { receipt_sent_via: 'sms' });

    addToast({
      type: 'sms',
      title: 'Digital Receipt SMS Sent',
      message: `Receipt for ${inv.id} ($${inv.totalAmount.toFixed(2)}) sent to ${inv.clientName} (${inv.clientPhone}).`
    });
  };

  return (
    <SalonContext.Provider
      value={{
        activeTab,
        setActiveTab,
        appointments,
        barbers,
        clients,
        services,
        automations,
        reminderLogs,
        selectedClient,
        setSelectedClient,
        isBookingModalOpen,
        setIsBookingModalOpen,
        isNewClientModalOpen,
        setIsNewClientModalOpen,
        isAddInventoryModalOpen,
        setIsAddInventoryModalOpen,
        isAddWalkInModalOpen,
        setIsAddWalkInModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        dismissToast,
        addToast,
        refreshData,
        addAppointment,
        updateAppointmentStatus,
        addClient,
        updateClientNotes,
        toggleAutomationRule,
        sendSimulatedReminder,
        updateBarberShifts,
        updateBarberDayShift,
        addBarberBreak,
        removeBarberBreak,
        updateBarberStatus,
        inventory,
        lowStockCount,
        addInventoryItem,
        updateInventoryStock,
        adjustInventoryStock,
        restockInventoryItem,
        deleteInventoryItem,
        walkIns,
        suggestNextAvailableBarber,
        addWalkIn,
        seatWalkIn,
        callWalkIn,
        cancelWalkIn,
        invoices,
        selectedInvoice,
        setSelectedInvoice,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutAppointment,
        setCheckoutAppointment,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        createInvoice,
        settleInvoice,
        refundInvoice,
        sendReceiptSms
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
