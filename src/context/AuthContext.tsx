import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  fetchUserData: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Add token to user object
          setUser({ ...parsedUser, token });
        } catch (error) {
          console.error('Error parsing user data:', error);
          // If there's an error parsing, fetch fresh data
          fetchUserData();
        }
      } else {
        // If no user data in localStorage, fetch it
        fetchUserData();
      }
    }
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data from API:', userData);
        
        // Ensure the userData has all required fields
        const userWithAllFields = {
          id: userData.id || userData._id,
          username: userData.username || '',
          email: userData.email || '',
          token: token // Add token to user object
        };
        
        setUser(userWithAllFields);
        localStorage.setItem('user', JSON.stringify(userWithAllFields));
      } else {
        // If token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    // Add token to user data before storing
    const userWithToken = { ...userData, token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    setIsAuthenticated(true);
    setUser(userWithToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
