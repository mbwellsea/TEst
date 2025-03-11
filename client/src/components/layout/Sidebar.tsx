import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const sidebarLinks = [
    { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/", icon: "bed", label: "Room Management" },
    { path: "/reservations", icon: "calendar_today", label: "Reservations" },
    { path: "/guests", icon: "people", label: "Guests" },
    { path: "/billing", icon: "payments", label: "Billing" },
    { path: "/reports", icon: "insights", label: "Reports" },
    { path: "/settings", icon: "settings", label: "Settings" },
  ];

  const sidebarBaseClasses = 
    "flex flex-col w-64 bg-white border-r border-neutral-200 flex-shrink-0 transition-all duration-300";
  const sidebarMobileClasses = isOpen 
    ? "fixed inset-y-0 left-0 z-30" 
    : "hidden";
  const sidebarDesktopClasses = "hidden md:flex";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-20 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar for mobile */}
      <div className={cn(sidebarBaseClasses, sidebarMobileClasses)}>
        <SidebarContent 
          links={sidebarLinks} 
          currentPath={location} 
        />
      </div>

      {/* Sidebar for desktop */}
      <div className={cn(sidebarBaseClasses, sidebarDesktopClasses)}>
        <SidebarContent 
          links={sidebarLinks} 
          currentPath={location} 
        />
      </div>
    </>
  );
}

interface SidebarContentProps {
  links: { path: string; icon: string; label: string }[];
  currentPath: string;
}

function SidebarContent({ links, currentPath }: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 bg-primary">
        <h1 className="text-xl font-semibold font-poppins text-white">Hotel Management</h1>
      </div>
      <div className="flex flex-col flex-grow overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium",
                currentPath === link.path 
                  ? "sidebar-active" 
                  : "text-neutral-700 hover:bg-neutral-100 rounded-md"
              )}
            >
              <span className="material-icons mr-3">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center">
            <span className="material-icons text-neutral-600 text-sm">person</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900">Front Desk Staff</p>
            <p className="text-xs text-neutral-700">staff@hotelname.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
