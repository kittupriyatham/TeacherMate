import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const spokenEnglishMap = {
  vp: 'Very Poor (VP)',
  p: 'Poor (P)',
  a: 'Average (A)',
  aa: 'Above Average (AA)',
  g: 'Good (G)',
  e: 'Excellent (E)'
};

const getWorkingDaysDefault = (monthIndex, year = new Date().getFullYear()) => {
  let days = 0;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, monthIndex, d).getDay();
    if (dayOfWeek !== 0) { // 0 is Sunday
      days++;
    }
  }
  return days;
};

export default function StudentDetailView({ studentId, onBack, token, onLogout }) {
  const [student, setStudent] = useState(null);
  const [combination, setCombination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [editTab, setEditTab] = useState('roster'); // 'roster' or 'attendance'
  const [submitting, setSubmitting] = useState(false);
  
  const initialFormData = {
    name: '',
    roll_no: '',
    fa1: '', fa2: '', sa1: '', fa3: '', fa4: '', sa2: '',
    prev_fa1: '', prev_fa2: '', prev_sa1: '', prev_fa3: '', prev_fa4: '', prev_sa2: '',
    prev2_fa1: '', prev2_fa2: '', prev2_sa1: '', prev2_fa3: '', prev2_fa4: '', prev2_sa2: '',
    g1: '', g2: '', g3: '',
    v1: '', v2: '', v3: '',
    r1: '', p1: '', cw1: '', r2: '', p2: '', cw2: '', r3: '', p3: '', cw3: '',
    listening: '', speaking: '', reading: '', writing: '',
    st1: '', st2: '', st3: '', st4: '', st5: '', st6: '', st7: '', st8: '', st9: '', st10: '',
    remarks: '',
    att_jan: '', att_feb: '', att_mar: '', att_apr: '', att_may: '', att_jun: '',
    att_jul: '', att_aug: '', att_sep: '', att_oct: '', att_nov: '', att_dec: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchStudentDetails = () => {
    fetch(`${API_BASE}/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to load profile details');
        return res.json();
      })
      .then((studentData) => {
        setStudent(studentData);
        // Fetch combination details to get total working days per month
        return fetch(`${API_BASE}/combinations/${studentData.combination_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load class combination details');
        return res.json();
      })
      .then((comboData) => {
        setCombination(comboData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchStudentDetails();
  }, [studentId]);

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this student profile?')) return;
    
    fetch(`${API_BASE}/students/${studentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to delete student profile');
        return res.json();
      })
      .then(() => {
        alert('Student profile deleted successfully.');
        onBack(); // Go back to student table
      })
      .catch((err) => alert(err.message));
  };

  const enterEditMode = (tab = 'roster') => {
    if (!student) return;
    setFormData({
      name: student.name || '',
      roll_no: student.roll_no || '',
      fa1: student.fa1 !== null && student.fa1 !== undefined ? student.fa1 : '',
      fa2: student.fa2 !== null && student.fa2 !== undefined ? student.fa2 : '',
      sa1: student.sa1 !== null && student.sa1 !== undefined ? student.sa1 : '',
      fa3: student.fa3 !== null && student.fa3 !== undefined ? student.fa3 : '',
      fa4: student.fa4 !== null && student.fa4 !== undefined ? student.fa4 : '',
      sa2: student.sa2 !== null && student.sa2 !== undefined ? student.sa2 : '',
      prev_fa1: student.prev_fa1 !== null && student.prev_fa1 !== undefined ? student.prev_fa1 : '',
      prev_fa2: student.prev_fa2 !== null && student.prev_fa2 !== undefined ? student.prev_fa2 : '',
      prev_sa1: student.prev_sa1 !== null && student.prev_sa1 !== undefined ? student.prev_sa1 : '',
      prev_fa3: student.prev_fa3 !== null && student.prev_fa3 !== undefined ? student.prev_fa3 : '',
      prev_fa4: student.prev_fa4 !== null && student.prev_fa4 !== undefined ? student.prev_fa4 : '',
      prev_sa2: student.prev_sa2 !== null && student.prev_sa2 !== undefined ? student.prev_sa2 : '',
      prev2_fa1: student.prev2_fa1 !== null && student.prev2_fa1 !== undefined ? student.prev2_fa1 : '',
      prev2_fa2: student.prev2_fa2 !== null && student.prev2_fa2 !== undefined ? student.prev2_fa2 : '',
      prev2_sa1: student.prev2_sa1 !== null && student.prev2_sa1 !== undefined ? student.prev2_sa1 : '',
      prev2_fa3: student.prev2_fa3 !== null && student.prev2_fa3 !== undefined ? student.prev2_fa3 : '',
      prev2_fa4: student.prev2_fa4 !== null && student.prev2_fa4 !== undefined ? student.prev2_fa4 : '',
      prev2_sa2: student.prev2_sa2 !== null && student.prev2_sa2 !== undefined ? student.prev2_sa2 : '',
      g1: student.g1 !== null && student.g1 !== undefined ? student.g1 : '',
      g2: student.g2 !== null && student.g2 !== undefined ? student.g2 : '',
      g3: student.g3 !== null && student.g3 !== undefined ? student.g3 : '',
      v1: student.v1 !== null && student.v1 !== undefined ? student.v1 : '',
      v2: student.v2 !== null && student.v2 !== undefined ? student.v2 : '',
      v3: student.v3 !== null && student.v3 !== undefined ? student.v3 : '',
      r1: student.r1 !== null && student.r1 !== undefined ? student.r1 : '',
      p1: student.p1 !== null && student.p1 !== undefined ? student.p1 : '',
      cw1: student.cw1 !== null && student.cw1 !== undefined ? student.cw1 : '',
      r2: student.r2 !== null && student.r2 !== undefined ? student.r2 : '',
      p2: student.p2 !== null && student.p2 !== undefined ? student.p2 : '',
      cw2: student.cw2 !== null && student.cw2 !== undefined ? student.cw2 : '',
      r3: student.r3 !== null && student.r3 !== undefined ? student.r3 : '',
      p3: student.p3 !== null && student.p3 !== undefined ? student.p3 : '',
      cw3: student.cw3 !== null && student.cw3 !== undefined ? student.cw3 : '',
      listening: student.listening !== null && student.listening !== undefined ? student.listening : '',
      speaking: student.speaking !== null && student.speaking !== undefined ? student.speaking : '',
      reading: student.reading !== null && student.reading !== undefined ? student.reading : '',
      writing: student.writing !== null && student.writing !== undefined ? student.writing : '',
      st1: student.st1 !== null && student.st1 !== undefined ? student.st1 : '',
      st2: student.st2 !== null && student.st2 !== undefined ? student.st2 : '',
      st3: student.st3 !== null && student.st3 !== undefined ? student.st3 : '',
      st4: student.st4 !== null && student.st4 !== undefined ? student.st4 : '',
      st5: student.st5 !== null && student.st5 !== undefined ? student.st5 : '',
      st6: student.st6 !== null && student.st6 !== undefined ? student.st6 : '',
      st7: student.st7 !== null && student.st7 !== undefined ? student.st7 : '',
      st8: student.st8 !== null && student.st8 !== undefined ? student.st8 : '',
      st9: student.st9 !== null && student.st9 !== undefined ? student.st9 : '',
      st10: student.st10 !== null && student.st10 !== undefined ? student.st10 : '',
      remarks: student.remarks !== null && student.remarks !== undefined ? student.remarks : '',
      att_jan: student.att_jan !== null && student.att_jan !== undefined ? student.att_jan : '',
      att_feb: student.att_feb !== null && student.att_feb !== undefined ? student.att_feb : '',
      att_mar: student.att_mar !== null && student.att_mar !== undefined ? student.att_mar : '',
      att_apr: student.att_apr !== null && student.att_apr !== undefined ? student.att_apr : '',
      att_may: student.att_may !== null && student.att_may !== undefined ? student.att_may : '',
      att_jun: student.att_jun !== null && student.att_jun !== undefined ? student.att_jun : '',
      att_jul: student.att_jul !== null && student.att_jul !== undefined ? student.att_jul : '',
      att_aug: student.att_aug !== null && student.att_aug !== undefined ? student.att_aug : '',
      att_sep: student.att_sep !== null && student.att_sep !== undefined ? student.att_sep : '',
      att_oct: student.att_oct !== null && student.att_oct !== undefined ? student.att_oct : '',
      att_nov: student.att_nov !== null && student.att_nov !== undefined ? student.att_nov : '',
      att_dec: student.att_dec !== null && student.att_dec !== undefined ? student.att_dec : '',
    });
    setEditTab(tab);
    setEditMode(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.roll_no) return;

    setSubmitting(true);
    const parseVal = (val) => (val !== '' && val !== null && val !== undefined ? parseInt(val) : null);

    const payload = {
      name: formData.name.trim(),
      roll_no: parseInt(formData.roll_no),
      combination_id: student.combination_id,
      fa1: parseVal(formData.fa1),
      fa2: parseVal(formData.fa2),
      sa1: parseVal(formData.sa1),
      fa3: parseVal(formData.fa3),
      fa4: parseVal(formData.fa4),
      sa2: parseVal(formData.sa2),
      prev_fa1: parseVal(formData.prev_fa1),
      prev_fa2: parseVal(formData.prev_fa2),
      prev_sa1: parseVal(formData.prev_sa1),
      prev_fa3: parseVal(formData.prev_fa3),
      prev_fa4: parseVal(formData.prev_fa4),
      prev_sa2: parseVal(formData.prev_sa2),
      prev2_fa1: parseVal(formData.prev2_fa1),
      prev2_fa2: parseVal(formData.prev2_fa2),
      prev2_sa1: parseVal(formData.prev2_sa1),
      prev2_fa3: parseVal(formData.prev2_fa3),
      prev2_fa4: parseVal(formData.prev2_fa4),
      prev2_sa2: parseVal(formData.prev2_sa2),
      g1: parseVal(formData.g1),
      g2: parseVal(formData.g2),
      g3: parseVal(formData.g3),
      v1: parseVal(formData.v1),
      v2: parseVal(formData.v2),
      v3: parseVal(formData.v3),
      r1: parseVal(formData.r1),
      p1: parseVal(formData.p1),
      cw1: parseVal(formData.cw1),
      r2: parseVal(formData.r2),
      p2: parseVal(formData.p2),
      cw2: parseVal(formData.cw2),
      r3: parseVal(formData.r3),
      p3: parseVal(formData.p3),
      cw3: parseVal(formData.cw3),
      listening: formData.listening !== '' ? formData.listening : null,
      speaking: formData.speaking !== '' ? formData.speaking : null,
      reading: formData.reading !== '' ? formData.reading : null,
      writing: formData.writing !== '' ? formData.writing : null,
      st1: parseVal(formData.st1),
      st2: parseVal(formData.st2),
      st3: parseVal(formData.st3),
      st4: parseVal(formData.st4),
      st5: parseVal(formData.st5),
      st6: parseVal(formData.st6),
      st7: parseVal(formData.st7),
      st8: parseVal(formData.st8),
      st9: parseVal(formData.st9),
      st10: parseVal(formData.st10),
      remarks: formData.remarks !== '' ? formData.remarks : null,
      att_jan: parseVal(formData.att_jan),
      att_feb: parseVal(formData.att_feb),
      att_mar: parseVal(formData.att_mar),
      att_apr: parseVal(formData.att_apr),
      att_may: parseVal(formData.att_may),
      att_jun: parseVal(formData.att_jun),
      att_jul: parseVal(formData.att_jul),
      att_aug: parseVal(formData.att_aug),
      att_sep: parseVal(formData.att_sep),
      att_oct: parseVal(formData.att_oct),
      att_nov: parseVal(formData.att_nov),
      att_dec: parseVal(formData.att_dec),
    };

    fetch(`${API_BASE}/students/${studentId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to update student profile');
        return res.json();
      })
      .then((savedStudent) => {
        setStudent(savedStudent);
        setEditMode(false);
        setSubmitting(false);
      })
      .catch((err) => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-medium animate-pulse">
        Loading student profile...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/60 text-slate-650 dark:text-slate-300 rounded-xl text-xs transition-all mb-4"
        >
          ← Back to Table
        </button>
        <div className="text-xs text-rose-500 font-semibold">
          Error loading profile: {error || 'Record empty'}
        </div>
      </div>
    );
  }

  const renderDetailCard = (label, currentVal, prevVal = undefined, prev2Val = undefined, highlight = false, hasHistory = false) => {
    const currentStr = currentVal !== null && currentVal !== undefined ? currentVal : '-';
    const prevStr = prevVal !== null && prevVal !== undefined ? prevVal : 'NA';
    const prev2Str = prev2Val !== null && prev2Val !== undefined ? prev2Val : 'NA';
    return (
      <div className={`p-2.5 rounded-xl border text-center transition-all ${
        highlight 
          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60'
      }`}>
        <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate" title={label}>{label}</span>
        <div className="flex items-center justify-center gap-1.5 mt-1 font-mono text-xs sm:text-sm whitespace-nowrap">
          <span className={highlight ? 'font-extrabold text-indigo-600 dark:text-indigo-400' : 'font-semibold text-slate-800 dark:text-slate-200'} title="Current Year">
            {currentStr}
          </span>
          {hasHistory && (
            <>
              <span className="text-slate-200 dark:text-slate-800 select-none text-xs font-normal">|</span>
              <span className="text-xs text-slate-400 dark:text-slate-400 font-normal" title="1 Year Ago">
                {prevStr}
              </span>
              <span className="text-slate-200 dark:text-slate-800 select-none text-xs font-normal">|</span>
              <span className="text-xs text-slate-400/80 dark:text-slate-550 font-normal" title="2 Years Ago">
                {prev2Str}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderEditableDetailCard = (colKey, label, highlight = false, isSpokenEnglish = false, maxVal = 100) => {
    return (
      <div className={`p-2.5 rounded-xl border text-center transition-all ${
        highlight 
          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60'
      }`}>
        <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate" title={label}>{label}</span>
        <div className="mt-1.5">
          {isSpokenEnglish ? (
            <select
              value={formData[colKey]}
              onChange={(e) => setFormData({ ...formData, [colKey]: e.target.value })}
              className="w-full px-1 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded text-[10px] font-semibold text-center text-slate-850 dark:text-slate-200"
            >
              <option value="">N/A</option>
              <option value="vp">Very Poor (VP)</option>
              <option value="p">Poor (P)</option>
              <option value="a">Average (A)</option>
              <option value="aa">Above Average (AA)</option>
              <option value="g">Good (G)</option>
              <option value="e">Excellent (E)</option>
            </select>
          ) : (
            <input
              type="number"
              min="0"
              max={maxVal}
              placeholder="N/A"
              value={formData[colKey]}
              onChange={(e) => setFormData({ ...formData, [colKey]: e.target.value })}
              className="w-full px-1.5 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded text-xs font-mono text-center text-slate-850 dark:text-slate-200"
            />
          )}
        </div>
      </div>
    );
  };

  const renderEditableDetailCardWithHistory = (colKey, prevKey, prev2Key, label, highlight = false) => {
    return (
      <div className={`p-2.5 rounded-xl border text-center transition-all ${
        highlight 
          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60'
      }`}>
        <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate mb-1" title={label}>{label}</span>
        
        <div className="flex flex-col gap-1.5">
          {/* Current Year */}
          <div>
            <span className="block text-[7px] text-slate-400 uppercase font-bold text-left">Current</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="N/A"
              value={formData[colKey]}
              onChange={(e) => setFormData({ ...formData, [colKey]: e.target.value })}
              className="w-full px-1 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded text-xs font-mono text-center text-slate-850 dark:text-slate-200"
            />
          </div>
          {/* Previous Year */}
          <div>
            <span className="block text-[7px] text-slate-400 uppercase font-bold text-left">Prev Yr</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="N/A"
              value={formData[prevKey]}
              onChange={(e) => setFormData({ ...formData, [prevKey]: e.target.value })}
              className="w-full px-1 py-0.5 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded text-xs font-mono text-center text-slate-550 dark:text-slate-400"
            />
          </div>
          {/* 2 Years Ago */}
          <div>
            <span className="block text-[7px] text-slate-400 uppercase font-bold text-left">2 Yrs Ago</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="N/A"
              value={formData[prev2Key]}
              onChange={(e) => setFormData({ ...formData, [prev2Key]: e.target.value })}
              className="w-full px-1 py-0.5 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded text-xs font-mono text-center text-slate-550 dark:text-slate-400"
            />
          </div>
        </div>
      </div>
    );
  };

  if (editMode) {
    return (
      <div className="max-w-7xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl p-8 mx-auto transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-850 dark:text-white tracking-tight">Edit Student Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Updating values for <span className="font-bold text-indigo-600 dark:text-indigo-400">{student.name}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Toggle between Roster and Attendance Panels */}
          <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-800/85 self-start mb-6 w-fit">
            <button
              type="button"
              onClick={() => setEditTab('roster')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editTab === 'roster'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              📋 Roster Profile
            </button>
            <button
              type="button"
              onClick={() => setEditTab('attendance')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editTab === 'attendance'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              📅 Attendance Profile
            </button>
          </div>

          {editTab === 'roster' ? (
            /* Panel A: Roster Edit View */
            <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in">
              {/* Left Column: Name & Roll inputs */}
              <div className="w-full md:w-1/5 flex flex-col items-center md:items-start text-center md:text-left flex-shrink-0 md:border-r border-slate-200 dark:border-slate-800 md:pr-6">
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-bold text-slate-850 dark:text-slate-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-1">Roll Number</label>
                    <input
                      type="number"
                      required
                      value={formData.roll_no}
                      onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-mono font-bold text-slate-850 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Inline Editable Grid */}
              <div className="flex-1 w-full space-y-6">
                {/* Main Evaluations */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                    Main Evaluations (Current, Prev Year, 2 Years Ago)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {renderEditableDetailCardWithHistory('fa1', 'prev_fa1', 'prev2_fa1', 'FA 1')}
                    {renderEditableDetailCardWithHistory('fa2', 'prev_fa2', 'prev2_fa2', 'FA 2')}
                    {renderEditableDetailCardWithHistory('sa1', 'prev_sa1', 'prev2_sa1', 'SA 1', true)}
                    {renderEditableDetailCardWithHistory('fa3', 'prev_fa3', 'prev2_fa3', 'FA 3')}
                    {renderEditableDetailCardWithHistory('fa4', 'prev_fa4', 'prev2_fa4', 'FA 4')}
                    {renderEditableDetailCardWithHistory('sa2', 'prev_sa2', 'prev2_sa2', 'SA 2', true)}
                  </div>
                </div>

                {/* Grammar & Vocabulary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Grammar */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                      Grammar Scores (out of 50)
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {renderEditableDetailCard('g1', 'G 1', false, false, 50)}
                      {renderEditableDetailCard('g2', 'G 2', false, false, 50)}
                      {renderEditableDetailCard('g3', 'G 3', false, false, 50)}
                    </div>
                  </div>

                  {/* Vocabulary */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                      Vocabulary Scores (out of 50)
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {renderEditableDetailCard('v1', 'V 1', false, false, 50)}
                      {renderEditableDetailCard('v2', 'V 2', false, false, 50)}
                      {renderEditableDetailCard('v3', 'V 3', false, false, 50)}
                    </div>
                  </div>
                </div>

                {/* Creative Work */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                    Creative Work Ratings
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {renderEditableDetailCard('r1', 'Reflection 1')}
                    {renderEditableDetailCard('p1', 'Project 1')}
                    {renderEditableDetailCard('cw1', 'Creative Work 1')}
                    {renderEditableDetailCard('r2', 'Reflection 2')}
                    {renderEditableDetailCard('p2', 'Project 2')}
                    {renderEditableDetailCard('cw2', 'Creative Work 2')}
                    {renderEditableDetailCard('r3', 'Reflection 3')}
                    {renderEditableDetailCard('p3', 'Project 3')}
                    {renderEditableDetailCard('cw3', 'Creative Work 3')}
                  </div>
                </div>

                {/* Spoken English */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                    Spoken English Ratings
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {renderEditableDetailCard('listening', 'Listening', false, true)}
                    {renderEditableDetailCard('speaking', 'Speaking', false, true)}
                    {renderEditableDetailCard('reading', 'Reading', false, true)}
                    {renderEditableDetailCard('writing', 'Writing', false, true)}
                  </div>
                </div>

                {/* Slip Tests */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                    Slip Tests (out of 25)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const key = `st${idx + 1}`;
                      return (
                        <div key={key}>
                          {renderEditableDetailCard(key, `Slip Test ${idx + 1}`, false, false, 25)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                    Teacher Remarks
                  </h4>
                  <textarea
                    rows="4"
                    placeholder="Enter observations, comments, or notes about student's overall performance..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-850 dark:text-slate-200 transition-all font-semibold resize-y"
                  />
                </div>

              </div>
            </div>
          ) : (
            /* Panel B: Attendance Edit View */
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
                Monthly Attendance Records
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                      <th className="p-3">Month</th>
                      <th className="p-3 text-center">Class Working Days</th>
                      <th className="p-3 text-center">Days Attended (Student)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((m, idx) => {
                      const monthNames = {
                        jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May',
                        jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December'
                      };
                      
                      const classDays = combination[`working_days_${m}`] !== null && combination[`working_days_${m}`] !== undefined
                        ? combination[`working_days_${m}`]
                        : getWorkingDaysDefault(idx);

                      return (
                        <tr key={m} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                          <td className="p-3 font-semibold">{monthNames[m]}</td>
                          <td className="p-3 text-center font-mono text-slate-500 dark:text-slate-400">{classDays}</td>
                          <td className="p-3 flex justify-center">
                            <input
                              type="number"
                              min="0"
                              max={classDays}
                              placeholder="N/A"
                              value={formData[`att_${m}`]}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== '' && parseInt(val) > classDays) {
                                  alert(`Attendance cannot exceed total working days (${classDays}) for ${monthNames[m]}`);
                                  return;
                                }
                                setFormData({ ...formData, [`att_${m}`]: val });
                              }}
                              className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-305 dark:hover:border-slate-750 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </form>
      </div>
    );
  }

  // --- Read-only Mode Layout ---
  return (
    <div className="max-w-7xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl p-8 mx-auto transition-all">
      {/* Detail Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-750 text-slate-755 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
          >
            ← Back to Student Table
          </button>
          
          <button
            onClick={() => enterEditMode('roster')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98]"
          >
            ✏️ Edit Profile
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/45 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-455 hover:text-rose-800 dark:hover:text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
          >
            🗑️ Delete Profile
          </button>
        </div>
        
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
          Official Student Profile Card
        </span>
      </div>

      {/* Profile Detail Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Student Details */}
        <div className="w-full md:w-1/5 flex flex-col items-center md:items-start text-center md:text-left flex-shrink-0 md:border-r border-slate-200 dark:border-slate-800 md:pr-6">
          <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-tight">{student.name}</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mt-2">Roll No: #{student.roll_no}</p>
        </div>

        {/* Right Column: Database Fields / Academic Profile */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Section 1: General & Main Evaluation */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
              Main Evaluations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {renderDetailCard('FA 1', student.fa1, student.prev_fa1, student.prev2_fa1, false, true)}
              {renderDetailCard('FA 2', student.fa2, student.prev_fa2, student.prev2_fa2, false, true)}
              {renderDetailCard('SA 1', student.sa1, student.prev_sa1, student.prev2_sa1, true, true)}
              {renderDetailCard('FA 3', student.fa3, student.prev_fa3, student.prev2_fa3, false, true)}
              {renderDetailCard('FA 4', student.fa4, student.prev_fa4, student.prev2_fa4, false, true)}
              {renderDetailCard('SA 2', student.sa2, student.prev_sa2, student.prev2_sa2, true, true)}
            </div>
          </div>

          {/* Section 2: Language Proficiency (Grammar & Vocabulary) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Grammar */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                Grammar Scores
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {renderDetailCard('G 1', student.g1)}
                {renderDetailCard('G 2', student.g2)}
                {renderDetailCard('G 3', student.g3)}
              </div>
            </div>

            {/* Vocabulary */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                Vocabulary Scores
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {renderDetailCard('V 1', student.v1)}
                {renderDetailCard('V 2', student.v2)}
                {renderDetailCard('V 3', student.v3)}
              </div>
            </div>
          </div>

          {/* Section 3: Creative Work */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
              Creative Work Ratings
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {renderDetailCard('Reflection 1', student.r1)}
              {renderDetailCard('Project 1', student.p1)}
              {renderDetailCard('Creative Work 1', student.cw1)}
              {renderDetailCard('Reflection 2', student.r2)}
              {renderDetailCard('Project 2', student.p2)}
              {renderDetailCard('Creative Work 2', student.cw2)}
              {renderDetailCard('Reflection 3', student.r3)}
              {renderDetailCard('Project 3', student.p3)}
              {renderDetailCard('Creative Work 3', student.cw3)}
            </div>
          </div>

          {/* Section 3.5: Spoken English */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
              Spoken English Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {renderDetailCard('Listening', student.listening ? (spokenEnglishMap[student.listening] || student.listening) : '-')}
              {renderDetailCard('Speaking', student.speaking ? (spokenEnglishMap[student.speaking] || student.speaking) : '-')}
              {renderDetailCard('Reading', student.reading ? (spokenEnglishMap[student.reading] || student.reading) : '-')}
              {renderDetailCard('Writing', student.writing ? (spokenEnglishMap[student.writing] || student.writing) : '-')}
            </div>
          </div>

          {/* Section 4: Slip Tests */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
              Slip Tests (out of 25)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, idx) => {
                const key = `st${idx + 1}`;
                return (
                  <div key={key}>
                    {renderDetailCard(`Slip Test ${idx + 1}`, student[key])}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Attendance Summary */}
          {combination && (
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
                Attendance Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Overall Summary Stats */}
                <div className="md:col-span-4 flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl shadow-sm">
                  {(() => {
                    const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                    let totalAttended = 0;
                    let totalWorking = 0;
                    
                    monthsList.forEach(m => {
                      const att = student[`att_${m}`];
                      const work = combination[`working_days_${m}`];
                      if (att !== null && att !== undefined && work !== null && work !== undefined && work > 0) {
                        totalAttended += att;
                        totalWorking += work;
                      }
                    });
                    
                    const percentage = totalWorking > 0 ? ((totalAttended / totalWorking) * 100).toFixed(1) : null;
                    return (
                      <>
                        <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-xs border border-teal-100 dark:border-teal-500/15 flex-shrink-0">
                          {percentage ? `${percentage}%` : 'N/A'}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Overall Percentage</span>
                          <span className="text-xs font-bold text-slate-850 dark:text-white block mt-0.5">
                            {totalWorking > 0 
                              ? `${totalAttended} / ${totalWorking} Days`
                              : 'No records entered'
                            }
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Monthly Breakdown Grid */}
                <div className="md:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((m) => {
                    const monthNames = {
                      jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May',
                      jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December'
                    };
                    const att = student[`att_${m}`];
                    const work = combination[`working_days_${m}`];
                    const hasData = att !== null && att !== undefined && work !== null && work !== undefined && work > 0;
                    
                    return (
                      <div key={m} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-xl text-center">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">{monthNames[m]}</span>
                        <span className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-350 mt-1">
                          {hasData ? `${att}/${work}` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Remarks */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 mb-4">
              Teacher Remarks
            </h4>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-xl shadow-sm min-h-[100px] text-xs text-slate-755 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {student.remarks ? student.remarks : <span className="text-slate-400 dark:text-slate-500 italic">No remarks entered yet.</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
