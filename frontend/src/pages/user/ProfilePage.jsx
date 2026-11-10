import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Edit2, Save, X, Scale, Ruler, Calendar, Activity, Heart } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name || '',
        age: res.data.user.age || '',
        gender: res.data.user.gender || '',
        height: res.data.user.height || '',
        weight: res.data.user.weight || '',
        fitnessLevel: res.data.user.fitnessLevel || '',
        fitnessPreferences: (res.data.user.fitnessPreferences || []).join(', ')
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updateData = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        fitnessPreferences: form.fitnessPreferences
          ? form.fitnessPreferences.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };
      const res = await userAPI.updateProfile(updateData);
      setProfile(res.data.user);
      updateUser(res.data.user);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const InfoItem = ({ label, value, unit }) => (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value || <span className="text-gray-500 italic">Not set</span>}{value && unit && <span className="text-gray-400 ml-1 text-xs">{unit}</span>}</p>
    </div>
  );

  const fitnessLevelColor = {
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-yellow-500/20 text-yellow-400',
    advanced: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="max-w-4xl animate-fadeIn space-y-6">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal and fitness information</p>
      </div>

      {success && (
        <div className="bg-lime-400/10 border border-lime-400/20 rounded-xl p-3 text-lime-400 text-sm flex items-center gap-2">
          <Activity size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
      )}

      {/* Profile Header */}
      <div className="card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-2xl bg-lime-400/20 border-2 border-lime-400/30 flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-lime-400">{initials}</span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{profile?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            {profile?.fitnessLevel && (
              <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${fitnessLevelColor[profile.fitnessLevel] || 'bg-gray-500/20 text-gray-400'}`}>
                {profile.fitnessLevel}
              </span>
            )}
            <span className="text-xs px-3 py-1 rounded-full bg-navy-700 text-gray-300 capitalize border border-white/5">
              {profile?.role}
            </span>
            {profile?.assignedTrainer && (
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-400/15 text-cyan-400 border border-cyan-400/20">
                Trainer: {profile.assignedTrainer.name}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="btn-primary shrink-0">
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-lime-400/15 rounded-lg flex items-center justify-center">
              <User size={16} className="text-lime-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Personal Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Full Name" value={profile?.name} />
            <InfoItem label="Email" value={profile?.email} />
            <InfoItem label="Age" value={profile?.age} unit="years" />
            <InfoItem label="Gender" value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
          </div>
        </div>

        {/* Fitness Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-cyan-400/15 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Fitness Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Height" value={profile?.height} unit="cm" />
            <InfoItem label="Current Weight" value={profile?.weight} unit="kg" />
            <InfoItem label="Fitness Level" value={profile?.fitnessLevel ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) : null} />
            <InfoItem label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null} />
          </div>
          {profile?.fitnessPreferences?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-2">Fitness Preferences</p>
              <div className="flex flex-wrap gap-2">
                {profile.fitnessPreferences.map(p => (
                  <span key={p} className="text-xs px-2.5 py-1 bg-lime-400/10 text-lime-400 rounded-full border border-lime-400/20">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editing} onClose={() => { setEditing(false); setError(''); }} title="Edit Profile" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" value={form.age} min="10" max="120" onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={form.height} min="50" max="300" onChange={e => setForm({ ...form, height: e.target.value })} />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input" value={form.weight} min="10" max="500" onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="label">Fitness Level</label>
              <select className="select" value={form.fitnessLevel} onChange={e => setForm({ ...form, fitnessLevel: e.target.value })}>
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Preferences (comma separated)</label>
              <input className="input" placeholder="Strength, Cardio, Yoga" value={form.fitnessPreferences} onChange={e => setForm({ ...form, fitnessPreferences: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setEditing(false); setError(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
