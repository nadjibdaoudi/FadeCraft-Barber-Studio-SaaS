import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Plus, 
  Scissors, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Phone, 
  X, 
  Timer, 
  ArrowRight,
  Coffee,
  Check
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { WalkInQueueItem } from '../types';

export const WalkInWaitlistSection: React.FC = () => {
  const { 
    walkIns, 
    barbers, 
    services, 
    addWalkIn, 
    seatWalkIn, 
    callWalkIn, 
    cancelWalkIn, 
    suggestNextAvailableBarber,
    addToast 
  } = useSalon();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [preferredBarberId, setPreferredBarberId] = useState('any');
  const [notes, setNotes] = useState('');

  // Live calculation of next available barber for display in banner
  const nextAvailable = suggestNextAvailableBarber('any');

  // Preview suggestion when filling the form
  const formSuggestion = suggestNextAvailableBarber(preferredBarberId);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    addWalkIn({
      clientName,
      clientPhone: clientPhone || '+1 (305) 555-0188',
      serviceId: selectedServiceId,
      preferredBarberId,
      notes
    });

    // Reset & close
    setClientName('');
    setClientPhone('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-5">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-[#FEE500] flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Walk-in Waitlist & Dynamic Queue
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {walkIns.length} client{walkIns.length === 1 ? '' : 's'} waiting in lounge · Auto-assigned by chair readiness & turnaround speed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Next Available Barber Tag matching template style */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-500">Fastest Opening:</span>
            <span className="font-bold text-slate-900 font-mono">
              {nextAvailable.barber.name} (Chair #{nextAvailable.barber.chairNumber})
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#FEE500] text-black">
              {nextAvailable.estimatedWaitMinutes === 0 ? 'Ready Now' : `~${nextAvailable.estimatedWaitMinutes}m`}
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Walk-in</span>
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      {walkIns.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center text-slate-400">
          <Clock className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
          <span className="text-xs font-semibold text-slate-700">No walk-in clients currently waiting</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click "+ Add Walk-in" when a client arrives without a booking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {walkIns.map((walkIn, idx) => (
            <div
              key={walkIn.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                walkIn.status === 'called'
                  ? 'bg-amber-50/60 border-amber-200 ring-1 ring-amber-300'
                  : 'bg-slate-50/50 border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Position & Service */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{walkIn.clientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{walkIn.clientPhone}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-slate-900">
                    ${walkIn.servicePrice}
                  </span>
                </div>

                {/* Service & Joined Time */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{walkIn.serviceName}</span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {walkIn.joinedTime}
                  </span>
                </div>

                {/* Auto-Suggested Barber Callout Banner */}
                <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Auto-Suggested Barber
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#FEE500] text-black">
                      {walkIn.estimatedWaitMinutes === 0 ? 'Ready Now' : `~${walkIn.estimatedWaitMinutes}m wait`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Scissors className="w-3.5 h-3.5 text-slate-700" />
                    <span className="font-bold text-slate-900">
                      {walkIn.suggestedBarberName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      (Chair #{walkIn.suggestedChairNumber})
                    </span>
                  </div>
                </div>

                {walkIn.notes && (
                  <p className="mt-2 text-[11px] text-slate-500 italic">
                    "{walkIn.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => callWalkIn(walkIn.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-colors"
                    title="Send SMS buzzer to client"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelWalkIn(walkIn.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from waitlist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => seatWalkIn(walkIn.id)}
                  className="px-3.5 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Seat in Chair #{walkIn.suggestedChairNumber}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD WALK-IN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Add Walk-in Client to Queue</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cameron Diaz / Walk-in Guest"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Phone Number (For SMS Ready Buzzer)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (305) 555-0199"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Service Requested</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price} · {s.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Preferred Barber</label>
                  <select
                    value={preferredBarberId}
                    onChange={(e) => setPreferredBarberId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="any">First Available Barber (Fastest)</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Chair #{b.chairNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Auto-Suggestion Preview Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Automatic Barber Routing Suggestion:
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#FEE500] text-black">
                    {formSuggestion.estimatedWaitMinutes === 0 ? 'Ready Immediately' : `~${formSuggestion.estimatedWaitMinutes}m wait`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 mt-0.5">
                  <span className="font-bold">{formSuggestion.barber.name}</span>
                  <span>(Chair #{formSuggestion.barber.chairNumber})</span>
                  <span>·</span>
                  <span className="text-slate-500">{formSuggestion.reason}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Notes / Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Skin taper on sides, espresso while waiting..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Add to Waiting Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
