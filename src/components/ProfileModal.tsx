import React, { useState } from 'react';
import { X, User, School, BookOpen, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  user: any;
  token: string;
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
  darkMode: boolean;
}

export default function ProfileModal({ user, token, onClose, onUpdate, darkMode }: ProfileModalProps) {
  const [name, setName] = useState(user.name || '');
  const [school, setSchool] = useState(user.school || '');
  const [major, setMajor] = useState(user.major || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, school, major }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onUpdate(data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error updating profile configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`w-full max-w-md border border-neutral-200/30 dark:border-neutral-850/40 shadow-2xl p-2 space-y-1 transition-all duration-300 rounded-[32px] ${
        darkMode ? 'bg-[#1c1b18]/95 text-white' : 'bg-white/95 text-black'
      } backdrop-blur-xl animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${
          darkMode ? 'border-neutral-800/40' : 'border-neutral-200/50'
        }`}>
          <h3 className="font-serif text-lg font-bold tracking-tight">Academic Profile</h3>
          <button 
            onClick={onClose}
            className={`p-1.5 hover:bg-opacity-15 rounded-full transition-colors ${darkMode ? 'hover:bg-white text-neutral-400 hover:text-white' : 'hover:bg-black text-neutral-500 hover:text-black'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className={`text-xs font-light leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Providing your school and major allows IRA AI to formulate specialized context-aware replies relevant to your curriculum.
          </p>

          {error && (
            <div className={`flex items-start gap-2.5 p-3 text-xs border rounded-[14px] ${
              darkMode ? 'bg-[#2d1b1a]/80 border-[#5e2b29]/60 text-[#e0a09e]' : 'bg-[#fdf2f2]/80 border-[#f8b4b4]/60 text-[#9b1c1c]'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`flex items-center gap-2.5 p-3 text-xs border rounded-[14px] ${
              darkMode ? 'bg-[#1b2b21]/80 border-[#295e3a]/60 text-[#a1e0b5]' : 'bg-[#f0fdf4]/80 border-[#bbf7d0]/60 text-[#15803d]'
            }`}>
              <Check className="w-4 h-4 shrink-0" />
              <span>Academic profile updated successfully!</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono font-bold uppercase tracking-wider pl-1 ${
              darkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              Student Name
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/40 rounded-[18px] transition-all duration-200 ${
                  darkMode ? 'border-neutral-800 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono font-bold uppercase tracking-wider pl-1 ${
              darkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              University / School
            </label>
            <div className="relative">
              <School className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`} />
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/40 rounded-[18px] transition-all duration-200 ${
                  darkMode ? 'border-neutral-800 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono font-bold uppercase tracking-wider pl-1 ${
              darkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              Field of Study / Major
            </label>
            <div className="relative">
              <BookOpen className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`} />
              <input
                type="text"
                placeholder="e.g. Computer Science & Philosophy"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/40 rounded-[18px] transition-all duration-200 ${
                  darkMode ? 'border-neutral-800 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className={`px-4.5 py-2 border text-[10px] uppercase font-bold tracking-wider rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                darkMode ? 'border-neutral-850 bg-transparent hover:bg-neutral-900' : 'border-neutral-200 bg-transparent hover:bg-neutral-100 shadow-2xs'
              }`}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 border text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                darkMode ? 'bg-[#e6e4db] text-[#141413] border-[#e6e4db] hover:bg-white' : 'bg-[#141413] text-[#faf9f5] border-[#141413] hover:bg-black shadow-md'
              } disabled:opacity-50`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
