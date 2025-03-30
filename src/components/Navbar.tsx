import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface RegisteredEvent {
  _id: string;
  name: string;
  date?: string;
  location: string;
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load registered events from localStorage when user is authenticated
    if (isAuthenticated) {
      loadRegisteredEvents();
    }
    
    // Listen for registration events
    const handleEventRegistered = (e: CustomEvent) => {
      loadRegisteredEvents();
    };
    
    window.addEventListener('eventRegistered', handleEventRegistered as EventListener);
    
    return () => {
      window.removeEventListener('eventRegistered', handleEventRegistered as EventListener);
    };
  }, [isAuthenticated]);

  const loadRegisteredEvents = () => {
    try {
      const events = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
      setRegisteredEvents(events);
    } catch (error) {
      console.error('Error loading registered events:', error);
      setRegisteredEvents([]);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-display font-semibold text-gradient">CampusEvents</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/event-management" className="nav-link">Management</Link>
                <Link to="/pr-marketing" className="nav-link">PR & Marketing</Link>
                <Link to="/engagement" className="nav-link">Engagement</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
                <Link to="/budget-optimization" className="nav-link">Predictive Budget Optimization</Link>
              </>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Registered Events Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative inline-flex items-center justify-center">
                      <Calendar size={18} className="text-foreground/80" />
                      {registeredEvents.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          {registeredEvents.length}
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Registered Events</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {registeredEvents.length === 0 ? (
                      <DropdownMenuItem disabled>
                        <span className="text-sm text-muted-foreground">No registered events</span>
                      </DropdownMenuItem>
                    ) : (
                      registeredEvents.map(event => (
                        <DropdownMenuItem key={event._id} asChild>
                          <Link to={`/event/${event._id}`} className="cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">{event.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {event.date || 'Date TBD'}
                              </span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link to="/profile" className="flex items-center space-x-2 hover:text-foreground transition-colors duration-200">
                  <User size={18} className="text-foreground/80" />
                  <span className="text-foreground/80">{user?.username || 'User'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
                  Log in
                </Link>
                <Link to="/auth/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground/80 hover:text-foreground transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-card mt-2 mx-4 rounded-2xl p-4 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="nav-link py-2">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/event-management" className="nav-link py-2">Management</Link>
                <Link to="/pr-marketing" className="nav-link py-2">PR & Marketing</Link>
                <Link to="/engagement" className="nav-link py-2">Engagement</Link>
                <Link to="/analytics" className="nav-link py-2">Analytics</Link>
                <Link to="/budget-optimization" className="nav-link py-2">Predictive Budget Optimization</Link>
                {/* Mobile Registered Events */}
                <div className="py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={16} />
                    <span className="font-medium">My Registered Events</span>
                    {registeredEvents.length > 0 && (
                      <Badge>{registeredEvents.length}</Badge>
                    )}
                  </div>
                  
                  {registeredEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-6">No registered events</p>
                  ) : (
                    <div className="space-y-2 pl-6">
                      {registeredEvents.map(event => (
                        <Link 
                          key={event._id} 
                          to={`/event/${event._id}`}
                          className="block text-sm hover:text-primary transition-colors"
                        >
                          {event.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link py-2 flex items-center">
                  <User size={16} className="mr-2" />
                  {user?.username || 'Profile'}
                </Link>
                <button
                  onClick={logout}
                  className="nav-link py-2 text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="nav-link py-2">Log in</Link>
                <Link to="/auth/signup" className="btn-primary py-2 text-center">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
