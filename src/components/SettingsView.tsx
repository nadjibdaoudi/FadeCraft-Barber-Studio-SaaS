import React, { useState } from 'react';
import { Settings, ShieldCheck, MessageSquare, Phone, MapPin, Clock, Save } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const SettingsView: React.FC = () => {
  const { addToast } = useSalon();
  const [salonName, setSalonName] = useState('Keystone Barber Co.');
  const [location, setLocation] = useState('3151 Coral Way, Suite 101, Downtown');
  const [senderId, setSenderId] = useState('KEYSTONE');
  const [smsGateway, setSmsGateway] = useState('Twilio Cloud Verified');
  const [whatsappActive, setWhatsappActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings Successfully Updated',
      message: 'Salon profile & SMS gateway configurations saved.'
    });
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900">Salon & Gateway Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Studio profile, SMS/WhatsApp notification credentials, and booking rules.
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
              onChange={(e) => setSalonName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Physical Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Active Chairs</label>
              <input
                type="number"
                defaultValue={6}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Operating Hours</label>
              <input
                type="text"
                defaultValue="9:00 AM - 7:30 PM"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* SMS / WhatsApp Gateway */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">SMS & WhatsApp Gateway</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">SMS Sender ID (Alphanumeric)</label>
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Carrier Provider</label>
            <input
              type="text"
              readOnly
              value={smsGateway}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">Meta WhatsApp Cloud API</span>
              <span className="text-[11px] text-slate-500">Allow rich media reminder cards on WhatsApp</span>
            </div>
            <input
              type="checkbox"
              checked={whatsappActive}
              onChange={(e) => setWhatsappActive(e.target.checked)}
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
