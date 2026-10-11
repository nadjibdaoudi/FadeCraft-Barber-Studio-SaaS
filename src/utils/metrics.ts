import { Invoice } from '../types';

// Put this file at: src/utils/metrics.ts

export const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const pad = (n: number) => String(n).padStart(2, '0');

// Local calendar date as YYYY-MM-DD (never use toISOString for this: it shifts the day by timezone).
export const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => localDate(new Date());

export const addDays = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return localDate(new Date(y, (m || 1) - 1, (d || 1) + days));
};

export const formatMoney = (n: number): string =>
  `${n < 0 ? '-' : ''}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;

export const formatMoneyShort = (n: number): string =>
  Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;

// Percent change from prev to cur. Returns null when there is nothing to compare with.
export const pctChange = (cur: number, prev: number): number | null =>
  prev > 0 ? ((cur - prev) / prev) * 100 : null;

const isPaid = (i: Invoice) => i.status === 'paid';

// Sum of paid invoices between two dates (inclusive, YYYY-MM-DD).
export const revenueBetween = (invoices: Invoice[], from: string, to: string): number =>
  invoices
    .filter((i) => isPaid(i) && i.date >= from && i.date <= to)
    .reduce((sum, i) => sum + i.totalAmount, 0);

// Paid invoices between two dates (inclusive).
export const paidBetween = (invoices: Invoice[], from: string, to: string): Invoice[] =>
  invoices.filter((i) => isPaid(i) && i.date >= from && i.date <= to);

export interface MonthRevenue {
  monthIndex: number;
  month: string; // single letter
  name: string; // Jan, Feb...
  revenue: number;
  cuts: number; // number of paid invoices
}

// Twelve months of paid revenue for a given year.
export const monthlyRevenue = (invoices: Invoice[], year: number): MonthRevenue[] => {
  const months: MonthRevenue[] = MONTH_NAMES.map((name, i) => ({
    monthIndex: i,
    month: MONTH_LETTERS[i],
    name,
    revenue: 0,
    cuts: 0
  }));

  invoices.forEach((inv) => {
    if (!isPaid(inv) || !inv.date) return;
    const [y, m] = inv.date.split('-').map(Number);
    if (y !== year || !m || m < 1 || m > 12) return;
    months[m - 1].revenue += inv.totalAmount;
    months[m - 1].cuts += 1;
  });

  return months;
};
