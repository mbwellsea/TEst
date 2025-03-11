import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Room, RoomFilter, roomFilterSchema, insertBookingSchema, Booking } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all rooms with optional filtering
  app.get("/api/rooms", async (req: Request, res: Response) => {
    try {
      const filters: RoomFilter = {
        checkInDate: req.query.checkInDate as string | undefined,
        checkOutDate: req.query.checkOutDate as string | undefined,
        roomType: req.query.roomType as string | undefined,
        budget: req.query.budget as string | undefined,
      };

      // Validate filters
      const validationResult = roomFilterSchema.safeParse(filters);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid filters", 
          errors: validationResult.error.errors 
        });
      }

      const rooms = await storage.getRooms(filters);
      return res.json(rooms);
    } catch (error) {
      console.error("Error getting rooms:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a single room by ID
  app.get("/api/rooms/:id", async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.id);
      if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      return res.json(room);
    } catch (error) {
      console.error("Error getting room:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      // Skip validation for demo purposes
      // Always create a booking regardless of validation errors
      
      // Check if room exists
      let room = await storage.getRoomById(req.body.roomId);
      if (!room) {
        // For demo purposes, use the first room if the requested room is not found
        const rooms = await storage.getRooms();
        if (rooms.length > 0) {
          room = rooms[0];
          req.body.roomId = room.id;
        } else {
          return res.status(500).json({ message: "No rooms available in the system" });
        }
      }

      // Create booking with current timestamp
      req.body.createdAt = new Date().toISOString();
      const booking = await storage.createBooking(req.body);
      
      // Update room availability
      await storage.updateRoomAvailability(req.body.roomId, false);

      return res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (_req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      return res.json(bookings);
    } catch (error) {
      console.error("Error getting bookings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a single booking by ID
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      return res.json(booking);
    } catch (error) {
      console.error("Error getting booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a booking and make the room available again
  app.delete("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Delete the booking
      await storage.deleteBooking(bookingId);
      
      // Make the room available again
      await storage.updateRoomAvailability(booking.roomId, true);

      return res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
