import React, { useState } from 'react';
import { 
  Scissors, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageSquare,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { AppointmentStatus } from '../types';

export const BookingsView: React.FC = () => {
  const { 
    appointments, 
    barbers, 
    updateAppointmentStatus, 
    setIsBookingModalOpen,
    setSelectedClient,
    clients,
    sendSimulatedReminder 
  } = useSalon();

  const [selectedChair, setSelectedChair] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesChair = selectedChair === 'all' || apt.chairNumber === selectedChair;
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    return matchesChair && matchesStatus;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_chair':
        return (
          <span className="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            In Chair
          </span>
        );
      case 'arrived':
        return (
          <span className="px-2.5 py-1 bg-[#FEE500] text-black font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-black" />
            Arrived
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-full uppercase tracking-wider">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase tracking-wider">
            Completed
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-full uppercase tracking-wider">
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Chair & Booking Management</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-semibold">
              {appointments.length} Total Bookings
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live chair schedules, walk-in progression, appointment statuses, and instant automated notifications.
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="px-4 py-2 bg-black text-white hover:bg-slate-800 transition-colors rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Chair Filters & Status Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Chair Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 text-xs overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setSelectedChair('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors ${
              selectedChair === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Chairs (5)
          </button>
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedChair(b.chairNumber)}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedChair === b.chairNumber
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Chair {b.chairNumber}</span>
              <span className="text-[10px] opacity-70">({b.name.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 text-xs">
          {['all', 'in_chair', 'arrived', 'confirmed', 'scheduled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                selectedStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status === 'in_chair' ? 'In Chair' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <Scissors className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="text-sm font-bold text-slate-800">No appointments found</span>
            <p className="text-xs text-slate-400 mt-1">Try switching chair filters or schedule a new client booking.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const client = clients.find(c => c.id === apt.clientId);
            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top Bar: Time & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {apt.time} ({apt.durationMinutes}m)
                      </span>
                      <span className="text-[11px] text-slate-400">· {apt.date}</span>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  {/* Client Info */}
                  <div 
                    onClick={() => client && setSelectedClient(client)}
                    className="flex items-center gap-3.5 mt-4 cursor-pointer group"
                  >
                    <img
                      src={apt.clientAvatar}
                      alt={apt.clientName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-black transition-all shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-black">
                        {apt.clientName}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 mt-0.5">
                        {apt.serviceName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Chair #{apt.chairNumber} · {apt.barberName}
                      </span>
                    </div>
                  </div>

                  {/* Notes & Specs */}
                  {apt.notes && (
                    <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-snug">
                      <span className="font-semibold text-slate-800">Cut notes: </span>
                      {apt.notes}
                    </div>
                  )}

                  {/* Reminder Dispatch Status */}
                  <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>{apt.reminderStatus.lastSentTimestamp || 'Automated queue active'}</span>
                    </div>
                    <button
                      onClick={() => sendSimulatedReminder(apt.id, 'sms', 'Manual Salon Ping')}
                      className="text-slate-600 hover:text-black font-semibold text-[10px] underline"
                    >
                      Resend SMS
                    </button>
                  </div>
                </div>

                {/* Footer Controls & Status Advance */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-slate-900">
                    ${apt.price}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'arrived')}
                        className="px-2.5 py-1 bg-[#FEE500] hover:bg-[#FEE500]/80 text-black text-xs font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        Mark Arrived
                      </button>
                    )}
                    {apt.status === 'arrived' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'in_chair')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        Seat in Chair
                      </button>
                    )}
                    {apt.status === 'in_chair' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                        className="px-3 py-1 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        Complete & Checkout
                      </button>
                    )}
                    {apt.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid & Logged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
