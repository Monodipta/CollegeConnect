import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate for redirect
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Corrected path
import HomePage from './pages/HomePage';
import CollegeProfilePage from './pages/CollegeProfilePage';
import EditProfilePage from './pages/EditProfilePage'; // NEW: Import EditProfilePage
import MainLayout from './components/layout/MainLayout';
import ResourcesPage from './pages/ResourcesPage';
import EventsPage from './pages/EventsPage';
import ForumPage from './pages/ForumPage';
import CollegesPage from './pages/CollegesPage';
import OtherCollegeProfilePage from './pages/OtherCollegeProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // NEW: Import ForgotPasswordPage
import ResetPasswordPage from './pages/ResetPasswordPage'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes WITHOUT the MainLayout (e.g., Auth pages) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes WITH the MainLayout (Authenticated pages) */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><CollegeProfilePage /></MainLayout>} />
        <Route path="/edit-profile" element={<MainLayout><EditProfilePage /></MainLayout>} /> {/* NEW: Edit Profile Route */}
        <Route path="/events" element={<MainLayout><EventsPage /></MainLayout>} />
        <Route path="/resources" element={<MainLayout><ResourcesPage /></MainLayout>} />
        <Route path="/forum" element={<MainLayout><ForumPage /></MainLayout>} />
        <Route path="/colleges" element={<MainLayout><CollegesPage /></MainLayout>} />
        <Route path="/resources" element={<MainLayout><ResourcesPage /></MainLayout>} />
        <Route path="/events" element={<MainLayout><EventsPage /></MainLayout>} />
        <Route path="/forum" element={<MainLayout><ForumPage /></MainLayout>} />
        <Route path="/colleges" element={<MainLayout><CollegesPage /></MainLayout>} />
        <Route path="/colleges/:id" element={<MainLayout><OtherCollegeProfilePage /></MainLayout>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* NEW: Forgot Password route */}
<Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* NEW: Reset Password route */}

        {/* Catch-all for undefined routes - redirect to login or home */}
        {/* Consider redirecting to login if user is not authenticated for any unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} /> {/* Redirects unknown paths to login */}
      </Routes>
    </Router>
  );
}

export default App;