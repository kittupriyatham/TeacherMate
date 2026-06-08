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

export default function StudentDetailView({ studentId, onBack, token, onLogout }) {
  const [student, setStudent] = useState(null);
  const [combination, setCombination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('basic'); // 'basic', 'main_eval', 'language', 'creative', 'slip_test'
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
    remarks: ''
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

  const openEditModal = () => {
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
      remarks: student.remarks !== null && student.remarks !== undefined ? student.remarks : ''
    });
    setActiveModalTab('basic');
    setIsModalOpen(true);
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
      remarks: formData.remarks !== '' ? formData.remarks : null
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
        setIsModalOpen(false);
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

  return (
    <div className="max-w-7xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl p-8 mx-auto transition-all">
      {/* Detail Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-750 text-slate-750 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
          >
            ← Back to Student Table
          </button>
          
          <button
            onClick={openEditModal}
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
        {/* Left Column: Avatar & Name */}
        <div className="w-full md:w-1/5 flex flex-col items-center text-center flex-shrink-0">
          <div className="relative group">
            {/* Dashed photo border */}
            <div className="w-36 h-36 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 group-hover:border-indigo-500/40 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-400 text-[11px] font-semibold mb-4 transition-all">
              Photo Box
            </div>
            {/* Visual indicator tag */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-bold">
              Placeholder
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-3">{student.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Roll No: #{student.roll_no}</p>
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
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Overall Percentage</span>
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-xl shadow-sm min-h-[100px] text-xs text-slate-750 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {student.remarks ? student.remarks : <span className="text-slate-400 dark:text-slate-500 italic">No remarks entered yet.</span>}
            </div>
          </div>

          {/* Edit Student Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative text-left">
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 text-slate-400 dark:text-slate-505 hover:text-slate-655 dark:hover:text-slate-200 text-lg transition-colors"
                >
                  ✕
                </button>

                {/* Modal Title */}
                <h3 className="text-base font-bold text-slate-905 dark:text-white mb-1">
                  Edit Student Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  Update student details and academic evaluations.
                </p>

                {/* Modal Tab Headers */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 mb-5 overflow-x-auto scrollbar-none gap-2">
                  {[
                    { id: 'basic', label: 'Basic Info' },
                    { id: 'main_eval', label: 'Main Eval' },
                    { id: 'language', label: 'Grammar/Vocab' },
                    { id: 'creative', label: 'Creative Work' },
                    { id: 'spoken_english', label: 'Spoken English' },
                    { id: 'slip_test', label: 'Slip Tests' },
                    { id: 'remarks', label: 'Remarks' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${
                        activeModalTab === tab.id
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 dark:text-slate-450 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tab 1: Basic Information */}
                  {activeModalTab === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                          Student Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                          Assigned Roll Number
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.roll_no}
                          onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Main Evaluation */}
                  {activeModalTab === 'main_eval' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-1">
                        <div className="col-span-3 text-left text-[9px] font-bold uppercase text-slate-400 dark:text-slate-505 tracking-wider">Assessment (out of 100)</div>
                        <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-505 tracking-wider">Current Year</div>
                        <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-505 tracking-wider">Previous Year</div>
                        <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-505 tracking-wider">2 Years Ago</div>
                      </div>
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {[
                          { key: 'fa1', prevKey: 'prev_fa1', prev2Key: 'prev2_fa1', label: 'FA1' },
                          { key: 'fa2', prevKey: 'prev_fa2', prev2Key: 'prev2_fa2', label: 'FA2' },
                          { key: 'sa1', prevKey: 'prev_sa1', prev2Key: 'prev2_sa1', label: 'SA1', isBold: true },
                          { key: 'fa3', prevKey: 'prev_fa3', prev2Key: 'prev2_fa3', label: 'FA3' },
                          { key: 'fa4', prevKey: 'prev_fa4', prev2Key: 'prev2_fa4', label: 'FA4' },
                          { key: 'sa2', prevKey: 'prev_sa2', prev2Key: 'prev2_sa2', label: 'SA2', isBold: true }
                        ].map((field) => (
                          <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                            <div className={`col-span-3 text-xs font-semibold ${field.isBold ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                              {field.label}
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="N/A"
                                value={formData[field.key]}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200 transition-all"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="N/A"
                                value={formData[field.prevKey]}
                                onChange={(e) => setFormData({ ...formData, [field.prevKey]: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-505 dark:text-slate-400 transition-all"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="N/A"
                                value={formData[field.prev2Key]}
                                onChange={(e) => setFormData({ ...formData, [field.prev2Key]: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-505 dark:text-slate-400 transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Language Skills (Grammar & Vocab) */}
                  {activeModalTab === 'language' && (
                    <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                      {/* Grammar */}
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-500 dark:text-indigo-400 mb-2">Grammar Sections (out of 50)</h4>
                        <div className="grid grid-cols-12 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                          <div className="col-span-8 text-left text-[9px] font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Section</div>
                          <div className="col-span-4 text-[9px] font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Score</div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { key: 'g1', label: 'Grammar 1' },
                            { key: 'g2', label: 'Grammar 2' },
                            { key: 'g3', label: 'Grammar 3' }
                          ].map((field) => (
                            <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                              <div className="col-span-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {field.label}
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="N/A"
                                  value={formData[field.key]}
                                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200 transition-all"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vocabulary */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-teal-500 dark:text-teal-400 mb-2">Vocabulary Sections (out of 50)</h4>
                        <div className="grid grid-cols-12 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                          <div className="col-span-8 text-left text-[9px] font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Section</div>
                          <div className="col-span-4 text-[9px] font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Score</div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { key: 'v1', label: 'Vocabulary 1' },
                            { key: 'v2', label: 'Vocabulary 2' },
                            { key: 'v3', label: 'Vocabulary 3' }
                          ].map((field) => (
                            <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                              <div className="col-span-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {field.label}
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="N/A"
                                  value={formData[field.key]}
                                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200 transition-all"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Creative Work */}
                  {activeModalTab === 'creative' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-1">
                        <div className="col-span-8 text-left text-[9px] font-bold uppercase text-slate-450 dark:text-slate-505 tracking-wider">Creative Metric (out of 100)</div>
                        <div className="col-span-4 text-[9px] font-bold uppercase text-slate-455 dark:text-slate-505 tracking-wider">Score</div>
                      </div>
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {[
                          { key: 'r1', label: 'Reflection 1' },
                          { key: 'p1', label: 'Project 1' },
                          { key: 'cw1', label: 'Creative Work 1' },
                          { key: 'r2', label: 'Reflection 2' },
                          { key: 'p2', label: 'Project 2' },
                          { key: 'cw2', label: 'Creative Work 2' },
                          { key: 'r3', label: 'Reflection 3' },
                          { key: 'p3', label: 'Project 3' },
                          { key: 'cw3', label: 'Creative Work 3' }
                        ].map((field) => (
                          <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {field.label}
                            </div>
                            <div className="col-span-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="N/A"
                                value={formData[field.key]}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200 transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: Spoken English */}
                  {activeModalTab === 'spoken_english' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-1">
                        <div className="col-span-8 text-left text-[9px] font-bold uppercase text-slate-450 dark:text-slate-555 tracking-wider">Metric</div>
                        <div className="col-span-4 text-[9px] font-bold uppercase text-slate-455 dark:text-slate-555 tracking-wider">Rating</div>
                      </div>
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {[
                          { key: 'listening', label: 'Listening' },
                          { key: 'speaking', label: 'Speaking' },
                          { key: 'reading', label: 'Reading' },
                          { key: 'writing', label: 'Writing' }
                        ].map((field) => (
                          <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-8 text-xs font-semibold text-slate-700 dark:text-slate-350">
                              {field.label}
                            </div>
                            <div className="col-span-4">
                              <select
                                value={formData[field.key]}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs text-slate-850 dark:text-slate-200 transition-all font-semibold"
                              >
                                <option value="">N/A</option>
                                <option value="vp">Very Poor (VP)</option>
                                <option value="p">Poor (P)</option>
                                <option value="a">Average (A)</option>
                                <option value="aa">Above Average (AA)</option>
                                <option value="g">Good (G)</option>
                                <option value="e">Excellent (E)</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Slip Tests */}
                  {activeModalTab === 'slip_test' && (
                    <div className="grid grid-cols-5 gap-3 max-h-[260px] overflow-y-auto pr-1">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const field = `st${idx + 1}`;
                        return (
                          <div key={field} className="text-center">
                            <label className="block text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1 truncate" title={`Slip Test ${idx + 1}`}>
                              Slip Test {idx + 1}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="25"
                              placeholder="N/A"
                              value={formData[field]}
                              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-855 dark:text-slate-200 transition-all"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab: Remarks */}
                  {activeModalTab === 'remarks' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                          Teacher Remarks / Notes
                        </label>
                        <textarea
                          rows="6"
                          placeholder="Enter observations, comments, or notes about student's overall performance..."
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold resize-y"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Update details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
