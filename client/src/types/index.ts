// Room types
export enum RoomType {
  STANDARD = "standard",
  DELUXE = "deluxe",
  SUITE = "suite",
  FAMILY = "family",
  BUDGET = "budget",
}

export enum BudgetRange {
  BUDGET = "budget", // Under ₱2,000
  MID = "mid", // ₱2,000-₱4,000
  PREMIUM = "premium", // Above ₱4,000
}

export interface Amenity {
  name: string;
  icon: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  roomType: RoomType;
  capacity: number;
  bedType: string;
  image: string;
  amenities: Amenity[];
  isAvailable: boolean;
}

// Booking types
export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  GCASH = "gcash",
  PAYMAYA = "paymaya",
}

export enum IdType {
  PASSPORT = "passport",
  DRIVERS_LICENSE = "drivers_license",
  NATIONAL_ID = "national_id",
  OTHER = "other",
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idType: IdType;
  idNumber: string;
}

export interface BookingDetails {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestInfo: GuestInfo;
  paymentMethod: PaymentMethod;
  specialRequests?: string;
  totalAmount: number;
}

export interface Booking {
  id: number;
  roomId: number;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  guestInfo: GuestInfo;
  paymentMethod: PaymentMethod;
  specialRequests?: string;
  totalAmount: number;
  createdAt: string;
}

// Filter types
export interface RoomFilters {
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  budget: string;
}
