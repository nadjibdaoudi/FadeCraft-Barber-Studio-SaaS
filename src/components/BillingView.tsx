import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Send, 
  Printer, 
  Filter, 
  ArrowUpRight, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Smartphone,
  Sparkles,
  Download,
  Scissors,
  User,
  X
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { Invoice, InvoiceStatus, PaymentMethod } from '../types';

export const BillingView: React.FC = () => {
  const { 
    invoices, 
    setSelectedInvoice, 
    setIsReceiptModalOpen, 
    setIsCheckoutModalOpen, 
    settleInvoice,
    refundInvoice,
    sendReceiptSms
  } = useSalon();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedQuickSettleId, setSelectedQuickSettleId] = useState<string | null>(null);
  const [quickSettleTip, setQuickSettleTip] = useState<number>(10);
  const [quickSettleMethod, setQuickSettleMethod] = useState<PaymentMethod>('card');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        inv.id.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.barberName.toLowerCase().includes(q) ||
        inv.items.some(item => item.name.toLowerCase().includes(q)) ||
        inv.paymentMethod.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchTerm]);

  // Aggregate KPI Stats
  const billingStats = useMemo(() => {
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalCollected = paidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTips = paidInvoices.reduce((acc, curr) => acc + curr.tipAmount, 0);
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const totalPending = pendingInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const avgTicket = paidInvoices.length > 0 ? (totalCollected / paidInvoices.length).toFixed(2) : '0.00';

    return {
      totalCollected,
      totalTips,
      pendingCount: pendingInvoices.length,
      totalPending,
      avgTicket,
      paidCount: paidInvoices.length
    };
  }, [invoices]);

  const handleOpenReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsReceiptModalOpen(true);
  };

  const handleQuickSettleSubmit = (invoiceId: string) => {
    settleInvoice(invoiceId, quickSettleMethod, quickSettleTip);
    setSelectedQuickSettleId(null);
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Billing & POS Invoices
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Register
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Settled tickets, barber chair commissions, gratuities, retail item add-ons, and instant SMS receipts.
          </p>
        </div>

        {/* Quick Checkout Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Quick Checkout / New Charge</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Settled Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Settled Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              ${billingStats.totalCollected.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{billingStats.paidCount} tickets settled</span>
            </div>
          </div>
        </div>

        {/* Total Barber Tips */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Barber Tips & Gratuity
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              ${billingStats.totalTips.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-mono">
              <span>Avg ~21.4% gratuity rate</span>
            </div>
          </div>
        </div>

        {/* Pending Tickets in Chair */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending in Chair
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              ${billingStats.totalPending.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <span>{billingStats.pendingCount} ticket(s) awaiting checkout</span>
            </div>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="bg-[#161618] text-white p-5 rounded-3xl border border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Average Ticket Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEE500] text-black flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-[#FEE500] tracking-tight">
              ${billingStats.avgTicket}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
              <span>Includes retail product lift</span>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICES DATA TABLE & CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by invoice #, client name, barber, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-hidden focus:border-black"
            />
          </div>

          {/* Filter Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {(['all', 'paid', 'pending', 'refunded'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-5">Customer Profile</th>
                <th className="py-3 px-5">Barber & Chair</th>
                <th className="py-3 px-5">Purchased Items</th>
                <th className="py-3 px-5">Payment Method</th>
                <th className="py-3 px-5 text-right">Subtotal & Tip</th>
                <th className="py-3 px-5 text-right">Total Charged</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No billing records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Invoice ID & Date */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-black">
                          {inv.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inv.date} · {inv.time}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 ring-1 ring-slate-200">
                          {inv.clientName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight">
                            {inv.clientName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {inv.clientPhone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Barber & Chair */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{inv.barberName}</span>
                        <span className="text-[10px] text-slate-400">Chair #{inv.chairNumber}</span>
                      </div>
                    </td>

                    {/* Purchased Items */}
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {inv.items.map((item, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              item.type === 'service'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-amber-50 text-amber-800 border border-amber-100'
                            }`}
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold capitalize text-slate-800">
                          {inv.paymentMethod.replace('_', ' ')}
                        </span>
                        {inv.paymentDetails?.cardLast4 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            •••• {inv.paymentDetails.cardLast4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subtotal & Tip */}
                    <td className="py-4 px-5 text-right font-mono">
                      <div className="flex flex-col">
                        <span className="text-slate-600">${inv.subtotal.toFixed(2)}</span>
                        {inv.tipAmount > 0 && (
                          <span className="text-[10px] text-emerald-600">
                            +${inv.tipAmount.toFixed(2)} tip
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Charged */}
                    <td className="py-4 px-5 text-right font-mono font-bold text-sm text-slate-900">
                      ${inv.totalAmount.toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === 'pending' ? (
                          <button
                            onClick={() => setSelectedQuickSettleId(inv.id)}
                            className="px-2.5 py-1 bg-black text-[#FEE500] hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          >
                            Settle Pay
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReceipt(inv)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => sendReceiptSms(inv.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Resend Digital SMS Receipt"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {inv.status === 'paid' && (
                          <button
                            onClick={() => refundInvoice(inv.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK SETTLE DRAWER / MODAL IF TRIGGERED */}
      {selectedQuickSettleId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectedQuickSettleId(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Settle In-Chair Ticket</h3>
              <button 
                onClick={() => setSelectedQuickSettleId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                {(['card', 'apple_pay', 'cash'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQuickSettleMethod(m)}
                    className={`py-2 rounded-xl capitalize transition-all border ${
                      quickSettleMethod === m 
                        ? 'bg-black text-white border-black shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Add Barber Tip ($)</label>
              <div className="grid grid-cols-4 gap-1 text-xs font-semibold">
                {[5, 10, 15, 20].map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setQuickSettleTip(tip)}
                    className={`py-2 rounded-xl transition-all ${
                      quickSettleTip === tip 
                        ? 'bg-black text-[#FEE500]' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ${tip}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleQuickSettleSubmit(selectedQuickSettleId)}
              className="w-full py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors shadow-xs mt-2"
            >
              Confirm Payment & Close Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
