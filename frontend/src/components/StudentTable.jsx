import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';


export default function StudentTable({ comboId, onStudentClick, token, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultColumnWidths = {
    roll_no: 70,
    name: 140,
    fa1: 85,
    fa2: 85,
    sa1: 85,
    fa3: 85,
    fa4: 85,
    sa2: 85,
    g1: 45,
    g2: 45,
    g3: 45,
    v1: 45,
    v2: 45,
    v3: 45,
    r1: 45,
    p1: 45,
    cw1: 45,
    r2: 45,
    p2: 45,
    cw2: 45,
    r3: 45,
    p3: 45,
    cw3: 45
  };
  const [columnWidths, setColumnWidths] = useState(defaultColumnWidths);

  const handleResizeStart = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colKey];

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setColumnWidths((prev) => ({
        ...prev,
        [colKey]: Math.max(40, startWidth + deltaX)
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderHeader = (colKey, label, title = '', extraClasses = '', alignmentClass = 'text-center') => {
    const hasBorder = !extraClasses.includes('border-r-0');
    const borderClass = hasBorder ? 'border-r border-slate-200 dark:border-slate-800' : '';
    return (
      <th 
        className={`p-2.5 relative select-none ${borderClass} ${alignmentClass} ${extraClasses}`}
        title={title}
      >
        <span className="truncate block pr-1.5" title={title || label}>{label}</span>
        <div 
          onMouseDown={(e) => handleResizeStart(e, colKey)}
          className="absolute right-0 top-0 bottom-0 w-1.5 hover:bg-indigo-500/40 active:bg-indigo-600 cursor-col-resize z-20"
        />
      </th>
    );
  };

  const totalTableWidth = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);

  // Form states (Add/Edit Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // null means "Add New", object means "Edit"
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API_BASE}/combinations/${comboId}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to load students');
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, [comboId]);

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Avoid triggering parent row click
    if (!confirm('Are you sure you want to delete this student profile?')) return;

    fetch(`${API_BASE}/students/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to delete student');
        return res.json();
      })
      .then(() => {
        // Remove from local state
        setStudents(students.filter((s) => s.id !== id));
      })
      .catch((err) => alert(err.message));
  };

  const initialFormData = {
    name: '',
    roll_no: '',
    fa1: '', fa2: '', sa1: '', fa3: '', fa4: '', sa2: '',
    prev_fa1: '', prev_fa2: '', prev_sa1: '', prev_fa3: '', prev_fa4: '', prev_sa2: '',
    prev2_fa1: '', prev2_fa2: '', prev2_sa1: '', prev2_fa3: '', prev2_fa4: '', prev2_sa2: '',
    g1: '', g2: '', g3: '',
    v1: '', v2: '', v3: '',
    r1: '', p1: '', cw1: '', r2: '', p2: '', cw2: '', r3: '', p3: '', cw3: '',
    st1: '', st2: '', st3: '', st4: '', st5: '', st6: '', st7: '', st8: '', st9: '', st10: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeModalTab, setActiveModalTab] = useState('basic'); // 'basic', 'main_eval', 'language', 'creative', 'slip_test'

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData(initialFormData);
    setActiveModalTab('basic');
    setIsModalOpen(true);
  };

  const openEditModal = (e, student) => {
    e.stopPropagation(); // Avoid triggering parent row click
    setEditingStudent(student);
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
      st1: student.st1 !== null && student.st1 !== undefined ? student.st1 : '',
      st2: student.st2 !== null && student.st2 !== undefined ? student.st2 : '',
      st3: student.st3 !== null && student.st3 !== undefined ? student.st3 : '',
      st4: student.st4 !== null && student.st4 !== undefined ? student.st4 : '',
      st5: student.st5 !== null && student.st5 !== undefined ? student.st5 : '',
      st6: student.st6 !== null && student.st6 !== undefined ? student.st6 : '',
      st7: student.st7 !== null && student.st7 !== undefined ? student.st7 : '',
      st8: student.st8 !== null && student.st8 !== undefined ? student.st8 : '',
      st9: student.st9 !== null && student.st9 !== undefined ? student.st9 : '',
      st10: student.st10 !== null && student.st10 !== undefined ? student.st10 : ''
    });
    setActiveModalTab('basic');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.roll_no) return;

    setSubmitting(true);
    const url = editingStudent 
      ? `${API_BASE}/students/${editingStudent.id}`
      : `${API_BASE}/students`;
    const method = editingStudent ? 'PUT' : 'POST';

    const parseVal = (val) => (val !== '' && val !== null && val !== undefined ? parseInt(val) : null);

    const payload = {
      name: formData.name.trim(),
      roll_no: parseInt(formData.roll_no),
      combination_id: comboId,
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
      st1: parseVal(formData.st1),
      st2: parseVal(formData.st2),
      st3: parseVal(formData.st3),
      st4: parseVal(formData.st4),
      st5: parseVal(formData.st5),
      st6: parseVal(formData.st6),
      st7: parseVal(formData.st7),
      st8: parseVal(formData.st8),
      st9: parseVal(formData.st9),
      st10: parseVal(formData.st10)
    };

    if (editingStudent) {
      payload.id = editingStudent.id;
    }

    fetch(url, {
      method: method,
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
        if (!res.ok) throw new Error('Failed to save student profile');
        return res.json();
      })
      .then((savedStudent) => {
        if (editingStudent) {
          setStudents(students.map((s) => (s.id === savedStudent.id ? savedStudent : s)));
        } else {
          setStudents([...students, savedStudent]);
        }
        setIsModalOpen(false);
        setSubmitting(false);
      })
      .catch((err) => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  const renderGradeCell = (currentVal, prevVal, prev2Val, currentClass = 'text-slate-800 dark:text-slate-200') => {
    const currentStr = currentVal !== null && currentVal !== undefined ? currentVal : '-';
    const prevStr = prevVal !== null && prevVal !== undefined ? prevVal : '-';
    const prev2Str = prev2Val !== null && prev2Val !== undefined ? prev2Val : '-';
    return (
      <div 
        className="flex w-full items-stretch justify-center font-mono text-[10px] whitespace-nowrap"
        title={`Current: ${currentStr} | Prev Year: ${prevStr} | 2 Years Ago: ${prev2Str}`}
      >
        <div className="flex-1 py-2.5 flex items-center justify-center">
          <span className={`font-bold ${currentClass}`}>
            {currentStr}
          </span>
        </div>
        <div className="w-[1px] bg-slate-200/50 dark:bg-slate-800/50 self-stretch"></div>
        <div className="flex-1 py-2.5 flex items-center justify-center text-slate-400 dark:text-slate-500 font-normal">
          {prevStr}
        </div>
        <div className="w-[1px] bg-slate-200/50 dark:bg-slate-800/50 self-stretch"></div>
        <div className="flex-1 py-2.5 flex items-center justify-center text-slate-400/80 dark:text-slate-650 font-normal">
          {prev2Str}
        </div>
      </div>
    );
  };

  const renderSingleGradeCell = (currentVal, currentClass = 'text-slate-800 dark:text-slate-200') => {
    const currentStr = currentVal !== null && currentVal !== undefined ? currentVal : '-';
    return (
      <div 
        className="flex w-full items-center justify-center font-mono text-xs py-2.5 whitespace-nowrap"
        title={`Current: ${currentStr}`}
      >
        <span className={`font-bold ${currentClass}`}>
          {currentStr}
        </span>
      </div>
    );
  };



  return (
    <div className="space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Student Roster</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Displaying students enrolled in the active class section combination. Marks shown as: <span className="font-semibold text-slate-700 dark:text-slate-350">Current</span> | <span className="text-slate-400 dark:text-slate-550">Previous Year</span> | <span className="text-slate-400/80 dark:text-slate-650">2 Years Ago</span> (for Main Evaluations only).
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">


          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98]"
          >
            <span>➕</span> Add New Student
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-all">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-450 dark:text-slate-500 font-medium animate-pulse">
            Loading students list...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500 font-medium">
            Error: {error}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <span className="block text-2xl mb-2">📁</span>
            <span className="text-xs font-medium italic">No students registered in this class. Click "Add New Student" to get started.</span>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table style={{ minWidth: totalTableWidth, width: '100%', tableLayout: 'fixed' }} className="text-left border-collapse">
              <colgroup>
                <col style={{ width: columnWidths.roll_no }} />
                <col style={{ width: columnWidths.name }} />
                <col style={{ width: columnWidths.fa1 }} />
                <col style={{ width: columnWidths.fa2 }} />
                <col style={{ width: columnWidths.sa1 }} />
                <col style={{ width: columnWidths.fa3 }} />
                <col style={{ width: columnWidths.fa4 }} />
                <col style={{ width: columnWidths.sa2 }} />
                <col style={{ width: columnWidths.g1 }} />
                <col style={{ width: columnWidths.g2 }} />
                <col style={{ width: columnWidths.g3 }} />
                <col style={{ width: columnWidths.v1 }} />
                <col style={{ width: columnWidths.v2 }} />
                <col style={{ width: columnWidths.v3 }} />
                <col style={{ width: columnWidths.r1 }} />
                <col style={{ width: columnWidths.p1 }} />
                <col style={{ width: columnWidths.cw1 }} />
                <col style={{ width: columnWidths.r2 }} />
                <col style={{ width: columnWidths.p2 }} />
                <col style={{ width: columnWidths.cw2 }} />
                <col style={{ width: columnWidths.r3 }} />
                <col style={{ width: columnWidths.p3 }} />
                <col style={{ width: columnWidths.cw3 }} />
              </colgroup>
              <thead>
                {/* Category Headers */}
                <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  <th className="p-3 pl-3 border-r border-slate-200 dark:border-slate-800" colSpan="2">Student</th>
                  <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" colSpan="6">Main Evaluation</th>
                  <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" colSpan="3">Grammar</th>
                  <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800 bg-sky-50/50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400" colSpan="3">Vocabulary</th>
                  <th className="p-3 text-center bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-tr-2xl" colSpan="9">Creative Work</th>
                </tr>
                {/* Column Name Headers */}
                <tr className="bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                  {renderHeader('roll_no', 'Roll No', '', 'pl-3', 'text-left')}
                  {renderHeader('name', 'Name', '', '', 'text-left')}
                  {/* Main Eval */}
                  {renderHeader('fa1', 'FA1', 'Formative Assessment 1')}
                  {renderHeader('fa2', 'FA2', 'Formative Assessment 2')}
                  {renderHeader('sa1', 'SA1', 'Summative Assessment 1', 'font-bold')}
                  {renderHeader('fa3', 'FA3', 'Formative Assessment 3')}
                  {renderHeader('fa4', 'FA4', 'Formative Assessment 4')}
                  {renderHeader('sa2', 'SA2', 'Summative Assessment 2', 'font-bold')}
                  {/* Grammar */}
                  {renderHeader('g1', 'G1', 'Grammar 1')}
                  {renderHeader('g2', 'G2', 'Grammar 2')}
                  {renderHeader('g3', 'G3', 'Grammar 3')}
                  {/* Vocabulary */}
                  {renderHeader('v1', 'V1', 'Vocabulary 1')}
                  {renderHeader('v2', 'V2', 'Vocabulary 2')}
                  {renderHeader('v3', 'V3', 'Vocabulary 3')}
                  {/* Creative Work */}
                  {renderHeader('r1', 'R1', 'Reflection 1')}
                  {renderHeader('p1', 'P1', 'Project 1')}
                  {renderHeader('cw1', 'CW1', 'Creative Writing 1')}
                  {renderHeader('r2', 'R2', 'Reflection 2')}
                  {renderHeader('p2', 'P2', 'Project 2')}
                  {renderHeader('cw2', 'CW2', 'Creative Writing 2')}
                  {renderHeader('r3', 'R3', 'Reflection 3')}
                  {renderHeader('p3', 'P3', 'Project 3')}
                  {renderHeader('cw3', 'CW3', 'Creative Writing 3', 'border-r-0')}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-medium">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onStudentClick(student.id)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="p-2 pl-3 text-slate-500 dark:text-slate-400 font-mono border-r border-slate-100 dark:border-slate-850 whitespace-nowrap">#{student.roll_no}</td>
                    <td className="p-2 text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold transition-colors truncate border-r border-slate-100 dark:border-slate-850" title={student.name}>
                      {student.name}
                    </td>
                    {/* Main Eval */}
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/5">{renderGradeCell(student.fa1, student.prev_fa1, student.prev2_fa1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/5">{renderGradeCell(student.fa2, student.prev_fa2, student.prev2_fa2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-100/20 dark:bg-indigo-950/10">{renderGradeCell(student.sa1, student.prev_sa1, student.prev2_sa1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/5">{renderGradeCell(student.fa3, student.prev_fa3, student.prev2_fa3)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/5">{renderGradeCell(student.fa4, student.prev_fa4, student.prev2_fa4)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-indigo-100/20 dark:bg-indigo-950/10">{renderGradeCell(student.sa2, student.prev_sa2, student.prev2_sa2)}</td>
                    {/* Grammar */}
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-emerald-50/10 dark:bg-emerald-950/5">{renderSingleGradeCell(student.g1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-emerald-50/10 dark:bg-emerald-950/5">{renderSingleGradeCell(student.g2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-emerald-50/10 dark:bg-emerald-950/5">{renderSingleGradeCell(student.g3)}</td>
                    {/* Vocabulary */}
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-sky-50/10 dark:bg-sky-950/5">{renderSingleGradeCell(student.v1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-sky-50/10 dark:bg-sky-950/5">{renderSingleGradeCell(student.v2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-sky-50/10 dark:bg-sky-950/5">{renderSingleGradeCell(student.v3)}</td>
                    {/* Creative Work */}
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.r1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.p1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.cw1)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.r2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.p2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.cw2)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.r3)}</td>
                    <td className="p-0 text-center border-r border-slate-100 dark:border-slate-850 bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.p3)}</td>
                    <td className="p-0 text-center bg-purple-50/10 dark:bg-purple-950/5">{renderSingleGradeCell(student.cw3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 text-lg transition-colors"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {editingStudent ? 'Edit Student Assessment Profile' : 'Add New Student Record'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enter academic evaluations below. Values will be committed to the database.
            </p>

            {/* Modal Tab Headers */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-5 overflow-x-auto scrollbar-none gap-2">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'main_eval', label: 'Main Eval' },
                { id: 'language', label: 'Grammar/Vocab' },
                { id: 'creative', label: 'Creative Work' },
                { id: 'slip_test', label: 'Slip Tests' }
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
                      placeholder="e.g. Aarav Sharma"
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
                      placeholder="e.g. 1"
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
                    <div className="col-span-3 text-left text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Assessment (out of 100)</div>
                    <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Current Year</div>
                    <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Previous Year</div>
                    <div className="col-span-3 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">2 Years Ago</div>
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
                            className="w-full px-2 py-1 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-500 dark:text-slate-400 transition-all"
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
                            className="w-full px-2 py-1 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-center text-slate-500 dark:text-slate-400 transition-all"
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
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-500 dark:text-emerald-400 mb-2">Vocabulary Sections (out of 50)</h4>
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
                    <div className="col-span-8 text-left text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Creative Metric (out of 100)</div>
                    <div className="col-span-4 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Score</div>
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

              {/* Tab 5: Slip Tests */}
              {activeModalTab === 'slip_test' && (
                <div className="grid grid-cols-5 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const field = `st${idx + 1}`;
                    return (
                      <div key={field}>
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
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-305 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-lg text-xs font-mono text-slate-850 dark:text-slate-200 transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStudent ? 'Update Details' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
