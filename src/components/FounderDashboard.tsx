import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Cpu, 
  BarChart3, 
  ArrowLeft, 
  RotateCw, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Search, 
  Layers, 
  Check, 
  Sparkles, 
  Clock, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import VoiceAuditPanel from './VoiceAuditPanel';

interface FounderDashboardProps {
  token: string;
  darkMode: boolean;
  onBack: () => void;
  onLogout?: () => void;
}

interface UserDirectoryEntry {
  id: string;
  name: string;
  email: string;
  school: string;
  major: string;
  createdAt: string;
  totalChats: number;
  totalMessages: number;
}

interface RecentActivityItem {
  id: string;
  email?: string;
  name?: string;
  title?: string;
  userName?: string;
  chatTitle?: string;
  role?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
}

interface StatsData {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  dailyActiveUsers: Record<string, string[]>;
  newUsersToday: number;
  firebaseConnectionStatus: string;
  firestoreStatus: string;
  openRouterStatus: string;
  geminiStatus: string;
  elevenLabsDiagnostic?: {
    apiKeyExists: boolean;
    apiStatus: 'PASS' | 'FAIL';
    accountAccessStatus: 'PASS' | 'FAIL';
    voicesCount: number;
    errorMessage: string;
  };
  userDirectory: UserDirectoryEntry[];
  recentActivity: {
    recentRegistrations: UserDirectoryEntry[];
    recentChats: RecentActivityItem[];
    recentMessages: RecentActivityItem[];
  };
  aiRequestLogs?: {
    id: string;
    timestamp: string;
    chatId: string;
    userId: string;
    userEmail: string;
    promptSnippet: string;
    attempts: { model: string; success: boolean; error?: string }[];
    finalModelUsed: string;
    responseSnippet: string;
    status: 'Success' | 'Failed';
  }[];
}

