import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import {
  Users, Shield, Activity, Target, Search, UserCheck, UserX,
  Trash2, Award, ChevronDown
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes, tRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        adminAPI.getTrainers()
      ]);
      setStats(dRes.data.stats);
      setUsers(uRes.data.users);
      setTrainers(tRes.data.trainers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const res = await adminAPI.toggleStatus(id);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      await fetchAll(); // refresh stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAssignTrainer = async () => {
    try {
      await adminAPI.assignTrainer(assignModal, selectedTrainer || null);
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
      setAssignModal(null);
      setSelectedTrainer('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTrainers = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;

  const roleColors = { admin: 'bg-purple-500/20 text-purple-400', trainer: 'bg-cyan-400/20 text-cyan-400', user: 'bg-lime-400/20 text-lime-400' };
  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage users, trainers and platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-lime-400/15 text-lime-400' },
          { label: 'Total Trainers', value: stats.totalTrainers, icon: Award, color: 'bg-cyan-400/15 text-cyan-400' },
          { label: 'Total Workouts', value: stats.totalWorkouts, icon: Activity, color: 'bg-orange-400/15 text-orange-400' },
          { label: 'Active Goals', value: stats.activeGoals, icon: Target, color: 'bg-purple-400/15 text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-navy-800 rounded-xl border border-white/5 w-fit">
        {['users', 'trainers'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(''); }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-lime-400 text-navy-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="input pl-9"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="card overflow-x-auto">
          <h3 className="text-base font-semibold text-white mb-4">User Management ({filteredUsers.length})</h3>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No users found</p>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="table-header rounded-l-lg">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Assigned Trainer</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-700 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-lime-400">{initials(u.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400">
                      {u.assignedTrainer ? (
                        <span className="text-cyan-400 text-xs">{u.assignedTrainer.name}</span>
                      ) : (
                        <span className="text-gray-600 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-2">
                          {u.role === 'user' && (
                            <button
                              onClick={() => { setAssignModal(u._id); setSelectedTrainer(u.assignedTrainer?._id || ''); }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            disabled={actionLoading === u._id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-yellow-400 hover:bg-yellow-400/10'
                                : 'text-green-400 hover:bg-green-400/10'
                            }`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(u._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      {u.role === 'admin' && <span className="text-xs text-gray-600 italic">Protected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Trainers Table */}
      {activeTab === 'trainers' && (
        <div className="card overflow-x-auto">
          <h3 className="text-base font-semibold text-white mb-4">Trainer Management ({filteredTrainers.length})</h3>
          {filteredTrainers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No trainers found</p>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-header rounded-l-lg">Trainer</th>
                  <th className="table-header">Specialization</th>
                  <th className="table-header">Experience</th>
                  <th className="table-header">Clients</th>
                  <th className="table-header">Rating</th>
                  <th className="table-header rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map(t => (
                  <tr key={t._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-cyan-400">{initials(t.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{t.profile?.specialization || '—'}</td>
                    <td className="table-cell">{t.profile?.experience ? `${t.profile.experience} yrs` : '—'}</td>
                    <td className="table-cell">
                      <span className="text-lime-400 font-medium">{t.profile?.assignedClients?.length || 0}</span>
                    </td>
                    <td className="table-cell">
                      {t.profile?.rating ? (
                        <span className="flex items-center gap-1 text-yellow-400">
                          ★ <span className="text-white">{t.profile.rating}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assign Trainer Modal */}
      <Modal isOpen={!!assignModal} onClose={() => { setAssignModal(null); setSelectedTrainer(''); }} title="Assign Trainer">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Select a trainer to assign to this user, or leave unassigned.</p>
          <div>
            <label className="label">Trainer</label>
            <select className="select" value={selectedTrainer} onChange={e => setSelectedTrainer(e.target.value)}>
              <option value="">No trainer (unassign)</option>
              {trainers.filter(t => t.isActive).map(t => (
                <option key={t._id} value={t._id}>{t.name} — {t.profile?.specialization || 'Trainer'}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setAssignModal(null); setSelectedTrainer(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleAssignTrainer} className="btn-primary flex-1 justify-center">Save Assignment</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete User"
        message="Permanently delete this user account? All their data will be lost. This cannot be undone."
        confirmText="Delete User"
      />
    </div>
  );
};

export default AdminDashboardPage;
