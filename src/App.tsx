import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthCard from './components/AuthCard';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileModal from './components/ProfileModal';
import FounderDashboard from './components/FounderDashboard';
import LiveVoiceScreen from './components/LiveVoiceScreen';
import PricingPlans from './components/PricingPlans';
import { Chat, Message } from './types';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'workspace'>('landing');
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState<string | null>(null);
  
  // Tab layout state for workspace: chat log vs founder panel vs voice orb vs pricing plans
  const [workspaceView, setWorkspaceView] = useState<'chat' | 'founder' | 'voice' | 'plans'>('chat');
  
  // Custom theme control
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ira_dark_mode');
    return saved === 'true';
  });

  // Toggle Dark Mode
  useEffect(() => {
    // Save to local storage
    localStorage.setItem('ira_dark_mode', String(darkMode));
    // Apply body level base classes
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#141413';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#faf9f5';
    }
  }, [darkMode]);

  // Load existing session on Mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ira_token');
    const savedUser = localStorage.getItem('ira_user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setView('workspace');
      // Fetch fresh profile state & desk files
      fetchInitData(savedToken);
    }
  }, []);

  const fetchInitData = async (accessToken: string) => {
    try {
      // 1. Get Me profile
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        localStorage.setItem('ira_user', JSON.stringify(userData.user));
      } else if (userRes.status === 401) {
        // If the session token has expired or is invalid, log out of the stale session
        setUser(null);
        setToken(null);
        setChats([]);
        setActiveChatId(null);
        setMessages([]);
        localStorage.removeItem('ira_token');
        localStorage.removeItem('ira_user');
        setView('landing');
        return;
      }

      // 2. Clear out local state first
      setChats([]);
      setActiveChatId(null);
      setMessages([]);

      // 3. Load chats list
      const chatsRes = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData.chats);
        if (chatsData.chats.length > 0) {
          // Select newest chat automatically on launch
          const newestChat = chatsData.chats[0];
          setActiveChatId(newestChat.id);
          fetchMessages(newestChat.id, accessToken);
        }
      }
    } catch (err) {
      console.error('Error fetching init workspace logs:', err);
    }
  };

  const fetchMessages = async (chatId: string, accessToken: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading study files:', err);
    }
  };

  const handleAuthSuccess = (userData: any, sessionToken: string) => {
    setUser(userData);
    setToken(sessionToken);
    localStorage.setItem('ira_token', sessionToken);
    localStorage.setItem('ira_user', JSON.stringify(userData));
    setView('workspace');
    fetchInitData(sessionToken);
  };

  const handleLogOut = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }
    setUser(null);
    setToken(null);
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem('ira_token');
    localStorage.removeItem('ira_user');
    setView('landing');
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    if (token) {
      fetchMessages(chatId, token);
    }
  };

  const handleNewChat = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: "New Concept Explanation" })
      });
      if (res.ok) {
        const { chat } = await res.json();
        setChats(prev => [chat, ...prev]);
        setActiveChatId(chat.id);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to register study desk:', err);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setDeleteConfirmChatId(chatId);
  };

  const handleConfirmDeleteChat = async () => {
    if (!deleteConfirmChatId || !token) return;
    const chatId = deleteConfirmChatId;
    setDeleteConfirmChatId(null);

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChatId === chatId) {
          const remaining = chats.filter(c => c.id !== chatId);
          if (remaining.length > 0) {
            setActiveChatId(remaining[0].id);
            fetchMessages(remaining[0].id, token);
          } else {
            setActiveChatId(null);
            setMessages([]);
          }
        }
      }
    } catch (err) {
      console.error('Archive file error:', err);
    }
  };

  const handleSendMessage = async (text: string, researchMode?: boolean) => {
    if (!token || loading) return;
    setLoading(true);
    setRateLimitExceeded(false);

    let currentChatId = activeChatId;

    try {
      if (!currentChatId) {
        // Automatically create a new chat if none exists
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: text.slice(0, 40) || "New Concept Explanation" })
        });
        if (res.ok) {
          const { chat } = await res.json();
          setChats(prev => [chat, ...prev]);
          setActiveChatId(chat.id);
          currentChatId = chat.id;
        } else {
          throw new Error("Could not initialize a session.");
        }
      }

      // Optimistically add user's message
      const tempUserMsg: Message = {
        id: 'temp_user_msg_' + Date.now(),
        chatId: currentChatId!,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const res = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, researchMode })
      });

      if (res.status === 429) {
        setRateLimitExceeded(true);
        // Remove optimistic user message since it wasn't saved on server
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Inquiry processing failed');
      }

      // Sync active conversation
      setMessages(prev => {
        // Filter out temporary local user message
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, data.userMessage || tempUserMsg, data.aiMessage];
      });

      // Update chat title in general list if it was dynamically summarized by server
      if (data.newTitle) {
        setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: data.newTitle } : c));
      }
    } catch (err: any) {
      console.error(err);
      // Inject temporary bot error message
      const tempErrBotMsg: Message = {
        id: 'temp_error_msg_' + Date.now(),
        chatId: currentChatId || 'error',
        role: 'model',
        content: `Error: ${err.message || 'The Academic Brain is busy right now. Please try again.'}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempErrBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (researchMode?: boolean) => {
    if (!token || !activeChatId || loading) return;
    setLoading(true);
    setRateLimitExceeded(false);

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ regenerate: true, researchMode })
      });

      if (res.status === 429) {
        setRateLimitExceeded(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Regeneration failed');
      }

      // Update state: drop the previous AI answer and insert new AI response
      setMessages(prev => {
        const withoutLast = [...prev];
        if (withoutLast.length > 0 && withoutLast[withoutLast.length - 1].role === 'model') {
          withoutLast.pop();
        }
        return [...withoutLast, data.aiMessage];
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('ira_user', JSON.stringify(updatedUser));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'text-[#faf9f5]' : 'text-[#141413]'}`}>
      {view === 'landing' && (
        <LandingPage 
          onStart={(target) => setView(target)} 
          darkMode={darkMode} 
        />
      )}

      {(view === 'login' || view === 'register') && (
        <AuthCard
          initialView={view}
          onBack={() => setView('landing')}
          onSuccess={handleAuthSuccess}
          darkMode={darkMode}
        />
      )}

      {view === 'workspace' && user && (
        <div className="flex h-screen overflow-hidden">
          {/* Historical Sidebar Navigation */}
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onOpenProfile={() => setProfileOpen(true)}
            onLogOut={handleLogOut}
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            workspaceView={workspaceView}
            onSetWorkspaceView={setWorkspaceView}
          />

          {/* Active Area with conditional view */}
          {workspaceView === 'chat' ? (
            <ChatArea
              chat={chats.find(c => c.id === activeChatId) || null}
              messages={messages}
              loading={loading}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              user={user}
              darkMode={darkMode}
              onOpenSidebar={() => setSidebarOpen(true)}
              rateLimitExceeded={rateLimitExceeded}
              onSwitchToVoice={() => setWorkspaceView('voice')}
            />
          ) : workspaceView === 'voice' ? (
            <LiveVoiceScreen 
              user={user}
              darkMode={darkMode}
              onBackToChat={() => setWorkspaceView('chat')}
            />
          ) : workspaceView === 'plans' ? (
            <PricingPlans
              user={user}
              token={token || ''}
              darkMode={darkMode}
              onBack={() => setWorkspaceView('chat')}
              onUserProfileUpdated={handleProfileUpdate}
            />
          ) : user.email === 'naiknirmal654@gmail.com' ? (
            <FounderDashboard
              token={token || ''}
              darkMode={darkMode}
              onBack={() => setWorkspaceView('chat')}
              onLogout={handleLogOut}
            />
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-colors ${
              darkMode ? 'bg-[#141413]' : 'bg-[#faf9f5]'
            }`}>
              <div className="border border-red-500/20 bg-red-500/5 p-8 text-center rounded-sm max-w-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-red-500">Access Denied</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  This administrative desk is strictly restricted to the founder of IRA AI. Non-founder access is prohibited.
                </p>
                <button
                  onClick={() => setWorkspaceView('chat')}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white dark:text-black border text-white rounded-sm font-mono text-xs hover:opacity-90 tracking-wide transition-all cursor-pointer"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          )}

          {/* Personal profile modal settings */}
          {profileOpen && (
            <ProfileModal
              user={user}
              token={token || ''}
              onClose={() => setProfileOpen(false)}
              onUpdate={handleProfileUpdate}
              darkMode={darkMode}
            />
          )}

          {/* Sandboxed friendly delete chat confirmation modal */}
          {deleteConfirmChatId && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-neutral-800 dark:text-neutral-100">
              <div className={`w-full max-w-sm border shadow-lg p-6 space-y-5 transition-all duration-200 ${
                darkMode ? 'bg-[#1c1b18] border-[#31302b]' : 'bg-white border-[#dedcd1]'
              }`}>
                <h3 className="font-serif text-base font-semibold">
                  Archive Study File
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                  Are you sure you want to permanently delete this chat data file? All message history from this conversation will be permanently lost.
                </p>
                <div className="flex gap-2.5 justify-end pt-1">
                  <button
                    onClick={() => setDeleteConfirmChatId(null)}
                    className={`px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                      darkMode ? 'border-[#31302b] text-[#a09e95] hover:bg-[#21201c] hover:text-[#faf9f5]' : 'border-[#dedcd1] text-[#706e64] hover:bg-neutral-50 hover:text-[#141413]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteChat}
                    className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer"
                  >
                    Delete File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
