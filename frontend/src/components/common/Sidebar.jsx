import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, Target, Dumbbell, Calendar,
  ClipboardList, BarChart2, Settings, LogOut, ChevronLeft,
  ChevronRight, Users, Shield, Menu, X, Activity
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
    }
  >
    <Icon size={18} className="shrink-0" />
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/goals', icon: Target, label: 'Fitness Goals' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercise Library' },
    { to: '/workout-plans', icon: Calendar, label: 'Workout Planner' },
    { to: '/workout-logs', icon: ClipboardList, label: 'Workout Tracking' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
  ];

  const trainerNav = [
    { to: '/trainer', icon: Activity, label: 'Trainer Dashboard' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercise Library' },
  ];

  const adminNav = [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercise Library' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'trainer' ? trainerNav : userNav;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-navy-800 border-r border-white/5 flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shrink-0">
          <Activity size={18} className="text-navy-900" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white tracking-tight">
            FIT<span className="text-lime-400">TRACK</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/5 p-2 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`nav-link w-full ${collapsed ? 'justify-center px-2' : ''}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
