import { supabase } from '../supabaseClient';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  BillingLineItem,
  PaymentMethod,
  InvoiceStatus
} from '../types';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_BARBERS, 
  INITIAL_CLIENTS, 
  INITIAL_SERVICES, 
  INITIAL_AUTOMATIONS, 
  INITIAL_REMINDER_LOGS,
  INITIAL_INVENTORY,
  INITIAL_WALKINS,
  INITIAL_INVOICES
} from '../data/mockData';

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
  
  // Actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'reminderStatus'>) => void;
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

const LOCAL_STORAGE_KEYS = {
  APPOINTMENTS: 'fadecraft_appointments_v1',
  CLIENTS: 'fadecraft_clients_v1',
  BARBERS: 'fadecraft_barbers_v2',
  INVENTORY: 'fadecraft_inventory_v1',
  WALKINS: 'fadecraft_walkins_v1',
  AUTOMATIONS: 'fadecraft_automations_v1',
  LOGS: 'fadecraft_logs_v1',
  INVOICES: 'fadecraft_invoices_v1',
};

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BARBERS);
      return saved ? JSON.parse(saved) : INITIAL_BARBERS;
    } catch {
      return INITIAL_BARBERS;
    }
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTOMATIONS);
      return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
    } catch {
      return INITIAL_AUTOMATIONS;
    }
  });
