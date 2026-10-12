import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertCircle, MapPin, Save } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const SettingsView: React.FC = () => {
  const { shop, barbers, updateShopSettings } = useSalon();

  const [salonName, setSalonName] = useState('');
  const [location, setLocation] = useState('');
  const [revenueGoal, setRevenueGoalInput] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [operatingHours, setOperatingHours] = useState('');
  const [senderId, setSenderId] = useState('');
  const [whatsappActive, setWhatsappActive] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Fill the form from the saved settings, but never overwrite what the user is typing.
  useEffect(() => {
    if (dirty) return;
    setSalonName(shop?.name ?? '');
    setLocation(shop?.location ?? '');
    setRevenueGoalInput(shop && shop.revenueGoal > 0 ? String(shop.revenueGoal) : '');
    setTaxRate(String(shop?.taxRate ?? 0));
    setOperatingHours(shop?.operatingHours ?? '');
    setSenderId(shop?.smsSenderId ?? '');
    setWhatsappActive(shop?.whatsappEnabled ?? false);
  }, [shop, dirty]);

  const edit = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = Number(revenueGoal.replace(/[^0-9.]/g, ''));
    const tax = Number(taxRate);

    updateShopSettings({
      name: salonName.trim() || 'My Salon',
      location: location.trim(),
      operatingHours: operatingHours.trim(),
      smsSenderId: senderId.trim(),
      whatsappEnabled: whatsappActive,
      ...(Number.isFinite(tax) && tax >= 0 && tax <= 100 ? { taxRate: tax } : {}),
      // An empty or zero goal keeps the previous one instead of erasing it.
      ...(Number.isFinite(goal) && goal > 0 ? { revenueGoal: goal } : {})
    });
    setDirty(false);
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900">Salon & Gateway Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Studio profile, yearly revenue goal, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salon Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Salon Profile</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Studio Brand Name</label>
            <input
              type="text"
              value={salonName}
              placeholder="My Salon"
              onChange={(e) => edit(setSalonName)(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Physical Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => edit(setLocation)(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Active Chairs</label>
              <input
                type="number"
                readOnly
                value={barbers.length}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Counted from your barbers list</span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Operating Hours</label>
              <input
                type="text"
                value={operatingHours}
                placeholder="9:00 AM - 7:30 PM"
                onChange={(e) => edit(setOperatingHours)(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Yearly Revenue Goal ($)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={revenueGoal}
              placeholder="e.g. 240000"
              onChange={(e) => edit(setRevenueGoalInput)(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Shown on the Dashboard and the sidebar goal card
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Sales Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={taxRate}
              onChange={(e) => edit(setTaxRate)(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Added to every checkout. Use 0 if you do not charge tax.
            </span>
          </div>
        </div>

        {/* SMS / WhatsApp Gateway */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">SMS & WhatsApp Gateway</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Simulation mode
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            No SMS or WhatsApp provider is connected yet. Reminders are recorded in the app, but no message is
            actually delivered to clients.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">SMS Sender ID (Alphanumeric)</label>
            <input
              type="text"
              value={senderId}
              placeholder="MYSALON"
              onChange={(e) => edit(setSenderId)(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Carrier Provider</label>
            <input
              type="text"
              readOnly
              value="None connected"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">WhatsApp reminders</span>
              <span className="text-[11px] text-slate-500">Saved preference, used once a provider is connected</span>
            </div>
            <input
              type="checkbox"
              checked={whatsappActive}
              onChange={(e) => edit(setWhatsappActive)(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configurations</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
