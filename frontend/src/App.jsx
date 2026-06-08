import React, { useState, useEffect } from 'react';
import SidebarMenu from './components/SidebarMenu';
import StudentTable from './components/StudentTable';
import StudentDetailView from './components/StudentDetailView';
import AuthView from './components/AuthView';
import TeacherProfile from './components/TeacherProfile';

export default function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'profile'
  const [selectedComboId, setSelectedComboId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleComboSelect = (comboId) => {
    setSelectedComboId(comboId);
    setSelectedStudentId(null); // Reset detail view when switching classes
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setSelectedComboId(null);
    setSelectedStudentId(null);
    setActiveView('dashboard');
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleProfileUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // If user is not logged in, render the Auth View
  if (!token) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar: Fixed menu on the left */}
      <aside className="w-80 h-full flex-shrink-0">
        <SidebarMenu
          selectedId={selectedComboId}
          onSelect={handleComboSelect}
          theme={theme}
          setTheme={setTheme}
          token={token}
          onProfileClick={() => setActiveView('profile')}
          onLogout={handleLogout}
          refreshTrigger={refreshTrigger}
          activeView={activeView}
        />
      </aside>

      {/* Main Workspace Area: Dynamic swap based on active states */}
      <main className="flex-1 h-full overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {activeView === 'profile' ? (
          <div className="animate-fade-in">
            <TeacherProfile
              token={token}
              onProfileUpdated={handleProfileUpdated}
              onBack={() => setActiveView('dashboard')}
              onLogout={handleLogout}
            />
          </div>
        ) : selectedStudentId ? (
          <div className="animate-fade-in">
            <StudentDetailView
              studentId={selectedStudentId}
              onBack={() => setSelectedStudentId(null)}
              token={token}
              onLogout={handleLogout}
            />
          </div>
        ) : selectedComboId ? (
          <div className="animate-fade-in">
            <StudentTable
              comboId={selectedComboId}
              onStudentClick={(id) => setSelectedStudentId(id)}
              token={token}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/10 shadow-sm dark:shadow-none transition-all">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-2xl mb-4 border border-slate-200 dark:border-slate-800">
              🏫
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">No Class Selected</h2>
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 max-w-sm">
              Please choose a class-section combination from the left menu to view, modify, or add student profiles.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
