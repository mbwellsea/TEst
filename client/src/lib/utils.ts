import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

export function calculateTotalNights(checkInDate: string, checkOutDate: string): number {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateTaxesAndFees(roomPrice: number, nights: number): number {
  const roomTotal = roomPrice * nights;
  return roomTotal * 0.1; // 10% tax rate
}

export function isPastDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  return checkDate < today;
}

export function getBudgetRange(price: number): BudgetRange {
  if (price < 2000) return BudgetRange.BUDGET;
  if (price <= 4000) return BudgetRange.MID;
  return BudgetRange.PREMIUM;
}

// Import from types
import { BudgetRange } from "@/types";
