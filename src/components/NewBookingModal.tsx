import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Check, 
  MessageSquare, 
  Phone, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const NewBookingModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    clients, 
    barbers, 
    services, 
    addAppointment,
    addClient 
  } = useSalon();

  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [bookingDate, setBookingDate] = useState('2026-09-29');
  const [bookingTime, setBookingTime] = useState('14:30');
  const [notes, setNotes] = useState('');
  const [enableSmsReminder, setEnableSmsReminder] = useState(true);

  if (!isBookingModalOpen) return null;

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];
  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const existingClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bookingDayName = dayNames[new Date(bookingDate + 'T12:00:00').getDay()];
  const barberShift = selectedBarber?.shifts?.find((s) => s.dayOfWeek === bookingDayName);
  const activeBreak = barberShift?.breaks?.find((b) => bookingTime >= b.startTime && bookingTime < b.endTime);

  const timeSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00',
    '13:00', '13:45', '14:30', '15:15', '16:00',
    '16:45', '17:30', '18:15', '19:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientId = selectedClientId;
    let clientName = existingClient?.name || 'Walk-in Guest';
    let clientPhone = existingClient?.phone || '+1 (305) 555-0199';
    let clientAvatar = existingClient?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

    if (isNewClient) {
      if (!newClientName || !newClientPhone) return;
      const created = addClient({
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail || `${newClientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        preferredBarberId: selectedBarber.id,
        stylePreferences: {
          hairStyle: 'Modern Fade',
          guardSides: '#1.5 to skin',
          topLength: 'Scissor texturing',
          beardStyle: 'Natural edge',
          hairType: 'Standard',
          sensitivities: 'None reported'
        },
        reminderPreferences: {
          sms: true,
          whatsapp: true,
          email: false,
          hoursNotice: 24
        }
      });
      clientId = created.id;
      clientName = created.name;
      clientPhone = created.phone;
      clientAvatar = created.avatarUrl;
    }

    addAppointment({
      clientId,
      clientName,
      clientAvatar,
      clientPhone,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      chairNumber: selectedBarber.chairNumber,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: selectedService.durationMinutes,
      status: 'scheduled',
      notes: notes || 'Standard booking with automated reminder queued.'
    });

    setIsBookingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-slate-900">New Appointment Booking</h2>
              <span className="text-[11px] text-slate-400">Keystone Barber Downtown Flagship</span>
            </div>
          </div>
          <button
            onClick={() => setIsBookingModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          
          {/* Client Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">Customer</label>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs font-semibold text-slate-600 hover:text-black underline"
              >
                {isNewClient ? '← Select existing client' : '+ Register new client'}
              </button>
            </div>

            {isNewClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone (SMS Reminders)</label>
                  <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+1 (305) 555-0100"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="julian@example.com"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.phone} ({c.loyaltyTier})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Barber & Chair Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-900">Select Barber & Chair</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {barbers.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedBarberId === b.id
                      ? 'border-black bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <img
                    src={b.avatarUrl}
                    alt={b.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold truncate">{b.name}</span>
                    <span className={`text-[10px] ${selectedBarberId === b.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      Chair #{b.chairNumber}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-900">Grooming Service</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedServiceId === s.id
                      ? 'border-black bg-slate-50 ring-1 ring-black'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <span className="text-xs font-bold font-mono text-slate-900">${s.price}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{s.durationMinutes} mins</span>
                    {s.popular && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Slot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">Time Slot</label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden font-mono"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} ({slot < '12:00' ? 'AM' : 'PM'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Barber Shift Schedule & Break Conflict Callout */}
          {barberShift && (
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
              !barberShift.isWorking
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : activeBreak
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold">
                  {selectedBarber.name}'s Shift ({bookingDayName}):
                </span>
                {!barberShift.isWorking ? (
                  <span>Scheduled as Day Off. Barber may not be available.</span>
                ) : (
                  <span>
                    Working hours: {barberShift.startTime} - {barberShift.endTime}
                    {barberShift.breaks.length > 0 && ` · Breaks: ${barberShift.breaks.map(b => `${b.label} (${b.startTime}-${b.endTime})`).join(', ')}`}
                  </span>
                )}
                {activeBreak && (
                  <span className="font-semibold text-amber-900 mt-1">
                    ⚠️ Note: Selected time ({bookingTime}) overlaps with {activeBreak.label} ({activeBreak.startTime} - {activeBreak.endTime}).
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Styling Notes & Requests</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Skin fade with razor finish, sensitive scalp..."
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
            />
          </div>

          {/* Automated Reminder Opt-in */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">
                  Automated Appointment Reminders
                </span>
                <span className="text-[11px] text-slate-500">
                  Sends 24h confirmation SMS & 2h arrival notice automatically.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableSmsReminder}
              onChange={(e) => setEnableSmsReminder(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Confirm & Schedule</span>
              <span className="text-[#FEE500] font-mono">${selectedService.price}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
