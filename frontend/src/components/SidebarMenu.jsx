import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function SidebarMenu({ 
  selectedId, 
  onSelect, 
  theme, 
  setTheme, 
  token, 
  onProfileClick, 
  onLogout, 
  refreshTrigger,
  activeView 
}) {
  const [combinations, setCombinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacher, setTeacher] = useState(null);

  // Create Class Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newComboName, setNewComboName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Fetch current teacher details
    fetch(`${API_BASE}/teachers/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to fetch teacher profile');
        return res.json();
      })
      .then((data) => setTeacher(data))
      .catch((err) => console.error('Error fetching teacher info:', err));
  }, [token, refreshTrigger]);

  const fetchCombinations = () => {
    setLoading(true);
    fetch(`${API_BASE}/teachers/me/combinations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to fetch classes');
        return res.json();
      })
      .then((data) => {
        setCombinations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCombinations();
  }, [token, refreshTrigger]);

  const handleCreateCombo = async (e) => {
    e.preventDefault();
    if (!newComboName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/combinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newComboName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create class combination');
      }

      const createdCombo = await res.json();
      
      // Reset state and close modal
      setNewComboName('');
      setIsCreateModalOpen(false);
      
      // Refetch linked combinations
      fetchCombinations();
      
      // Auto-select the newly created combination
      onSelect(createdCombo.id);

    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredCombinations = combinations.filter((combo) =>
    combo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-extrabold text-white text-lg">TM</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-slate-800 dark:text-white tracking-wide">TeacherMate</h1>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Dashboard v1.2</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-750/80 transition-all active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Search Combos */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/60">
        <div className="relative">
          <input
            type="text"
            placeholder="Search active classes... (e.g. 5-A)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-305 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs placeholder-slate-400 dark:placeholder-slate-505 text-slate-800 dark:text-slate-200 transition-all font-semibold"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-550 text-sm">
            🔍
          </span>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            My Class Assignments
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-300 transition-colors flex items-center gap-0.5"
            title="Create New Class Section"
          >
            ➕ Create
          </button>
        </div>

        {loading ? (
          <div className="p-3 text-xs text-slate-400 dark:text-slate-500 font-medium animate-pulse">
            Loading classes...
          </div>
        ) : error ? (
          <div className="p-3 text-xs text-rose-500 font-medium bg-rose-500/10 rounded-xl border border-rose-500/20">
            Error: {error}
          </div>
        ) : combinations.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">No linked classes.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create One Now
            </button>
          </div>
        ) : filteredCombinations.length === 0 ? (
          <div className="p-3 text-xs text-slate-400 dark:text-slate-555 font-medium italic">
            No combinations found.
          </div>
        ) : (
          filteredCombinations.map((combo) => {
            const isActive = selectedId === combo.id && activeView === 'dashboard';
            return (
              <button
                key={combo.id}
                onClick={() => onSelect(combo.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-left text-xs font-semibold ${
                  isActive
                    ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/60'
                }`}
              >
                <span>{combo.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-105 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/20'
                  }`}
                >
                  Active
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Teacher Profile Card widget at bottom */}
      {teacher && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
          <button 
            onClick={onProfileClick}
            className={`flex items-center gap-3 group text-left max-w-[70%] ${activeView === 'profile' ? 'opacity-100' : 'opacity-85 hover:opacity-100'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400">
              {getInitials(teacher.full_name)}
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {teacher.full_name}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-505 font-medium truncate">
                {teacher.email || 'Click to edit profile'}
              </p>
            </div>
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={onProfileClick}
              title="Profile Settings"
              className={`p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-850 transition-all ${
                activeView === 'profile'
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-250'
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-all"
            >
              🚪
            </button>
          </div>
        </div>
      )}

      {/* Create Class Section Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 text-lg transition-colors"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-1">
              Create Class & Section
            </h3>
            <p className="text-[11px] text-slate-455 dark:text-slate-400 mb-5 leading-normal">
              Enter class and section name. It will be globally created and automatically assigned to you.
            </p>
            <form onSubmit={handleCreateCombo} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                  Class & Section Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8 - B"
                  value={newComboName}
                  onChange={(e) => setNewComboName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {creating && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
