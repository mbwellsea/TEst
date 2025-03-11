import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="p-1 mr-4 text-neutral-700 md:hidden"
            onClick={onSidebarToggle}
          >
            <span className="material-icons">menu</span>
          </Button>
          <h2 className="text-lg font-medium font-poppins">Room Booking</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="material-icons text-neutral-700 text-sm">search</span>
            </span>
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1"
            />
          </div>
          <Button variant="ghost" size="icon" className="p-1 rounded-full text-neutral-700 hover:bg-neutral-100">
            <span className="material-icons">notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="p-1 rounded-full text-neutral-700 hover:bg-neutral-100">
            <span className="material-icons">help_outline</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
