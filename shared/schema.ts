import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Room schema
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // In Philippine Peso
  roomType: text("room_type").notNull(),
  capacity: integer("capacity").notNull(),
  bedType: text("bed_type").notNull(),
  image: text("image").notNull(),
  amenities: jsonb("amenities").notNull().$type<{ name: string; icon: string }[]>(),
  isAvailable: boolean("is_available").notNull().default(true),
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  checkInDate: text("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  guestInfo: jsonb("guest_info").notNull().$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
  }>(),
  paymentMethod: text("payment_method").notNull(),
  specialRequests: text("special_requests"),
  totalAmount: integer("total_amount").notNull(),
  createdAt: text("created_at").notNull(),
});

// Insert schemas
export const insertRoomSchema = createInsertSchema(rooms);
export const insertBookingSchema = createInsertSchema(bookings);

// Types
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// Validation schemas
export const roomFilterSchema = z.object({
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  roomType: z.string().optional(),
  budget: z.string().optional(),
});

export type RoomFilter = z.infer<typeof roomFilterSchema>;