useEffect(() => {
  async function fetchSalonData() {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (bookingsError) console.error('bookings:', bookingsError);
    if (clientsError) console.error('clients:', clientsError);

    if (!bookingsError && bookingsData) {
      setAppointments(bookingsData as Appointment[]);
    }
    if (!clientsError && clientsData) {
      setClients(clientsData as Client[]);
    }
  }

  }
};

  fetchSalonData();

  const channel = supabase
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bookings' },
      (payload) => {
        setAppointments((prev) => [payload.new as Appointment, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
const addAppointment = async (newAppointment: Omit<Appointment, 'id' | 'reminderStatus'>) => {
  // 1. إرسال الحجز إلى قاعدة بيانات Supabase
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        client_name: newAppointment.clientName,
        client_phone: newAppointment.clientPhone,
        service_name: newAppointment.serviceName,
        price: newAppointment.price,
        barber_id: newAppointment.barberId,
        status: newAppointment.status || 'scheduled'
      }
    ])
    .select();

  if (error) {
    console.error('Error adding appointment to Supabase:', error);
    return;
  }

  // 2. تحديث الحجوزات في الواجهة فورًا بالبيانات المرجعة من Supabase
  if (data && data.length > 0) {
    const savedAppointment = data[0];
    setAppointments((prev) => [savedAppointment, ...prev]);

  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_REMINDER_LOGS;
    } catch {
      return INITIAL_REMINDER_LOGS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [walkIns, setWalkIns] = useState<WalkInQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WALKINS);
      return saved ? JSON.parse(saved) : INITIAL_WALKINS;
    } catch {
      return INITIAL_WALKINS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

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

  // Count items below minimum threshold
  const lowStockCount = inventory.filter((item) => item.currentStock <= item.minStockThreshold).length;

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Failed saving appointments', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.warn('Failed saving clients', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
    } catch (e) {
      console.warn('Failed saving barbers', e);
    }
  }, [barbers]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.warn('Failed saving inventory', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.WALKINS, JSON.stringify(walkIns));
    } catch (e) {
      console.warn('Failed saving walk-ins', e);
    }
  }, [walkIns]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations));
    } catch (e) {
      console.warn('Failed saving automations', e);
    }
  }, [automations]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(reminderLogs));
    } catch (e) {
      console.warn('Failed saving logs', e);
    }
  }, [reminderLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.warn('Failed saving invoices', e);
    }
  }, [invoices]);

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

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'reminderStatus'>) => {
    const newId = 'apt-' + Date.now();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      reminderStatus: {
        sent24h: false,
        sent2h: false,
        lastSentChannel: 'sms',
        lastSentTimestamp: 'Scheduled automatically'
      }
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Also simulate immediate 24h booking confirmation reminder dispatch!
    addToast({
      type: 'sms',
      title: 'Appointment Scheduled & Reminder Queued',
      message: `Confirmed booking for ${appointmentData.clientName} with ${appointmentData.barberName} at ${appointmentData.time}.`
    });

    // Automatically create a reminder log entry
    const newLog: ReminderLog = {
      id: 'log-' + Date.now(),
      appointmentId: newId,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      barberName: appointmentData.barberName,
      timeSlot: `${appointmentData.date} ${appointmentData.time}`,
      channel: 'sms',
      ruleTitle: 'Instant Booking Confirmation',
      timestamp: 'Just now',
      status: 'delivered',
      messagePreview: `Hi ${appointmentData.clientName}, your cut with ${appointmentData.barberName} is set for ${appointmentData.date} at ${appointmentData.time}!`
    };

    setReminderLogs((prev) => [newLog, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated = { ...apt, status };
          
          // If status completed, update client total visits and lifetime spend
          if (status === 'completed' && apt.status !== 'completed') {
            setClients((clientPrev) =>
              clientPrev.map((c) => {
                if (c.id === apt.clientId) {
                  const newVisits = c.totalVisits + 1;
                  const newSpend = c.totalSpend + apt.price;
                  const target = c.loyaltyProgress.targetVisits;
                  return {
                    ...c,
                    totalVisits: newVisits,
                    totalSpend: newSpend,
                    lastVisitDate: new Date().toISOString().split('T')[0],
                    loyaltyProgress: {
                      currentVisits: (c.loyaltyProgress.currentVisits + 1) % target,
                      targetVisits: target
                    }
                  };
                }
                return c;
              })
            );

            // Auto-trigger post cut review reminder
            setTimeout(() => {
              addToast({
                type: 'whatsapp',
                title: 'Post-Cut Loyalty Message Dispatched',
                message: `Sent WhatsApp feedback & 10% rebook incentive to ${apt.clientName}.`
              });
            }, 1000);
          }

          return updated;
        }
        return apt;
      })
    );
  };

  const addClient = (clientData: Omit<Client, 'id' | 'joinedDate' | 'lastVisitDate' | 'totalVisits' | 'totalSpend' | 'loyaltyTier' | 'loyaltyProgress' | 'cutHistory'>): Client => {
    const newId = 'client-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newClient: Client = {
      ...clientData,
      id: newId,
      joinedDate: today,
      lastVisitDate: today,
      totalVisits: 1,
      totalSpend: 45,
      loyaltyTier: 'Regular',
      loyaltyProgress: {
        currentVisits: 1,
        targetVisits: 10
      },
      cutHistory: [
        {
          date: today,
          barberName: barbers.find(b => b.id === clientData.preferredBarberId)?.name || 'Marcus Vance',
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

    return newClient;
  };

  const updateClientNotes = (clientId: string, note: CutFormulaNote) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = {
            ...c,
            cutHistory: [note, ...c.cutHistory]
          };
          if (selectedClient && selectedClient.id === clientId) {
            setSelectedClient(updated);
          }
          return updated;
        }
        return c;
      })
    );

    addToast({
      type: 'info',
      title: 'Cut Formula Saved',
      message: `Updated barber formula specs for ${selectedClient?.name || 'client'}.`
    });
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomations((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  const sendSimulatedReminder = (appointmentId: string, channel: ReminderChannel, ruleTitle: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const newLog: ReminderLog = {
      id: 'log-' + Date.now(),
      appointmentId,
      clientName: apt.clientName,
      clientPhone: apt.clientPhone,
      barberName: apt.barberName,
      timeSlot: `${apt.date} ${apt.time}`,
      channel,
      ruleTitle,
      timestamp: 'Just now',
      status: 'delivered',
      messagePreview: `Hi ${apt.clientName}, this is FadeCraft Studio! Reminder for your ${apt.serviceName} with ${apt.barberName} at ${apt.time}. Reply 1 to CONFIRM.`
    };

    setReminderLogs((prev) => [newLog, ...prev]);

    // Update appointment status record
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              reminderStatus: {
                ...a.reminderStatus,
                lastSentChannel: channel,
                lastSentTimestamp: `Sent just now via ${channel.toUpperCase()}`
              }
            }
          : a
      )
    );

    addToast({
      type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      title: `Instant ${channel.toUpperCase()} Reminder Sent`,
      message: `Dispatched to ${apt.clientName} (${apt.clientPhone}) for Chair #${apt.chairNumber}.`
    });
  };

  const updateBarberShifts = (barberId: string, shifts: DayShift[]) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === barberId ? { ...b, shifts } : b))
    );
    addToast({
      type: 'success',
      title: 'Shift Schedule Updated',
      message: 'Weekly work hours and break slots saved.'
    });
  };

  const updateBarberDayShift = (barberId: string, dayOfWeek: DayOfWeek, updates: Partial<DayShift>) => {
    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id !== barberId) return b;
        const updatedShifts = b.shifts.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, ...updates } : s
        );
        return { ...b, shifts: updatedShifts };
      })
    );
  };

  const addBarberBreak = (barberId: string, dayOfWeek: DayOfWeek, breakSlot: Omit<BreakSlot, 'id'>) => {
    const id = 'brk-' + Date.now();
    const newBreak: BreakSlot = { ...breakSlot, id };

    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id !== barberId) return b;
        const updatedShifts = b.shifts.map((s) => {
          if (s.dayOfWeek !== dayOfWeek) return s;
          return {
            ...s,
            breaks: [...s.breaks, newBreak]
          };
        });
        return { ...b, shifts: updatedShifts };
      })
    );

    addToast({
      type: 'info',
      title: 'Break Scheduled',
      message: `${breakSlot.label} added (${breakSlot.startTime} - ${breakSlot.endTime}) for ${dayOfWeek}.`
    });
  };

  const removeBarberBreak = (barberId: string, dayOfWeek: DayOfWeek, breakId: string) => {
    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id !== barberId) return b;
        const updatedShifts = b.shifts.map((s) => {
          if (s.dayOfWeek !== dayOfWeek) return s;
          return {
            ...s,
            breaks: s.breaks.filter((brk) => brk.id !== breakId)
          };
        });
        return { ...b, shifts: updatedShifts };
      })
    );

    addToast({
      type: 'info',
      title: 'Break Removed',
      message: `Break period deleted from ${dayOfWeek} schedule.`
    });
  };

  const updateBarberStatus = (barberId: string, status: Barber['status']) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === barberId ? { ...b, status } : b))
    );
    const barber = barbers.find((b) => b.id === barberId);
    addToast({
      type: status === 'on_break' ? 'info' : 'success',
      title: 'Barber Status Changed',
      message: `${barber?.name || 'Barber'} is now marked as ${status.replace('_', ' ').toUpperCase()}.`
    });
  };

  // Inventory Management Methods
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    const id = 'inv-' + Date.now();
    const status: InventoryItem['status'] = 
      itemData.currentStock <= 0 
        ? 'out_of_stock' 
        : itemData.currentStock <= itemData.minStockThreshold 
        ? 'low_stock' 
        : 'in_stock';

    const newItem: InventoryItem = {
      ...itemData,
      id,
      status
    };

    setInventory((prev) => [newItem, ...prev]);
    addToast({
      type: 'success',
      title: 'Supply Item Added',
      message: `${newItem.name} registered under ${newItem.category.toUpperCase()}.`
    });
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const validStock = Math.max(0, newStock);
        const status: InventoryItem['status'] = 
          validStock <= 0 
            ? 'out_of_stock' 
            : validStock <= item.minStockThreshold 
            ? 'low_stock' 
            : 'in_stock';
        return {
          ...item,
          currentStock: validStock,
          status
        };
      })
    );
  };

  const adjustInventoryStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStock = Math.max(0, item.currentStock + delta);
        const status: InventoryItem['status'] = 
          newStock <= 0 
            ? 'out_of_stock' 
            : newStock <= item.minStockThreshold 
            ? 'low_stock' 
            : 'in_stock';
        
        if (newStock <= item.minStockThreshold && item.currentStock > item.minStockThreshold) {
          addToast({
            type: 'sms',
            title: '⚠️ Low Stock Alert Triggered',
            message: `${item.name} is down to ${newStock} ${item.unit} (Threshold: ${item.minStockThreshold}).`
          });
        }

        return {
          ...item,
          currentStock: newStock,
          status
        };
      })
    );
  };

  const restockInventoryItem = (id: string, quantityToAdd: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStock = item.currentStock + quantityToAdd;
        const status: InventoryItem['status'] = 
          newStock <= item.minStockThreshold ? 'low_stock' : 'in_stock';
        return {
          ...item,
          currentStock: newStock,
          lastRestockedDate: new Date().toISOString().split('T')[0],
          status
        };
      })
    );

    const item = inventory.find((i) => i.id === id);
    addToast({
      type: 'success',
      title: 'Stock Replenished',
      message: `Added +${quantityToAdd} ${item?.unit || 'units'} to ${item?.name || 'supply item'}.`
    });
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Supply item was removed from salon inventory.'
    });
  };

  // Walk-in Waitlist Logic: Auto-suggest next available barber
  const suggestNextAvailableBarber = (preferredBarberId: string = 'any') => {
    // Filter barbers working on Tuesday
    const availableBarbers = barbers.filter((b) => {
      const shift = b.shifts.find((s) => s.dayOfWeek === 'Tuesday');
      return shift?.isWorking && b.status !== 'offline';
    });

    if (availableBarbers.length === 0) {
      const fallback = barbers[0];
      return {
        barber: fallback,
        estimatedWaitMinutes: 25,
        reason: 'All chairs offline'
      };
    }

    // If client requested a specific barber
    if (preferredBarberId && preferredBarberId !== 'any') {
      const requested = barbers.find((b) => b.id === preferredBarberId) || barbers[0];
      let wait = 0;
      let reason = 'Chair is ready immediately';

      if (requested.status === 'in_service') {
        wait = 18;
        reason = `Currently in chair with client (~18 mins left)`;
      } else if (requested.status === 'on_break') {
        wait = 25;
        reason = `On scheduled break (~25 mins)`;
      }

      return {
        barber: requested,
        estimatedWaitMinutes: wait,
        reason
      };
    }

    // Auto-Suggest Next Available: Check for immediate free barber
    const freeBarber = availableBarbers.find((b) => b.status === 'active');
    if (freeBarber) {
      return {
        barber: freeBarber,
        estimatedWaitMinutes: 0,
        reason: `Chair #${freeBarber.chairNumber} is open and ready immediately`
      };
    }

    // If all are in service or on break, calculate minimum estimated wait
    // Rank by: in_service first, then on_break
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
    const suggestion = suggestNextAvailableBarber(walkInData.preferredBarberId);
    const now = new Date();
    const joinedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newWalkIn: WalkInQueueItem = {
      id: 'walkin-' + Date.now(),
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
      joinedTime,
      status: 'waiting',
      notes: walkInData.notes || 'In-shop walk-in guest'
    };

    setWalkIns((prev) => [...prev, newWalkIn]);

    addToast({
      type: 'success',
      title: 'Walk-in Added to Queue',
      message: `${newWalkIn.clientName} added. Auto-suggested: ${suggestion.barber.name} (Chair #${suggestion.barber.chairNumber} · ~${suggestion.estimatedWaitMinutes}m wait).`
    });
  };

  const seatWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    if (!item) return;

    // Remove from active queue or mark seated
    setWalkIns((prev) => prev.filter((w) => w.id !== walkInId));

    // Convert into a live appointment with 'in_chair'
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addAppointment({
      clientId: 'client-walkin-' + Date.now(),
      clientName: item.clientName,
      clientPhone: item.clientPhone,
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      barberId: item.suggestedBarberId,
      barberName: item.suggestedBarberName,
      chairNumber: item.suggestedChairNumber,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      price: item.servicePrice,
      date: '2026-09-29',
      time: currentTime,
      durationMinutes: item.serviceDurationMinutes,
      status: 'in_chair',
      notes: item.notes || 'Walk-in guest seated from waitlist queue'
    });

    // Update barber status to in_service
    setBarbers((prev) =>
      prev.map((b) => (b.id === item.suggestedBarberId ? { ...b, status: 'in_service' } : b))
    );

    addToast({
      type: 'success',
      title: 'Guest Seated in Chair',
      message: `${item.clientName} is now in Chair #${item.suggestedChairNumber} with ${item.suggestedBarberName}.`
    });
  };

  const callWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    if (!item) return;

    setWalkIns((prev) =>
      prev.map((w) => (w.id === walkInId ? { ...w, status: 'called' } : w))
    );

    addToast({
      type: 'sms',
      title: 'Buzzer SMS Dispatched to Client',
      message: `Sent to ${item.clientName} (${item.clientPhone}): "Your chair with ${item.suggestedBarberName} is ready now!"`
    });
  };

  const cancelWalkIn = (walkInId: string) => {
    const item = walkIns.find((w) => w.id === walkInId);
    setWalkIns((prev) => prev.filter((w) => w.id !== walkInId));
    addToast({
      type: 'info',
      title: 'Walk-in Removed',
      message: `${item?.clientName || 'Guest'} removed from waiting queue.`
    });
  };

  // Customer Billing & Checkout Methods
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'date' | 'time'>): Invoice => {
    const todayStr = '2026-09-29';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `INV-2026-${String(invoices.length + 843).padStart(4, '0')}`,
      date: todayStr,
      time: nowTime,
      receiptSentVia: invoiceData.receiptSentVia || 'none',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // If invoice is paid, update client's spend and visits, and complete appointment if applicable
    if (newInvoice.status === 'paid') {
      if (newInvoice.clientId) {
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === newInvoice.clientId) {
              const updatedSpend = c.totalSpend + newInvoice.totalAmount;
              const updatedVisits = c.totalVisits + 1;
              return {
                ...c,
                totalSpend: updatedSpend,
                totalVisits: updatedVisits,
                lastVisitDate: todayStr,
              };
            }
            return c;
          })
        );
      }

      if (newInvoice.appointmentId) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === newInvoice.appointmentId ? { ...a, status: 'completed' } : a
          )
        );
      }

      addToast({
        type: 'success',
        title: 'Payment Processed Successfully',
        message: `${newInvoice.clientName} paid $${newInvoice.totalAmount.toFixed(2)} via ${newInvoice.paymentMethod.replace('_', ' ').toUpperCase()}`,
      });
    }

    return newInvoice;
  };

  const settleInvoice = (invoiceId: string, paymentMethod: PaymentMethod, tipAmount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const updatedTotal = inv.subtotal + inv.taxAmount + tipAmount - inv.discountAmount;
          const updatedInv: Invoice = {
            ...inv,
            status: 'paid',
            paymentMethod,
            tipAmount,
            totalAmount: updatedTotal,
            paymentDetails: {
              cardBrand: paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'card' ? 'Visa' : 'Cash',
              cardLast4: paymentMethod === 'cash' ? undefined : '5521',
              transactionRef: `tx_live_${Math.random().toString(36).substring(2, 9)}`,
            },
          };

          // Update client totalSpend
          setClients((clientsPrev) =>
            clientsPrev.map((c) => {
              if (c.id === inv.clientId) {
                return {
                  ...c,
                  totalSpend: c.totalSpend + updatedTotal,
                  totalVisits: c.totalVisits + 1,
                  lastVisitDate: '2026-09-29',
                };
              }
              return c;
            })
          );

          if (inv.appointmentId) {
            setAppointments((aptsPrev) =>
              aptsPrev.map((a) => (a.id === inv.appointmentId ? { ...a, status: 'completed' } : a))
            );
          }

          addToast({
            type: 'success',
            title: `Invoice ${inv.id} Settled`,
            message: `Received $${updatedTotal.toFixed(2)} from ${inv.clientName} (Chair #${inv.chairNumber}).`,
          });

          return updatedInv;
        }
        return inv;
      })
    );
  };

  const refundInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          addToast({
            type: 'info',
            title: `Invoice ${inv.id} Refunded`,
            message: `Refund of $${inv.totalAmount.toFixed(2)} issued to ${inv.clientName}.`,
          });
          return { ...inv, status: 'refunded' };
        }
        return inv;
      })
    );
  };

  const sendReceiptSms = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, receiptSentVia: 'sms' } : i))
    );

    addToast({
      type: 'sms',
      title: 'Digital Receipt SMS Sent',
      message: `Receipt for ${inv.id} ($${inv.totalAmount.toFixed(2)}) sent to ${inv.clientName} (${inv.clientPhone}).`,
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
