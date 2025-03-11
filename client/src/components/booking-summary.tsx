import { differenceInDays, format } from "date-fns";
import { Room } from "@/types";

interface BookingSummaryProps {
  selectedRoom: Room | null;
  checkInDate: string;
  checkOutDate: string;
}

export default function BookingSummary({ 
  selectedRoom, 
  checkInDate, 
  checkOutDate 
}: BookingSummaryProps) {
  // Calculate number of nights
  const startDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  const nights = Math.max(1, differenceInDays(endDate, startDate));
  
  // Calculate costs
  const roomRate = selectedRoom ? selectedRoom.price : 0;
  const roomTotal = roomRate * nights;
  const taxRate = 0.10; // 10% tax
  const taxesAndFees = roomTotal * taxRate;
  const totalAmount = roomTotal + taxesAndFees;

  return (
    <div className="bg-neutral-100 rounded-md p-4">
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-neutral-700">Room Type:</span>
          <span className="font-medium">{selectedRoom ? selectedRoom.name : "No room selected"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-700">Check-in:</span>
          <span className="font-medium">{format(startDate, 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-700">Check-out:</span>
          <span className="font-medium">{format(endDate, 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-700">Duration:</span>
          <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
        </div>
        {selectedRoom && (
          <>
            <div className="flex justify-between">
              <span className="text-neutral-700">Room Rate:</span>
              <span className="font-medium">₱{roomRate.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-700">Taxes & Fees:</span>
              <span className="font-medium">₱{taxesAndFees.toLocaleString()}</span>
            </div>
            <div className="border-t border-neutral-300 pt-2 mt-2">
              <div className="flex justify-between font-medium text-base">
                <span>Total Amount:</span>
                <span className="text-primary">₱{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
        {!selectedRoom && (
          <div className="border-t border-neutral-300 pt-2 mt-2">
            <div className="text-center text-neutral-500 italic">
              Please select a room to see pricing details
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
