import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  Scissors, 
  Clock, 
  Layers, 
  Calendar,
  AlertCircle,
  Sparkles,
  PieChart as PieIcon,
  Download,
  Filter,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { FINANCIAL_PERFORMANCE_METRICS, MONTHLY_METRICS } from '../data/mockData';
import { useSalon } from '../context/SalonContext';
import { MonthlyFinancialRecord } from '../types';

type TimeRangeFilter = 'ytd' | 'fullYear' | 'last6Months';

export const AnalyticsView: React.FC = () => {
  const { appointments, clients } = useSalon();

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('ytd');
  const [showRevenue, setShowRevenue] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showNetProfit, setShowNetProfit] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyFinancialRecord | null>(null);

  // Filter dataset based on selected time range
  const chartData = useMemo(() => {
    switch (timeRange) {
      case 'last6Months':
        // April to September
        return FINANCIAL_PERFORMANCE_METRICS.slice(3, 9);
      case 'fullYear':
        // All 12 months including projections
        return FINANCIAL_PERFORMANCE_METRICS;
      case 'ytd':
      default:
        // Completed YTD months (Jan to Sep)
        return FINANCIAL_PERFORMANCE_METRICS.filter((m) => m.isCompleted);
    }
  }, [timeRange]);

  // Aggregate metrics based on the current filtered data
  const stats = useMemo(() => {
    const totalRev = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalExp = chartData.reduce((acc, curr) => acc + curr.expenses, 0);
    const totalProfit = totalRev - totalExp;
    const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';
    const totalPayroll = chartData.reduce((acc, curr) => acc + curr.payroll, 0);
    const totalSupplies = chartData.reduce((acc, curr) => acc + curr.supplies, 0);
    const totalRent = chartData.reduce((acc, curr) => acc + curr.rent, 0);
    const totalOps = chartData.reduce((acc, curr) => acc + curr.operations, 0);

    return {
      totalRev,
      totalExp,
      totalProfit,
      margin,
      totalPayroll,
      totalSupplies,
      totalRent,
      totalOps,
      payrollPercent: totalExp > 0 ? Math.round((totalPayroll / totalExp) * 100) : 0,
      suppliesPercent: totalExp > 0 ? Math.round((totalSupplies / totalExp) * 100) : 0,
      rentPercent: totalExp > 0 ? Math.round((totalRent / totalExp) * 100) : 0,
      opsPercent: totalExp > 0 ? Math.round((totalOps / totalExp) * 100) : 0,
    };
  }, [chartData]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Custom Recharts Tooltip matching high-end studio theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyFinancialRecord = payload[0].payload;
      return (
        <div className="bg-[#18181B] text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 text-xs flex flex-col gap-2.5 min-w-[240px] pointer-events-none z-50">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="font-bold text-sm tracking-tight text-white">{data.fullMonth}</span>
            {data.isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE500] text-black">
                Current
              </span>
            )}
            {!data.isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                Forecast
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 font-mono">
            {showRevenue && (
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Revenue:
                </span>
                <span className="font-bold text-sm">{formatCurrency(data.revenue)}</span>
              </div>
            )}

            {showExpenses && (
              <div className="flex items-center justify-between text-rose-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Expenses:
                </span>
                <span className="font-bold text-sm">{formatCurrency(data.expenses)}</span>
              </div>
            )}

            {showNetProfit && (
              <div className="flex items-center justify-between text-[#FEE500] pt-1 border-t border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEE500] inline-block" />
                  Net Profit:
                </span>
                <span className="font-bold text-sm">{formatCurrency(data.netProfit)}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Operating Margin:</span>
            <span className="font-bold font-mono text-white">{data.profitMargin}%</span>
          </div>

          {/* Quick Expense Sub-Breakdown preview */}
          <div className="bg-zinc-900/90 rounded-xl p-2 flex flex-col gap-1 text-[10px] text-zinc-400 mt-1">
            <div className="flex justify-between">
              <span>Barber Payroll:</span>
              <span className="font-mono text-zinc-300">{formatCurrency(data.payroll)}</span>
            </div>
            <div className="flex justify-between">
              <span>Studio Rent:</span>
              <span className="font-mono text-zinc-300">{formatCurrency(data.rent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplies & Blades:</span>
              <span className="font-mono text-zinc-300">{formatCurrency(data.supplies)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Salon Financial Telemetry & Performance
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Recharts Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track gross booking receipts versus operating overhead, barber payroll, rent, supplies, and net margin velocity.
          </p>
        </div>

        {/* Action / Export Indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audited Fiscal 2026</span>
          </div>
        </div>
      </div>

      {/* KPI CARDS (Financial Performance Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {timeRange === 'ytd' ? 'YTD Gross Revenue' : 'Period Gross Revenue'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatCurrency(stats.totalRev)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24.8%</span>
              <span className="text-slate-400 font-normal">vs previous year</span>
            </div>
          </div>
        </div>

        {/* Total Operating Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operating Overhead
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {formatCurrency(stats.totalExp)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mt-1">
              <span className="font-mono">{stats.payrollPercent}%</span>
              <span className="text-slate-400 font-normal">barber commission & pay</span>
            </div>
          </div>
        </div>

        {/* Total Net Profit */}
        <div className="bg-[#161618] text-white p-5 rounded-3xl border border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Net Operating Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEE500] text-black flex items-center justify-center font-bold">
              <span>$</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-[#FEE500] tracking-tight">
              {formatCurrency(stats.totalProfit)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Healthy cash runway</span>
            </div>
          </div>
        </div>

        {/* Operating Margin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operating Profit Margin
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {stats.margin}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <span>Top decile</span>
              <span className="text-slate-400 font-normal">vs salon avg (28%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FEATURE: RECHARTS REVENUE VS EXPENSES LINE CHART */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-6">
        {/* Chart Header with Interactive Filters & Series Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Revenue vs. Expenses Trend
              </h3>
              <span className="text-xs font-normal text-slate-400 font-mono">
                · Monthly Cashflow & Profit Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click data points to examine individual monthly cost breakdowns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Series Visibility Toggles */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200/80 text-xs">
              <button
                onClick={() => setShowRevenue(!showRevenue)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  showRevenue 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showRevenue ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Revenue</span>
              </button>

              <button
                onClick={() => setShowExpenses(!showExpenses)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  showExpenses 
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showExpenses ? 'bg-white' : 'bg-rose-500'}`} />
                <span>Expenses</span>
              </button>

              <button
                onClick={() => setShowNetProfit(!showNetProfit)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  showNetProfit 
                    ? 'bg-black text-[#FEE500] shadow-xs' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showNetProfit ? 'bg-[#FEE500]' : 'bg-black'}`} />
                <span>Net Profit</span>
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === 'ytd' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                YTD (Jan - Sep)
              </button>
              <button
                onClick={() => setTimeRange('last6Months')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === 'last6Months' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Last 6 Mo
              </button>
              <button
                onClick={() => setTimeRange('fullYear')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === 'fullYear' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Full 2026 (Forecast)
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-[380px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 15, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedMonth(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E2E8F0" 
              />

              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'monospace' }}
                dy={8}
              />

              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${val / 1000}k`}
                domain={[0, 40000]}
                dx={-8}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Reference line for average monthly break-even threshold */}
              <ReferenceLine 
                y={11550} 
                stroke="#94A3B8" 
                strokeDasharray="4 4" 
                label={{ 
                  value: 'Avg Breakeven Overhead ($11.5k)', 
                  fill: '#64748B', 
                  fontSize: 10, 
                  position: 'insideTopLeft' 
                }} 
              />

              {/* Revenue Line */}
              {showRevenue && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#10B981', strokeWidth: 3, stroke: '#FFFFFF' }}
                />
              )}

              {/* Expenses Line */}
              {showExpenses && (
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Operating Expenses"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#F43F5E', strokeWidth: 3, stroke: '#FFFFFF' }}
                />
              )}

              {/* Net Profit Line */}
              {showNetProfit && (
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke="#1E293B"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#FEE500', strokeWidth: 2, stroke: '#1E293B' }}
                  activeDot={{ r: 8, fill: '#FEE500', strokeWidth: 3, stroke: '#1E293B' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Quick Insights Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900">Gross Revenue</span>
              <span className="text-slate-400">· Cuts, beard trims, packages & retail</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-900">Operating Expenses</span>
              <span className="text-slate-400">· Payroll, rent, supplies, utilities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black border border-[#FEE500]" />
              <span className="font-semibold text-slate-900">Net Profit</span>
              <span className="text-slate-400">· Studio bottom-line margin</span>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Peak Month: <strong className="text-slate-900">September ($33,400 rev / $15,600 profit)</strong>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: EXPENSE CATEGORY DISTRIBUTION & PROFITABILITY STRATEGIES */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left: Operating Expense Category Breakdown */}
        <div className="xl:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Expense Allocation Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total {formatCurrency(stats.totalExp)}
            </span>
          </div>

          {/* Categorical Progress Bars */}
          <div className="flex flex-col gap-4">
            {/* Barber Payroll & Commission */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-800">Barber Payroll & Commission</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(stats.totalPayroll)} ({stats.payrollPercent}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.payrollPercent}%` }} 
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Competitive 50-60% commission split rewarding high chair turnaround and rebooks.
              </span>
            </div>

            {/* Studio Facility Lease */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Downtown Studio Lease & Utilities</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(stats.totalRent)} ({stats.rentPercent}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.rentPercent}%` }} 
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Fixed brick-and-mortar storefront rent ($1,800/mo) across 6 active barber chairs.
              </span>
            </div>

            {/* Consumables & Grooming Supplies */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-800">Grooming Products, Blades & Towels</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(stats.totalSupplies)} ({stats.suppliesPercent}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.suppliesPercent}%` }} 
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Feather blades, Suavecito/Uppercut pomades, neck strips, and sanitizing barbicide.
              </span>
            </div>

            {/* Operations, Software & SMS Gateway */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="font-semibold text-slate-800">Software, SMS Gateway & Marketing</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {formatCurrency(stats.totalOps)} ({stats.opsPercent}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.opsPercent}%` }} 
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Twilio automated reminders, Meta WhatsApp Cloud API, and local Google Ads.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Studio Financial Health & Strategic Takeaways */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          <div className="bg-[#161618] text-white p-6 rounded-3xl border border-zinc-800 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FEE500]" />
                <h3 className="text-base font-bold text-white">Profitability Strategic Health</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEE500] text-black">
                Grade: A+
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 flex flex-col gap-1">
                <span className="text-[11px] text-zinc-400">Revenue per Chair/Mo</span>
                <span className="text-xl font-bold font-mono text-white">$5,567</span>
                <span className="text-[10px] text-emerald-400">+$820 vs benchmark</span>
              </div>
              <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 flex flex-col gap-1">
                <span className="text-[11px] text-zinc-400">Expense-to-Revenue Ratio</span>
                <span className="text-xl font-bold font-mono text-white">55.8%</span>
                <span className="text-[10px] text-emerald-400">Industry ideal (&lt;65%)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Strong Margin Cushion:</strong> Operating margin of <strong>{stats.margin}%</strong> leaves <strong>{formatCurrency(stats.totalProfit)}</strong> in retained earnings to reinvest in chair upgrades or bonuses.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Fixed Overhead Absorption:</strong> Facility rent is diluted down to just <strong>{stats.rentPercent}%</strong> of gross sales due to peak 6-chair capacity utilization.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Annual Goal Tracking:</strong> On track to surpass the <strong>$240,000</strong> gross revenue target by mid-November based on 34m 12s chair turnaround cadence.
                </p>
              </div>
            </div>
          </div>

          {/* Drilldown on Clicked Month if Selected */}
          {selectedMonth && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Detailed Drilldown: {selectedMonth.fullMonth}
                </h4>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Revenue</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">
                    {formatCurrency(selectedMonth.revenue)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Expenses</span>
                  <span className="font-bold font-mono text-rose-600 text-sm">
                    {formatCurrency(selectedMonth.expenses)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Net Profit</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatCurrency(selectedMonth.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
