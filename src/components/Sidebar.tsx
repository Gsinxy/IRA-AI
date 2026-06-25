import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  GraduationCap, 
  Menu, 
  X,
  BookOpen,
  BarChart3,
  Mic,
  Sparkles
} from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onOpenProfile: () => void;
  onLogOut: () => void;
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  workspaceView: 'chat' | 'founder' | 'voice' | 'plans';
  onSetWorkspaceView: (view: 'chat' | 'founder' | 'voice' | 'plans') => void;
}

function getFriendlyProfileName(user: any): string {
  if (!user || !user.name) return 'Student';
  const name = String(user.name).trim();
  if (!name) return 'Student';
  if (name.includes('@')) return 'Student';
  if (/^\d+$/.test(name) || (name.length > 20 && !name.includes(' '))) return 'Student';
  return name;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenProfile,
  onLogOut,
  user,
  darkMode,
  setDarkMode,
  isOpen,
  onClose,
  workspaceView,
  onSetWorkspaceView
}: SidebarProps) {
  // Deduplicate study files by unique ID
  const uniqueChats = chats.filter(
    (c, idx, self) => self.findIndex(o => o.id === c.id) === idx
  );
  
  const friendlyName = getFriendlyProfileName(user);
  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 border-r flex flex-col justify-between transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        ${darkMode ? 'bg-[#141413]/90 border-neutral-800/50 text-[#faf9f5]' : 'bg-[#faf9f5]/90 border-neutral-200/60 text-[#141413]'}
        backdrop-blur-xl shadow-lg
      `}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand header */}
          <div className={`p-5 flex justify-between items-center border-b ${
            darkMode ? 'border-neutral-800/50' : 'border-neutral-200/60'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-[#faf9f5]/10 text-[#faf9f5]' : 'bg-[#141413]/10 text-[#141413]'
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight">IRA AI</span>
            </div>
            
            {/* Dark mode & Close mobile button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 border hover:scale-110 rounded-full transition-all duration-200 ${
                  darkMode ? 'border-neutral-800 bg-[#21201c]/40 text-neutral-300 hover:text-[#faf9f5]' : 'border-neutral-200 bg-white/50 text-[#141413] hover:bg-neutral-100'
                }`}
                title={darkMode ? 'Light Theme' : 'Academic Night Theme'}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              
              <button 
                onClick={onClose}
                className="p-2 lg:hidden border rounded-full hover:scale-110 transition-all duration-200 text-inherit border-transparent"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New Chat Button & Voice/Founder Controls */}
          <div className="p-4 space-y-2.5">
            <button
              onClick={() => {
                onNewChat();
                onSetWorkspaceView('chat');
                onClose(); // Auto-close on mobile
              }}
              className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer ${
                workspaceView === 'chat'
                  ? (darkMode ? 'bg-[#faf9f5] text-[#141413] border-[#faf9f5] shadow-md shadow-white/5' : 'bg-[#141413] text-[#faf9f5] border-[#141413] shadow-md shadow-black/10')
                  : (darkMode 
                      ? 'bg-[#1c1b18] text-[#faf9f5] border-neutral-800 hover:bg-[#21201c]' 
                      : 'bg-white text-[#141413] border-neutral-200 hover:bg-neutral-100')
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              New Study File
            </button>

            {user?.email === 'naiknirmal654@gmail.com' && (
              <button
                onClick={() => {
                  onSetWorkspaceView('voice');
                  onClose(); // Auto-close on mobile
                }}
                className={`w-full py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-xs cursor-pointer relative overflow-hidden ${
                  workspaceView === 'voice'
                    ? (darkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-500/10 text-rose-700 border-rose-500/30')
                    : (darkMode 
                        ? 'bg-[#1c1b18] text-[#faf9f5] border-neutral-800 hover:bg-[#21201c]' 
                        : 'bg-white text-[#141413] border-neutral-200 hover:bg-neutral-100')
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>🎤 Voice Assistant (Founder Beta)</span>
                {workspaceView !== 'voice' && (
                  <span className="absolute right-3 top-2.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>
            )}

            {user?.email === 'naiknirmal654@gmail.com' && (
              <button
                onClick={() => {
                  onSetWorkspaceView('founder');
                  onClose(); // Auto-close on mobile
                }}
                className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
                  workspaceView === 'founder'
                    ? (darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-amber-500/10 text-amber-800 border-amber-600/30 font-bold')
                    : (darkMode 
                        ? 'bg-[#1c1b18] text-[#faf9f5] border-neutral-800 hover:bg-[#21201c]' 
                        : 'bg-white text-[#141413] border-neutral-200 hover:bg-[#f3f2ee]')
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Founder Console
              </button>
            )}
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 select-none">
            <div className={`px-2 pb-2 text-[10px] uppercase tracking-[0.2em] font-bold ${
              darkMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Academic Desk List ({uniqueChats.length})
            </div>

            {uniqueChats.length === 0 ? (
              <div className={`p-4 text-center text-xs font-light italic ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                No active concept studies. Click above to launch one.
              </div>
            ) : (
              uniqueChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      onSetWorkspaceView('chat');
                      onClose(); // Auto-close on mobile
                    }}
                    className={`group w-full max-w-full flex items-center justify-between text-left text-xs rounded-full transition-all duration-200 py-2.5 px-4 mb-1 cursor-pointer hover:scale-[1.02] active:scale-[0.99] border-0 ${
                      isActive
                        ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-black/5 text-neutral-900 shadow-sm')
                        : (darkMode 
                            ? 'bg-transparent text-neutral-400 hover:text-[#faf9f5] hover:bg-white/5' 
                            : 'bg-transparent text-[#5c5b54] hover:text-[#141413] hover:bg-black/5')
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate pr-1">{chat.title}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-full shrink-0 transition-opacity hover:opacity-100 ${
                        darkMode ? 'hover:bg-red-950/40 text-neutral-500 hover:text-red-400' : 'hover:bg-red-50 text-neutral-400 hover:text-red-600'
                      }`}
                      title="Archive File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Workspace Panel */}
        <div className={`p-4 border-t flex flex-col gap-3.5 ${
          darkMode ? 'border-neutral-800/50 bg-[#141413]' : 'border-neutral-200/60 bg-[#faf9f5]'
        }`}>
          {/* Upgrade Banner */}
          <div className={`p-4 border rounded-[24px] mb-1 relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md ${
            darkMode 
              ? 'bg-[#1c1b18] border-neutral-800/80 text-[#faf9f5]' 
              : 'bg-white border-neutral-200/70 text-[#141413]'
          }`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.plan && user.plan !== 'Free' ? 'bg-[#c5a85c] scale-110' : 'bg-green-500 animate-pulse'}`} />
              <span className="text-[9px] font-mono tracking-wider uppercase font-bold text-[#b59547]">
                {user.plan || 'Free Account'}
              </span>
            </div>
            <p className={`text-[10px] leading-relaxed font-light mb-3 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {user.plan && user.plan !== 'Free' 
                ? 'Active pro membership. Support validated.' 
                : 'Accelerate search with Gemini Pro and specialized models.'}
            </p>
            <button
              onClick={() => {
                onSetWorkspaceView('plans');
                onClose();
              }}
              className={`w-full py-2 px-4 rounded-full border text-[9px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
                workspaceView === 'plans'
                  ? (darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500 font-bold' : 'bg-amber-50 text-amber-850 border-amber-600 font-bold')
                  : (darkMode 
                      ? 'bg-[#141413] text-[#faf9f5] border-neutral-800 hover:bg-[#21201c] hover:border-amber-500/30' 
                      : 'bg-white text-[#141413] border-neutral-200 hover:bg-neutral-100 hover:border-[#b59547]')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{user.plan && user.plan !== 'Free' ? 'View/Change Subscription' : 'Explore Special Plans'}</span>
            </button>
          </div>

          {/* User profile detail block */}
          <div 
            onClick={onOpenProfile}
            className={`flex items-center gap-2.5 p-2 rounded-2xl cursor-pointer group transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
              darkMode ? 'border-neutral-800 bg-[#1c1b18]' : 'border-neutral-200 bg-white'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate group-hover:underline">{friendlyName}</div>
              <div className={`text-[10px] truncate max-w-full ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {user.major || 'Set study major'}
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={onOpenProfile}
              className={`flex-1 py-2 px-3 rounded-full border text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                darkMode ? 'border-neutral-800 bg-white/5 hover:bg-white/10' : 'border-neutral-200 bg-white hover:bg-neutral-100'
              }`}
            >
              Profile
            </button>
            <button
              onClick={onLogOut}
              className={`py-2 px-3 rounded-full border text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center text-red-600 hover:bg-red-500/10 ${
                darkMode ? 'border-red-900/30 bg-red-500/5' : 'border-red-100 bg-red-50/50'
              } transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
