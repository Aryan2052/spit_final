import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

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
                <Link to="/add-event" className="nav-link">Add event</Link>
              </>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
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
              </>
            )}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex items-center space-x-2 py-2 text-foreground/80 hover:text-foreground transition-colors duration-200">
                    <User size={18} className="text-foreground/80" />
                    <span>{user?.username || 'User'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2">
                    Log in
                  </Link>
                  <Link to="/auth/signup" className="btn-primary text-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
