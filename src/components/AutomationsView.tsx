import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw,
  BellRing,
  ArrowUpRight
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { AutomationRule, ReminderChannel } from '../types';

export const AutomationsView: React.FC = () => {
  const { 
    automations, 
    toggleAutomationRule, 
    reminderLogs, 
    clients, 
    appointments, 
    sendSimulatedReminder 
  } = useSalon();

  const [selectedRuleId, setSelectedRuleId] = useState<string>(automations[0]?.id || 'rule-1');
  const [selectedChannel, setSelectedChannel] = useState<ReminderChannel>('sms');
  const [testClientId, setTestClientId] = useState<string>(clients[0]?.id || '');

  const activeRule = automations.find((r) => r.id === selectedRuleId) || automations[0];
  const testClient = clients.find((c) => c.id === testClientId) || clients[0];
  const testAppointment = appointments.find((a) => a.clientId === testClient.id) || appointments[0];

  // Generate preview text replacing variables
  const formatTemplatePreview = (template: string) => {
    return template
      .replace(/{client_name}/g, testClient.name)
      .replace(/{barber_name}/g, testAppointment?.barberName || 'Marcus Vance')
      .replace(/{service_name}/g, testAppointment?.serviceName || 'Signature Skin Fade')
      .replace(/{appointment_time}/g, testAppointment?.time || '14:30')
      .replace(/{chair_number}/g, (testAppointment?.chairNumber || 1).toString())
      .replace(/{booking_link}/g, 'fadecraft.studio/b/8x92')
      .replace(/{quick_book_url}/g, 'fadecraft.studio/rebook');
  };

  const handleTestSend = () => {
    if (testAppointment) {
      sendSimulatedReminder(testAppointment.id, selectedChannel, activeRule.title);
    }
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      
      {/* Top Banner & KPI strip */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FEE500] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Automated Appointment Reminders & Follow-ups
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous multi-channel engine sending 24h confirmations, 2h chair-ready alerts, and smart 28-day fade recall triggers via SMS & WhatsApp.
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Rate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono text-slate-900">99.4%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">+0.2%</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Confirmations</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono text-slate-900">89.6%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">via 1-Tap</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">No-Show Drop</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono text-emerald-600">-64%</span>
              <span className="text-[10px] text-slate-400">vs benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rules List, Right Phone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Rules List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 px-1">
            Active Automation Workflows
          </h3>

          <div className="flex flex-col gap-3">
            {automations.map((rule) => {
              const isSelected = selectedRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-black ring-1 ring-black shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-2xl mt-0.5 ${rule.active ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{rule.title}</span>
                          <span className="px-2 py-0.2 bg-slate-100 text-slate-600 text-[10px] font-mono rounded">
                            {rule.channels.join(' + ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    {/* Active Toggle Switch */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAutomationRule(rule.id);
                      }}
                      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        rule.active ? 'bg-black' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          rule.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Rule Metrics Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-4 font-mono">
                      <span>Sent: {rule.stats.sentCount}</span>
                      <span>·</span>
                      <span className="text-slate-700 font-semibold">
                        Confirmed: {rule.stats.confirmedCount}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">
                        Rebooked: {rule.stats.rebookedCount}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-800 underline">
                      Preview in Phone →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Live Interactive Phone Simulator */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Live Client Message Simulator</h3>
            </div>
            
            {/* Channel Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedChannel('sms')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedChannel === 'sms' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                SMS
              </button>
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedChannel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>

          {/* Test recipient selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Preview as:</span>
            <select
              value={testClientId}
              onChange={(e) => setTestClientId(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Device Mockup Frame */}
          <div className="p-4 bg-slate-900 rounded-3xl shadow-xl flex flex-col gap-3 text-white border-4 border-slate-800">
            {/* Top speaker bar */}
            <div className="flex items-center justify-center gap-1">
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Conversation Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                  K
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white leading-tight">Keystone Barber</span>
                  <span className="text-[9px] text-emerald-400">Verified Business</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">14:30</span>
            </div>

            {/* Simulated Chat Bubble */}
            <div className="py-2 flex flex-col gap-2">
              <div
                className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-sm ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-[#005c4b] text-white rounded-tl-xs self-start'
                    : 'bg-slate-800 text-slate-100 rounded-tl-xs self-start border border-slate-700'
                }`}
              >
                {formatTemplatePreview(activeRule.templateMessage)}
                <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-slate-400 font-mono">
                  <span>14:30</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
              </div>

              {/* Client Auto-Reply Simulation */}
              <div className="p-2.5 rounded-2xl max-w-[40%] bg-blue-600 text-white rounded-tr-xs text-xs font-bold self-end shadow-sm flex items-center justify-between">
                <span>1</span>
                <span className="text-[9px] text-blue-200 font-mono">14:31</span>
              </div>
            </div>

            {/* Send simulation button */}
            <button
              onClick={handleTestSend}
              className="mt-2 w-full py-2.5 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate Real Dispatch to {testClient.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM: Delivery History & Audit Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Automated Dispatch & Confirmation Audit Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live transmission records, carrier delivery confirmations, and client feedback response telemetry.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {reminderLogs.length} transmissions logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="pb-3 font-normal">Recipient</th>
                <th className="pb-3 font-normal">Appointment</th>
                <th className="pb-3 font-normal">Rule Trigger</th>
                <th className="pb-3 font-normal">Channel</th>
                <th className="pb-3 font-normal">Message Excerpt</th>
                <th className="pb-3 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminderLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-slate-900">
                    <div className="flex flex-col">
                      <span>{log.clientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">{log.clientPhone}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-600">
                    <div className="flex flex-col">
                      <span>{log.timeSlot}</span>
                      <span className="text-[10px] text-slate-400">with {log.barberName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-700 font-medium">
                    {log.ruleTitle}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded uppercase">
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 max-w-xs truncate">
                    {log.messagePreview}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
