
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import MessDashboard from '@/pages/MessDashboard';
import ManageMess from '@/pages/ManageMess';
import CreateMess from '@/pages/CreateMess';
import EditMess from '@/pages/EditMess';
import Profile from '@/pages/Profile';
import StudentDashboard from '@/pages/StudentDashboard';
import MessDetails from '@/pages/MessDetails';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';

function App() {
  const navigate = useNavigate();
  
  return (
    <ThemeProvider>
      <AuthProvider onAuthSuccess={(path) => navigate(path)}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mess-dashboard" element={<MessDashboard />} />
          <Route path="/manage-mess" element={<ManageMess />} />
          <Route path="/create-mess" element={<CreateMess />} />
          <Route path="/edit-mess/:id" element={<EditMess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/mess/:id" element={<MessDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
