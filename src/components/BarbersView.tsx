import React, { useState } from 'react';
import { 
  UserCheck, 
  Star, 
  Scissors, 
  Award, 
  Clock, 
  Calendar, 
  Coffee, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Copy, 
  ChevronRight,
  Sun,
  Timer,
  X,
  Edit3
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { Barber, DayOfWeek, DayShift, BreakSlot } from '../types';
import { DAYS_OF_WEEK } from '../data/mockData';

export const BarbersView: React.FC = () => {
  const { 
    barbers, 
    appointments, 
    updateBarberDayShift, 
    addBarberBreak, 
    removeBarberBreak,
    updateBarberStatus,
    updateBarberShifts,
    addToast 
  } = useSalon();

  // Active sub-tab: 'shifts' | 'weekly' | 'profiles'
  const [activeSubTab, setActiveSubTab] = useState<'shifts' | 'weekly' | 'profiles'>('shifts');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Tuesday'); // Defaults to today Tuesday
  
  // State for adding a break inline
  const [activeAddBreakBarberId, setActiveAddBreakBarberId] = useState<string | null>(null);
  const [newBreakLabel, setNewBreakLabel] = useState('Coffee Break');
  const [newBreakStart, setNewBreakStart] = useState('15:00');
  const [newBreakEnd, setNewBreakEnd] = useState('15:30');

  // State for Full Weekly Schedule Editor Modal
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  // Helper to calculate total shift duration minus breaks in hours
  const calculateWorkingHours = (shift: DayShift): string => {
    if (!shift.isWorking) return '0.0';
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    shift.breaks.forEach((b) => {
      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      totalMinutes -= ((bEndH * 60 + bEndM) - (bStartH * 60 + bStartM));
    });

    return (Math.max(0, totalMinutes) / 60).toFixed(1);
  };

  // Helper to calculate total shop hours scheduled for the selected day
  const totalShopHoursToday = barbers.reduce((acc, barber) => {
    const shift = barber.shifts.find(s => s.dayOfWeek === selectedDay);
    if (!shift || !shift.isWorking) return acc;
    return acc + parseFloat(calculateWorkingHours(shift));
  }, 0).toFixed(1);

  const activeBarbersCount = barbers.filter(b => {
    const shift = b.shifts.find(s => s.dayOfWeek === selectedDay);
    return shift?.isWorking;
  }).length;

  const onBreakCount = barbers.filter(b => b.status === 'on_break').length;

  const handleSaveAddBreak = (barberId: string) => {
    if (!newBreakStart || !newBreakEnd) return;
    addBarberBreak(barberId, selectedDay, {
      label: newBreakLabel,
      startTime: newBreakStart,
      endTime: newBreakEnd
    });
    setActiveAddBreakBarberId(null);
  };

  const handleCopyHoursToAllWeekdays = (barber: Barber) => {
    const currentShift = barber.shifts.find(s => s.dayOfWeek === selectedDay);
    if (!currentShift) return;

    const updated = barber.shifts.map((s) => {
      if (s.dayOfWeek === 'Sunday') return s; // Keep Sunday as off-day by default
      return {
        ...s,
        isWorking: currentShift.isWorking,
        startTime: currentShift.startTime,
        endTime: currentShift.endTime,
        breaks: currentShift.breaks.map(b => ({ ...b, id: 'b-' + Math.random().toString(36).substring(2, 6) }))
      };
    });

    updateBarberShifts(barber.id, updated);
    addToast({
      type: 'success',
      title: 'Hours Cloned',
      message: `Applied ${selectedDay} shift hours to all weekdays for ${barber.name}.`
    });
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FEE500] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Barber Shift & Chair Roster Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure daily work hours, scheduled lunch & coffee breaks, off-days, and live chair coverage for the salon team.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold self-start xl:self-auto">
          <button
            onClick={() => setActiveSubTab('shifts')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'shifts'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Shifts & Breaks
          </button>
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'weekly'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Roster Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('profiles')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'profiles'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Barber Profiles
          </button>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Scheduled Today</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {totalShopHoursToday} <span className="text-xs text-slate-400 font-normal">hrs</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
            <Timer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Active Staffed Chairs</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {activeBarbersCount} of {barbers.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Staff on Break Right Now</span>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
              {onBreakCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Shop Peak Hours</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              12:00 PM – 4:30 PM
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sun className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY SHIFTS & BREAKS */}
      {activeSubTab === 'shifts' && (
        <div className="flex flex-col gap-6">
          
          {/* Day of Week Selector Bar */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = day === 'Tuesday';
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {day}
                    {isToday && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isSelected ? 'bg-[#FEE500] text-black' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Today
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {barbers.filter(b => b.shifts.find(s => s.dayOfWeek === day)?.isWorking).length} chairs on
                  </span>
                </button>
              );
            })}
          </div>

          {/* Barbers Shifts Cards List */}
          <div className="flex flex-col gap-5">
            {barbers.map((barber) => {
              const shift = barber.shifts.find(s => s.dayOfWeek === selectedDay) || {
                dayOfWeek: selectedDay,
                isWorking: true,
                startTime: '09:00',
                endTime: '18:00',
                breaks: []
              };

              const netHours = calculateWorkingHours(shift);
              const barberAppts = appointments.filter(a => a.barberId === barber.id);

              return (
                <div
                  key={barber.id}
                  className={`bg-white rounded-3xl p-6 border shadow-2xs transition-all ${
                    shift.isWorking ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
                    
                    {/* Barber Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                          }}
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                          barber.status === 'on_break' 
                            ? 'bg-amber-500' 
                            : shift.isWorking ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">{barber.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono">
                            Chair #{barber.chairNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5">{barber.specialty}</span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-slate-900">{netHours} hrs</span> net shift
                          <span>·</span>
                          <span>{shift.breaks.length} break{shift.breaks.length === 1 ? '' : 's'}</span>
                          <span>·</span>
                          <span className="text-slate-400">{barberAppts.length} appointments booked</span>
                        </div>
                      </div>
                    </div>

                    {/* Working Toggle & Time Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* On Duty / Day Off Toggle */}
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        <span className="text-xs font-semibold px-2 text-slate-600">
                          {shift.isWorking ? 'On Duty' : 'Day Off'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateBarberDayShift(barber.id, selectedDay, { isWorking: !shift.isWorking });
                          }}
                          className={`w-11 h-6 rounded-full p-1 transition-colors ${
                            shift.isWorking ? 'bg-black' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              shift.isWorking ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Work Hours Inputs */}
                      {shift.isWorking ? (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => updateBarberDayShift(barber.id, selectedDay, { startTime: e.target.value })}
                            className="bg-transparent font-mono font-bold text-slate-900 focus:outline-hidden"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => updateBarberDayShift(barber.id, selectedDay, { endTime: e.target.value })}
                            className="bg-transparent font-mono font-bold text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-2xl bg-slate-100 text-slate-400 text-xs font-medium">
                          No Shift Scheduled
                        </div>
                      )}

                      {/* Break Status Action */}
                      {shift.isWorking && (
                        <button
                          onClick={() => {
                            const newStatus = barber.status === 'on_break' ? 'active' : 'on_break';
                            updateBarberStatus(barber.id, newStatus);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                            barber.status === 'on_break'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80'
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>{barber.status === 'on_break' ? 'End Break (Resume)' : 'Send on Break'}</span>
                        </button>
                      )}

                      {/* Copy to Weekdays */}
                      <button
                        onClick={() => handleCopyHoursToAllWeekdays(barber)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Copy this shift schedule to all weekdays"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Edit full weekly schedule */}
                      <button
                        onClick={() => setEditingBarber(barber)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Full 7-Day Plan
                      </button>
                    </div>
                  </div>

                  {/* Visual Day Timeline Bar */}
                  {shift.isWorking && (
                    <div className="pt-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>08:00 AM</span>
                        <span>12:00 PM</span>
                        <span>03:00 PM</span>
                        <span>06:00 PM</span>
                        <span>08:00 PM</span>
                      </div>

                      {/* Continuous bar visualizer: 8:00 to 20:00 (12 hours span = 720 mins) */}
                      <div className="w-full h-3 rounded-full bg-slate-100 relative overflow-hidden flex items-center">
                        {/* Working span */}
                        {(() => {
                          const baseStart = 8 * 60; // 08:00
                          const totalSpan = 12 * 60; // 720 mins
                          const [sH, sM] = shift.startTime.split(':').map(Number);
                          const [eH, eM] = shift.endTime.split(':').map(Number);
                          const startOffset = Math.max(0, (sH * 60 + sM - baseStart) / totalSpan * 100);
                          const width = Math.min(100 - startOffset, ((eH * 60 + eM) - (sH * 60 + sM)) / totalSpan * 100);

                          return (
                            <div 
                              className="absolute h-full bg-slate-800 rounded-full"
                              style={{ left: `${startOffset}%`, width: `${width}%` }}
                              title={`Working: ${shift.startTime} - ${shift.endTime}`}
                            />
                          );
                        })()}

                        {/* Breaks overlay in electric yellow / amber */}
                        {shift.breaks.map((brk) => {
                          const baseStart = 8 * 60;
                          const totalSpan = 12 * 60;
                          const [sH, sM] = brk.startTime.split(':').map(Number);
                          const [eH, eM] = brk.endTime.split(':').map(Number);
                          const startOffset = Math.max(0, (sH * 60 + sM - baseStart) / totalSpan * 100);
                          const width = Math.max(1, ((eH * 60 + eM) - (sH * 60 + sM)) / totalSpan * 100);

                          return (
                            <div
                              key={brk.id}
                              className="absolute h-full bg-[#FEE500] ring-1 ring-black/20 rounded-sm z-10"
                              style={{ left: `${startOffset}%`, width: `${width}%` }}
                              title={`Break: ${brk.label} (${brk.startTime} - ${brk.endTime})`}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                          <span>On Duty Work</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FEE500]" />
                          <span>Scheduled Break</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                          <span>Off-Shift</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Breaks Management Section */}
                  {shift.isWorking && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">
                            Daily Breaks & Rest Intervals ({selectedDay})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveAddBreakBarberId(
                              activeAddBreakBarberId === barber.id ? null : barber.id
                            );
                          }}
                          className="text-xs font-semibold text-slate-800 hover:text-black flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Break Slot</span>
                        </button>
                      </div>

                      {/* Inline Form to add a break */}
                      {activeAddBreakBarberId === barber.id && (
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-150 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Break Label</label>
                            <input
                              type="text"
                              value={newBreakLabel}
                              onChange={(e) => setNewBreakLabel(e.target.value)}
                              placeholder="e.g. Lunch Break"
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Start Time</label>
                            <input
                              type="time"
                              value={newBreakStart}
                              onChange={(e) => setNewBreakStart(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">End Time</label>
                            <input
                              type="time"
                              value={newBreakEnd}
                              onChange={(e) => setNewBreakEnd(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 self-end">
                            <button
                              type="button"
                              onClick={() => handleSaveAddBreak(barber.id)}
                              className="px-3 py-1.5 bg-black text-white font-bold rounded-lg hover:bg-slate-800"
                            >
                              Save Break
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveAddBreakBarberId(null)}
                              className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Break chips list */}
                      <div className="flex flex-wrap gap-2">
                        {shift.breaks.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            No break slots configured for {selectedDay}. Click "+ Add Break Slot" above.
                          </span>
                        ) : (
                          shift.breaks.map((brk) => (
                            <div
                              key={brk.id}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs"
                            >
                              <span className="w-2 h-2 rounded-full bg-[#FEE500]" />
                              <span className="font-semibold text-slate-800">{brk.label}</span>
                              <span className="text-slate-400 font-mono">
                                {brk.startTime} - {brk.endTime}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeBarberBreak(barber.id, selectedDay, brk.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                                title="Delete break"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY ROSTER MATRIX */}
      {activeSubTab === 'weekly' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Weekly Shift Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">Overview of weekly work hours and off-days across all barber stations.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 font-normal">Barber & Chair</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d} className="pb-3 text-center font-normal">{d.slice(0, 3)}</th>
                  ))}
                  <th className="pb-3 text-right font-normal">Weekly Total</th>
                  <th className="pb-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {barbers.map((barber) => {
                  let totalWeekMins = 0;
                  barber.shifts.forEach((s) => {
                    if (s.isWorking) {
                      const [sH, sM] = s.startTime.split(':').map(Number);
                      const [eH, eM] = s.endTime.split(':').map(Number);
                      let mins = (eH * 60 + eM) - (sH * 60 + sM);
                      s.breaks.forEach((b) => {
                        const [bSH, bSM] = b.startTime.split(':').map(Number);
                        const [bEH, bEM] = b.endTime.split(':').map(Number);
                        mins -= ((bEH * 60 + bEM) - (bSH * 60 + bSM));
                      });
                      totalWeekMins += Math.max(0, mins);
                    }
                  });

                  const weeklyHoursFormatted = (totalWeekMins / 60).toFixed(1);

                  return (
                    <tr key={barber.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 flex items-center gap-3">
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{barber.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Chair #{barber.chairNumber}</span>
                        </div>
                      </td>

                      {DAYS_OF_WEEK.map((d) => {
                        const shift = barber.shifts.find(s => s.dayOfWeek === d);
                        const isWorking = shift?.isWorking;

                        return (
                          <td key={d} className="py-3.5 text-center">
                            {isWorking ? (
                              <div className="flex flex-col items-center">
                                <span className="font-mono font-semibold text-slate-800 text-[11px]">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                                {shift.breaks.length > 0 && (
                                  <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono mt-0.5">
                                    {shift.breaks.length} break{shift.breaks.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-[11px]">— OFF —</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                        {weeklyHoursFormatted} hrs
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setEditingBarber(barber)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-black hover:text-white rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: BARBER PROFILES & RATINGS */}
      {activeSubTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {barbers.map((barber) => {
            const barberAppts = appointments.filter(a => a.barberId === barber.id);
            const inChairNow = barberAppts.find(a => a.status === 'in_chair');

            return (
              <div
                key={barber.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900">{barber.name}</span>
                        <span className="text-xs text-slate-500 font-medium">Chair #{barber.chairNumber}</span>
                        <span className="text-[11px] text-amber-600 font-semibold">{barber.specialty}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      inChairNow
                        ? 'bg-amber-500 text-white animate-pulse'
                        : barber.status === 'on_break'
                        ? 'bg-amber-100 text-amber-800'
                        : barber.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {inChairNow ? 'In Chair' : barber.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] text-slate-400">Client Rating</span>
                      <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{barber.rating}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] text-slate-400">Cuts Completed</span>
                      <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                        {barber.cutsCompleted}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-400 block mb-0.5">Current Shift State:</span>
                    {barber.status === 'on_break' ? (
                      <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" />
                        Currently enjoying scheduled break
                      </span>
                    ) : inChairNow ? (
                      <span className="font-semibold text-slate-900">
                        In Chair: {inChairNow.clientName} ({inChairNow.serviceName})
                      </span>
                    ) : (
                      <span className="font-medium text-emerald-700">
                        Ready for next scheduled walk-in
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{barberAppts.length} appointments today</span>
                  <button
                    onClick={() => {
                      setEditingBarber(barber);
                    }}
                    className="text-xs font-semibold text-slate-800 hover:text-black underline"
                  >
                    Manage Shifts
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL 7-DAY SCHEDULE MODAL */}
      {editingBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={editingBarber.avatarUrl}
                  alt={editingBarber.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      7-Day Shift Master: {editingBarber.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-mono rounded">
                      Chair #{editingBarber.chairNumber}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Define operational hours, recurring lunch hours, and off-duty days.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditingBarber(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Schedule Rows */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayShift = editingBarber.shifts.find(s => s.dayOfWeek === day) || {
                  dayOfWeek: day,
                  isWorking: false,
                  startTime: '09:00',
                  endTime: '18:00',
                  breaks: []
                };

                return (
                  <div
                    key={day}
                    className={`p-4 rounded-2xl border transition-all ${
                      dayShift.isWorking ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            updateBarberDayShift(editingBarber.id, day, { isWorking: !dayShift.isWorking });
                            // Update local modal state copy
                            setEditingBarber({
                              ...editingBarber,
                              shifts: editingBarber.shifts.map(s => s.dayOfWeek === day ? { ...s, isWorking: !s.isWorking } : s)
                            });
                          }}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors ${
                            dayShift.isWorking ? 'bg-black' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                              dayShift.isWorking ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-24">{day}</span>
                      </div>

                      {dayShift.isWorking ? (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                            <span className="text-slate-400">Hours:</span>
                            <input
                              type="time"
                              value={dayShift.startTime}
                              onChange={(e) => {
                                updateBarberDayShift(editingBarber.id, day, { startTime: e.target.value });
                                setEditingBarber({
                                  ...editingBarber,
                                  shifts: editingBarber.shifts.map(s => s.dayOfWeek === day ? { ...s, startTime: e.target.value } : s)
                                });
                              }}
                              className="font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                              type="time"
                              value={dayShift.endTime}
                              onChange={(e) => {
                                updateBarberDayShift(editingBarber.id, day, { endTime: e.target.value });
                                setEditingBarber({
                                  ...editingBarber,
                                  shifts: editingBarber.shifts.map(s => s.dayOfWeek === day ? { ...s, endTime: e.target.value } : s)
                                });
                              }}
                              className="font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
                            />
                          </div>

                          <span className="text-[11px] font-mono text-slate-500">
                            {calculateWorkingHours(dayShift)} hrs
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Day Off / Studio Closed</span>
                      )}
                    </div>

                    {/* Break chips inside modal */}
                    {dayShift.isWorking && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Breaks:</span>
                        {dayShift.breaks.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-lg font-mono flex items-center gap-1"
                          >
                            <span>{b.label} ({b.startTime} - {b.endTime})</span>
                            <button
                              onClick={() => {
                                removeBarberBreak(editingBarber.id, day, b.id);
                                setEditingBarber({
                                  ...editingBarber,
                                  shifts: editingBarber.shifts.map(s => s.dayOfWeek === day ? {
                                    ...s,
                                    breaks: s.breaks.filter(brk => brk.id !== b.id)
                                  } : s)
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setEditingBarber(null)}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
              >
                Done & Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
