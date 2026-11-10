import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Activity, Dumbbell, Target, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please fill in all fields');

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'trainer') navigate('/trainer');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@fittrack.com', password: 'Admin@123' },
      trainer: { email: 'trainer@fittrack.com', password: 'Trainer@123' },
      user: { email: 'user@fittrack.com', password: 'User@123' }
    };
    setForm(creds[role]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-navy-800 p-12 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-navy-900" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            FIT<span className="text-lime-400">TRACK</span>
          </span>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Transform Your
            <span className="block text-lime-400">Fitness Journey</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Track workouts, monitor progress, achieve your goals — all in one intelligent fitness platform.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Dumbbell, title: 'Smart Workout Tracking', desc: 'Log every session with detailed metrics' },
              { icon: Target, title: 'Goal Management', desc: 'Set and track measurable fitness goals' },
              { icon: TrendingUp, title: 'Progress Analytics', desc: 'Visual insights into your performance' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 bg-navy-700/50 rounded-xl border border-white/5">
                <div className="w-10 h-10 bg-lime-400/15 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-lime-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">© 2024 FITTRACK. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-lime-400 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-navy-900" />
            </div>
            <span className="text-xl font-bold">FIT<span className="text-lime-400">TRACK</span></span>
          </div>

          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-400 text-navy-900 font-bold py-3 rounded-xl hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo shortcuts */}
            <div className="mt-5 p-4 bg-navy-700/50 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 font-medium mb-2">Quick demo access:</p>
              <div className="flex gap-2">
                {['admin', 'trainer', 'user'].map(role => (
                  <button
                    key={role}
                    onClick={() => fillDemo(role)}
                    className="flex-1 py-1.5 px-2 bg-navy-600 text-xs text-gray-300 hover:text-white hover:bg-navy-500 rounded-lg capitalize transition-colors border border-white/5"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-lime-400 hover:text-lime-300 font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
