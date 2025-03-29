import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventManagement from "./pages/EventManagement";
import PRMarketing from "./pages/PRMarketing";
import Engagement from "./pages/Engagement";
import Analytics from "./pages/Analytics";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />

                {/* Protected Routes */}
                <Route
                  path="/event-management"
                  element={<ProtectedRoute><EventManagement /></ProtectedRoute>}
                />
                <Route
                  path="/pr-marketing"
                  element={<ProtectedRoute><PRMarketing /></ProtectedRoute>}
                />
                <Route
                  path="/engagement"
                  element={<ProtectedRoute><Engagement /></ProtectedRoute>}
                />
                <Route
                  path="/analytics"
                  element={<ProtectedRoute><Analytics /></ProtectedRoute>}
                />
                <Route
                  path="/management"
                  element={<ProtectedRoute><EventManagement /></ProtectedRoute>}
                />

                {/* Public Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </QueryClientProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
