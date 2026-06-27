import fs from 'fs';
import path from 'path';
import { User, Chat, Message, AiRequestLog } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

interface Schema {
  users: User[];
  chats: Chat[];
  messages: Message[];
  sessions?: Record<string, string | { userId: string; supabaseAccessToken?: string }>;
  apiUsage?: Record<string, number>;
  openRouterRequests?: {
    attempts: number;
    success: number;
    failed: number;
    fallbackGemini: number;
  };
  dailyActiveUsers?: Record<string, string[]>;
  aiRequestLogs?: AiRequestLog[];
}

const emptySchema: Schema = {
  users: [],
  chats: [],
  messages: [],
  sessions: {},
  apiUsage: {},
  openRouterRequests: {
    attempts: 0,
    success: 0,
    failed: 0,
    fallbackGemini: 0
  },
  dailyActiveUsers: {},
  aiRequestLogs: []
};

// Initialize database
function generateTemporaryNameFromEmail(email: string): string {
  if (!email) return "Student";
  const localPart = email.split('@')[0];
  
  // Convert dividers (dashes, dots, underscores, numbers) to spaces
  const cleaned = localPart.replace(/[\d._\-]+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  
  if (words.length > 0) {
    const formattedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    const result = formattedWords.join(' ');
    if (result.toLowerCase() === 'naiknirmal') {
      return 'Naik Nirmal';
    }
    return result;
  }
  
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function initDb(): Schema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(emptySchema, null, 2), 'utf-8');
      return emptySchema;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Schema;

    // Run migration for any users who have missing/raw names
    if (parsed.users) {
      let changed = false;
      parsed.users.forEach(u => {
        const prefix = u.email ? u.email.split('@')[0] : '';
        const isDefaultOrMissing = !u.name || u.name.trim().length === 0 || u.name === u.email || u.name === prefix;
        if (isDefaultOrMissing && u.email) {
          const tempName = generateTemporaryNameFromEmail(u.email);
          console.log(`[DB STORE MIGRATION] Sanitizing name for user ${u.email}: "${u.name}" -> "${tempName}"`);
          u.name = tempName;
          changed = true;
        }
      });
      if (changed) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch (e) {
          console.error("Failed to write migrated user database:", e);
        }
      }
    }

    if (!parsed.sessions) {
      parsed.sessions = {};
    }
    if (!parsed.apiUsage) {
      parsed.apiUsage = {};
    }
    if (!parsed.openRouterRequests) {
      parsed.openRouterRequests = {
        attempts: 0,
        success: 0,
        failed: 0,
        fallbackGemini: 0
      };
    }
    if (!parsed.dailyActiveUsers) {
      parsed.dailyActiveUsers = {};
    }
    if (!parsed.aiRequestLogs) {
      parsed.aiRequestLogs = [];
    }
    return parsed;
  } catch (error) {
    console.error('Error initializing database, using memory-store:', error);
    return emptySchema;
  }
}

let db = initDb();

