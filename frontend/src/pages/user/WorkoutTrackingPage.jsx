import { useState, useEffect } from 'react';
import { logAPI, exerciseAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, Flame, Clock, Dumbbell, CheckCircle, ClipboardList } from 'lucide-react';

const statusStyles = {
  completed: 'bg-lime-400/15 text-lime-400',
  partial: 'bg-yellow-400/15 text-yellow-400',
  skipped: 'bg-red-400/15 text-red-400'
};

const WorkoutTrackingPage = () => {
  const [logs, setLogs] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [todayStats, setTodayStats] = useState({ count: 0, totalDuration: 0, totalCalories: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const initForm = { exercise: '', workoutDate: today, duration: '', sets: 3, reps: 10, weight: 0, caloriesBurned: '', completionStatus: 'completed', notes: '' };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    Promise.all([logAPI.getAll({ limit: 50 }), exerciseAPI.getAll()])
      .then(([lRes, eRes]) => {
        setLogs(lRes.data.logs);
        setTodayStats(lRes.data.todayStats || {});
        setExercises(eRes.data.exercises);
        if (eRes.data.exercises.length > 0) {
          setForm(f => ({ ...f, exercise: eRes.data.exercises[0]._id }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const autoCalc = (exerciseId, duration) => {
    const ex = exercises.find(e => e._id === exerciseId);
    if (ex && duration) return Math.round(ex.caloriesPerMinute * Number(duration));
    return 0;
  };

  const handleExerciseChange = (exerciseId) => {
    const cal = autoCalc(exerciseId, form.duration);
    setForm(f => ({ ...f, exercise: exerciseId, caloriesBurned: cal || f.caloriesBurned }));
  };

  const handleDurationChange = (duration) => {
    const cal = autoCalc(form.exercise, duration);
    setForm(f => ({ ...f, duration, caloriesBurned: cal || f.caloriesBurned }));
  };

  const handleEdit = (log) => {
    setForm({
      exercise: log.exercise?._id || log.exercise,
      workoutDate: new Date(log.workoutDate).toISOString().split('T')[0],
      duration: log.duration,
      sets: log.sets,
      reps: log.reps,
      weight: log.weight,
      caloriesBurned: log.caloriesBurned,
      completionStatus: log.completionStatus,
      notes: log.notes || ''
    });
    setEditing(log._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.exercise || !form.duration || !form.workoutDate) {
      return setError('Exercise, date and duration are required');
    }
    const payload = {
      ...form,
      duration: Number(form.duration),
      sets: Number(form.sets),
      reps: Number(form.reps),
      weight: Number(form.weight),
      caloriesBurned: Number(form.caloriesBurned) || autoCalc(form.exercise, form.duration)
    };
    try {
      if (editing) {
        const res = await logAPI.update(editing, payload);
        setLogs(logs.map(l => l._id === editing ? res.data.log : l));
      } else {
        const res = await logAPI.create(payload);
        setLogs([res.data.log, ...logs]);
        // Update today stats
        if (payload.workoutDate === today) {
          setTodayStats(s => ({
            count: s.count + 1,
            totalDuration: s.totalDuration + payload.duration,
            totalCalories: s.totalCalories + payload.caloriesBurned,
            completed: s.completed + (payload.completionStatus === 'completed' ? 1 : 0)
          }));
        }
      }
      setShowForm(false);
      setEditing(null);
      setForm(f => ({ ...initForm, exercise: f.exercise }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout');
    }
  };

  const handleDelete = async (id) => {
    try {
      await logAPI.delete(id);
      setLogs(logs.filter(l => l._id !== id));
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Workout Tracking</h1>
          <p className="page-subtitle">Log and monitor your daily workouts</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(f => ({ ...initForm, exercise: f.exercise })); setShowForm(true); }} className="btn-primary">
          <Plus size={18} /> Add Workout
        </button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Today's Workouts", value: todayStats.count, icon: Dumbbell, color: 'bg-lime-400/15 text-lime-400' },
          { label: 'Total Duration', value: `${todayStats.totalDuration}m`, icon: Clock, color: 'bg-cyan-400/15 text-cyan-400' },
          { label: 'Calories Burned', value: todayStats.totalCalories, icon: Flame, color: 'bg-orange-400/15 text-orange-400' },
          { label: 'Completed', value: todayStats.completed, icon: CheckCircle, color: 'bg-green-400/15 text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workout History Table */}
      <div className="card">
        <h3 className="text-base font-semibold text-white mb-4">Workout History</h3>
        {logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No workouts logged yet"
            description="Start tracking your workouts to see your history here"
            action={<button onClick={() => setShowForm(true)} className="btn-primary">Log First Workout</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-header rounded-l-lg">Date</th>
                  <th className="table-header">Exercise</th>
                  <th className="table-header">Duration</th>
                  <th className="table-header">Sets × Reps</th>
                  <th className="table-header">Weight</th>
                  <th className="table-header">Calories</th>
                  <th className="table-header">Status</th>
                  <th className="table-header rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell">{new Date(log.workoutDate).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{log.exercise?.name}</p>
                        <p className="text-xs text-gray-500">{log.exercise?.category}</p>
                      </div>
                    </td>
                    <td className="table-cell">{log.duration} min</td>
                    <td className="table-cell">{log.sets} × {log.reps}</td>
                    <td className="table-cell">{log.weight > 0 ? `${log.weight} kg` : 'BW'}</td>
                    <td className="table-cell">{log.caloriesBurned} kcal</td>
                    <td className="table-cell">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${statusStyles[log.completionStatus]}`}>
                        {log.completionStatus}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(log)} className="text-gray-400 hover:text-lime-400 transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(log._id)} className="text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setError(''); }} title={editing ? 'Edit Workout' : 'Log Workout'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Exercise *</label>
              <select className="select" value={form.exercise} onChange={e => handleExerciseChange(e.target.value)}>
                {exercises.map(ex => <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Workout Date *</label>
              <input type="date" className="input" value={form.workoutDate} onChange={e => setForm({ ...form, workoutDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Duration (minutes) *</label>
              <input type="number" className="input" min="1" placeholder="30" value={form.duration} onChange={e => handleDurationChange(e.target.value)} />
            </div>
            <div>
              <label className="label">Sets</label>
              <input type="number" className="input" min="1" value={form.sets} onChange={e => setForm({ ...form, sets: e.target.value })} />
            </div>
            <div>
              <label className="label">Reps</label>
              <input type="number" className="input" min="1" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} />
            </div>
            <div>
              <label className="label">Weight (kg) — 0 for bodyweight</label>
              <input type="number" className="input" min="0" step="0.5" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="label">Calories Burned (auto-calculated)</label>
              <input type="number" className="input" min="0" value={form.caloriesBurned} onChange={e => setForm({ ...form, caloriesBurned: e.target.value })} />
            </div>
            <div>
              <label className="label">Completion Status</label>
              <select className="select" value={form.completionStatus} onChange={e => setForm({ ...form, completionStatus: e.target.value })}>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} placeholder="How did it go?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editing ? 'Save Changes' : 'Log Workout'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Workout"
        message="Remove this workout record? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default WorkoutTrackingPage;
