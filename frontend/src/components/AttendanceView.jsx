import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const months = [
  { code: 'jan', name: 'January' },
  { code: 'feb', name: 'February' },
  { code: 'mar', name: 'March' },
  { code: 'apr', name: 'April' },
  { code: 'may', name: 'May' },
  { code: 'jun', name: 'June' },
  { code: 'jul', name: 'July' },
  { code: 'aug', name: 'August' },
  { code: 'sep', name: 'September' },
  { code: 'oct', name: 'October' },
  { code: 'nov', name: 'November' },
  { code: 'dec', name: 'December' }
];

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

export default function AttendanceView({ comboId, token, onLogout, onBack }) {
  const [combination, setCombination] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('jan');
  const [workingDays, setWorkingDays] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Class Combination details (to get working_days)
      const comboRes = await fetch(`${API_BASE}/combinations/${comboId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (comboRes.status === 401) {
        onLogout();
        throw new Error('Session expired');
      }
      if (!comboRes.ok) throw new Error('Failed to fetch class combination details');
      const comboData = await comboRes.json();
      setCombination(comboData);

      // 2. Fetch Students List
      const studentsRes = await fetch(`${API_BASE}/combinations/${comboId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!studentsRes.ok) throw new Error('Failed to fetch students list');
      const studentsData = await studentsRes.json();
      setStudents(studentsData.sort((a, b) => a.roll_no - b.roll_no));

      // 3. Initialize fields for default selected month ('jan')
      initializeMonthFields(comboData, studentsData, 'jan');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [comboId]);

  // Sync fields when selected month changes
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    if (combination && students.length > 0) {
      initializeMonthFields(combination, students, newMonth);
    }
  };

  const initializeMonthFields = (combo, studentList, monthCode) => {
    const daysKey = `working_days_${monthCode}`;
    const attKey = `att_${monthCode}`;

    // Get 0-based calendar month index from months list
    const monthIndex = months.findIndex(m => m.code === monthCode);
    const defaultDays = getWorkingDaysDefault(monthIndex);

    const daysVal = combo[daysKey] !== null && combo[daysKey] !== undefined ? combo[daysKey] : defaultDays;
    setWorkingDays(daysVal);

    const initialMap = {};
    studentList.forEach(s => {
      const attVal = s[attKey] !== null && s[attKey] !== undefined ? s[attKey] : '';
      initialMap[s.id] = attVal;
    });
    setAttendanceMap(initialMap);
    setSaveSuccess(false);
  };

  // Quick Action: Set all student days to the current working days value
  const handleSetAllToMax = () => {
    if (!workingDays || isNaN(parseInt(workingDays))) {
      alert('Please enter a valid number of working days first.');
      return;
    }
    const maxVal = parseInt(workingDays);
    const updatedMap = {};
    students.forEach(s => {
      updatedMap[s.id] = maxVal;
    });
    setAttendanceMap(updatedMap);
  };

  const handleAttendedDaysChange = (studentId, value) => {
    const parsed = value === '' ? '' : parseInt(value);
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: parsed
    }));
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    const parsedWorkingDays = workingDays === '' ? null : parseInt(workingDays);
    
    // Validation
    if (parsedWorkingDays !== null && (parsedWorkingDays < 0 || parsedWorkingDays > 31)) {
      alert('Total Working Days must be between 0 and 31.');
      setSaving(false);
      return;
    }

    const studentsAttendance = students.map(s => {
      const val = attendanceMap[s.id];
      const parsedVal = val === '' ? null : parseInt(val);
      
      // Validation per student
      if (parsedVal !== null && parsedWorkingDays !== null && parsedVal > parsedWorkingDays) {
        // We will warn the user but cap it in payload if they proceed or throw error
        throw new Error(`Student ${s.name} attended days (${parsedVal}) cannot exceed Working Days (${parsedWorkingDays}).`);
      }
      if (parsedVal !== null && parsedVal < 0) {
        throw new Error(`Student ${s.name} attended days cannot be negative.`);
      }

      return {
        id: s.id,
        attendance: parsedVal
      };
    });

    try {
      const res = await fetch(`${API_BASE}/combinations/${comboId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          month: selectedMonth,
          working_days: parsedWorkingDays,
          students_attendance: studentsAttendance
        })
      });

      if (res.status === 401) {
        onLogout();
        throw new Error('Session expired');
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save attendance record');
      }

      // Success
      setSaveSuccess(true);
      
      // Update local cache
      const updatedCombo = { ...combination, [`working_days_${selectedMonth}`]: parsedWorkingDays };
      setCombination(updatedCombo);
      
      const updatedStudents = students.map(s => {
        const matchingVal = attendanceMap[s.id];
        return {
          ...s,
          [`att_${selectedMonth}`]: matchingVal === '' ? null : parseInt(matchingVal)
        };
      });
      setStudents(updatedStudents);

      // Dismiss success banner after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculatePercentage = (attended, total) => {
    if (total === null || total === undefined || total === '' || parseInt(total) === 0) return null;
    if (attended === null || attended === undefined || attended === '') return null;
    const p = (parseInt(attended) / parseInt(total)) * 100;
    return p.toFixed(1);
  };

  const getPercentageBadge = (percentage) => {
    if (percentage === null) return null;
    const num = parseFloat(percentage);
    let classes = "";
    if (num >= 90) {
      classes = "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10";
    } else if (num >= 75) {
      classes = "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/10";
    } else {
      classes = "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/10";
    }
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${classes}`}>
        {percentage}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-medium animate-pulse">
        Loading attendance sheet...
      </div>
    );
  }

  if (error || !combination) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/60 text-slate-650 dark:text-slate-300 rounded-xl text-xs transition-all mb-4"
        >
          ← Back
        </button>
        <div className="text-xs text-rose-500 font-semibold">
          Error loading attendance: {error || 'Record empty'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-slate-650 dark:text-slate-300 text-xs transition-all"
              title="Back to Student Table"
            >
              ←
            </button>
            <span>Monthly Attendance Manager</span>
          </h2>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            Bulk-record attendance for class <span className="font-semibold text-slate-755 dark:text-white">{combination.name}</span>. Select month and input total working days first.
          </p>
        </div>
        <button
          onClick={onBack}
          className="self-start px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
        >
          View Student Roster Table
        </button>
      </div>

      {/* Control Panel Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-all">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            {/* Month Selection */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Select Attendance Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Working Days */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Total Working Days
              </label>
              <input
                type="number"
                min="0"
                max="31"
                placeholder="e.g. 22"
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
                className="w-full px-3.5 py-2.0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-mono font-semibold text-slate-850 dark:text-slate-200 transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="md:col-span-4">
              <button
                type="button"
                onClick={handleSetAllToMax}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
              >
                ⚡ Set All Students to Max Days ({workingDays || 'N/A'})
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-xs font-medium text-center animate-fade-in">
              🎉 Attendance sheet saved successfully!
            </div>
          )}

          {/* Roster Input List */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950/45 px-4 py-2 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 tracking-wider">
              <div className="col-span-2">Roll No</div>
              <div className="col-span-5">Student Name</div>
              <div className="col-span-3 text-center">Days Attended</div>
              <div className="col-span-2 text-right">Attendance %</div>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[420px] overflow-y-auto custom-scrollbar">
              {students.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-450 dark:text-slate-500 italic">
                  No students registered in this class combination.
                </div>
              ) : (
                students.map((student) => {
                  const currentAttVal = attendanceMap[student.id] !== undefined ? attendanceMap[student.id] : '';
                  const percentage = calculatePercentage(currentAttVal, workingDays);
                  return (
                    <div key={student.id} className="grid grid-cols-12 px-4 py-2.5 items-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                      <div className="col-span-2 font-mono text-slate-400 dark:text-slate-505">#{student.roll_no}</div>
                      <div className="col-span-5 font-bold text-slate-800 dark:text-white">{student.name}</div>
                      <div className="col-span-3 flex justify-center">
                        <input
                          type="number"
                          min="0"
                          max={workingDays || 31}
                          placeholder="N/A"
                          value={currentAttVal}
                          onChange={(e) => handleAttendedDaysChange(student.id, e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-850 dark:text-slate-200 transition-all"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        {getPercentageBadge(percentage) || <span className="text-[10px] text-slate-400 dark:text-slate-505">-</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>}
              {saving ? 'Saving...' : 'Save Attendance Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
