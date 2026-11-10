import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FileText, Download, Printer, Target, Calendar, Clock, Flame, Dumbbell } from 'lucide-react';

const COLORS = ['#B8F34A', '#36CFC9', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

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

const SummaryCard = ({ icon: Icon, label, value, color = 'text-lime-400', bg = 'bg-lime-400/10' }) => (
  <div className="card-sm flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
);

const ReportsPage = () => {
  const [tab, setTab] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '', category: 'All' });

  const tabs = [
    { id: 'weekly', label: 'Weekly Report' },
    { id: 'monthly', label: 'Monthly Report' },
    { id: 'goals', label: 'Goal Achievement' },
    { id: 'history', label: 'Workout History' },
  ];

  useEffect(() => {
    fetchData(tab);
  }, [tab]);

  const fetchData = async (t) => {
    setLoading(true);
    try {
      let res;
      if (t === 'weekly') res = await reportAPI.getWeekly();
      else if (t === 'monthly') res = await reportAPI.getMonthly();
      else if (t === 'goals') res = await reportAPI.getGoals();
      else res = await reportAPI.getHistory(filters);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await reportAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workout-history.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => window.print();

  const statusColors = {
    completed: 'text-lime-400 bg-lime-400/15',
    active: 'text-cyan-400 bg-cyan-400/15',
    paused: 'text-yellow-400 bg-yellow-400/15'
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Detailed insights into your fitness journey</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn-secondary">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-navy-800 rounded-xl border border-white/5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-lime-400 text-navy-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="animate-fadeIn">
          {/* WEEKLY */}
          {tab === 'weekly' && data.summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard icon={Dumbbell} label="Total Workouts" value={data.summary.totalWorkouts} />
                <SummaryCard icon={Clock} label="Total Duration" value={`${data.summary.totalDuration}m`} color="text-cyan-400" bg="bg-cyan-400/10" />
                <SummaryCard icon={Flame} label="Calories Burned" value={data.summary.totalCalories} color="text-orange-400" bg="bg-orange-400/10" />
                <SummaryCard icon={Calendar} label="Avg Duration" value={`${data.summary.avgDuration}m`} color="text-purple-400" bg="bg-purple-400/10" />
              </div>

              <div className="card">
                <h3 className="text-base font-semibold text-white mb-4">Daily Activity This Week</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.dailyActivity || []} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="workouts" name="Workouts" fill="#B8F34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="calories" name="Calories" fill="#36CFC9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {data.exerciseSummary?.length > 0 && (
                <div className="card overflow-x-auto">
                  <h3 className="text-base font-semibold text-white mb-4">Exercise Summary</h3>
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr>
                        <th className="table-header rounded-l-lg">Exercise</th>
                        <th className="table-header">Sessions</th>
                        <th className="table-header">Duration (min)</th>
                        <th className="table-header rounded-r-lg">Calories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.exerciseSummary.map((e) => (
                        <tr key={e.name} className="table-row">
                          <td className="table-cell font-medium">{e.name}</td>
                          <td className="table-cell">{e.sessions}</td>
                          <td className="table-cell">{e.totalDuration}</td>
                          <td className="table-cell">{e.totalCalories}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MONTHLY */}
          {tab === 'monthly' && data.summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard icon={Dumbbell} label="Monthly Workouts" value={data.summary.monthlyWorkouts} />
                <SummaryCard icon={Clock} label="Total Minutes" value={data.summary.totalMinutes} color="text-cyan-400" bg="bg-cyan-400/10" />
                <SummaryCard icon={Flame} label="Calories Burned" value={data.summary.totalCalories} color="text-orange-400" bg="bg-orange-400/10" />
                <SummaryCard icon={Target} label="Current Weight" value={`${data.summary.currentWeight}kg`} color="text-purple-400" bg="bg-purple-400/10" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-base font-semibold text-white mb-4">Weekly Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.weeklyData || []} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="workouts" name="Workouts" fill="#B8F34A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="calories" name="Calories" fill="#36CFC9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 className="text-base font-semibold text-white mb-4">Category Distribution</h3>
                  {data.categoryDistribution?.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={data.categoryDistribution} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                            {data.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {data.categoryDistribution.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-gray-400 truncate">{d.name}</span>
                            <span className="text-white ml-auto">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[160px] flex items-center justify-center text-gray-500 text-sm">No data</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GOALS */}
          {tab === 'goals' && data.summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard icon={Target} label="Total Goals" value={data.summary.totalGoals} />
                <SummaryCard icon={Target} label="Completed" value={data.summary.completedGoals} color="text-lime-400" bg="bg-lime-400/10" />
                <SummaryCard icon={Target} label="Active" value={data.summary.activeGoals} color="text-cyan-400" bg="bg-cyan-400/10" />
                <SummaryCard icon={Target} label="Completion Rate" value={`${data.summary.completionRate}%`} color="text-purple-400" bg="bg-purple-400/10" />
              </div>

              <div className="card">
                <h3 className="text-base font-semibold text-white mb-4">Goal Progress Details</h3>
                {data.goals?.length > 0 ? (
                  <div className="space-y-5">
                    {data.goals.map((g) => (
                      <div key={g._id} className="p-4 bg-navy-700/50 rounded-xl border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{g.goalName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{g.goalType} · Target: {new Date(g.targetDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColors[g.status] || 'text-gray-400 bg-gray-400/15'}`}>
                            {g.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <span>Start: <span className="text-white">{g.startValue} {g.unit}</span></span>
                          <span>Current: <span className="text-lime-400 font-semibold">{g.currentValue} {g.unit}</span></span>
                          <span>Target: <span className="text-white">{g.targetValue} {g.unit}</span></span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${g.status === 'completed' ? 'bg-lime-400' : 'bg-cyan-400'}`}
                            style={{ width: `${g.progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-right text-lime-400 mt-1 font-semibold">{g.progressPercentage}%</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No goals created yet</p>
                )}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === 'history' && (
            <div className="space-y-6">
              {data.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SummaryCard icon={Dumbbell} label="Total Sessions" value={data.summary.totalSessions} />
                  <SummaryCard icon={Clock} label="Total Duration" value={`${data.summary.totalDuration}m`} color="text-cyan-400" bg="bg-cyan-400/10" />
                  <SummaryCard icon={Flame} label="Total Calories" value={data.summary.totalCalories} color="text-orange-400" bg="bg-orange-400/10" />
                </div>
              )}

              {/* Filters */}
              <div className="card">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <div>
                    <label className="label">From Date</label>
                    <input type="date" className="input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">To Date</label>
                    <input type="date" className="input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Search Exercise</label>
                    <input type="text" className="input" placeholder="Exercise name..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select className="select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                      {['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Calisthenics', 'CrossFit', 'Flexibility'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => fetchData('history')} className="btn-primary mt-3">Apply Filters</button>
              </div>

              {/* Table */}
              <div className="card overflow-x-auto">
                <h3 className="text-base font-semibold text-white mb-4">Workout History</h3>
                {data.logs?.length > 0 ? (
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr>
                        <th className="table-header rounded-l-lg">Date</th>
                        <th className="table-header">Exercise</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Duration</th>
                        <th className="table-header">Sets × Reps</th>
                        <th className="table-header">Weight</th>
                        <th className="table-header">Calories</th>
                        <th className="table-header rounded-r-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logs.map((log) => (
                        <tr key={log._id} className="table-row">
                          <td className="table-cell">{new Date(log.workoutDate).toLocaleDateString()}</td>
                          <td className="table-cell font-medium">{log.exercise?.name}</td>
                          <td className="table-cell text-gray-400">{log.exercise?.category}</td>
                          <td className="table-cell">{log.duration} min</td>
                          <td className="table-cell">{log.sets} × {log.reps}</td>
                          <td className="table-cell">{log.weight > 0 ? `${log.weight}kg` : 'BW'}</td>
                          <td className="table-cell">{log.caloriesBurned}</td>
                          <td className="table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              log.completionStatus === 'completed' ? 'bg-lime-400/15 text-lime-400' :
                              log.completionStatus === 'partial' ? 'bg-yellow-400/15 text-yellow-400' :
                              'bg-red-400/15 text-red-400'
                            }`}>
                              {log.completionStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-gray-400 text-sm">No workout records found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