export default function FounderDashboard({ token, darkMode, onBack, onLogout }: FounderDashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'insights' | 'health' | 'directory' | 'activity' | 'voice-audit'>('health');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const renderStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('healthy') || s.includes('online') || s.includes('connected')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          🟢 Healthy
        </span>
      );
    } else if (s.includes('degraded')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          🟡 Degraded
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" style={{ animationDuration: '3s' }} />
          🔴 Offline
        </span>
      );
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/founder/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access Denied. Only authorized founder account can access this administrative workspace.');
        }
        if (res.status === 401) {
          throw new Error('Administrative session expired. Please re-authenticate.');
        }
        throw new Error(`Failed to load ledger metrics (HTTP ${res.status})`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error('[Founder Fetch Error]', err);
      setError(err.message || 'An error occurred fetching cloud analytics ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Filter student registries based on queries
  const filteredUsers = stats?.userDirectory.filter(u => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.school.toLowerCase().includes(term) ||
      u.major.toLowerCase().includes(term)
    );
  }) || [];

  // Compute DAU dates of active trend lines
  const dailyActiveUsers = stats?.dailyActiveUsers || {};
  const sortedDates = Object.keys(dailyActiveUsers).sort((a, b) => a.localeCompare(b));
  const maxDAUCount = sortedDates.length > 0 
    ? Math.max(...Object.values(dailyActiveUsers).map((ids: any) => ids.length), 3) 
    : 3;

  return (
    <div className={`flex flex-col h-screen overflow-y-auto w-full transition-colors duration-200 ${
      darkMode ? 'bg-[#141413] text-[#faf9f5]' : 'bg-[#faf9f5] text-[#141413]'
    }`}>
      {/* Upper Boundary Navigation Panel */}
      <header className={`py-5 px-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200 ${
        darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 border rounded-sm hover:underline flex items-center gap-1.5 text-xs font-mono tracking-wider ${
              darkMode ? 'border-[#31302b] text-[#a09e95] hover:bg-neutral-800' : 'border-[#dedcd1] text-[#706e64] hover:bg-[#f3f2ee]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Workspace
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-500 font-bold">
                Privileged Access
              </span>
              <span className="text-[9px] font-mono border border-amber-500/30 bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                FOUNDER
              </span>
            </div>
            <h2 className="font-serif text-lg font-medium">IRA AI Operational Founder Dashboard</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className={`px-3 py-1.5 border rounded-sm font-mono text-xs hover:underline flex items-center gap-1.5 transition-all ${
              darkMode ? 'border-[#31302b] text-[#faf9f5] hover:bg-neutral-800' : 'border-[#dedcd1] text-[#141413] hover:bg-[#f3f2ee]'
            } disabled:opacity-40`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-10 py-8 space-y-8 flex-1">
        {error ? (
          <div className="border border-red-500/20 bg-red-500/5 p-8 text-center rounded-sm max-w-md mx-auto space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-500">Access Restricted</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              {error}
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-neutral-900 border text-white rounded font-mono text-xs hover:opacity-90 tracking-wide"
            >
              Return to Studies
            </button>
          </div>
        ) : loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 rounded-full border-dashed border-amber-500 animate-spin" />
            </div>
            <p className="font-mono text-xs text-neutral-500 animate-pulse">Pulling live Firestore analytics ledger...</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            
            {/* Live Bento Cards Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className={`p-5 border rounded-sm transition-all duration-200 ${
                darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <div className="flex justify-between items-start text-neutral-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Registered Students</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="font-serif text-3xl font-extrabold tracking-tight">
                  {stats.totalUsers}
                </div>
                <p className="text-[9px] font-mono text-emerald-500 flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" /> Fully Persistent
                </p>
              </div>

              <div className={`p-5 border rounded-sm transition-all duration-200 ${
                darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <div className="flex justify-between items-start text-neutral-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Academic Chats</span>
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="font-serif text-3xl font-extrabold tracking-tight">
                  {stats.totalChats}
                </div>
                <p className="text-[9px] text-neutral-500 font-mono mt-1">
                  Study session files
                </p>
              </div>

              <div className={`p-5 border rounded-sm transition-all duration-200 ${
                darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <div className="flex justify-between items-start text-neutral-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Total Messages</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-serif text-3xl font-extrabold tracking-tight">
                  {stats.totalMessages}
                </div>
                <p className="text-[9px] text-neutral-500 font-mono mt-1">
                  AI & Student queries
                </p>
              </div>

              <div className={`p-5 border rounded-sm transition-all duration-200 ${
                darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <div className="flex justify-between items-start text-neutral-400 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">New Users Today</span>
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <div className="font-serif text-3xl font-extrabold tracking-tight text-indigo-500 dark:text-indigo-400">
                  {stats.newUsersToday}
                </div>
                <p className="text-[9px] text-neutral-500 font-mono mt-1">
                  Registrants logged today
                </p>
              </div>

            </div>

            {/* Health Indicators Ribbon */}
            <div className={`p-4 border rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs leading-relaxed ${
              darkMode ? 'bg-[#1c1b18] border-[#31302b]' : 'bg-white border-[#dedcd1]'
            }`}>
              <div className="flex gap-2 items-center">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold">System Operational Health Diagnostics (Real-Time Lights)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">OpenRouter:</span>
                  {renderStatusBadge(stats.openRouterStatus)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">Gemini:</span>
                  {renderStatusBadge(stats.geminiStatus)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">Firebase:</span>
                  {renderStatusBadge(stats.firebaseConnectionStatus)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">Firestore R/W:</span>
                  {renderStatusBadge(stats.firestoreStatus)}
                </div>
                {stats.elevenLabsDiagnostic && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-400">ElevenLabs:</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                      stats.elevenLabsDiagnostic.apiStatus === 'PASS' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {stats.elevenLabsDiagnostic.apiStatus === 'PASS' ? '🟢 Connected' : '🔴 Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Navigation Controls */}
            <div className="border-b border-dashed flex flex-wrap gap-2 border-neutral-300 dark:border-neutral-800 pb-1">
              <button
                onClick={() => setActiveTab('health')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'health'
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                System Health & AI Logs
              </button>
              <button
                onClick={() => setActiveTab('voice-audit')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'voice-audit'
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Voice Assistant Audit
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'insights'
                    ? 'border-[#f59e0b] text-[#f59e0b] font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Insights & active trend
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'directory'
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Student directory ({stats.userDirectory.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'activity'
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Recent activity feeds
              </button>
            </div>

            {/* TAB: Voice Assistant Audit */}
            {activeTab === 'voice-audit' && (
              <VoiceAuditPanel token={token} darkMode={darkMode} />
            )}

            {/* TAB: System Health & AI Logs */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                
                {/* Tracked Components Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  
                  {/* Card 1: OpenRouter */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between space-y-3 ${
                    darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-neutral-400">OpenRouter API</h4>
                        <p className="text-[10px] text-neutral-500 font-light font-sans">Primary AI Endpoint</p>
                      </div>
                      <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                    </div>
                    <div className="py-1">
                      {renderStatusBadge(stats.openRouterStatus)}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      Pings model registries. Houses Claude & DeepSeek cascading routing nodes.
                    </p>
                  </div>

                  {/* Card 2: Gemini */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between space-y-3 ${
                    darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-neutral-400">Gemini API SDK</h4>
                        <p className="text-[10px] text-neutral-500 font-light font-sans">Fallback SDK Core</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                    </div>
                    <div className="py-1">
                      {renderStatusBadge(stats.geminiStatus)}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      Direct cloud integration used as a resilient high-speed secondary backup model.
                    </p>
                  </div>

                  {/* Card 3: Firebase Conn */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between space-y-3 ${
                    darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-neutral-400">Firebase Auth</h4>
                        <p className="text-[10px] text-neutral-500 font-light font-sans">User Access Token</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <div className="py-1">
                      {renderStatusBadge(stats.firebaseConnectionStatus)}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      Authenticates privileged admin sessions & user database tokens.
                    </p>
                  </div>

                  {/* Card 4: Firestore Read/Write */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between space-y-3 ${
                    darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-neutral-400">Firestore R/W</h4>
                        <p className="text-[10px] text-neutral-500 font-light font-sans">Database Transactions</p>
                      </div>
                      <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                    </div>
                    <div className="py-1">
                      {renderStatusBadge(stats.firestoreStatus)}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      Runs write-read-delete diagnostics to verify absolute ledger integrity.
                    </p>
                  </div>

                  {/* Card 5: ElevenLabs Connectivity Diagnostic */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between space-y-3 ${
                    darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-neutral-400">ElevenLabs</h4>
                        <p className="text-[10px] text-neutral-500 font-light font-sans">Voice Synthesis</p>
                      </div>
                      <Volume2 className="w-4 h-4 text-pink-500 shrink-0" />
                    </div>
                    
                    <div className="space-y-2 py-1 font-mono text-[10px]">
                      {stats.elevenLabsDiagnostic ? (
                        <>
                          <div className="mb-1">
                            {stats.elevenLabsDiagnostic.apiStatus === 'PASS' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded font-bold animate-pulse">
                                🟢 ElevenLabs Connected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded font-bold">
                                🔴 ElevenLabs Connection Failed
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                            <div>• API Key: <span className="text-neutral-900 dark:text-neutral-300 font-bold">{stats.elevenLabsDiagnostic.apiKeyExists ? 'Detected' : 'Missing'}</span></div>
                            <div>• API Status: <span className={stats.elevenLabsDiagnostic.apiStatus === 'PASS' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{stats.elevenLabsDiagnostic.apiStatus}</span></div>
                            <div>• Account Access: <span className={stats.elevenLabsDiagnostic.accountAccessStatus === 'PASS' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{stats.elevenLabsDiagnostic.accountAccessStatus}</span></div>
                            <div>• Voices Loaded: <span className="text-neutral-900 dark:text-neutral-200 font-bold">{stats.elevenLabsDiagnostic.voicesCount}</span></div>
                            {stats.elevenLabsDiagnostic.errorMessage && (
                              <div className="text-[9px] text-rose-500 dark:text-rose-400 font-light break-all max-h-16 overflow-y-auto pt-1 leading-normal">
                                {stats.elevenLabsDiagnostic.errorMessage}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-neutral-500">Checking...</span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      Fetches custom voices and text-to-speech presets to power AI voice features.
                    </p>
                  </div>

                </div>

                {/* AI Model Cascading Rule Sheet banner */}
                <div className={`p-4 border rounded-sm text-xs leading-normal space-y-2 ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]/60' : 'bg-amber-50/20 border-amber-500/20'
                }`}>
                  <h4 className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Activity className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                    AI Model Resilience Safeguard Matrix
                  </h4>
                  <p className="text-neutral-500 font-light">
                    Incoming student queries are routed with zero downtime. If a primary AI gateway is congested or fails, the server cascades down the resilient chain automatically to ensure user chats are never empty.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-1 font-mono text-[10px] text-neutral-400">
                    <div>
                      <span className="font-semibold text-neutral-300">Resilient Chain Order:</span>{' '}
                      <span className="text-blue-400 font-bold">1. Claude</span> ➔{' '}
                      <span className="text-purple-400 font-bold">2. Gemini SDK</span> ➔{' '}
                      <span className="text-cyan-400 font-bold">3. DeepSeek</span>
                    </div>
                    <div className="hidden sm:block text-neutral-600">|</div>
                    <div>
                      <span className="font-semibold text-neutral-300">Failover Safeguard:</span> Direct fallback to hardcoded local outline card if all 3 channels fail.
                    </div>
                  </div>
                </div>

                {/* AI Request Logs Table / Panel */}
                <div className={`p-5 border rounded-sm space-y-4 ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        AI Request Failover & Route Logs
                      </h3>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-light mt-0.5">
                        Logs all attempts, showing exact errors and the successful response source.
                      </p>
                    </div>

                    {/* Log Filter input */}
                    <div className="relative w-full sm:w-72">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder="Search logs by student email, model, chat ID"
                        className={`text-xs w-full pl-9 pr-3 py-2 border rounded focus:outline-none transition-all ${
                          darkMode 
                            ? 'border-[#31302b] bg-[#141413] focus:border-[#faf9f5]' 
                            : 'border-[#dedcd1] bg-white focus:border-[#141413]'
                        }`}
                      />
                    </div>
                  </div>

                  {!stats.aiRequestLogs || stats.aiRequestLogs.length === 0 ? (
                    <div className="text-center p-12 text-neutral-500 italic text-xs border border-dashed rounded-sm dark:border-neutral-800">
                      No AI requests recorded in this administrative session yet. Submit a message in a study chat to see failover routes.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {stats.aiRequestLogs
                        .filter(log => {
                          const query = logSearchQuery.toLowerCase();
                          return (
                            log.userEmail?.toLowerCase().includes(query) ||
                            log.chatId?.toLowerCase().includes(query) ||
                            log.finalModelUsed?.toLowerCase().includes(query) ||
                            log.promptSnippet?.toLowerCase().includes(query)
                          );
                        })
                        .map((log, index) => (
                          <div key={log.id || index} className="border rounded p-4 dark:border-neutral-800 space-y-3 hover:bg-neutral-500/5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b pb-2 border-neutral-300 dark:border-neutral-800">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] text-neutral-500">#{log.id}</span>
                                <span className="text-neutral-500 font-light">|</span>
                                <span className="font-semibold text-neutral-800 dark:text-neutral-100">{log.userEmail}</span>
                                <span className="text-neutral-500 font-light">|</span>
                                <span className="font-mono text-[10px] text-neutral-500">Chat: {log.chatId}</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[10px]">
                                <span className="text-neutral-400">{formatDate(log.timestamp)}</span>
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                  log.status === 'Success' ? 'bg-green-500/10 text-emerald-500' : 'bg-red-500/10 text-rose-500'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                            </div>

                            {/* Prompt and Response snippets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wide">Prompt Snippet:</span>
                                <p className="italic text-neutral-600 dark:text-neutral-300 bg-neutral-100/50 dark:bg-neutral-900/50 p-2.5 rounded border border-dashed dark:border-neutral-800 font-sans">
                                  "{log.promptSnippet}"
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wide">Response Snippet:</span>
                                <p className="italic text-neutral-600 dark:text-neutral-300 bg-neutral-100/50 dark:bg-neutral-900/50 p-2.5 rounded border border-dashed dark:border-neutral-800 font-sans">
                                  "{log.responseSnippet}"
                                </p>
                              </div>
                            </div>

                            {/* Fallback Attempts Detail Block */}
                            <div className="bg-[#fcfbf9] dark:bg-[#1f1e1a] p-3 border rounded-sm dark:border-neutral-800 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="text-[10px] font-mono text-[#a09e95] uppercase font-bold tracking-wider">
                                  Resilience Routing Cascade Progress (Attempts):
                                </span>
                                <div className="text-[10px] font-mono">
                                  Response Source:{' '}
                                  <span className="font-bold text-amber-500 dark:text-amber-400">
                                    {log.finalModelUsed || 'None (All Failed)'}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                {['Claude (anthropic/claude-3-haiku)', 'Gemini (Native SDK)', 'DeepSeek (deepseek/deepseek-chat)'].map((stepModel, i) => {
                                  const keyPrefix = i === 0 ? 'Claude' : i === 1 ? 'Gemini' : 'DeepSeek';
                                  // Find if there was an attempt recorded matching this prefix
                                  const matchingAttempt = log.attempts?.find(att => att.model.includes(keyPrefix));
                                  
                                  let stepStatus = 'not_attempted';
                                  if (matchingAttempt) {
                                    stepStatus = matchingAttempt.success ? 'success' : 'failed';
                                  }

                                  return (
                                    <div 
                                      key={i} 
                                      className={`p-2 border rounded-sm space-y-1 text-[11px] ${
                                        stepStatus === 'success' 
                                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                                          : stepStatus === 'failed' 
                                            ? 'bg-red-500/5 border-rose-500/20' 
                                            : 'bg-neutral-500/5 border-neutral-200/50 dark:border-neutral-800/40 opacity-50'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center font-mono">
                                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                          {i + 1}. {i === 0 ? 'Claude' : i === 1 ? 'Gemini SDK' : 'DeepSeek'}
                                        </span>
                                        {stepStatus === 'success' && (
                                          <span className="text-emerald-500 font-bold uppercase text-[9px]">🟢 Passed</span>
                                        )}
                                        {stepStatus === 'failed' && (
                                          <span className="text-rose-500 font-bold uppercase text-[9px]">🔴 Failed</span>
                                        )}
                                        {stepStatus === 'not_attempted' && (
                                          <span className="text-neutral-500 font-medium uppercase text-[9px]">⚪ Skipped</span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-neutral-500 leading-normal font-sans">
                                        {i === 0 && 'Primary Model target via OpenRouter.'}
                                        {i === 1 && 'Resilient backup model routed directly via Google Cloud GenAI.'}
                                        {i === 2 && 'Secondary failover backup node via OpenRouter.'}
                                      </p>
                                      {stepStatus === 'failed' && matchingAttempt?.error && (
                                        <div className="text-[9px] bg-red-500/10 text-red-500 p-1 rounded font-mono truncate hover:whitespace-normal" title={matchingAttempt.error}>
                                          Error: {matchingAttempt.error}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 1: Insights & trends */}
            {activeTab === 'insights' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Users Trend Line logs */}
                <div className={`col-span-1 lg:col-span-2 p-5 border rounded-sm ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <h3 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    Daily Active Users (DAU) Cloud ledger Log
                  </h3>

                  {sortedDates.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-xs text-neutral-500 italic">
                      <span>No historical metrics active. Registration and study messages populate records automatically.</span>
                    </div>
                  ) : (
                    <div>
                      <div className="h-44 flex items-end gap-3 md:gap-4 px-2 pt-4 relative">
                        {/* Dynamic Grid Helpers */}
                        <div className="absolute inset-y-0 left-0 right-0 border-b border-[#dedcd1]/40 dark:border-[#31302b]/40 pointer-events-none flex flex-col justify-between">
                          <div className="w-full border-t border-dashed border-[#dedcd1]/25 dark:border-[#31302b]/25" />
                          <div className="w-full border-t border-dashed border-[#dedcd1]/25 dark:border-[#31302b]/25" />
                          <div className="w-full border-t border-dashed border-[#dedcd1]/25 dark:border-[#31302b]/25" />
                        </div>

                        {sortedDates.map((dateStr, idx) => {
                          const audience = dailyActiveUsers[dateStr] || [];
                          const size = audience.length;
                          const fractionOfMax = maxDAUCount > 0 ? (size / maxDAUCount) * 100 : 0;
                          return (
                            <div key={`${dateStr}-${idx}`} className="flex-1 flex flex-col items-center group relative z-10">
                              
                              {/* Hover Tooltip Box */}
                              <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-150 bg-neutral-900 border border-neutral-700 text-white dark:bg-white dark:text-neutral-950 text-[10px] rounded px-2.5 py-1 shadow-lg pointer-events-none whitespace-nowrap z-50">
                                <p className="font-semibold">Log Day: {dateStr}</p>
                                <p className="font-mono text-[9px] text-indigo-400">Unique Actives: {size} students</p>
                              </div>

                              <div className="w-full bg-[#f3f2ee] dark:bg-[#2c2b27] rounded-sm h-36 flex items-end">
                                <div 
                                  style={{ height: `${Math.max(fractionOfMax, 8)}%` }}
                                  className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-sm group-hover:bg-[#ab9e78] transition-all duration-300"
                                />
                              </div>

                              <div className="text-[9px] font-mono text-neutral-500 mt-1.5 truncate max-w-full select-none">
                                {dateStr.slice(5)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Developer / Administrative Information credentials */}
                <div className={`p-5 border rounded-sm ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <h3 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Security Framework
                  </h3>
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-3 border rounded-sm dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neutral-500 text-[10px]">Cloud Infrastructure</span>
                        <span className="text-indigo-400 text-[10px]">LIVE</span>
                      </div>
                      <p className="text-[10px] font-light text-neutral-400 leading-relaxed font-sans mt-1">
                        All chat logs, messages, and student registries are hosted securely on your custom Firebase Cloud project.
                      </p>
                    </div>

                    <div className="p-3 border rounded-sm dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neutral-500 text-[10px]">Database Synced</span>
                        <span className="text-emerald-500 text-[10px]">VERIFIED</span>
                      </div>
                      <p className="text-[10px] font-light text-neutral-400 leading-relaxed font-sans mt-1">
                        Verified cloud set operations confirm the persistence rules allow authorized read/write actions safely.
                      </p>
                    </div>

                    <div className="p-3 border rounded-sm dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413]">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 text-[10px]">Supabase references</span>
                        <span className="text-red-500 text-[10px] uppercase font-bold">REMOVED</span>
                      </div>
                      <p className="text-[10px] font-light text-neutral-500 mt-1 font-sans">
                        Clean server architectures exclude old SQL wrappers and redundant endpoints completely.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Student Directory */}
            {activeTab === 'directory' && (
              <div className={`p-5 border rounded-sm space-y-4 ${
                darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Student registration ledger (Firestore records)
                    </h3>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-light mt-0.5">
                      Lists active students with total academic chats started and direct messages sent on the platform.
                    </p>
                  </div>

                  {/* Search Filtering */}
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, school, major"
                      className={`text-xs w-full pl-9 pr-3 py-2 border rounded focus:outline-none transition-all ${
                        darkMode 
                          ? 'border-[#31302b] bg-[#141413] focus:border-[#faf9f5]' 
                          : 'border-[#dedcd1] bg-white focus:border-[#141413]'
                      }`}
                    />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center p-12 text-neutral-500 italic text-xs border border-dashed rounded-sm dark:border-neutral-800">
                    No registered students found matching your search term.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b font-mono text-[10px] uppercase tracking-wider text-neutral-500 border-neutral-300 dark:border-neutral-800">
                          <th className="pb-3 font-semibold">Student Name / Email</th>
                          <th className="pb-3 font-semibold">Academic Context</th>
                          <th className="pb-3 font-semibold">Date Registered</th>
                          <th className="pb-3 text-center font-semibold">Chats Started</th>
                          <th className="pb-3 text-center font-semibold">Messages Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dedcd1]/40 dark:divide-[#31302b]/40">
                        {filteredUsers.map((u, idx) => (
                          <tr key={`${u.id || 'user'}-${idx}`} className="hover:bg-neutral-500/5 transition-colors">
                            <td className="py-3.5 pr-2">
                              <div className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-1">
                                {u.name}
                                {u.email === 'naiknirmal654@gmail.com' && (
                                  <span className="text-[8px] border border-amber-500/20 bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded font-mono uppercase">FOUNDER</span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono font-light mt-0.5 select-all">{u.email}</div>
                            </td>
                            <td className="py-3.5 pr-2">
                              {u.major ? (
                                <div className="font-medium text-neutral-800 dark:text-neutral-200">{u.major}</div>
                              ) : (
                                <span className="italic text-neutral-500">Major Undecided</span>
                              )}
                              <div className="text-[10px] text-neutral-500 font-light truncate max-w-[200px] mt-0.5">
                                {u.school || 'Unset institution'}
                              </div>
                            </td>
                            <td className="py-3.5 text-neutral-400 font-mono text-[11px] font-light">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3.5 text-center font-semibold font-mono text-indigo-500">
                              {u.totalChats}
                            </td>
                            <td className="py-3.5 text-center font-semibold font-mono text-emerald-500">
                              {u.totalMessages}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Recent Activity feeds */}
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Registrations column */}
                <div className={`p-5 border rounded-sm space-y-4 ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <h4 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                    <Users className="w-4 h-4 text-indigo-400" />
                    New student registrations
                  </h4>
                  {stats.recentActivity.recentRegistrations.length === 0 ? (
                    <p className="text-center p-6 italic text-neutral-500 text-xs">No recent students registered.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivity.recentRegistrations.slice(0, 5).map((reg, idx) => (
                        <div key={`${reg.id || 'reg'}-${idx}`} className="text-xs space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold">{reg.name}</span>
                            <span className="text-[9px] font-mono text-neutral-500 font-light shrink-0">{formatDate(reg.createdAt).split(',')[0]}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">{reg.email}</div>
                          <p className="text-[10px] text-neutral-500 font-light">
                            {reg.major || 'Major Undecided'} • {reg.school || 'Unset Inst.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Chats column */}
                <div className={`p-5 border rounded-sm space-y-4 ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <h4 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Latest study session chats
                  </h4>
                  {stats.recentActivity.recentChats.length === 0 ? (
                    <p className="text-center p-6 italic text-neutral-500 text-xs">No academic chats on record.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivity.recentChats.map((chat, idx) => (
                        <div key={`${chat.id || 'chat'}-${idx}`} className="text-xs space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{chat.title || 'Studies file'}</span>
                            <span className="text-[9px] font-mono text-neutral-500 font-light shrink-0">{formatDate(chat.createdAt).split(',')[0]}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            By student: <span className="font-medium font-mono text-[9px] text-[#ab9e78]">{chat.userName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messages column */}
                <div className={`p-5 border rounded-sm space-y-4 ${
                  darkMode ? 'bg-[#1a1916] border-[#31302b]' : 'bg-white border-[#dedcd1]'
                }`}>
                  <h4 className="font-serif text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Latest message logs (live preview)
                  </h4>
                  {stats.recentActivity.recentMessages.length === 0 ? (
                    <p className="text-center p-6 italic text-neutral-500 text-xs">No messages recorded.</p>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {stats.recentActivity.recentMessages.map((msg, idx) => (
                        <div key={`${msg.id || 'msg'}-${idx}`} className="text-xs p-2 border rounded-sm dark:border-neutral-800 space-y-1.5 bg-neutral-500/5">
                          <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                            <span className={`uppercase font-bold ${msg.role === 'user' ? 'text-indigo-400' : 'text-amber-500'}`}>{msg.role === 'user' ? 'Student' : 'IRA Brain'}</span>
                            <span className="font-light">{formatDate(msg.timestamp).split(',')[0]}</span>
                          </div>
                          <p className="italic text-neutral-600 dark:text-neutral-300 font-light text-[11px] leading-relaxed break-words">
                            "{msg.content}"
                          </p>
                          <div className="text-[8px] font-mono text-neutral-500 truncate">
                            In Chat: {msg.chatTitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
}