function saveDb(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Memory token store mapping token -> userId
const tokenStore = new Map<string, string>();

// Simple in-memory rate-limiter store mapping token/ip -> timestamp array
const rateLimitStore = new Map<string, number[]>();

export const DB = {
  // Users
  createUser: (name: string, email: string, passwordHash: string): User => {
    const emailLower = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email === emailLower);
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: emailLower,
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb();
    return newUser;
  },

  createUserWithId: (id: string, name: string, email: string, passwordHash: string): User => {
    const emailLower = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email === emailLower);
    if (existing) {
      return existing;
    }
    const newUser: User = {
      id,
      email: emailLower,
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb();
    return newUser;
  },

  findUserByEmail: (email: string): User | undefined => {
    const emailLower = email.toLowerCase().trim();
    return db.users.find(u => u.email === emailLower);
  },

  findUserById: (id: string): User | undefined => {
    return db.users.find(u => u.id === id);
  },

  migrateUserId: (oldId: string, newId: string): User => {
    console.log(`[DB STORE MIGRATION] Migrating database pointers from ${oldId} to ${newId}`);
    const existingNewUser = db.users.find(u => u.id === newId);
    let user = db.users.find(u => u.id === oldId);

    if (existingNewUser) {
      user = existingNewUser;
      db.users = db.users.filter(u => u.id !== oldId);
    } else if (user) {
      user.id = newId;
    }

    // Update chats userId
    if (db.chats) {
      db.chats.forEach(c => {
        if (c.userId === oldId) {
          c.userId = newId;
        }
      });
    }

    // Update sessions record
    if (db.sessions) {
      Object.keys(db.sessions).forEach(token => {
        const value = db.sessions![token];
        if (typeof value === 'object' && value !== null) {
          if (value.userId === oldId) {
            value.userId = newId;
          }
        } else if (value === oldId) {
          db.sessions![token] = newId;
        }
      });
    }

    // Update daily active users lists
    if (db.dailyActiveUsers) {
      Object.keys(db.dailyActiveUsers).forEach(day => {
        db.dailyActiveUsers![day] = db.dailyActiveUsers![day].map(id => id === oldId ? newId : id);
      });
    }

    saveDb();
    return user || existingNewUser || db.users.find(u => u.id === newId)!;
  },

  updateUserProfile: (id: string, updates: { name?: string; school?: string; major?: string; plan?: string }): User => {
    const user = db.users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found.');
    }
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.school !== undefined) user.school = updates.school;
    if (updates.major !== undefined) user.major = updates.major;
    if (updates.plan !== undefined) user.plan = updates.plan;
    saveDb();
    return user;
  },

  // Token sessions
  createSession: (userId: string, supabaseAccessToken?: string): string => {
    const token = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
    if (!db.sessions) {
      db.sessions = {};
    }
    db.sessions[token] = { userId, supabaseAccessToken };
    saveDb();
    return token;
  },

  getUserIdFromSession: (token: string): string | undefined => {
    if (!db.sessions) {
      return undefined;
    }
    const val = db.sessions[token];
    if (!val) return undefined;
    if (typeof val === 'string') {
      return val;
    }
    return val.userId;
  },

  getSupabaseTokenFromSession: (token: string): string | undefined => {
    if (!db.sessions) {
      return undefined;
    }
    const val = db.sessions[token];
    if (!val || typeof val === 'string') {
      return undefined;
    }
    return val.supabaseAccessToken;
  },

  deleteSession: (token: string): void => {
    if (db.sessions && db.sessions[token]) {
      delete db.sessions[token];
      saveDb();
    }
  },

  // Chats
  createChat: (userId: string, title: string): Chat => {
    const newChat: Chat = {
      id: 'chat_' + Math.random().toString(36).substr(2, 9),
      userId,
      title: title || 'New Concept Explanation',
      createdAt: new Date().toISOString(),
    };
    db.chats.push(newChat);
    saveDb();
    return newChat;
  },

  getChatsByUser: (userId: string): Chat[] => {
    return db.chats
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getChat: (chatId: string): Chat | undefined => {
    return db.chats.find(c => c.id === chatId);
  },

  deleteChat: (chatId: string, userId: string): boolean => {
    const index = db.chats.findIndex(c => c.id === chatId && c.userId === userId);
    if (index === -1) return false;
    db.chats.splice(index, 1);
    // Delete corresponding messages
    db.messages = db.messages.filter(m => m.chatId !== chatId);
    saveDb();
    return true;
  },

  updateChatTitle: (chatId: string, userId: string, title: string): Chat | undefined => {
    const chat = db.chats.find(c => c.id === chatId && c.userId === userId);
    if (!chat) return undefined;
    chat.title = title;
    saveDb();
    return chat;
  },

  updateChatDocument: (chatId: string, text: string, name: string, type: string): Chat | undefined => {
    const chat = db.chats.find(c => c.id === chatId);
    if (!chat) return undefined;
    chat.extractedDocumentText = text;
    chat.extractedDocumentName = name;
    chat.extractedDocumentType = type;
    saveDb();
    return chat;
  },

  // Messages
  addMessage: (chatId: string, role: 'user' | 'model', content: string, sources?: any[], researchWarning?: string, image?: any): Message => {
    const newMessage: Message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      chatId,
      role,
      content,
      createdAt: new Date().toISOString(),
      sources,
      researchWarning,
      image
    };
    db.messages.push(newMessage);
    saveDb();
    return newMessage;
  },

  getMessagesByChat: (chatId: string): Message[] => {
    return db.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  deleteLastMessage: (chatId: string): boolean => {
    const chatMessages = db.messages.filter(m => m.chatId === chatId);
    if (chatMessages.length === 0) return false;
    const lastMsg = chatMessages[chatMessages.length - 1];
    db.messages = db.messages.filter(m => m.id !== lastMsg.id);
    saveDb();
    return true;
  },

  // Sync / Cloud Upserts
  upsertChat: (chat: Chat): Chat => {
    if (!db.chats) {
      db.chats = [];
    }
    const idx = db.chats.findIndex(c => c.id === chat.id);
    if (idx !== -1) {
      db.chats[idx] = { ...db.chats[idx], ...chat };
    } else {
      db.chats.push(chat);
    }
    saveDb();
    return chat;
  },

  upsertMessage: (message: Message): Message => {
    if (!db.messages) {
      db.messages = [];
    }
    const idx = db.messages.findIndex(m => m.id === message.id);
    if (idx !== -1) {
      db.messages[idx] = { ...db.messages[idx], ...message };
    } else {
      db.messages.push(message);
    }
    saveDb();
    return message;
  },

  // Rate limiter check
  isRateLimited: (key: string, limit: number = 30, windowMs: number = 60000): boolean => {
    const now = Date.now();
    let timestamps = rateLimitStore.get(key) || [];
    // Remove stale timestamps
    timestamps = timestamps.filter(t => now - t < windowMs);
    if (timestamps.length >= limit) {
      return true;
    }
    timestamps.push(now);
    rateLimitStore.set(key, timestamps);
    return false;
  },


  getAllUsers: (): User[] => {
    return db.users || [];
  },

  getAllChats: (): Chat[] => {
    return db.chats || [];
  },

  getAllMessages: (): Message[] => {
    return db.messages || [];
  },

  recordApiHit: (route: string): void => {
    if (!db.apiUsage) {
      db.apiUsage = {};
    }
    db.apiUsage[route] = (db.apiUsage[route] || 0) + 1;
    saveDb();
  },

  recordOpenRouterRequest: (status: 'attempt' | 'success' | 'failed' | 'fallbackGemini'): void => {
    if (!db.openRouterRequests) {
      db.openRouterRequests = { attempts: 0, success: 0, failed: 0, fallbackGemini: 0 };
    }
    if (status === 'attempt') {
      db.openRouterRequests.attempts += 1;
    } else if (status === 'success') {
      db.openRouterRequests.success += 1;
    } else if (status === 'failed') {
      db.openRouterRequests.failed += 1;
    } else if (status === 'fallbackGemini') {
      db.openRouterRequests.fallbackGemini += 1;
    }
    saveDb();
  },

  recordUserActivity: (userId: string): void => {
    if (!db.dailyActiveUsers) {
      db.dailyActiveUsers = {};
    }
    // Track unique user activity by day (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    if (!db.dailyActiveUsers[today]) {
      db.dailyActiveUsers[today] = [];
    }
    if (!db.dailyActiveUsers[today].includes(userId)) {
      db.dailyActiveUsers[today].push(userId);
    }
    saveDb();
  },

  addAiRequestLog: (log: Omit<AiRequestLog, 'id'>): AiRequestLog => {
    if (!db.aiRequestLogs) {
      db.aiRequestLogs = [];
    }
    const newLog: AiRequestLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      ...log
    };
    db.aiRequestLogs.push(newLog);
    // Maintain a max log list of 100 entries to prevent files from ballooning
    if (db.aiRequestLogs.length > 100) {
      db.aiRequestLogs.shift();
    }
    saveDb();
    return newLog;
  },

  getAiRequestLogs: (): AiRequestLog[] => {
    return db.aiRequestLogs || [];
  },

  getFounderStats: () => {
    return {
      totalUsers: db.users.length,
      totalChats: db.chats.length,
      totalMessages: db.messages.length,
      dailyActiveUsers: db.dailyActiveUsers || {},
      apiUsage: db.apiUsage || {},
      openRouterRequests: db.openRouterRequests || { attempts: 0, success: 0, failed: 0, fallbackGemini: 0 },
      aiRequestLogs: db.aiRequestLogs || [],
      recentSignups: [...db.users]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          school: u.school,
          major: u.major,
          createdAt: u.createdAt
        }))
    };
  }
};
