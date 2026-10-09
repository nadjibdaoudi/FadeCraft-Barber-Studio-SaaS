import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  DollarSign, 
  Scissors, 
  ShieldAlert, 
  Truck, 
  Clock, 
  Trash2,
  ArrowUpRight,
  Sparkles,
  X
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { InventoryCategory, InventoryItem } from '../types';

export const InventoryView: React.FC = () => {
  const { 
    inventory, 
    lowStockCount, 
    adjustInventoryStock, 
    restockInventoryItem, 
    deleteInventoryItem, 
    addInventoryItem,
    addToast 
  } = useSalon();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'low_stock' | 'in_stock'>('all');

  // Modal for adding a new product
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('blades');
  const [newItemStock, setNewItemStock] = useState<number>(10);
  const [newItemThreshold, setNewItemThreshold] = useState<number>(4);
  const [newItemUnit, setNewItemUnit] = useState('boxes');
  const [newItemCost, setNewItemCost] = useState<number>(12.00);
  const [newItemRetail, setNewItemRetail] = useState<number>(20.00);
  const [newItemSupplier, setNewItemSupplier] = useState('Empire Barber Wholesale');

  // Quick Restock Dialog state
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);

  // Calculations
  const totalValuation = inventory.reduce((acc, item) => acc + (item.currentStock * item.costPrice), 0);
  const totalUnits = inventory.reduce((acc, item) => acc + item.currentStock, 0);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = 
      selectedStatusFilter === 'all' || 
      (selectedStatusFilter === 'low_stock' && (item.status === 'low_stock' || item.status === 'out_of_stock')) ||
      (selectedStatusFilter === 'in_stock' && item.status === 'in_stock');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStockThreshold);

  const handleRestockAllCritical = () => {
    lowStockItems.forEach((item) => {
      restockInventoryItem(item.id, Math.max(5, item.minStockThreshold * 2));
    });
    addToast({
      type: 'success',
      title: 'Bulk Restock Completed',
      message: `Replenished all ${lowStockItems.length} critical supplies to safe buffer levels.`
    });
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    addInventoryItem({
      name: newItemName,
      sku: newItemSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newItemCategory,
      currentStock: Number(newItemStock),
      minStockThreshold: Number(newItemThreshold),
      unit: newItemUnit,
      costPrice: Number(newItemCost),
      retailPrice: newItemRetail ? Number(newItemRetail) : undefined,
      supplier: newItemSupplier,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      usagePerDayEstimated: 0.5
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewItemName('');
    setNewItemSku('');
    setNewItemStock(10);
    setNewItemThreshold(4);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || restockQuantity <= 0) return;
    restockInventoryItem(restockModalItem.id, restockQuantity);
    setRestockModalItem(null);
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FEE500] flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Barber Supplies & Inventory Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live stock audits for Japanese blades, shavette cartridges, pomades, pre-shave creams, aftershaves, and hygiene neck strips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <button
              onClick={handleRestockAllCritical}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Restock All {lowStockCount} Critical Supplies</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supply Item</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Tracked Supplies</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {inventory.length} <span className="text-xs text-slate-400 font-normal">items ({totalUnits} units)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center justify-between transition-colors ${
          lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200/90' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex flex-col">
            <span className="text-[11px] text-amber-800 font-semibold uppercase">Low-Stock Alerts</span>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-1 flex items-baseline gap-1.5">
              <span>{lowStockCount}</span>
              <span className="text-xs text-amber-700 font-normal">requiring reorder</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Inventory Asset Value</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Active Suppliers</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              5 Distributors
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* URGENT LOW STOCK ALERT STRIP (When items need attention) */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-3xl flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Attention Required: {lowStockItems.length} Products Below Safety Threshold
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-mono font-semibold">
              Automatic alert generated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate pr-2">{item.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1 font-mono">
                    <span className="text-rose-600 font-bold">
                      {item.currentStock} {item.unit} left
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Min: {item.minStockThreshold}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.supplier}</span>
                  <button
                    onClick={() => {
                      setRestockModalItem(item);
                      setRestockQuantity(item.minStockThreshold * 2);
                    }}
                    className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    Restock Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplies, SKU, distributor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-black"
          />
        </div>

        {/* Categories segmented tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 text-xs overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Supplies' },
            { id: 'blades', label: 'Razors & Blades' },
            { id: 'styling', label: 'Pomades & Styling' },
            { id: 'shave', label: 'Shave & Aftershave' },
            { id: 'hygiene', label: 'Sanitation & Disinfectant' },
            { id: 'care', label: 'Beard Care' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-black text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium ${
              selectedStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatusFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 ${
              selectedStatusFilter === 'low_stock' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Low Stock</span>
            {lowStockCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setSelectedStatusFilter('in_stock')}
            className={`px-3 py-1.5 rounded-xl font-medium ${
              selectedStatusFilter === 'in_stock' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            In Stock
          </button>
        </div>
      </div>

      {/* Main Supplies Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Supply Catalog & Stock Telemetry</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing {filteredInventory.length} of {inventory.length} items</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="pb-3 font-normal">Product & Category</th>
                <th className="pb-3 font-normal">SKU & Supplier</th>
                <th className="pb-3 font-normal">Stock Level / Safety</th>
                <th className="pb-3 text-center font-normal">Quick Adjust</th>
                <th className="pb-3 text-right font-normal">Unit Cost</th>
                <th className="pb-3 text-right font-normal">Status</th>
                <th className="pb-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isCritical = item.currentStock <= item.minStockThreshold;
                const ratio = Math.min(100, Math.round((item.currentStock / (item.minStockThreshold * 2.5)) * 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Name & Category */}
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                          {item.category} · {item.unit}
                        </span>
                      </div>
                    </td>

                    {/* SKU & Supplier */}
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-700 text-[11px] font-semibold">{item.sku}</span>
                        <span className="text-[11px] text-slate-400">{item.supplier}</span>
                      </div>
                    </td>

                    {/* Stock Level Bar & Threshold */}
                    <td className="py-3.5 w-48">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className={`font-bold ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.currentStock} {item.unit}
                          </span>
                          <span className="text-[10px] text-slate-400">Min: {item.minStockThreshold}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCritical ? 'bg-rose-500' : ratio < 50 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(8, ratio)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => adjustInventoryStock(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                          title="Use 1 unit"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-slate-800 text-xs">
                          {item.currentStock}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustInventoryStock(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                          title="Add 1 unit"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Cost & Value */}
                    <td className="py-3.5 text-right font-mono">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900">${item.costPrice.toFixed(2)}</span>
                        {item.retailPrice && (
                          <span className="text-[10px] text-emerald-600">Retail: ${item.retailPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 text-right">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQuantity(10);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-800" />
                <h3 className="text-base font-bold text-slate-900">Restock Supply Item</h3>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="flex flex-col gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-900">{restockModalItem.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Current Stock: {restockModalItem.currentStock} {restockModalItem.unit} (Min: {restockModalItem.minStockThreshold})
                </span>
                <span className="text-[11px] text-slate-500">
                  Supplier: {restockModalItem.supplier}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Quantity to Add ({restockModalItem.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm font-mono font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <div className="flex items-center gap-1">
                    {[5, 10, 20].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setRestockQuantity(preset)}
                        className="px-2.5 py-2 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                <span>Estimated Cost:</span>
                <span className="font-bold text-slate-900">
                  ${(restockQuantity * restockModalItem.costPrice).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Add Supply to Inventory</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Feather Hi-Stainless Blades (100pk)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="blades">Razors & Blades</option>
                    <option value="styling">Styling & Pomades</option>
                    <option value="shave">Shave & Aftershave</option>
                    <option value="hygiene">Hygiene & Sanitation</option>
                    <option value="care">Beard Care</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="BLD-FTH-100"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(parseInt(e.target.value) || 1)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="boxes / jars"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1">Retail Price ($) [Optional]</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemRetail}
                    onChange={(e) => setNewItemRetail(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Distributor / Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Empire Barber Wholesale"
                  value={newItemSupplier}
                  onChange={(e) => setNewItemSupplier(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
