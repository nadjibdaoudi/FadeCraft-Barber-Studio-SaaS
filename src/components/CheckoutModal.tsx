import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  DollarSign, 
  Scissors, 
  Package, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  User, 
  Phone, 
  Smartphone, 
  Percent,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { BillingLineItem, PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    checkoutAppointment, 
    setCheckoutAppointment,
    clients, 
    barbers, 
    services, 
    inventory, 
    adjustInventoryStock,
    createInvoice,
    setSelectedInvoice,
    setIsReceiptModalOpen
  } = useSalon();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [chairNumber, setChairNumber] = useState<number>(1);
  const [lineItems, setLineItems] = useState<BillingLineItem[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string>('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number | 'custom'>(20);
  const [customTip, setCustomTip] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [sendReceiptViaSms, setSendReceiptViaSms] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Prefill when checkoutAppointment is provided
  useEffect(() => {
    if (checkoutAppointment) {
      setSelectedClientId(checkoutAppointment.clientId);
      setSelectedBarberId(checkoutAppointment.barberId);
      setChairNumber(checkoutAppointment.chairNumber);
      
      const matchedService = services.find(s => s.id === checkoutAppointment.serviceId);
      if (matchedService) {
        setLineItems([
          {
            id: 'item-' + Date.now(),
            type: 'service',
            name: matchedService.name,
            quantity: 1,
            unitPrice: matchedService.price,
            total: matchedService.price
          }
        ]);
      }
    } else {
      // Default to first client & barber
      if (clients.length > 0 && !selectedClientId) {
        setSelectedClientId(clients[0].id);
      }
      if (barbers.length > 0 && !selectedBarberId) {
        setSelectedBarberId(barbers[0].id);
        setChairNumber(barbers[0].chairNumber);
      }
      if (services.length > 0 && lineItems.length === 0) {
        setLineItems([
          {
            id: 'item-' + Date.now(),
            type: 'service',
            name: services[0].name,
            quantity: 1,
            unitPrice: services[0].price,
            total: services[0].price
          }
        ]);
      }
    }
  }, [checkoutAppointment, isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const currentClient = clients.find(c => c.id === selectedClientId);
  const currentBarber = barbers.find(b => b.id === selectedBarberId) || barbers[0];

  // Financial calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = Number((subtotal * 0.07).toFixed(2)); // 7% FL sales tax

  let calculatedTip = 0;
  if (tipPercent === 'custom') {
    calculatedTip = Number(customTip) || 0;
  } else {
    calculatedTip = Number(((subtotal * tipPercent) / 100).toFixed(2));
  }

  const totalAmount = Math.max(0, subtotal + taxAmount + calculatedTip - discountAmount);

  const handleAddService = () => {
    if (!selectedServiceToAdd) return;
    const srv = services.find(s => s.id === selectedServiceToAdd);
    if (!srv) return;

    setLineItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now() + Math.random(),
        type: 'service',
        name: srv.name,
        quantity: 1,
        unitPrice: srv.price,
        total: srv.price
      }
    ]);
    setSelectedServiceToAdd('');
  };

  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const prod = inventory.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    const retailPrice = prod.retailPrice || Number((prod.costPrice * 1.8).toFixed(2));

    setLineItems(prev => [
      ...prev,
      {
        id: 'item-' + Date.now() + Math.random(),
        type: 'product',
        name: prod.name,
        quantity: 1,
        unitPrice: retailPrice,
        total: retailPrice
      }
    ]);

    // Automatically decrement stock for this retail item
    adjustInventoryStock(prod.id, -1);
    setSelectedProductToAdd('');
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const clientName = currentClient ? currentClient.name : guestName || 'Walk-in Guest';
    const clientPhone = currentClient ? currentClient.phone : guestPhone || '+1 (305) 555-0000';
    const clientEmail = currentClient ? currentClient.email : undefined;

    const created = createInvoice({
      appointmentId: checkoutAppointment ? checkoutAppointment.id : undefined,
      clientId: currentClient ? currentClient.id : 'client-walkin',
      clientName,
      clientPhone,
      clientEmail,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      chairNumber: currentBarber.chairNumber,
      items: lineItems,
      subtotal,
      taxAmount,
      tipAmount: calculatedTip,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentDetails: {
        cardBrand: paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'card' ? 'Visa' : 'Cash',
        cardLast4: paymentMethod === 'cash' ? undefined : '4242',
        transactionRef: `tx_live_${Math.random().toString(36).substring(2, 9)}`,
      },
      status: 'paid',
      notes: notes || (checkoutAppointment ? `Settled from appointment ${checkoutAppointment.id}` : 'Direct POS checkout'),
      receiptSentVia: sendReceiptViaSms ? 'sms' : 'none'
    });

    setIsCheckoutModalOpen(false);
    setCheckoutAppointment(null);
    setSelectedInvoice(created);
    setIsReceiptModalOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsCheckoutModalOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEE500] text-black flex items-center justify-center font-bold text-base shadow-sm">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Point of Sale · Customer Checkout</h2>
              <p className="text-xs text-slate-400">
                Charge haircut services, retail grooming supplies, tips, and issue digital receipts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleCompletePayment} className="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          {/* Client & Barber Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer Profile</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-black"
              >
                <option value="">-- Guest / Walk-in Customer --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyaltyTier} · {c.phone})
                  </option>
                ))}
              </select>

              {!selectedClientId && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Phone for SMS Receipt"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Barber & Chair Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
                <span>Barber & Chair Station</span>
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => {
                  setSelectedBarberId(e.target.value);
                  const b = barbers.find(item => item.id === e.target.value);
                  if (b) setChairNumber(b.chairNumber);
                }}
                className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-black"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Chair #{b.chairNumber} · {b.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ticket Line Items
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {lineItems.length} item(s)
              </span>
            </div>

            {/* Existing Items */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {lineItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No items added yet. Add a service or retail product below.
                </div>
              ) : (
                lineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.type === 'service' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-900 font-bold">${item.total.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Bar: Add Service or Retail Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
              {/* Add Service */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedServiceToAdd}
                  onChange={(e) => setSelectedServiceToAdd(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="">+ Add Salon Service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.price})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={!selectedServiceToAdd}
                  className="p-2 bg-black disabled:opacity-40 text-white rounded-xl hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Retail Product from Inventory */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="">+ Add Retail Pomade/Clay...</option>
                  {inventory.filter(p => p.category === 'styling' || p.category === 'shave').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.retailPrice || (p.costPrice * 1.8).toFixed(0)}) [{p.currentStock} left]
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductToAdd}
                  className="p-2 bg-black disabled:opacity-40 text-white rounded-xl hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tip Selection & Loyalty Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barber Gratuity / Tip */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Barber Gratuity (Tip)</span>
                <span className="font-mono text-emerald-600 font-bold">${calculatedTip.toFixed(2)}</span>
              </label>

              <div className="grid grid-cols-5 gap-1 text-xs font-semibold">
                {[0, 15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercent(pct)}
                    className={`py-2 rounded-xl transition-all ${
                      tipPercent === pct
                        ? 'bg-black text-[#FEE500] shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}%`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipPercent('custom')}
                  className={`py-2 rounded-xl transition-all ${
                    tipPercent === 'custom'
                      ? 'bg-black text-[#FEE500] shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Custom
                </button>
              </div>

              {tipPercent === 'custom' && (
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="Enter custom tip..."
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              )}
            </div>

            {/* Discount / VIP Loyalty Deduction */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>VIP Discount / Loyalty Perk</span>
                <span className="font-mono text-rose-600 font-bold">-${discountAmount.toFixed(2)}</span>
              </label>

              <div className="grid grid-cols-4 gap-1 text-xs font-semibold">
                {[0, 5, 10, 15].map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setDiscountAmount(disc)}
                    className={`py-2 rounded-xl transition-all ${
                      discountAmount === disc
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {disc === 0 ? '$0' : `-$${disc}`}
                  </button>
                ))}
              </div>

              {currentClient && currentClient.loyaltyTier.includes('VIP') && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" />
                  {currentClient.loyaltyTier} perks eligible
                </span>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              {(['card', 'apple_pay', 'cash', 'gift_card'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2.5 px-3 rounded-2xl flex flex-col items-center gap-1 capitalize transition-all border ${
                    paymentMethod === method
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${paymentMethod === method ? 'text-[#FEE500]' : 'text-slate-400'}`} />
                  <span className="text-[11px]">{method.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SMS Receipt Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Dispatch Digital SMS Receipt</span>
                <span className="text-[10px] text-slate-400">
                  Sends itemized receipt with validated parking info directly to client's phone.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendReceiptViaSms}
              onChange={(e) => setSendReceiptViaSms(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
          </div>

          {/* Checkout Financial Breakdown Summary */}
          <div className="bg-[#18181B] text-white p-4 rounded-2xl flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Sales Tax (7.0%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Gratuity / Tip:</span>
              <span>+${calculatedTip.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>VIP Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline text-white">
              <span className="text-sm font-bold font-sans text-[#FEE500]">TOTAL DUE</span>
              <span className="text-2xl font-bold font-mono text-[#FEE500]">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={lineItems.length === 0}
            className="w-full py-3.5 bg-black hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all shadow-md mt-1"
          >
            <CreditCard className="w-4 h-4 text-[#FEE500]" />
            <span>Charge & Settle Ticket (${totalAmount.toFixed(2)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
