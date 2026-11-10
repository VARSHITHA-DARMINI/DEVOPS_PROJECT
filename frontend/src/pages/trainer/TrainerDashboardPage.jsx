import { useState, useEffect } from 'react';
import { trainerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Users, Activity, Star, Search, User, Target, Dumbbell,
  MessageSquare, ChevronRight, Award, Clock, Flame
} from 'lucide-react';

const TrainerDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, category: 'General', feedbackText: '', recommendations: '' });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    Promise.all([trainerAPI.getDashboard(), trainerAPI.getClients()])
      .then(([dRes, cRes]) => {
        setDashboard(dRes.data.dashboard);
        setClients(cRes.data.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setClientLoading(true);
    try {
      const res = await trainerAPI.getClientDetails(client._id);
      setClientDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setClientLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.feedbackText) return setFeedbackError('Feedback message is required');
    setSubmitting(true);
    setFeedbackError('');
    try {
      await trainerAPI.submitFeedback({ clientId: selectedClient._id, ...feedbackForm });
      setFeedbackSuccess('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackForm({ rating: 5, category: 'General', feedbackText: '', recommendations: '' });
      // Refresh client details
      const res = await trainerAPI.getClientDetails(selectedClient._id);
      setClientDetails(res.data);
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading trainer dashboard..." />;

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const fitnessLevelColor = { beginner: 'text-green-400', intermediate: 'text-yellow-400', advanced: 'text-red-400' };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="page-title">Trainer Dashboard</h1>
        <p className="page-subtitle">Monitor and support your assigned clients</p>
      </div>

      {/* Trainer Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Clients', value: dashboard?.totalClients || 0, icon: Users, color: 'bg-lime-400/15 text-lime-400' },
          { label: 'Total Sessions', value: dashboard?.totalSessions || 0, icon: Activity, color: 'bg-cyan-400/15 text-cyan-400' },
          { label: 'Specialization', value: dashboard?.profile?.specialization || '—', icon: Award, color: 'bg-purple-400/15 text-purple-400', small: true },
          { label: 'Rating', value: dashboard?.rating ? `${dashboard.rating}/5` : '—', icon: Star, color: 'bg-yellow-400/15 text-yellow-400' },
        ].map(({ label, value, icon: Icon, color, small }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-bold text-white truncate ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Client List */}
        <div className="xl:col-span-2 card">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-lime-400" /> Assigned Clients
          </h3>
          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input pl-9 text-xs"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              {clients.length === 0 ? 'No clients assigned yet' : 'No clients match your search'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map(client => (
                <button
                  key={client._id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                    selectedClient?._id === client._id
                      ? 'bg-lime-400/10 border-lime-400/20'
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-xs font-bold text-lime-400">{initials(client.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{client.name}</p>
                    <p className="text-xs text-gray-400 truncate">{client.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{client.workoutCount} sessions</p>
                    <ChevronRight size={14} className={selectedClient?._id === client._id ? 'text-lime-400' : 'text-gray-600'} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Client Details */}
        <div className="xl:col-span-3">
          {!selectedClient ? (
            <div className="card h-full flex items-center justify-center py-20">
              <div className="text-center">
                <User size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Select a client to view details</p>
              </div>
            </div>
          ) : clientLoading ? (
            <div className="card"><LoadingSpinner message="Loading client data..." /></div>
          ) : (
            <div className="space-y-5">
              {/* Client Header */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center">
                      <span className="text-base font-bold text-cyan-400">{initials(selectedClient.name)}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{selectedClient.name}</h3>
                      <p className="text-sm text-gray-400">{selectedClient.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowFeedbackModal(true); setFeedbackError(''); }}
                    className="btn-primary text-xs"
                  >
                    <MessageSquare size={14} /> Give Feedback
                  </button>
                </div>

                {feedbackSuccess && (
                  <div className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-3 text-lime-400 text-sm mb-4">
                    {feedbackSuccess}
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                  {[
                    { label: 'Age', value: clientDetails?.client?.age ? `${clientDetails.client.age}y` : '—' },
                    { label: 'Gender', value: clientDetails?.client?.gender || '—' },
                    { label: 'Height', value: clientDetails?.client?.height ? `${clientDetails.client.height}cm` : '—' },
                    { label: 'Weight', value: clientDetails?.client?.weight ? `${clientDetails.client.weight}kg` : '—' },
                    { label: 'Level', value: clientDetails?.client?.fitnessLevel || '—' },
                    { label: 'Sessions', value: clientDetails?.logs?.length || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2 bg-navy-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-white capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              {clientDetails?.goals?.length > 0 && (
                <div className="card">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Target size={15} className="text-lime-400" /> Fitness Goals
                  </h4>
                  <div className="space-y-3">
                    {clientDetails.goals.slice(0, 3).map(g => (
                      <div key={g._id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{g.goalName}</span>
                          <span className="text-lime-400 font-semibold">{g.progressPercentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill bg-gradient-to-r from-cyan-400 to-lime-400" style={{ width: `${g.progressPercentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Workouts */}
              <div className="card">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Dumbbell size={15} className="text-cyan-400" /> Recent Workouts
                </h4>
                {clientDetails?.logs?.length > 0 ? (
                  <div className="space-y-2">
                    {clientDetails.logs.slice(0, 5).map(log => (
                      <div key={log._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-white">{log.exercise?.name}</p>
                          <p className="text-xs text-gray-400">{new Date(log.workoutDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={11} /> {log.duration}m</span>
                          <span className="flex items-center gap-1"><Flame size={11} /> {log.caloriesBurned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No workout records yet</p>
                )}
              </div>

              {/* Feedback History */}
              {clientDetails?.feedback?.length > 0 && (
                <div className="card">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare size={15} className="text-purple-400" /> Feedback History
                  </h4>
                  <div className="space-y-3">
                    {clientDetails.feedback.map(f => (
                      <div key={f._id} className="p-3 bg-navy-700/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1 mb-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{f.category}</span>
                          <span className="text-xs text-gray-500 ml-auto">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{f.feedbackText}</p>
                        {f.recommendations && (
                          <p className="text-xs text-cyan-400 mt-1.5 italic">💡 {f.recommendations}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title={`Feedback for ${selectedClient?.name}`}>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFeedbackForm(f => ({ ...f, rating: r }))}
                >
                  <Star
                    size={28}
                    className={r <= feedbackForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="select" value={feedbackForm.category} onChange={e => setFeedbackForm(f => ({ ...f, category: e.target.value }))}>
              {['General', 'Progress', 'Nutrition', 'Technique', 'Motivation', 'Recovery'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Feedback Message *</label>
            <textarea className="textarea" rows={4} placeholder="Write detailed feedback for your client..." value={feedbackForm.feedbackText} onChange={e => setFeedbackForm(f => ({ ...f, feedbackText: e.target.value }))} />
          </div>
          <div>
            <label className="label">Recommendations</label>
            <textarea className="textarea" rows={2} placeholder="Specific recommendations or next steps..." value={feedbackForm.recommendations} onChange={e => setFeedbackForm(f => ({ ...f, recommendations: e.target.value }))} />
          </div>
          {feedbackError && <p className="text-sm text-red-400">{feedbackError}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerDashboardPage;
