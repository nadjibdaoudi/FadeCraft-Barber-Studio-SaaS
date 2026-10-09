import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Send, 
  Copy, 
  Check, 
  CreditCard, 
  Scissors, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const ReceiptModal: React.FC = () => {
  const { 
    selectedInvoice, 
    setSelectedInvoice, 
    isReceiptModalOpen, 
    setIsReceiptModalOpen,
    sendReceiptSms,
    refundInvoice
  } = useSalon();

  const [copied, setCopied] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);

  if (!isReceiptModalOpen || !selectedInvoice) return null;

  const inv = selectedInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
----------------------------------------
   KEYSTONE BARBER STUDIO / FADECRAFT
         Downtown · 6 Chairs
----------------------------------------
Invoice: ${inv.id}
Date: ${inv.date} at ${inv.time}
Client: ${inv.clientName} (${inv.clientPhone})
Barber: ${inv.barberName} (Chair #${inv.chairNumber})
----------------------------------------
ITEMS:
${inv.items.map(item => `${item.name} x${item.quantity} - $${item.total.toFixed(2)}`).join('\n')}
----------------------------------------
Subtotal: $${inv.subtotal.toFixed(2)}
Tax (7%): $${inv.taxAmount.toFixed(2)}
Barber Tip: $${inv.tipAmount.toFixed(2)}
Discount: -$${inv.discountAmount.toFixed(2)}
TOTAL PAID: $${inv.totalAmount.toFixed(2)}
Payment: ${inv.paymentMethod.replace('_', ' ').toUpperCase()} ${inv.paymentDetails?.cardLast4 ? `(•••• ${inv.paymentDetails.cardLast4})` : ''}
Status: ${inv.status.toUpperCase()}
----------------------------------------
Thank you for your visit!
Keystone Barber Flagship · Brickell Ave
----------------------------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSms = () => {
    setIsSendingSms(true);
    sendReceiptSms(inv.id);
    setTimeout(() => setIsSendingSms(false), 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsReceiptModalOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FEE500] text-black flex items-center justify-center font-bold text-xs">
              K
            </div>
            <div>
              <span className="text-xs font-bold leading-tight block">Official Salon Receipt</span>
              <span className="text-[10px] text-slate-400 font-mono">{inv.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 font-sans bg-[#FAFBFD]">
          {/* Studio Brand Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300 flex flex-col items-center">
            <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm">
              <span>K</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">KEYSTONE BARBER STUDIO</h3>
            <span className="text-[11px] text-slate-500">FadeCraft Flagship · Downtown Brickell</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Tel: +1 (305) 555-0199 · Tax ID: #88-29104</span>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
              <span className="font-bold text-slate-800">{inv.clientName}</span>
              <span className="text-[11px] text-slate-500 font-mono block">{inv.clientPhone}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Barber / Station</span>
              <span className="font-bold text-slate-800">{inv.barberName}</span>
              <span className="text-[11px] text-slate-500 block">Chair #{inv.chairNumber}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono py-1 border-t border-b border-slate-200">
            <span>Date: {inv.date} · {inv.time}</span>
            <span className={`px-2 py-0.2 rounded-full font-bold uppercase text-[9px] ${
              inv.status === 'paid' 
                ? 'bg-emerald-100 text-emerald-800' 
                : inv.status === 'pending' 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {inv.status}
            </span>
          </div>

          {/* Line Items Table */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Purchased Items & Services</span>
            <div className="flex flex-col gap-1.5">
              {inv.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-1 pr-2">
                    <span className="text-[10px] font-mono font-semibold px-1 rounded bg-slate-100 text-slate-600">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-slate-800 leading-tight">{item.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({item.type})</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 shrink-0">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals & Totals */}
          <div className="pt-3 border-t border-dashed border-slate-300 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${inv.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>FL State Sales Tax (7.0%)</span>
              <span>${inv.taxAmount.toFixed(2)}</span>
            </div>
            {inv.tipAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Barber Gratuity / Tip</span>
                <span>+${inv.tipAmount.toFixed(2)}</span>
              </div>
            )}
            {inv.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>VIP Loyalty Discount</span>
                <span>-${inv.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline text-slate-900">
              <span className="text-sm font-bold font-sans">TOTAL CHARGED</span>
              <span className="text-lg font-bold">${inv.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 capitalize">
                  {inv.paymentMethod.replace('_', ' ')}
                </span>
                {inv.paymentDetails?.cardLast4 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inv.paymentDetails.cardBrand} ending in •••• {inv.paymentDetails.cardLast4}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AUTH APPROVED
            </span>
          </div>

          {/* Notes if present */}
          {inv.notes && (
            <div className="p-2.5 bg-slate-100/70 rounded-xl text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Memo: </span>
              {inv.notes}
            </div>
          )}

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
            Automated digital receipt generated by Keystone FadeCraft Engine.
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {inv.status === 'paid' && (
              <button
                onClick={() => refundInvoice(inv.id)}
                className="px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Issue full refund for this transaction"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refund</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSendSms}
            disabled={isSendingSms}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{inv.receiptSentVia === 'sms' ? 'Resend SMS Receipt' : 'Send SMS Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
