import React, { useState } from 'react';
import { X, User, Phone, Mail, Scissors, Sparkles } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const NewClientModal: React.FC = () => {
  const { 
    isNewClientModalOpen, 
    setIsNewClientModalOpen, 
    barbers, 
    addClient 
  } = useSalon();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredBarberId, setPreferredBarberId] = useState(barbers[0]?.id || 'barber-1');
  const [hairStyle, setHairStyle] = useState('Skin Fade with Textured Top');
  const [guardSides, setGuardSides] = useState('#1 to foil razor bald');
  const [topLength, setTopLength] = useState('2.5 inches scissor work');
  const [beardStyle, setBeardStyle] = useState('Trimmed stubble with sharp lineup');
  const [sensitivities, setSensitivities] = useState('Prefers tea tree aftershave balm');
  const [enableSms, setEnableSms] = useState(true);
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);

  if (!isNewClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addClient({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      preferredBarberId,
      stylePreferences: {
        hairStyle,
        guardSides,
        topLength,
        beardStyle,
        hairType: 'Standard',
        sensitivities
      },
      reminderPreferences: {
        sms: enableSms,
        whatsapp: enableWhatsapp,
        email: false,
        hoursNotice: 24
      }
    });

    setIsNewClientModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Customer Profile</h2>
              <span className="text-[11px] text-slate-400">Record cut blueprints & notification preferences</span>
            </div>
          </div>
          <button
            onClick={() => setIsNewClientModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-900 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Sterling"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Phone Number (SMS)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (305) 555-0199"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liam@example.com"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-black outline-hidden"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Scissors className="w-3.5 h-3.5" />
              <span>Grooming Blueprint & Specs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Haircut Style</label>
                <input
                  type="text"
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Clipper Guards (Sides)</label>
                <input
                  type="text"
                  value={guardSides}
                  onChange={(e) => setGuardSides(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Top Technique</label>
                <input
                  type="text"
                  value={topLength}
                  onChange={(e) => setTopLength(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Preferred Barber</label>
                <select
                  value={preferredBarberId}
                  onChange={(e) => setPreferredBarberId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Chair #{b.chairNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sensitivities / Skin Notes</label>
              <input
                type="text"
                value={sensitivities}
                onChange={(e) => setSensitivities(e.target.value)}
                placeholder="e.g. Sensitive neck, no alcohol aftershave"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Reminder Preferences */}
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-900">Automated Notification Opt-Ins</span>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSms}
                  onChange={(e) => setEnableSms(e.target.checked)}
                  className="accent-black"
                />
                <span className="text-slate-700">SMS Reminders</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWhatsapp}
                  onChange={(e) => setEnableWhatsapp(e.target.checked)}
                  className="accent-black"
                />
                <span className="text-slate-700">WhatsApp Messages</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewClientModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Customer Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
