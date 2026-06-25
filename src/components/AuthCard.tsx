import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, Mail, Lock, User, School, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

interface AuthCardProps {
  initialView: 'login' | 'register';
  onBack: () => void;
  onSuccess: (userData: any, token: string) => void;
  darkMode: boolean;
}

export default function AuthCard({ initialView, onBack, onSuccess, darkMode }: AuthCardProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = view === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = view === 'login' 
      ? { email, password } 
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${view === 'login' ? 'Login' : 'Registration'} failed`);
      }

      onSuccess(data.user, data.token);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Back button */}
      <button
        onClick={onBack}
        className={`absolute top-6 left-6 flex items-center gap-2 text-sm font-medium hover:underline ${
          darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Main card */}
      <div className={`w-full max-w-md p-8 border transition-all duration-200 ${
        darkMode ? 'bg-[#1c1b18] border-[#31302b]' : 'bg-white border-[#dedcd1]'
      }`}>
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-12 h-12 flex items-center justify-center border mb-4 rounded-full ${
            darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-[#faf9f5]'
          }`}>
            <GraduationCap className="w-6 h-6 text-inherit" />
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            {view === 'login' ? 'Sign In to IRA AI' : 'Create Student Profile'}
          </h2>
          <p className={`text-xs mt-1 text-center ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
            {view === 'login' 
              ? 'Access your private desk and chat files' 
              : 'Sign up to personalized concept teaching, logging, and history'
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`flex items-start gap-3 p-3 text-sm border mb-6 ${
            darkMode 
              ? 'bg-[#2d1b1a] border-[#5e2b29] text-[#e0a09e]' 
              : 'bg-[#fdf2f2] border-[#f8b4b4] text-[#9b1c1c]'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="name-input" className={`text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'
              }`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-[#706e64]' : 'text-[#a09e95]'
                }`} />
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="Alexander Hamilton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-transparent border text-sm font-light focus:outline-none transition-all ${
                    darkMode 
                      ? 'border-[#31302b] focus:border-[#faf9f5] text-[#faf9f5]' 
                      : 'border-[#dedcd1] focus:border-[#141413] text-[#141413]'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email-input" className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'
            }`}>
              Student Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-[#706e64]' : 'text-[#a09e95]'
              }`} />
              <input
                id="email-input"
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-transparent border text-sm font-light focus:outline-none transition-all ${
                  darkMode 
                    ? 'border-[#31302b] focus:border-[#faf9f5] text-[#faf9f5]' 
                    : 'border-[#dedcd1] focus:border-[#141413] text-[#141413]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password-input" className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-[#706e64]' : 'text-[#a09e95]'
              }`} />
              <input
                id="password-input"
                type="password"
                required
                minLength={6}
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-transparent border text-sm font-light focus:outline-none transition-all ${
                  darkMode 
                    ? 'border-[#31302b] focus:border-[#faf9f5] text-[#faf9f5]' 
                    : 'border-[#dedcd1] focus:border-[#141413] text-[#141413]'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              darkMode 
                ? 'bg-[#e6e4db] text-[#141413] hover:bg-white border-[#e6e4db]' 
                : 'bg-[#141413] text-[#faf9f5] hover:bg-black border-[#141413]'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing desk...
              </>
            ) : (
              view === 'login' ? 'Enter Workspace' : 'Configure Profile'
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className={`mt-8 border-t pt-4 text-center text-xs ${
          darkMode ? 'border-[#31302b]' : 'border-[#dedcd1]'
        }`}>
          {view === 'login' ? (
            <p className={darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}>
              New to IRA AI?{' '}
              <button
                onClick={() => { setView('register'); setError(null); }}
                className={`underline font-semibold hover:text-inherit ${darkMode ? 'text-[#faf9f5]' : 'text-[#141413]'}`}
              >
                Create student profile
              </button>
            </p>
          ) : (
            <p className={darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}>
              Already registered?{' '}
              <button
                onClick={() => { setView('login'); setError(null); }}
                className={`underline font-semibold hover:text-inherit ${darkMode ? 'text-[#faf9f5]' : 'text-[#141413]'}`}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
