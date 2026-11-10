import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, Flame, Clock, Target, TrendingUp, Dumbbell, Star } from 'lucide-react';

const COLORS = ['#B8F34A', '#36CFC9', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#10B981'];

const StatCard = ({ icon: Icon, label, value, unit, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}<span className="text-sm text-gray-400 ml-1">{unit}</span></p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-navy-700 border border-white/10 rounded-xl p-3 text-xs">
        <p className="text-gray-300 font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="text-white font-semibold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, weeklyRes, monthlyRes, distRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getWeeklyActivity(),
          dashboardAPI.getMonthlyProgress(),
          dashboardAPI.getCategoryDistribution()
        ]);
        setStats(statsRes.data.stats);
        setRecentLogs(statsRes.data.recentLogs || []);
        setGoals(statsRes.data.goals || []);
        setFeedback(statsRes.data.feedback || []);
        setWeekly(weeklyRes.data.activity || []);
        setMonthly(monthlyRes.data.progress || []);
        setDistribution(distRes.data.distribution || []);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statusColors = {
    completed: 'bg-lime-400/20 text-lime-400',
    partial: 'bg-yellow-400/20 text-yellow-400',
    skipped: 'bg-red-400/20 text-red-400'
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-lime-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2 bg-navy-800 border border-white/5 rounded-xl px-4 py-2">
          <TrendingUp size={16} className="text-lime-400" />
          <span className="text-sm text-gray-300">Keep up the great work!</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="Total Workouts" value={stats?.totalWorkouts || 0} unit="sessions" color="bg-lime-400/15 text-lime-400" />
        <StatCard icon={Clock} label="Total Duration" value={stats?.totalDuration || 0} unit="mins" color="bg-cyan-400/15 text-cyan-400" />
        <StatCard icon={Flame} label="Calories Burned" value={stats?.totalCalories || 0} unit="kcal" color="bg-orange-400/15 text-orange-400" />
        <StatCard icon={Target} label="Active Goals" value={stats?.activeGoals || 0} unit="goals" color="bg-purple-400/15 text-purple-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="card xl:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4">Weekly Workout Activity</h3>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Bar dataKey="workouts" name="Workouts" fill="#B8F34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="duration" name="Duration (min)" fill="#36CFC9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No workout data this week yet</div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Exercise Categories</h3>
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">Log workouts to see categories</div>
          )}
          {distribution.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {distribution.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400">{d.name}</span>
                  </div>
                  <span className="text-white font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Monthly Fitness Progress</h3>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="workouts" name="Workouts" stroke="#B8F34A" strokeWidth={2.5} dot={{ fill: '#B8F34A', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="calories" name="Calories" stroke="#36CFC9" strokeWidth={2.5} dot={{ fill: '#36CFC9', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="card">
          <h3 className="text-base font-semibold text-white mb-4">Recent Workouts</h3>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-lime-400/10 rounded-xl flex items-center justify-center">
                      <Dumbbell size={16} className="text-lime-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{log.exercise?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(log.workoutDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{log.duration} min</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[log.completionStatus] || 'bg-gray-400/20 text-gray-400'}`}>
                      {log.completionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No workouts logged yet</p>
          )}
        </div>

        {/* Goals & Feedback */}
        <div className="space-y-6">
          {/* Goals */}
          <div className="card">
            <h3 className="text-base font-semibold text-white mb-4">Fitness Goals</h3>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div key={g._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-200">{g.goalName}</span>
                      <span className="text-xs text-lime-400 font-semibold">{g.progressPercentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill bg-lime-400"
                        style={{ width: `${g.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No goals set yet</p>
            )}
          </div>

          {/* Trainer Feedback */}
          {feedback.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-white mb-4">Trainer Feedback</h3>
              {feedback.map((f) => (
                <div key={f._id} className="p-3 bg-navy-700/50 rounded-xl border border-white/5 mb-3 last:mb-0">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{f.category}</span>
                  </div>
                  <p className="text-xs text-gray-300">{f.feedbackText}</p>
                  {f.trainer && <p className="text-xs text-gray-500 mt-1">— {f.trainer.name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
