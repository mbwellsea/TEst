import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomType, BudgetRange } from "@/types";
import { addDays, format } from "date-fns";

interface RoomFiltersProps {
  onSearch: (filters: {
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    budget: string;
  }) => void;
}

export default function RoomFilters({ onSearch }: RoomFiltersProps) {
  // Initialize with today and tomorrow
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const [checkInDate, setCheckInDate] = useState(format(today, 'yyyy-MM-dd'));
  const [checkOutDate, setCheckOutDate] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [roomType, setRoomType] = useState("all");
  const [budget, setBudget] = useState("any");

  const handleSearch = () => {
    onSearch({
      checkInDate,
      checkOutDate,
      roomType,
      budget
    });
  };

  return (
    <div className="p-5 border-b border-neutral-200 bg-neutral-100/50">
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-auto">
          <Label htmlFor="check-in-date" className="block text-sm font-medium text-neutral-700 mb-1">
            Check-in Date
          </Label>
          <Input
            type="date"
            id="check-in-date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full rounded-md"
            min={format(today, 'yyyy-MM-dd')}
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="check-out-date" className="block text-sm font-medium text-neutral-700 mb-1">
            Check-out Date
          </Label>
          <Input
            type="date"
            id="check-out-date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full rounded-md"
            min={format(addDays(new Date(checkInDate), 1), 'yyyy-MM-dd')}
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="room-type" className="block text-sm font-medium text-neutral-700 mb-1">
            Room Type
          </Label>
          <Select
            value={roomType}
            onValueChange={setRoomType}
          >
            <SelectTrigger id="room-type" className="w-full md:w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={RoomType.STANDARD}>Standard</SelectItem>
              <SelectItem value={RoomType.DELUXE}>Deluxe</SelectItem>
              <SelectItem value={RoomType.SUITE}>Suite</SelectItem>
              <SelectItem value={RoomType.FAMILY}>Family</SelectItem>
              <SelectItem value={RoomType.BUDGET}>Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="budget" className="block text-sm font-medium text-neutral-700 mb-1">
            Budget
          </Label>
          <Select
            value={budget}
            onValueChange={setBudget}
          >
            <SelectTrigger id="budget" className="w-full md:w-[200px]">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value={BudgetRange.BUDGET}>Budget (Under ₱2,000)</SelectItem>
              <SelectItem value={BudgetRange.MID}>Mid-range (₱2,000-₱4,000)</SelectItem>
              <SelectItem value={BudgetRange.PREMIUM}>Premium (Above ₱4,000)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto md:self-end">
          <Button 
            className="w-full px-4 py-2 bg-primary text-white hover:bg-primary/90 flex items-center justify-center" 
            onClick={handleSearch}
          >
            <span className="material-icons text-sm mr-1">search</span>
            Find Rooms
          </Button>
        </div>
      </div>
    </div>
  );
}
