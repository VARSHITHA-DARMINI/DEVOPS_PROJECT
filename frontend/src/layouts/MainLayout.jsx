import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import TopNav from '../components/common/TopNav';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MainLayout = ({ title = 'FITTRACK', allowedRoles }) => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <LoadingSpinner message="Authenticating..." />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const sidebarWidth = collapsed ? '64px' : '256px';

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopNav title={title} />
        <main className="flex-1 p-6 overflow-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
