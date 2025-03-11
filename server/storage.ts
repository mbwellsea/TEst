import { Room, InsertRoom, RoomFilter, Booking, InsertBooking } from "@shared/schema";

export interface IStorage {
  // Room operations
  getRooms(filters?: RoomFilter): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoomAvailability(id: number, isAvailable: boolean): Promise<Room | undefined>;
  
  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  deleteBooking(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private rooms: Map<number, Room>;
  private bookings: Map<number, Booking>;
  private roomIdCounter: number;
  private bookingIdCounter: number;

  constructor() {
    this.rooms = new Map();
    this.bookings = new Map();
    this.roomIdCounter = 1;
    this.bookingIdCounter = 1;

    // Initialize with sample rooms
    this.initializeRooms();
    
    // Initialize with sample bookings
    this.initializeSampleBookings();
  }

  private initializeRooms() {
    const sampleRooms: InsertRoom[] = [
      {
        name: "Standard Room",
        description: "A comfortable room with all basic amenities perfect for budget travelers.",
        price: 1800,
        roomType: "standard",
        capacity: 2,
        bedType: "1 Double Bed",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        amenities: [
          { name: "Free WiFi", icon: "wifi" },
          { name: "Air Conditioning", icon: "ac_unit" }
        ],
        isAvailable: true
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with upgraded amenities and city view for a comfortable stay.",
        price: 2800,
        roomType: "deluxe",
        capacity: 2,
        bedType: "1 Queen Bed",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        amenities: [
          { name: "Free WiFi", icon: "wifi" },
          { name: "Room Service", icon: "room_service" }
        ],
        isAvailable: true
      },
      {
        name: "Family Suite",
        description: "Spacious suite with separate living area, perfect for families or small groups.",
        price: 3500,
        roomType: "family",
        capacity: 4,
        bedType: "2 Queen Beds",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        amenities: [
          { name: "Smart TV", icon: "tv" },
          { name: "Bathtub", icon: "bathtub" }
        ],
        isAvailable: true
      },
      {
        name: "Executive Suite",
        description: "Luxurious suite with panoramic city views, separate living area and premium amenities.",
        price: 4500,
        roomType: "suite",
        capacity: 2,
        bedType: "1 King Bed",
        image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        amenities: [
          { name: "Jacuzzi", icon: "hot_tub" },
          { name: "Mini Bar", icon: "local_bar" }
        ],
        isAvailable: true
      },
      {
        name: "Budget Single",
        description: "Cozy room for solo travelers with essential amenities at an affordable price.",
        price: 1200,
        roomType: "budget",
        capacity: 1,
        bedType: "1 Single Bed",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        amenities: [
          { name: "Free WiFi", icon: "wifi" },
          { name: "Breakfast", icon: "restaurant_menu" }
        ],
        isAvailable: true
      }
    ];

    // Add sample rooms to storage
    sampleRooms.forEach(room => {
      this.createRoom(room);
    });
  }

  // Room operations
  async getRooms(filters?: RoomFilter): Promise<Room[]> {
    let rooms = Array.from(this.rooms.values());

    // Apply filters if provided
    if (filters) {
      // Filter by room type
      if (filters.roomType) {
        rooms = rooms.filter(room => room.roomType === filters.roomType);
      }

      // Filter by budget range
      if (filters.budget) {
        switch (filters.budget) {
          case "budget": // Under ₱2,000
            rooms = rooms.filter(room => room.price < 2000);
            break;
          case "mid": // ₱2,000-₱4,000
            rooms = rooms.filter(room => room.price >= 2000 && room.price <= 4000);
            break;
          case "premium": // Above ₱4,000
            rooms = rooms.filter(room => room.price > 4000);
            break;
        }
      }

      // We're not actually checking date conflicts for this MVP
      // but in a real application, we would check if a room is booked
      // during the selected dates
    }

    return rooms;
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.roomIdCounter++;
    const newRoom: Room = { 
      ...room, 
      id,
      isAvailable: room.isAvailable !== undefined ? room.isAvailable : true 
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async updateRoomAvailability(id: number, isAvailable: boolean): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom: Room = { ...room, isAvailable };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  private initializeSampleBookings() {
    // Create sample bookings with corresponding guests, dates, and payment info
    const sampleBookings: InsertBooking[] = [
      {
        roomId: 1, // Standard Room
        checkInDate: "2025-03-11",
        checkOutDate: "2025-03-13",
        guestInfo: {
          firstName: "Maria",
          lastName: "Santos",
          email: "maria.santos@example.com",
          phone: "+63 912 345 6789",
          idType: "passport",
          idNumber: "P1234567"
        },
        paymentMethod: "credit_card",
        totalAmount: 3960, // 1800 x 2 nights + taxes/fees
        specialRequests: "Please prepare extra pillows",
        createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
      },
      {
        roomId: 2, // Deluxe Room
        checkInDate: "2025-03-15",
        checkOutDate: "2025-03-18",
        guestInfo: {
          firstName: "Juan",
          lastName: "Dela Cruz",
          email: "juan.delacruz@example.com",
          phone: "+63 917 123 4567",
          idType: "drivers_license",
          idNumber: "DL87654321"
        },
        paymentMethod: "gcash",
        totalAmount: 9240, // 2800 x 3 nights + taxes/fees
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        roomId: 3, // Family Suite
        checkInDate: "2025-03-20",
        checkOutDate: "2025-03-25",
        guestInfo: {
          firstName: "Anton",
          lastName: "Reyes",
          email: "anton.reyes@example.com",
          phone: "+63 918 765 4321",
          idType: "national_id",
          idNumber: "NID123456"
        },
        paymentMethod: "cash",
        totalAmount: 19250, // 3500 x 5 nights + taxes/fees
        specialRequests: "Requesting a baby crib and early check-in if possible",
        createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];

    // Add sample bookings and update room availability
    sampleBookings.forEach(booking => {
      this.createBooking(booking);
      this.updateRoomAvailability(booking.roomId, false); // Mark room as unavailable
    });
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const newBooking: Booking = { 
      ...booking, 
      id,
      createdAt: booking.createdAt || now.toISOString(),
      specialRequests: booking.specialRequests || null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const booking = this.bookings.get(id);
    if (!booking) return false;
    
    this.bookings.delete(id);
    return true;
  }
}

export const storage = new MemStorage();
