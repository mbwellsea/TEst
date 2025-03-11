import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
  const { id, name, description, price, image, amenities, capacity, bedType, isAvailable } = room;

  return (
    <div className="p-5 border-b border-neutral-200 hover:bg-neutral-50">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4">
          <div 
            className="w-full h-48 md:h-36 rounded-md bg-neutral-200 bg-cover bg-center" 
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
        <div className="w-full md:w-2/4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-base font-medium">{name}</h4>
            <Badge variant={isAvailable ? "success" : "destructive"}>
              {isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <p className="text-sm text-neutral-700 mb-2">{description}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2">
            <div className="flex items-center">
              <span className="material-icons text-neutral-700 text-base mr-1">person</span>
              <span>{capacity} {capacity > 1 ? 'Guests' : 'Guest'}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-700 text-base mr-1">king_bed</span>
              <span>{bedType}</span>
            </div>
            {amenities.slice(0, 2).map((amenity, index) => (
              <div key={index} className="flex items-center">
                <span className="material-icons text-neutral-700 text-base mr-1">{amenity.icon}</span>
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/4 flex flex-col justify-between">
          <div className="text-right">
            <div className={`text-xl font-semibold ${isAvailable ? 'text-primary' : 'text-neutral-500'}`}>
              ₱{price.toLocaleString()}<span className={`text-sm font-normal ${isAvailable ? 'text-neutral-700' : 'text-neutral-500'}`}>/night</span>
            </div>
            <div className={`text-xs ${isAvailable ? 'text-neutral-700' : 'text-neutral-500'} mb-4`}>includes taxes & fees</div>
          </div>
          {isAvailable ? (
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => onSelect(room)}>
              Select Room
            </Button>
          ) : (
            <Button className="w-full bg-neutral-300 text-neutral-600 cursor-not-allowed" disabled>
              Not Available
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
