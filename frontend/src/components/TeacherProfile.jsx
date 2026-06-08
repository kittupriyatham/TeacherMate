import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function TeacherProfile({ token, onProfileUpdated, onBack, onLogout }) {
  const [profile, setProfile] = useState({ full_name: '', email: '', bio: '' });
  const [allCombos, setAllCombos] = useState([]);
  const [myComboIds, setMyComboIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile
        const profRes = await fetch(`${API_BASE}/teachers/me`, { headers });
        if (profRes.status === 401) {
          onLogout();
          return;
        }
        if (!profRes.ok) throw new Error('Failed to load profile details');
        const profData = await profRes.json();
        setProfile(profData);

        // Fetch all combinations
        const allRes = await fetch(`${API_BASE}/combinations`, { headers });
        if (allRes.status === 401) {
          onLogout();
          return;
        }
        if (!allRes.ok) throw new Error('Failed to load classes catalog');
        const allData = await allRes.json();
        setAllCombos(allData);

        // Fetch my combinations
        const myRes = await fetch(`${API_BASE}/teachers/me/combinations`, { headers });
        if (myRes.status === 401) {
          onLogout();
          return;
        }
        if (!myRes.ok) throw new Error('Failed to load linked classes');
        const myData = await myRes.json();
        setMyComboIds(myData.map((c) => c.id));

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleComboToggle = (id) => {
    setMyComboIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. Update personal details
      const updateProfRes = await fetch(`${API_BASE}/teachers/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          full_name: (profile.full_name || '').trim(),
          email: profile.email ? profile.email.trim() : null,
          bio: profile.bio ? profile.bio.trim() : null,
        }),
      });
      if (updateProfRes.status === 401) {
        onLogout();
        return;
      }
      if (!updateProfRes.ok) throw new Error('Failed to save profile details');
      const updatedProfile = await updateProfRes.json();
      setProfile(updatedProfile);

      // 2. Update linked combinations
      const updateCombosRes = await fetch(`${API_BASE}/teachers/me/combinations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(myComboIds),
      });
      if (updateCombosRes.status === 401) {
        onLogout();
        return;
      }
      if (!updateCombosRes.ok) {
        const errData = await updateCombosRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update class assignments');
      }
      
      setSuccessMsg('Profile and class assignments successfully updated!');
      if (onProfileUpdated) {
        onProfileUpdated(); // Notify parent to refresh list
      }
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-medium animate-pulse">
        Loading teacher profile configuration...
      </div>
    );
  }

  return (
    <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl p-8 mx-auto transition-all">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
        >
          ← Back to Dashboard
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-full">
          My Teacher Profile
        </span>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Setup Grid */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Personal Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={profile.full_name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                Biography / Department Notes
              </label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Linked Class-Sections */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-2">
            Class & Section Assignments
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-normal">
            Check the class sections you teach. These combinations will be displayed in your sidebar for easy roster lookup and student CRUD management.
          </p>
          
          {allCombos.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 text-center text-xs text-slate-400">
              No class-section combinations defined in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allCombos.map((combo) => {
                const isChecked = myComboIds.includes(combo.id);
                const isOccupiedByOther = combo.teacher_id !== null && combo.teacher_id !== undefined && combo.teacher_id !== profile.id;
                
                return (
                  <button
                    key={combo.id}
                    type="button"
                    disabled={isOccupiedByOther}
                    onClick={() => handleComboToggle(combo.id)}
                    className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border transition-all text-xs font-semibold text-left w-full ${
                      isOccupiedByOther
                        ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 text-slate-400 dark:text-slate-605 cursor-not-allowed opacity-70'
                        : isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-250 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span>{combo.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                        isOccupiedByOther
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium'
                          : isChecked 
                          ? 'bg-indigo-600 text-white font-bold' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-medium'
                      }`}>
                        {isOccupiedByOther ? 'Locked' : isChecked ? '✓ Active' : 'Off'}
                      </span>
                    </div>
                    {isOccupiedByOther && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 font-normal flex items-center gap-1">
                        🔒 Occupied by {combo.teacher_name || 'Other Teacher'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Submit Buttons */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
            Save Profile Changes
          </button>
        </div>

      </form>
    </div>
  );
}
