
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            
            {/* Protected Routes - To be implemented */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  {/* <StudentDashboard /> */}
                  <div className="container mx-auto p-8">
                    <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
                    <p>This page is under construction. Coming soon!</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/mess-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['mess_owner']}>
                  {/* <MessDashboard /> */}
                  <div className="container mx-auto p-8">
                    <h1 className="text-2xl font-bold mb-4">Mess Owner Dashboard</h1>
                    <p>This page is under construction. Coming soon!</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  {/* <ProfilePage /> */}
                  <div className="container mx-auto p-8">
                    <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                    <p>This page is under construction. Coming soon!</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
