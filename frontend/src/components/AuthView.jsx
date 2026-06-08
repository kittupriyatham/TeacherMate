import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function AuthView({ onLoginSuccess, theme, setTheme }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    bio: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isRegistering 
      ? `${API_BASE}/auth/register` 
      : `${API_BASE}/auth/login`;

    const payload = isRegistering 
      ? {
          username: formData.username.trim(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          email: formData.email.trim() || null,
          bio: formData.bio.trim() || null,
        }
      : {
          username: formData.username.trim(),
          password: formData.password,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred during authentication');
      }

      if (isRegistering) {
        // Auto-login after successful registration
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password,
          }),
        });

        if (!loginResponse.ok) {
          throw new Error('Registration completed, but auto-login failed. Please log in manually.');
        }

        const loginData = await loginResponse.json();
        onLoginSuccess(loginData.access_token);
      } else {
        const data = await response.json();
        onLoginSuccess(data.access_token);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Theme Toggle Button */}
      <div className="absolute top-5 right-5">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 shadow-sm transition-all active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden p-8 transition-all duration-300">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <span className="font-extrabold text-white text-2xl">TM</span>
          </div>
          <h1 className="font-bold text-xl text-slate-800 dark:text-white tracking-wide">TeacherMate</h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5 font-medium">
            {isRegistering ? 'Create your teacher portal account' : 'Access your teacher dashboard'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="e.g. Professor Smith"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter unique username"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
            />
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 tracking-wider mb-1.5">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="smith@school.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-505 dark:text-slate-400 tracking-wider mb-1.5">
                  Short Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-all font-semibold resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : isRegistering ? (
              'Create Teacher Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle between Register and Login */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isRegistering ? 'Sign In Here' : 'Register as a Teacher'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
