
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  CreditCard, 
  BarChart2, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Reservations', href: '/reservations', icon: Calendar },
    { name: 'Guests', href: '/guests', icon: Users },
    { name: 'Rooms', href: '/rooms', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const NavLinks = () => (
    <>
      <div className="flex items-center h-16 px-6 border-b">
        <h1 className="text-xl font-bold text-sidebar-primary">Hotel Manager</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button 
          className="sidebar-link w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
  
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col sidebar">
        <NavLinks />
      </div>
      
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 md:hidden absolute top-4 left-4 z-10">
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 sidebar">
          <NavLinks />
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
          <div className="flex items-center md:ml-0">
            <h1 className="md:hidden text-xl font-bold">Hotel Manager</h1>
          </div>
          <div className="flex items-center">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  A
                </div>
                <span className="hidden md:inline-block text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
