import { useState, useEffect } from 'react';
import { planAPI, exerciseAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, Calendar, Dumbbell, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const diffColor = { beginner: 'text-green-400 bg-green-400/15', intermediate: 'text-yellow-400 bg-yellow-400/15', advanced: 'text-red-400 bg-red-400/15' };

const WorkoutPlannerPage = () => {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    planName: '', description: '', difficulty: 'beginner',
    schedule: [], durationWeeks: 4, exercises: []
  });

  useEffect(() => {
    Promise.all([planAPI.getAll(), exerciseAPI.getAll()])
      .then(([pRes, eRes]) => {
        setPlans(pRes.data.plans);
        setExercises(eRes.data.exercises);
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ planName: '', description: '', difficulty: 'beginner', schedule: [], durationWeeks: 4, exercises: [] });
    setEditing(null);
    setError('');
  };

  const handleEdit = (plan) => {
    setForm({
      planName: plan.planName,
      description: plan.description || '',
      difficulty: plan.difficulty,
      schedule: plan.schedule || [],
      durationWeeks: plan.durationWeeks || 4,
      exercises: plan.exercises.map(e => ({
        exercise: e.exercise?._id || e.exercise,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds || 60,
        notes: e.notes || ''
      }))
    });
    setEditing(plan._id);
    setShowForm(true);
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      schedule: f.schedule.includes(day) ? f.schedule.filter(d => d !== day) : [...f.schedule, day]
    }));
  };

  const addExercise = () => {
    if (exercises.length === 0) return;
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, { exercise: exercises[0]._id, sets: 3, reps: 10, restSeconds: 60, notes: '' }]
    }));
  };

  const updateExercise = (idx, field, value) => {
    setForm(f => {
      const ex = [...f.exercises];
      ex[idx] = { ...ex[idx], [field]: value };
      return { ...f, exercises: ex };
    });
  };

  const removeExercise = (idx) => {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.planName) return setError('Plan name is required');
    if (form.exercises.length === 0) return setError('Add at least one exercise');

    const payload = {
      ...form,
      durationWeeks: Number(form.durationWeeks),
      exercises: form.exercises.map(e => ({
        ...e,
        sets: Number(e.sets),
        reps: Number(e.reps),
        restSeconds: Number(e.restSeconds)
      }))
    };

    try {
      if (editing) {
        const res = await planAPI.update(editing, payload);
        setPlans(plans.map(p => p._id === editing ? res.data.plan : p));
      } else {
        const res = await planAPI.create(payload);
        setPlans([res.data.plan, ...plans]);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (id) => {
    try {
      await planAPI.delete(id);
      setPlans(plans.filter(p => p._id !== id));
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  const scheduledCount = plans.filter(p => p.schedule?.length > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Workout Planner</h1>
          <p className="page-subtitle">Create and manage your workout programs</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus size={18} /> Create Workout Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-400/15 rounded-xl flex items-center justify-center">
            <Calendar size={18} className="text-lime-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Plans</p>
            <p className="text-2xl font-bold text-white">{plans.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-400/15 rounded-xl flex items-center justify-center">
            <Dumbbell size={18} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Scheduled</p>
            <p className="text-2xl font-bold text-white">{scheduledCount}</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      {plans.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No workout plans yet"
          description="Create your first workout plan to structure your training"
          action={<button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">Create First Plan</button>}
        />
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white">{plan.planName}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${diffColor[plan.difficulty]}`}>
                      {plan.difficulty}
                    </span>
                  </div>
                  {plan.description && <p className="text-sm text-gray-400 mb-2">{plan.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Dumbbell size={12} className="text-lime-400" /> {plan.exercises?.length || 0} exercises</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> {plan.durationWeeks} weeks</span>
                    {plan.schedule?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-purple-400" /> {plan.schedule.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === plan._id ? null : plan._id)}
                    className="btn-secondary px-3 py-2"
                  >
                    {expanded === plan._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => handleEdit(plan)} className="btn-secondary px-3 py-2">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(plan._id)} className="btn-danger px-3 py-2">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded exercises */}
              {expanded === plan._id && plan.exercises?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Exercises</p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr>
                          <th className="table-header rounded-l-lg">Exercise</th>
                          <th className="table-header">Category</th>
                          <th className="table-header">Sets</th>
                          <th className="table-header">Reps</th>
                          <th className="table-header rounded-r-lg">Rest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.exercises.map((ex, i) => (
                          <tr key={i} className="table-row">
                            <td className="table-cell font-medium">{ex.exercise?.name || 'Unknown'}</td>
                            <td className="table-cell text-gray-400">{ex.exercise?.category || '—'}</td>
                            <td className="table-cell">{ex.sets}</td>
                            <td className="table-cell">{ex.reps}</td>
                            <td className="table-cell">{ex.restSeconds}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Workout Plan' : 'Create Workout Plan'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Plan Name *</label>
              <input className="input" placeholder="e.g., Push Pull Legs" value={form.planName} onChange={e => setForm({ ...form, planName: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="textarea" rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (weeks)</label>
              <input type="number" className="input" min="1" max="52" value={form.durationWeeks} onChange={e => setForm({ ...form, durationWeeks: e.target.value })} />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="label">Workout Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    form.schedule.includes(day)
                      ? 'bg-lime-400 text-navy-900 border-lime-400'
                      : 'bg-navy-700 text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Exercises *</label>
              <button type="button" onClick={addExercise} className="btn-secondary text-xs py-1.5 px-3">
                <Plus size={14} /> Add Exercise
              </button>
            </div>
            {form.exercises.length === 0 ? (
              <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-sm text-gray-500">
                Click "Add Exercise" to add exercises to this plan
              </div>
            ) : (
              <div className="space-y-3">
                {form.exercises.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-navy-700/50 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      <div className="col-span-2">
                        <label className="label text-xs">Exercise</label>
                        <select className="select text-xs py-2" value={ex.exercise} onChange={e => updateExercise(idx, 'exercise', e.target.value)}>
                          {exercises.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Sets</label>
                        <input type="number" className="input text-xs py-2" min="1" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} />
                      </div>
                      <div>
                        <label className="label text-xs">Reps</label>
                        <input type="number" className="input text-xs py-2" min="1" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeExercise(idx)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editing ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Plan"
        message="Delete this workout plan? This cannot be undone."
        confirmText="Delete Plan"
      />
    </div>
  );
};

export default WorkoutPlannerPage;
