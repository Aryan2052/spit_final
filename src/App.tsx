import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventManagement from "./pages/EventManagement";
import PRMarketing from "./pages/PRMarketing";
import Engagement from "./pages/Engagement";
import Analytics from "./pages/Analytics";
import BudgetOptimization from "./pages/BudgetOptimization";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Profile from "./pages/profile";
import EventInfo from "./pages/EventInfo";
import Gamification from "./pages/Gamification";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <GamificationProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/event/:id" element={<EventInfo />} />
                  <Route path="/event/:id/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />

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
                    path="/budget-optimization"
                    element={<ProtectedRoute><BudgetOptimization /></ProtectedRoute>}
                  />
                  <Route
                    path="/management"
                    element={<ProtectedRoute><EventManagement /></ProtectedRoute>}
                  />
                  <Route
                    path="/profile"
                    element={<ProtectedRoute><Profile /></ProtectedRoute>}
                  />

                  {/* Public Routes */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </QueryClientProvider>
          </GamificationProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
