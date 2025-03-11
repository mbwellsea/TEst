import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RoomFilters from "@/components/room-filters";
import RoomCard from "@/components/ui/room-card";
import BookingForm from "@/components/booking-form";
import useSidebar from "@/hooks/use-sidebar";
import { Room, RoomFilters as RoomFiltersType } from "@/types";
import { addDays, format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

export default function BookingPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Initialize with today and tomorrow
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const [filters, setFilters] = useState<RoomFiltersType>({
    checkInDate: format(today, 'yyyy-MM-dd'),
    checkOutDate: format(tomorrow, 'yyyy-MM-dd'),
    roomType: "",
    budget: "",
  });

  const handleFilterChange = (newFilters: RoomFiltersType) => {
    setFilters(newFilters);
    // Reset selected room when filters change
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    // Refetch rooms to update availability
    roomsQuery.refetch();
  };
  
  // Construct the URL with filters
  const getRoomsUrl = () => {
    const searchParams = new URLSearchParams();
    if (filters.checkInDate) searchParams.append('checkInDate', filters.checkInDate);
    if (filters.checkOutDate) searchParams.append('checkOutDate', filters.checkOutDate);
    if (filters.roomType) searchParams.append('roomType', filters.roomType);
    if (filters.budget) searchParams.append('budget', filters.budget);
    
    const queryString = searchParams.toString();
    return `/api/rooms${queryString ? `?${queryString}` : ''}`;
  };
  
  // Fetch rooms based on filters
  const roomsQuery = useQuery<Room[]>({
    queryKey: [getRoomsUrl()],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return response.json() as Promise<Room[]>;
    }
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 bg-neutral-100 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Room Selection Section */}
            <div className="flex-1 bg-white rounded-lg shadow-sm">
              <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-lg font-medium font-poppins">Available Rooms</h3>
                <button 
                  onClick={() => roomsQuery.refetch()}
                  className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                  disabled={roomsQuery.isLoading}
                >
                  <span className="material-icons text-sm mr-1">refresh</span>
                  Refresh
                </button>
              </div>
              
              <RoomFilters onSearch={handleFilterChange} />
              
              <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
                {roomsQuery.isLoading ? (
                  <div className="p-6 text-center">
                    <p>Loading rooms...</p>
                  </div>
                ) : roomsQuery.isError ? (
                  <div className="p-6 text-center">
                    <p className="text-red-500">Error loading rooms. Please try again.</p>
                  </div>
                ) : roomsQuery.data && roomsQuery.data.length === 0 ? (
                  <div className="p-6 text-center">
                    <p>No rooms found matching your criteria.</p>
                  </div>
                ) : (
                  roomsQuery.data && roomsQuery.data.map((room: Room) => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onSelect={handleRoomSelect} 
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Booking Form Section */}
            <BookingForm 
              selectedRoom={selectedRoom} 
              checkInDate={filters.checkInDate}
              checkOutDate={filters.checkOutDate}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper function to handle 401 responses
type UnauthorizedBehavior = "returnNull" | "throw";
const getQueryFn = <T,>({ on401 }: { on401: UnauthorizedBehavior }) => 
  async ({ queryKey }: { queryKey: (string | Object)[] }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    
    return res.json() as Promise<T>;
  };
