import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Booking, Room } from "@/types";
import { formatCurrency, calculateTotalNights } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function ReservationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [queryClient]);

  // Fetch bookings with rooms included
  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/bookings'],
    select: (data: Booking[]) => {
      return data.map(booking => ({
        ...booking,
        // Format dates for display
        formattedCheckIn: new Date(booking.checkInDate).toLocaleDateString(),
        formattedCheckOut: new Date(booking.checkOutDate).toLocaleDateString(),
        // Calculate number of nights
        nights: calculateTotalNights(booking.checkInDate, booking.checkOutDate)
      }));
    }
  });

  // Function to combine bookings with room data
  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
    select: (data: Room[]) => data
  });

  const bookingsWithRooms = bookings.map(booking => {
    const room = rooms.find(r => r.id === booking.roomId);
    return { ...booking, room };
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest('DELETE', `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      toast({
        title: "Booking deleted",
        description: "The booking has been successfully deleted.",
        variant: "default",
      });
      
      // Refresh data after deletion - this will update all components using these queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      
      // Also invalidate any rooms query with filters to ensure booking page updates
      queryClient.invalidateQueries({ 
        queryKey: ['/api/rooms'], 
        refetchType: 'all' 
      });
      
      setBookingToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
    // Invalidate all room-related queries to update room management page too
    queryClient.invalidateQueries({ 
      queryKey: ['/api/rooms'],
      refetchType: 'all'
    });
    toast({
      title: "Refreshed",
      description: "The booking data has been refreshed.",
      variant: "default",
    });
  };

  // Function to view booking details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  // Function to confirm deletion
  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  // Function to execute deletion
  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete.id);
    }
  };

  // Close booking details modal
  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 p-4 md:p-6 bg-neutral-100 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Reservations</h1>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="flex items-center"
                disabled={isLoading || deleteBookingMutation.isPending}
              >
                <span className="material-icons text-sm mr-1">refresh</span>
                Refresh
              </Button>
              <div className="text-xs text-neutral-500 hidden md:block">
                Auto-refreshes every 30 seconds
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setLocation("/")}
            >
              <span className="material-icons mr-2">add</span>
              New Booking
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500">Error loading reservations.</p>
            </Card>
          ) : bookingsWithRooms.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="material-icons text-neutral-400 text-5xl mb-4">event_busy</span>
              <h3 className="text-xl font-medium mb-2">No Reservations Found</h3>
              <p className="text-neutral-500 mb-4">There are currently no reservations in the system.</p>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setLocation("/")}
              >
                Make a New Booking
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              <div className="rounded-lg shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Guest</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Room</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Check-in</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Check-out</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {bookingsWithRooms.map((booking) => (
                        <tr key={booking.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-neutral-900">{`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}</div>
                            <div className="text-sm text-neutral-500">{booking.guestInfo.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{booking.room?.name || "Unknown Room"}</div>
                            <div className="text-sm text-neutral-500">{booking.room?.roomType ? booking.room.roomType.charAt(0).toUpperCase() + booking.room.roomType.slice(1) : 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{booking.formattedCheckIn}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900">{booking.formattedCheckOut}</div>
                            <div className="text-sm text-neutral-500">{booking.nights} night(s)</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-neutral-900 font-medium">₱{booking.totalAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Confirmed
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDetails(booking)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              >
                                <span className="material-icons text-sm mr-1">visibility</span>
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteClick(booking)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                disabled={deleteBookingMutation.isPending}
                              >
                                <span className="material-icons text-sm mr-1">delete</span>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? 
              The room will be marked as available again.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookingMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteBookingMutation.isPending}
            >
              {deleteBookingMutation.isPending ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2"></span>
              ) : (
                <span className="material-icons text-sm mr-1">delete</span>
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Reservation #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-4">
              {/* Room Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-500">Room Information</h4>
                <div className="flex items-start gap-4 bg-neutral-50 p-3 rounded-md">
                  {selectedBooking.room?.image && (
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={selectedBooking.room?.image || ""} 
                        alt={selectedBooking.room?.name || "Room"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium">{selectedBooking.room?.name || "Unknown Room"}</h5>
                    <p className="text-sm text-neutral-600">
                      {selectedBooking.room?.bedType} · Capacity: {selectedBooking.room?.capacity} people
                    </p>
                    <div className="flex gap-2 mt-1">
                      {selectedBooking.room?.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="inline-flex items-center text-xs bg-white border border-neutral-200 px-2 py-1 rounded-full">
                          <span className="material-icons text-xs mr-1">{amenity.icon}</span>
                          {amenity.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-500">Stay Information</h4>
                <div className="bg-neutral-50 p-3 rounded-md grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">Check-in</p>
                    <p className="font-medium">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Check-out</p>
                    <p className="font-medium">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Duration</p>
                    <p className="font-medium">{calculateTotalNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)} night(s)</p>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-500">Guest Information</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-neutral-500">Full Name</p>
                      <p className="font-medium">{selectedBooking.guestInfo.firstName} {selectedBooking.guestInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Contact</p>
                      <p className="font-medium">{selectedBooking.guestInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Email</p>
                      <p className="font-medium">{selectedBooking.guestInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">ID Type</p>
                      <p className="font-medium">{selectedBooking.guestInfo.idType.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-500">Payment Information</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-neutral-500">Amount</p>
                      <p className="font-medium">₱{selectedBooking.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Payment Method</p>
                      <p className="font-medium">{selectedBooking.paymentMethod.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Booking Date</p>
                      <p className="font-medium">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Status</p>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-neutral-500">Special Requests</h4>
                  <div className="bg-neutral-50 p-3 rounded-md">
                    <p className="text-sm">{selectedBooking.specialRequests}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                closeDetails();
                if (selectedBooking) {
                  handleDeleteClick(selectedBooking);
                }
              }}
            >
              <span className="material-icons text-sm mr-1">delete</span>
              Delete Booking
            </Button>
            <Button variant="outline" onClick={closeDetails}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}