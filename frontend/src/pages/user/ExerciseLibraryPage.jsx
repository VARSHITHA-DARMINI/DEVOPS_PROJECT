
import { useState, useEffect } from 'react';
import { exerciseAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Search, Filter, Dumbbell, ChevronRight, Zap, Target } from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/20'
};

const categoryIllustrations = {
  Strength: '🏋️',
  Cardio: '🏃',
  HIIT: '⚡',
  Yoga: '🧘',
  Pilates: '🤸',
  Calisthenics: '💪',
  CrossFit: '🔥',
  Flexibility: '🌊'
};

const ExerciseCard = ({ exercise, onClick }) => (
  <div
    onClick={() => onClick(exercise)}
    className="card group hover:border-lime-400/20 hover:shadow-lg hover:shadow-lime-400/5 transition-all cursor-pointer"
  >
    {/* Visual Header */}
    <div className="h-32 bg-gradient-to-br from-navy-700 to-navy-600 rounded-xl mb-4 flex items-center justify-center border border-white/5 overflow-hidden relative">
      <span className="text-5xl">{categoryIllustrations[exercise.category] || '💪'}</span>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-800/50 to-transparent" />
      <div className="absolute bottom-2 left-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${difficultyColors[exercise.difficulty]}`}>
          {exercise.difficulty}
        </span>
      </div>
    </div>

    <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-lime-400 transition-colors">{exercise.name}</h3>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-400">{exercise.category}</span>
      <span className="text-gray-600">·</span>
      <span className="text-xs text-gray-400">{exercise.muscleGroup}</span>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{exercise.description}</p>

    <button className="mt-3 w-full flex items-center justify-between text-xs text-lime-400 hover:text-lime-300 transition-colors pt-2 border-t border-white/5">
      View Details <ChevronRight size={14} />
    </button>
  </div>
);

const ExerciseLibraryPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'All', difficulty: 'All' });

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Calisthenics', 'CrossFit', 'Flexibility'];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchExercises();
  }, [filters.category, filters.difficulty]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;
      const res = await exerciseAPI.getAll(params);
      setExercises(res.data.exercises);
    } catch { } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExercises();
  };

  const filtered = filters.search
    ? exercises.filter(e => e.name.toLowerCase().includes(filters.search.toLowerCase()))
    : exercises;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="page-title">Exercise Library</h1>
        <p className="page-subtitle">Browse {exercises.length} exercises across all categories</p>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search exercises..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="select sm:w-40"
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="select sm:w-40"
            value={filters.difficulty}
            onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
          >
            {difficulties.map(d => <option key={d} value={d} className="capitalize">{d === 'All' ? 'All Levels' : d}</option>)}
          </select>
          <button type="submit" className="btn-primary shrink-0">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilters({ ...filters, category: cat })}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filters.category === cat
                ? 'bg-lime-400 text-navy-900 border-lime-400'
                : 'bg-navy-800 text-gray-400 hover:text-white border-white/10'
            }`}
          >
            {categoryIllustrations[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{filtered.length}</span> exercises
          {filters.category !== 'All' && <span> in <span className="text-lime-400">{filters.category}</span></span>}
        </p>
      )}

      {/* Exercise Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Dumbbell size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No exercises found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(ex => (
            <ExerciseCard key={ex._id} exercise={ex} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Exercise Details" size="md">
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="h-36 bg-gradient-to-br from-navy-700 to-navy-600 rounded-xl flex items-center justify-center border border-white/5">
              <span className="text-7xl">{categoryIllustrations[selected.category] || '💪'}</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{selected.name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${difficultyColors[selected.difficulty]}`}>
                  {selected.difficulty}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Zap size={12} className="text-lime-400" /> {selected.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Target size={12} className="text-cyan-400" /> {selected.muscleGroup}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-200 leading-relaxed">{selected.description}</p>
            </div>

            {selected.instructions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Instructions</p>
                <ol className="space-y-2">
                  {selected.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-lime-400/15 text-lime-400 text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-navy-700/50 rounded-xl border border-white/5 text-sm">
              <span className="text-gray-400">Calories burned</span>
              <span className="text-orange-400 font-semibold">{selected.caloriesPerMinute} kcal/min</span>
            </div>

            <button onClick={() => setSelected(null)} className="btn-secondary w-full justify-center">Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseLibraryPage;
