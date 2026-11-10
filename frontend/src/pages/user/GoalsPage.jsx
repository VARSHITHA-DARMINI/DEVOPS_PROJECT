import { useState, useEffect } from 'react';
import { goalAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, TrendingUp, Target, CheckCircle, Clock } from 'lucide-react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [progressModal, setProgressModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ goalName: '', goalType: '', startValue: '', currentValue: '', targetValue: '', unit: 'kg', targetDate: '', notes: '' });
  const [progressVal, setProgressVal] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await goalAPI.getAll();
      setGoals(res.data.goals);
    } catch { } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ goalName: '', goalType: '', startValue: '', currentValue: '', targetValue: '', unit: 'kg', targetDate: '', notes: '' });
    setEditing(null);
    setError('');
  };

  const handleEdit = (goal) => {
    setForm({
      goalName: goal.goalName,
      goalType: goal.goalType,
      startValue: goal.startValue,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      notes: goal.notes || '',
      status: goal.status
    });
    setEditing(goal._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.goalName || !form.goalType || !form.startValue || !form.targetValue || !form.targetDate) {
      return setError('Please fill in all required fields');
    }
    try {
      const payload = {
        ...form,
        startValue: Number(form.startValue),
        currentValue: Number(form.currentValue || form.startValue),
        targetValue: Number(form.targetValue)
      };
      if (editing) {
        const res = await goalAPI.update(editing, payload);
        setGoals(goals.map(g => g._id === editing ? res.data.goal : g));
      } else {
        const res = await goalAPI.create(payload);
        setGoals([res.data.goal, ...goals]);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalAPI.delete(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch { }
  };

  const handleProgressUpdate = async () => {
    if (!progressVal) return;
    try {
      const res = await goalAPI.updateProgress(progressModal._id, Number(progressVal));
      setGoals(goals.map(g => g._id === progressModal._id ? res.data.goal : g));
      setProgressModal(null);
      setProgressVal('');
    } catch { }
  };

  const summary = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    rate: goals.length ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0
  };

  const statusStyles = {
    active: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
    completed: 'bg-lime-400/15 text-lime-400 border-lime-400/20',
    paused: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20'
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Fitness Goals</h1>
          <p className="page-subtitle">Set, track and achieve your fitness targets</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: summary.total, icon: Target, color: 'bg-lime-400/15 text-lime-400' },
          { label: 'Active Goals', value: summary.active, icon: Clock, color: 'bg-cyan-400/15 text-cyan-400' },
          { label: 'Completed', value: summary.completed, icon: CheckCircle, color: 'bg-green-400/15 text-green-400' },
          { label: 'Completion Rate', value: `${summary.rate}%`, icon: TrendingUp, color: 'bg-purple-400/15 text-purple-400' }
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

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set your first fitness goal and start tracking your progress"
          action={<button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">Add First Goal</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <div key={goal._id} className="card group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white leading-tight">{goal.goalName}</h3>
                  <span className="text-xs text-gray-400 mt-1 block">{goal.goalType}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium border ${statusStyles[goal.status] || 'bg-gray-400/15 text-gray-400'}`}>
                  {goal.status}
                </span>
              </div>

              {/* Values */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="font-semibold text-white">{goal.startValue} <span className="text-xs text-gray-400">{goal.unit}</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="font-bold text-lime-400 text-base">{goal.currentValue} <span className="text-xs">{goal.unit}</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="font-semibold text-white">{goal.targetValue} <span className="text-xs text-gray-400">{goal.unit}</span></p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-lime-400 font-semibold">{goal.progressPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${goal.status === 'completed' ? 'bg-lime-400' : 'bg-gradient-to-r from-cyan-400 to-lime-400'}`}
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setProgressModal(goal); setProgressVal(goal.currentValue); }}
                  className="btn-primary flex-1 justify-center text-xs py-2"
                >
                  <TrendingUp size={14} /> Update Progress
                </button>
                <button onClick={() => handleEdit(goal)} className="btn-secondary px-3 py-2">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => setDeleteConfirm(goal._id)} className="btn-danger px-3 py-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Goal' : 'Add New Goal'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Goal Name *</label>
              <input className="input" placeholder="e.g., Lose 10kg" value={form.goalName} onChange={e => setForm({ ...form, goalName: e.target.value })} />
            </div>
            <div>
              <label className="label">Goal Type *</label>
              <select className="select" value={form.goalType} onChange={e => setForm({ ...form, goalType: e.target.value })}>
                <option value="">Select type</option>
                {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Strength', 'Custom'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unit *</label>
              <input className="input" placeholder="kg, km, reps..." value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label">Starting Value *</label>
              <input type="number" className="input" step="0.1" value={form.startValue} onChange={e => setForm({ ...form, startValue: e.target.value })} />
            </div>
            <div>
              <label className="label">Current Value</label>
              <input type="number" className="input" step="0.1" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
            </div>
            <div>
              <label className="label">Target Value *</label>
              <input type="number" className="input" step="0.1" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} />
            </div>
            <div>
              <label className="label">Target Date *</label>
              <input type="date" className="input" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            {editing && (
              <div>
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" rows={2} placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editing ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal isOpen={!!progressModal} onClose={() => { setProgressModal(null); setProgressVal(''); }} title="Update Progress">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Update current value for: <span className="text-white font-medium">{progressModal?.goalName}</span></p>
          <div>
            <label className="label">Current Value ({progressModal?.unit})</label>
            <input
              type="number"
              className="input"
              step="0.1"
              value={progressVal}
              onChange={e => setProgressVal(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setProgressModal(null); setProgressVal(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleProgressUpdate} className="btn-primary flex-1 justify-center">Update</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete Goal"
      />
    </div>
  );
};

export default GoalsPage;
