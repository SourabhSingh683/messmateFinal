
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
import Discover from "./pages/Discover";
import MessDetails from "./pages/MessDetails";
import StudentDashboard from "./pages/StudentDashboard";
import MessDashboard from "./pages/MessDashboard";
import ManageMess from "./pages/ManageMess";
import EditMess from "./pages/EditMess";

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
            <Route path="/discover" element={<Discover />} />
            <Route path="/mess-details/:messId" element={<MessDetails />} />
            
            {/* Protected Student Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Mess Owner Routes */}
            <Route 
              path="/mess-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['mess_owner']}>
                  <MessDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/manage-mess" 
              element={
                <ProtectedRoute allowedRoles={['mess_owner']}>
                  <ManageMess />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/edit-mess/:messId" 
              element={
                <ProtectedRoute allowedRoles={['mess_owner']}>
                  <EditMess />
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
