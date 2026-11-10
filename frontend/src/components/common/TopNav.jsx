import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';

const TopNav = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    trainer: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30',
    user: 'bg-lime-400/20 text-lime-400 border-lime-400/30'
  };

  return (
    <header className="h-16 bg-navy-800/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Title */}
      <h2 className="text-base font-semibold text-white">{title}</h2>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors relative">
          <Bell size={16} className="text-gray-400" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-lime-400/20 border border-lime-400/30 flex items-center justify-center">
              <span className="text-xs font-bold text-lime-400">{initials}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${roleColors[user?.role] || roleColors.user}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-navy-700 border border-white/10 rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User size={15} /> My Profile
              </button>
              <div className="border-t border-white/5 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
