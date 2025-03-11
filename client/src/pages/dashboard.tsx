import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import useSidebar from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking, Room } from "@/types";

export default function DashboardPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [_, setLocation] = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get bookings from localStorage
        const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Get rooms from API
        const roomsRes = await fetch('/api/rooms');
        const roomsData = await roomsRes.json();
        
        setBookings(localBookings);
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  const occupiedRooms = bookings.length; // Assuming all bookings are for currently occupied rooms
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Calculate revenue from bookings
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 bg-neutral-100 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DashboardCard 
              title="Total Rooms" 
              value={String(totalRooms)} 
              icon="hotel" 
              trend="Available for booking" 
            />
            <DashboardCard 
              title="Occupied Rooms" 
              value={String(occupiedRooms)} 
              icon="meeting_room" 
              trend={`${occupancyRate}% occupancy rate`} 
            />
            <DashboardCard 
              title="Total Bookings" 
              value={String(totalBookings)} 
              icon="event_available" 
              trend="All confirmed bookings" 
            />
            <DashboardCard 
              title="Total Revenue" 
              value={`₱${totalRevenue.toLocaleString()}`} 
              icon="payments" 
              trend="From all bookings" 
            />
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
            
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <span className="material-icons text-4xl text-neutral-400 mb-2">event_busy</span>
                <h3 className="text-lg font-medium mb-1">No reservations yet</h3>
                <p className="text-neutral-500">Make a booking to see your reservations here</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Guest</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Room</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Check In</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Check Out</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}</div>
                            <div className="text-sm text-neutral-500">{booking.guestInfo.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{booking.room?.name || "Unknown Room"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{new Date(booking.checkInDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{new Date(booking.checkOutDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">₱{booking.totalAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Confirmed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setLocation("/")}
            >
              Make a New Booking
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
}

function DashboardCard({ title, value, icon, trend }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="material-icons text-primary">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-neutral-500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
