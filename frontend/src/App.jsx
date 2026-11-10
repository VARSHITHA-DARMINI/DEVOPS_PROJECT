import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import DashboardPage from './pages/user/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import GoalsPage from './pages/user/GoalsPage';
import ExerciseLibraryPage from './pages/user/ExerciseLibraryPage';
import WorkoutPlannerPage from './pages/user/WorkoutPlannerPage';
import WorkoutTrackingPage from './pages/user/WorkoutTrackingPage';
import ReportsPage from './pages/user/ReportsPage';

// Trainer pages
import TrainerDashboardPage from './pages/trainer/TrainerDashboardPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route element={<MainLayout title="Dashboard" allowedRoles={['user']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<MainLayout title="My Profile" allowedRoles={['user', 'trainer', 'admin']} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<MainLayout title="Fitness Goals" allowedRoles={['user']} />}>
            <Route path="/goals" element={<GoalsPage />} />
          </Route>
          <Route element={<MainLayout title="Exercise Library" allowedRoles={['user', 'trainer', 'admin']} />}>
            <Route path="/exercises" element={<ExerciseLibraryPage />} />
          </Route>
          <Route element={<MainLayout title="Workout Planner" allowedRoles={['user']} />}>
            <Route path="/workout-plans" element={<WorkoutPlannerPage />} />
          </Route>
          <Route element={<MainLayout title="Workout Tracking" allowedRoles={['user']} />}>
            <Route path="/workout-logs" element={<WorkoutTrackingPage />} />
          </Route>
          <Route element={<MainLayout title="Reports & Analytics" allowedRoles={['user']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Trainer routes */}
          <Route element={<MainLayout title="Trainer Dashboard" allowedRoles={['trainer']} />}>
            <Route path="/trainer" element={<TrainerDashboardPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<MainLayout title="Admin Dashboard" allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
