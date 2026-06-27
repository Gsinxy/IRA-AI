export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Stored securely as string, we can do a simple hash or plain base64-stored for simplicity if needed, but a robust password check is excellent
  school?: string;
  major?: string;
  createdAt: string;
  plan?: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  extractedDocumentText?: string;
  extractedDocumentName?: string;
  extractedDocumentType?: string;
}

export interface SearchSource {
  title: string;
  url: string;
  content?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  sources?: SearchSource[];
  researchWarning?: string;
  image?: {
    type: string;
    title: string;
    imageUrl: string;
    caption: string;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    school?: string;
    major?: string;
    createdAt: string;
    plan?: string;
  };
  token: string;
}

export interface AiModelAttempt {
  model: string;
  success: boolean;
  error?: string;
}

export interface AiRequestLog {
  id: string;
  timestamp: string;
  chatId: string;
  userId: string;
  userEmail: string;
  promptSnippet: string;
  attempts: AiModelAttempt[];
  finalModelUsed: string;
  responseSnippet: string;
  status: 'Success' | 'Failed';
}
