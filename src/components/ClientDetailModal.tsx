import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Scissors, 
  Clock, 
  Plus, 
  Check, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Coffee, 
  AlertCircle,
  Receipt,
  CreditCard
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { CutFormulaNote } from '../types';

export const ClientDetailModal: React.FC = () => {
  const { 
    selectedClient, 
    setSelectedClient, 
    updateClientNotes, 
    setIsBookingModalOpen,
    sendSimulatedReminder,
    appointments,
    invoices,
    setSelectedInvoice,
    setIsReceiptModalOpen,
    setIsCheckoutModalOpen
  } = useSalon();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    barberName: 'Marcus Vance',
    notes: '',
    guardSizes: '#1.5 to skin taper',
    finishProduct: 'Matte Clay Cream'
  });

  if (!selectedClient) return null;

  const clientAppointments = appointments.filter(a => a.clientId === selectedClient.id);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.notes) return;

    const formula: CutFormulaNote = {
      date: new Date().toISOString().split('T')[0],
      barberName: newNote.barberName,
      notes: newNote.notes,
      guardSizes: newNote.guardSizes,
      finishProduct: newNote.finishProduct
    };

    updateClientNotes(selectedClient.id, formula);
    setIsAddingNote(false);
    setNewNote({
      barberName: 'Marcus Vance',
      notes: '',
      guardSizes: '#1.5 to skin taper',
      finishProduct: 'Matte Clay Cream'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <img
              src={selectedClient.avatarUrl}
              alt={selectedClient.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{selectedClient.name}</h2>
                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-full">
                  {selectedClient.loyaltyTier}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedClient.phone}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedClient.email}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedClient(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 divide-y divide-slate-100">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400">Total Visits</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {selectedClient.totalVisits}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400">Lifetime Spend</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                ${selectedClient.totalSpend}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400">Loyalty Progress</span>
              <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                {selectedClient.loyaltyProgress.currentVisits}/{selectedClient.loyaltyProgress.targetVisits}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400">Preferred Channel</span>
              <div className="text-xs font-bold text-slate-900 mt-1 uppercase">
                {selectedClient.reminderPreferences.sms ? 'SMS' : 'WhatsApp'}
              </div>
            </div>
          </div>

          {/* Section: Style Blueprint & Cut Specs */}
          <div className="pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Barber Cut Blueprint & Specs</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Last updated Sept 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Haircut Profile</span>
                <span className="font-semibold text-slate-800">{selectedClient.stylePreferences.hairStyle}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Clipper Guard on Sides</span>
                <span className="font-semibold text-slate-800">{selectedClient.stylePreferences.guardSides}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Top Length & Technique</span>
                <span className="font-semibold text-slate-800">{selectedClient.stylePreferences.topLength}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-slate-400 font-medium">Beard / Neckline Style</span>
                <span className="font-semibold text-slate-800">{selectedClient.stylePreferences.beardStyle}</span>
              </div>
            </div>

            {/* Sensitivities & Hospitality */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-amber-900">Skin Sensitivities & Preferences:</span>
                <span className="text-amber-800 mt-0.5">{selectedClient.stylePreferences.sensitivities}</span>
                {selectedClient.stylePreferences.preferredBeverage && (
                  <span className="text-amber-800 mt-1 flex items-center gap-1 font-medium">
                    <Coffee className="w-3.5 h-3.5" />
                    Complimentary drink: {selectedClient.stylePreferences.preferredBeverage}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Formula History & Barber Notes */}
          <div className="pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Cut History & Formulas</h3>
              </div>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="text-xs font-semibold text-slate-800 hover:text-black flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Formula Note</span>
              </button>
            </div>

            {/* Note logging form */}
            {isAddingNote && (
              <form onSubmit={handleSaveNote} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Barber</label>
                    <input
                      type="text"
                      value={newNote.barberName}
                      onChange={(e) => setNewNote({ ...newNote, barberName: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Guard Settings</label>
                    <input
                      type="text"
                      value={newNote.guardSizes}
                      onChange={(e) => setNewNote({ ...newNote, guardSizes: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. #1.5 fade into skin"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Formula & Styling Notes</label>
                  <textarea
                    value={newNote.notes}
                    onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg h-16"
                    placeholder="Specific scissor point details, neckline razor angle, crown direction..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                  >
                    Save Cut Formula
                  </button>
                </div>
              </form>
            )}

            {/* List of past cut formulas */}
            <div className="flex flex-col gap-2.5">
              {selectedClient.cutHistory.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No previous formulas logged yet. Add one above.
                </div>
              ) : (
                selectedClient.cutHistory.map((cut, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cut.barberName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{cut.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{cut.notes}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                      <span>Guards: {cut.guardSizes}</span>
                      <span>·</span>
                      <span>Product: {cut.finishProduct}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Automated Reminder History */}
          <div className="pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Automated Reminder Channel Status</h3>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SMS Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  24h SMS & WhatsApp Automated Triggers
                </span>
                <span className="text-[11px] text-slate-400">
                  Sends notice 24h prior, followed by 2h chair-ready direction pin.
                </span>
              </div>
              <button
                onClick={() => {
                  const apt = clientAppointments[0];
                  if (apt) {
                    sendSimulatedReminder(apt.id, 'sms', 'Manual Client Ping');
                  }
                }}
                className="px-3 py-1.5 bg-black text-white hover:bg-slate-800 text-xs font-medium rounded-lg shadow-2xs"
              >
                Send Test SMS
              </button>
            </div>
          </div>

          {/* Section: Customer Billing History & Invoices */}
          <div className="pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Billing History & Digital Receipts</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setIsCheckoutModalOpen(true);
                }}
                className="text-xs font-bold text-slate-900 hover:text-black flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                <span>New Charge</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {invoices.filter(i => i.clientId === selectedClient.id).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                  No invoices recorded yet for this client. Tap "New Charge" to settle an in-chair service.
                </div>
              ) : (
                invoices
                  .filter(i => i.clientId === selectedClient.id)
                  .map((inv) => (
                    <div 
                      key={inv.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{inv.id}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {inv.date} · {inv.barberName} · {inv.items.map(it => it.name).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          ${inv.totalAmount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setSelectedClient(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>

          <button
            onClick={() => {
              setSelectedClient(null);
              setIsBookingModalOpen(true);
            }}
            className="px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Next Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
