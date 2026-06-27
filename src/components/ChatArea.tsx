import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  GraduationCap, 
  ArrowRight, 
  ChevronRight, 
  Sparkles,
  Menu,
  School,
  BookOpen,
  Mic,
  Search,
  Code,
  FileText,
  Globe,
  ClipboardList,
  Brain,
  Target,
  ChevronDown,
  Paperclip
} from 'lucide-react';
import { Message, Chat } from '../types';
import AiVisualization from './AiVisualization';

interface ExtractedVisualization {
  type: 'chart' | 'mermaid';
  rawCode: string;
  parsedData?: any;
}

function extractVisualizations(content: string): { cleanContent: string; visual: ExtractedVisualization | null } {
  if (!content) return { cleanContent: '', visual: null };

  console.log("[Frontend Vis Engine] Processing potential visualization payload. Total content length:", content.length);

  // 1. Try to find json_visualization block
  const jsonRegex = /```json_visualization\s*([\s\S]*?)```/i;
  const jsonMatch = content.match(jsonRegex);
  if (jsonMatch) {
    try {
      const rawCode = jsonMatch[1].trim();
      const parsedData = JSON.parse(rawCode);
      const cleanContent = content.replace(jsonRegex, '').trim();
      console.log("[Frontend Vis Engine] Successfully extracted and parsed json_visualization payload! Title:", parsedData.title, "Type:", parsedData.type);
      return {
        cleanContent,
        visual: {
          type: 'chart',
          rawCode,
          parsedData
        }
      };
    } catch (e) {
      console.error("[Frontend Vis Engine] ERROR parsing json_visualization payload block as JSON:", e);
    }
  }

  // 2. Try to find mermaid block
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/i;
  const mermaidMatch = content.match(mermaidRegex);
  if (mermaidMatch) {
    const rawCode = mermaidMatch[1].trim();
    const cleanContent = content.replace(mermaidRegex, '').trim();
    console.log("[Frontend Vis Engine] Successfully extracted Mermaid concept diagram payload! Code snippet:", rawCode.substring(0, 100));
    return {
      cleanContent,
      visual: {
        type: 'mermaid',
        rawCode
      }
    };
  }

  console.log("[Frontend Vis Engine] No visualization payload blocks (json_visualization or mermaid) found in message content.");
  return { cleanContent: content, visual: null };
}

interface ChatAreaProps {
  chat: Chat | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string, researchMode?: boolean) => void;
  onRegenerate: (researchMode?: boolean) => void;
  user: any;
  darkMode: boolean;
  onOpenSidebar: () => void;
  rateLimitExceeded?: boolean;
  onSwitchToVoice?: () => void;
}

// Custom code block renderer with copying
function CodeBlock({ code, language, darkMode }: { code: string; language: string; darkMode: boolean; key?: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 border border-[#dedcd1] dark:border-[#31302b] rounded-sm overflow-hidden text-xs">
      <div className={`flex justify-between items-center px-4 py-2 border-b text-[10px] uppercase font-mono tracking-wider ${
        darkMode ? 'bg-[#141413] border-[#31302b] text-[#706e64]' : 'bg-[#faf9f5] border-[#dedcd1] text-[#706e64]'
      }`}>
        <span>{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-[#1a1916] text-[#f7f6f0] font-mono leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// Inline Text formatting: support bold (* or **), inline code (`), and italic
function formatInlineText(text: string, darkMode: boolean) {
  const parts = [];
  let currentIndex = 0;

  // Regex matches `inline code` or **bold** or *italic*
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // Add text before the match
    if (matchIndex > currentIndex) {
      parts.push(text.slice(currentIndex, matchIndex));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const codeContent = token.slice(1, -1);
      parts.push(
        <code key={matchIndex} className={`px-1.5 py-0.5 rounded-sm font-mono text-[11px] ${
          darkMode ? 'bg-white/10 text-[#faf9f5]' : 'bg-black/5 text-[#141413]'
        }`}>
          {codeContent}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={matchIndex} className="font-semibold text-black dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={matchIndex} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    currentIndex = inlineRegex.lastIndex;
  }

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts;
}

// Custom Markdown block-by-block renderer
function MarkdownRenderer({ text, darkMode }: { text: string; darkMode: boolean }) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push(...renderTextBlocks(textBefore, darkMode, `sb-${blockIndex++}`));
    }

    const language = match[1];
    const code = match[2];
    elements.push(<CodeBlock key={`cb-${match.index}`} code={code} language={language} darkMode={darkMode} />);

    lastIndex = codeBlockRegex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter.trim() || elements.length === 0) {
    elements.push(...renderTextBlocks(textAfter, darkMode, `sa-${blockIndex++}`));
  }

  return <div className="space-y-3.5 text-sm font-sans leading-relaxed tracking-normal">{elements}</div>;
}

function renderTextBlocks(text: string, darkMode: boolean, prefix: string) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { items: string[]; type: 'bullet' | 'ordered' } | null = null;

  const flushList = (key: number) => {
    if (currentList) {
      if (currentList.type === 'bullet') {
        blocks.push(
          <ul key={`ul-${prefix}-${key}`} className="list-disc pl-5 my-2 space-y-1 ml-2">
            {currentList.items.map((it, idx) => (
              <li key={`li-${prefix}-${key}-${idx}`} className="font-light">{formatInlineText(it, darkMode)}</li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`ol-${prefix}-${key}`} className="list-decimal pl-5 my-2 space-y-1 ml-2">
            {currentList.items.map((it, idx) => (
              <li key={`li-${prefix}-${key}-${idx}`} className="font-light">{formatInlineText(it, darkMode)}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const itemKey = `${prefix}-${index}`;

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(index);
      blocks.push(
        <h4 key={`h4-${itemKey}`} className="font-serif text-base font-semibold tracking-tight mt-5 mb-2 text-black dark:text-white border-b border-dashed border-[#dedcd1] dark:border-[#31302b] pb-1">
          {formatInlineText(trimmed.slice(4), darkMode)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(index);
      blocks.push(
        <h3 key={`h3-${itemKey}`} className="font-serif text-lg font-semibold tracking-tight mt-6 mb-2 text-black dark:text-white">
          {formatInlineText(trimmed.slice(3), darkMode)}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList(index);
      blocks.push(
        <h2 key={`h2-${itemKey}`} className="font-serif text-xl font-bold tracking-tight mt-7 mb-3 text-black dark:text-white">
          {formatInlineText(trimmed.slice(2), darkMode)}
        </h2>
      );
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      flushList(index);
      blocks.push(
        <blockquote key={`bq-${itemKey}`} className={`pl-4 border-l-2 my-3 italic text-xs leading-relaxed ${
          darkMode ? 'border-[#706e64] text-[#a09e95]' : 'border-[#dedcd1] text-[#706e64]'
        }`}>
          {formatInlineText(trimmed.slice(2), darkMode)}
        </blockquote>
      );
    }
    // Bullet lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.slice(2);
      if (currentList && currentList.type === 'bullet') {
        currentList.items.push(itemContent);
      } else {
        flushList(index);
        currentList = { type: 'bullet', items: [itemContent] };
      }
    }
    // Ordered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s/);
      const itemContent = trimmed.slice(match![0].length);
      if (currentList && currentList.type === 'ordered') {
        currentList.items.push(itemContent);
      } else {
        flushList(index);
        currentList = { type: 'ordered', items: [itemContent] };
      }
    }
    // Paragraph or empty lines
    else {
      flushList(index);
      if (trimmed) {
        blocks.push(
          <p key={`p-${itemKey}`} className="font-light text-[13.5px] leading-relaxed text-[#21211e] dark:text-[#f3f2ee]">
            {formatInlineText(line, darkMode)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);
  return blocks;
}

function getValidFullName(user: any): string | null {
  if (!user || typeof user.name !== 'string') return null;
  const name = user.name.trim();
  if (!name) return null;
  
  // 1. Must not contain @ (emails)
  if (name.includes('@')) return null;
  
  // 2. Must not contain numbers/digits (usernames with numbers, email prefixes like naiknirmal654, IDs)
  if (/\d/.test(name)) return null;
  
  // 3. Must not look like a hex/uuid or Firebase UID (typically long strings with no spaces, or alphanumeric)
  if (!name.includes(' ')) {
    if (name.length > 15 || !/^[A-Za-z]+$/.test(name)) {
      return null;
    }
    return name;
  }
  
  // 4. If it has spaces, check if it contains typical letters, hyphens, or apostrophes
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const allAlphabetic = parts.every(p => /^[A-Za-z'\-]+$/.test(p));
    if (allAlphabetic) {
      return name;
    }
  }
  
  return null;
}

function getFriendlyProfileName(user: any): string {
  if (!user || !user.name) return 'Student';
  const name = String(user.name).trim();
  if (!name) return 'Student';
  if (name.includes('@')) return 'Student';
  if (/^\d+$/.test(name) || (name.length > 20 && !name.includes(' '))) return 'Student';
  return name;
}

export default function ChatArea({
  chat,
  messages,
  loading,
  onSendMessage,
  onRegenerate,
  user,
  darkMode,
  onOpenSidebar,
  rateLimitExceeded,
  onSwitchToVoice
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // IRA-inspired modes & file states
  const [currentMode, setCurrentMode] = useState<'Study' | 'Research' | 'Coding' | 'Assignment' | 'Career'>('Study');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [mockAttachedFile, setMockAttachedFile] = useState<string | null>(null);
  const [researchEnabled, setResearchEnabled] = useState(false);

  const friendlyName = getFriendlyProfileName(user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    let finalQuery = inputText;
    // Prefix modes context dynamically if not standard Study Mode
    if (currentMode !== 'Study') {
      finalQuery = `[Academic Mode: ${currentMode}] ${finalQuery}`;
    }
    // Prefix attachment if present
    if (mockAttachedFile) {
      finalQuery = `[Attached Resource: ${mockAttachedFile}] ${finalQuery}`;
    }

    onSendMessage(finalQuery, researchEnabled);
    setInputText('');
    setMockAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex-1 flex flex-col h-screen min-w-0 transition-colors duration-200 ${
      darkMode ? 'bg-[#141413] text-[#faf9f5]' : 'bg-[#faf9f5] text-[#141413]'
    }`}>
      {/* Top Header */}
      <header className={`py-4 px-6 border-b flex justify-between items-center backdrop-blur-md transition-all duration-300 z-10 ${
        darkMode ? 'border-neutral-800/40 bg-[#141413]/85' : 'border-neutral-200/50 bg-[#faf9f5]/85'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className={`p-2.5 border rounded-full lg:hidden transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              darkMode ? 'border-neutral-800 bg-[#1c1b18] hover:bg-[#21201c]' : 'border-neutral-200 bg-white hover:bg-neutral-100 shadow-2xs'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div>
            <h2 className="font-serif text-base font-semibold truncate max-w-[200px] sm:max-w-[400px] tracking-tight">
              {chat ? chat.title : 'IRA AI Consultation Desk'}
            </h2>
            {chat && (
              <p className={`text-[10px] uppercase font-mono tracking-wider ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                File Ref: Study Workspace ({messages.length} notes)
              </p>
            )}
          </div>
        </div>

        {/* Personalized school stamp */}
        {user && (user.school || user.major) && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-dashed rounded-full border-black/10 dark:border-white/10 text-[10px] shadow-3xs">
            <School className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[180px]">
              {user.major || 'Global Curriculum'} — {user.school || 'Academic Desk'}
            </span>
          </div>
        )}
      </header>

      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 min-h-0">
        {!hasMessages ? (
          /* Empty Workspace Welcome Greeting - Redesigned like IRA */
          <div className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center min-h-[75vh] px-2 select-none animate-in fade-in duration-500">
            {/* Minimal Centered Logo/Branding Header */}
            <div className="flex flex-col items-center mb-10 gap-2.5">
              <div className={`w-16 h-16 flex items-center justify-center border rounded-full transition-all duration-300 transform hover:scale-105 hover:rotate-6 shadow-md ${
                darkMode ? 'border-neutral-800/80 bg-neutral-900/60 text-white shadow-black/10' : 'border-neutral-200/50 bg-white text-black shadow-neutral-100'
              }`}>
                <GraduationCap className="w-9 h-9 text-neutral-800 dark:text-neutral-100" />
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-center">
                IRA AI
              </h1>
              <p className={`font-mono text-[9px] tracking-widest uppercase ${
                darkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Next-Gen Academic Intelligence
              </p>
            </div>

            {/* Giant Centered Search Box */}
            <form onSubmit={handleSubmit} className="w-full relative">
              <div className={`w-full border rounded-[24px] p-4.5 transition-all duration-300 shadow-md focus-within:shadow-lg focus-within:ring-4 ${
                darkMode
                  ? 'bg-[#1c1b18]/80 border-neutral-800/80 focus-within:border-neutral-700/80 focus-within:ring-white/[0.03]'
                  : 'bg-white/90 border-neutral-200/60 focus-within:border-neutral-350 focus-within:ring-black/[0.02]'
              } backdrop-blur-md`}>
                {/* File attachment preview inside the input box */}
                {mockAttachedFile && (
                  <div className="flex items-center gap-2 mb-2.5 p-1.5 px-3.5 border rounded-full text-xs w-fit bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="font-medium truncate max-w-[200px]">{mockAttachedFile}</span>
                    <button
                      type="button"
                      onClick={() => setMockAttachedFile(null)}
                      className="ml-2 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                <textarea
                  required
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask IRA anything about studies, coding, research, internships, careers, or assignments"
                  className={`w-full bg-transparent border-none text-sm font-light resize-none focus:outline-none focus:ring-0 leading-relaxed rounded-[18px] ${
                    darkMode ? 'text-[#faf9f5] placeholder-neutral-500' : 'text-[#141413] placeholder-neutral-400'
                  }`}
                />

                {/* Bottom Action bar inside Search Container */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-neutral-200/60 dark:border-neutral-800/50">
                  <div className="flex items-center gap-2 relative">
                    {/* Mode Selector Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer ${
                          currentMode === 'Study'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : currentMode === 'Research'
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
                            : currentMode === 'Coding'
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : currentMode === 'Assignment'
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                            : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}
                      >
                        {currentMode === 'Study' ? (
                          <BookOpen className="w-3.5 h-3.5" />
                        ) : currentMode === 'Research' ? (
                          <Search className="w-3.5 h-3.5" />
                        ) : currentMode === 'Coding' ? (
                          <Code className="w-3.5 h-3.5" />
                        ) : currentMode === 'Assignment' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <Target className="w-3.5 h-3.5" />
                        )}
                        <span>{currentMode}</span>
                        <ChevronDown className="w-3 h-3 opacity-80" />
                      </button>

                      {/* Dropdown Options List */}
                      {modeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setModeDropdownOpen(false)}
                          />
                          <div className={`absolute bottom-full left-0 mb-2.5 z-20 w-56 border rounded-[24px] shadow-xl p-2 flex flex-col gap-1 transition-all duration-300 ${
                            darkMode ? 'bg-[#1c1b18] border-neutral-800 text-white shadow-black/40' : 'bg-white border-neutral-200 text-black shadow-neutral-200/60'
                          } backdrop-blur-xl`}>
                            <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                              Academic Mode
                            </div>
                            
                            {[
                              { id: 'Study', label: 'Study Mode', desc: 'Core concept training', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> },
                              { id: 'Research', label: 'Research Mode', desc: 'Papers & science sources', icon: <Search className="w-3.5 h-3.5 text-blue-500" /> },
                              { id: 'Coding', label: 'Coding Mode', desc: 'Optimal solutions & debugging', icon: <Code className="w-3.5 h-3.5 text-amber-500" /> },
                              { id: 'Assignment', label: 'Assignment Mode', desc: 'Outlines & shells drafting', icon: <FileText className="w-3.5 h-3.5 text-indigo-500" /> },
                              { id: 'Career', label: 'Career Mode', desc: 'Roadmaps & portfolios help', icon: <Target className="w-3.5 h-3.5 text-rose-500" /> }
                            ].map((modeItem) => (
                              <button
                                key={modeItem.id}
                                type="button"
                                onClick={() => {
                                  setCurrentMode(modeItem.id as any);
                                  setModeDropdownOpen(false);
                                }}
                                className={`w-full flex items-start gap-2.5 p-2 rounded-2xl text-left transition-colors cursor-pointer ${
                                  currentMode === modeItem.id
                                    ? (darkMode ? 'bg-white/10' : 'bg-black/5')
                                    : (darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5')
                                }`}
                              >
                                <span className="pt-0.5">{modeItem.icon}</span>
                                <div>
                                  <div className="text-xs font-semibold">{modeItem.label}</div>
                                  <div className="text-[10px] text-neutral-400 font-light">{modeItem.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Voice trigger action */}
                    {user?.email === 'naiknirmal654@gmail.com' && (
                      <button
                        type="button"
                        onClick={onSwitchToVoice}
                        className={`p-2 border rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                          darkMode ? 'border-neutral-800 bg-[#141413] text-[#e6e4db]' : 'border-neutral-200 bg-[#faf9f5] text-[#141413] shadow-xs'
                        }`}
                        title="IRA Live Voice (Founder Beta)"
                      >
                        <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
                      </button>
                    )}

                    {/* Attach File action button */}
                    <input
                      type="file"
                      id="ira-file-attach"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMockAttachedFile(file.name);
                        }
                      }}
                    />
                    <label
                      htmlFor="ira-file-attach"
                      className={`p-2 border rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                        darkMode ? 'border-neutral-800 bg-[#141413] text-[#e6e4db]' : 'border-neutral-200 bg-[#faf9f5] text-[#141413] shadow-xs'
                      }`}
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4 text-neutral-400 hover:text-inherit" />
                    </label>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                      inputText.trim()
                        ? (darkMode ? 'bg-[#faf9f5] text-black hover:bg-white shadow-md' : 'bg-black text-[#faf9f5] hover:bg-neutral-800 shadow-md')
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 opacity-55 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Compact Pill Chips suggestions instead of dashboard cards */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-xl">
              <span className={`text-[10px] uppercase tracking-wider font-mono mr-1.5 font-bold ${
                darkMode ? 'text-[#706e64]' : 'text-[#a09e95]'
              }`}>
                Academic Keys:
              </span>
              
              {[
                { label: 'Explain', prompt: 'Explain the complex academic concept of: ', mode: 'Study' },
                { label: 'Research', prompt: 'Research peer-reviewed papers and top academic sources on: ', mode: 'Research' },
                { label: 'Notes', prompt: 'Formulate an exhaustive summary study guide and key notes for: ', mode: 'Study' },
                { label: 'Quiz', prompt: 'Devise a 5-question multi-difficulty academic test regarding: ', mode: 'Study' },
                { label: 'Code', prompt: 'Draft a clean optimal programming algorithm with explanation in TypeScript for: ', mode: 'Coding' },
                { label: 'Internships', prompt: 'Give a comprehensive professional skills roadmap and interview kit for securing internships in: ', mode: 'Career' }
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => {
                    setInputText(pill.prompt);
                    setCurrentMode(pill.mode as any);
                  }}
                  className={`text-xs px-3.5 py-1.5 border rounded-full transition-all cursor-pointer font-light hover:scale-102 ${
                    darkMode
                      ? 'border-[#31302b] bg-[#1c1b18] hover:bg-neutral-800 hover:text-white text-neutral-300'
                      : 'border-[#dedcd1] bg-white hover:bg-neutral-50 hover:text-black text-neutral-600 shadow-2xs'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Actual Message Lists */
          <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {messages.map((msg, idx) => {
              const isAi = msg.role === 'model';
              const isLatestAiMessage = isAi && idx === messages.length - 1;

              return (
                <div 
                  key={msg.id || idx}
                  className={`flex flex-col ${isAi ? 'items-start animate-in fade-in duration-300 slide-in-from-left-4' : 'items-end animate-in fade-in duration-300 slide-in-from-right-4'}`}
                >
                  <span className={`text-[10px] uppercase font-mono tracking-widest mb-2 px-1 ${
                    darkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    {isAi ? 'IRA AI' : user.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className={`max-w-[85%] sm:max-w-[100%] px-6 py-5 rounded-[24px] border break-words overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 ${
                    isAi
                      ? (darkMode 
                          ? 'bg-[#1c1b18]/90 border-neutral-800/60 text-[#e6e4db]' 
                          : 'bg-white/90 border-neutral-200/50 text-[#141413]')
                      : (darkMode 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-100 rounded-tr-xs' 
                          : 'bg-amber-500/[0.05] border-amber-500/15 text-amber-900 rounded-tr-xs')
                  } backdrop-blur-xs`}>
                    {isAi ? (
                      <>
                        {(() => {
                          const { cleanContent, visual } = extractVisualizations(msg.content);
                          if (visual) {
                            console.log(`[Frontend Vis Engine] Rendering visual element in message. ID: ${msg.id || "unknown"}, Type: ${visual.type}`);
                          }
                          return (
                            <>
                              {visual && (
                                <AiVisualization
                                  id={msg.id || `vis-${idx}`}
                                  type={visual.type}
                                  rawCode={visual.rawCode}
                                  parsedData={visual.parsedData}
                                  darkMode={darkMode}
                                />
                              )}
                              <MarkdownRenderer text={cleanContent} darkMode={darkMode} />
                            </>
                          );
                        })()}
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-1.5 text-xs font-semibold mb-2.5 text-neutral-500 dark:text-neutral-400">
                              <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />
                              <span>Retrieved Sources</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {msg.sources.map((src, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`p-2.5 border rounded-lg flex flex-col justify-between transition-all duration-200 text-left hover:scale-[1.01] hover:shadow-xs ${
                                    darkMode 
                                      ? 'bg-[#141413]/50 border-neutral-800/60 hover:bg-[#141413] hover:border-neutral-700/80 text-neutral-200' 
                                      : 'bg-neutral-50/50 border-neutral-200/50 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800'
                                  }`}
                                >
                                  <span className="text-xs font-semibold line-clamp-1 leading-normal mb-1">
                                    {src.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-blue-500 dark:text-blue-400 truncate flex items-center gap-1">
                                    <span>{src.url}</span>
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {msg.researchWarning && (
                          <div className="mt-3 px-3 py-2 border rounded-lg text-xs flex items-center gap-1.5 bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400">
                            <span className="font-semibold font-mono">⚠️ {msg.researchWarning}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-light text-inherit whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}

                    {/* Chat actions (Copy / Regenerate for AI response) */}
                    {isAi && (
                      <div className={`flex items-center gap-3 mt-4 pt-3.5 border-t text-[10px] uppercase font-mono tracking-wider ${
                        darkMode ? 'border-neutral-800/80 text-neutral-500' : 'border-neutral-200/60 text-neutral-400'
                      }`}>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>

                        {isLatestAiMessage && (
                          <button
                            onClick={() => onRegenerate(researchEnabled)}
                            disabled={loading}
                            className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom elegant study helper typing indicator */}
            {loading && (
              <div className="flex flex-col items-start animate-pulse">
                <span className={`text-[10px] uppercase font-mono tracking-widest mb-2 px-1 ${
                  darkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  {researchEnabled ? 'IRA AI • Searching the Web' : 'IRA AI • Consulting standard models'}
                </span>
                <div className={`px-6 py-5 border rounded-[24px] flex items-center gap-2.5 shadow-xs ${
                  darkMode ? 'bg-[#1c1b18]/90 border-neutral-800/60' : 'bg-white/90 border-neutral-200/50'
                } backdrop-blur-xs`}>
                  <span className={`flex space-x-1.5`}>
                    <span className="w-2 h-2 rounded-full animate-bounce bg-[#706e64]" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce bg-[#706e64]" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce bg-[#706e64]" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-xs font-serif italic text-neutral-500 select-none pl-1">
                    {researchEnabled ? 'Researching sources...' : 'Drafting proof...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Form Input Deck */}
      {hasMessages && (
        <div className={`p-4 sm:p-6 border-t ${
          darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white'
        }`}>
          <div className="max-w-3xl mx-auto">
            {rateLimitExceeded && (
              <div className="mb-3 text-xs bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900/40 p-2.5 rounded-sm flex items-center gap-2 animate-pulse">
                <span>Rate Limit Warning: You are requesting more than typical limits. Please pause and let IRA finalize drafts.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`w-full border rounded-xl p-3 transition-all duration-300 focus-within:ring-1 ${
              darkMode
                ? 'bg-[#141413] border-[#31302b] focus-within:border-[#faf9f5] focus-within:ring-[#faf9f5]/20'
                : 'bg-white border-[#dedcd1] focus-within:border-[#141413] focus-within:ring-[#141413]/10'
            }`}>
              <textarea
                required
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chat ? "Query IRA regarding this layout, proof, or subject..." : "Ask any academic question to begin..."}
                disabled={loading}
                className={`w-full bg-transparent border-none text-sm font-light resize-none focus:outline-none focus:ring-0 leading-relaxed ${
                  darkMode ? 'text-[#faf9f5] placeholder-[#706e64]' : 'text-[#141413] placeholder-[#a09e95]'
                } disabled:opacity-40`}
              />
              
              {/* Bottom Action bar inside the active form */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 relative">
                  {/* Mode Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 cursor-pointer ${
                        currentMode === 'Study'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : currentMode === 'Research'
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
                          : currentMode === 'Coding'
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : currentMode === 'Assignment'
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      {currentMode === 'Study' ? (
                        <BookOpen className="w-3 h-3" />
                      ) : currentMode === 'Research' ? (
                        <Search className="w-3 h-3" />
                      ) : currentMode === 'Coding' ? (
                        <Code className="w-3 h-3" />
                      ) : currentMode === 'Assignment' ? (
                        <FileText className="w-3 h-3" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                      <span>{currentMode}</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                    </button>

                    {/* Dropdown Options List */}
                    {modeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setModeDropdownOpen(false)}
                        />
                        <div className={`absolute bottom-full left-0 mb-2 z-20 w-52 border rounded-xl shadow-lg p-1.5 flex flex-col gap-1 transition-all ${
                          darkMode ? 'bg-[#1c1b18] border-[#31302b] text-white' : 'bg-white border-[#dedcd1] text-black'
                        }`}>
                          <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
                            Academic Mode
                          </div>
                          
                          {[
                            { id: 'Study', label: 'Study Mode', desc: 'Concept training', icon: <BookOpen className="w-3 h-3 text-emerald-500" /> },
                            { id: 'Research', label: 'Research Mode', desc: 'Papers & science', icon: <Search className="w-3 h-3 text-blue-500" /> },
                            { id: 'Coding', label: 'Coding Mode', desc: 'Optimal solutions', icon: <Code className="w-3 h-3 text-amber-500" /> },
                            { id: 'Assignment', label: 'Assignment Mode', desc: 'Drafts & shells', icon: <FileText className="w-3 h-3 text-indigo-500" /> },
                            { id: 'Career', label: 'Career Mode', desc: 'Roadmaps help', icon: <Target className="w-3 h-3 text-rose-500" /> }
                          ].map((modeItem) => (
                            <button
                              key={modeItem.id}
                              type="button"
                              onClick={() => {
                                setCurrentMode(modeItem.id as any);
                                setModeDropdownOpen(false);
                              }}
                              className={`w-full flex items-start gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                currentMode === modeItem.id
                                  ? (darkMode ? 'bg-neutral-800' : 'bg-neutral-100')
                                  : (darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50')
                              }`}
                            >
                              <span className="pt-0.5">{modeItem.icon}</span>
                              <div>
                                <div className="text-[11px] font-semibold">{modeItem.label}</div>
                                <div className="text-[9px] text-neutral-400 font-light">{modeItem.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Research Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setResearchEnabled(!researchEnabled)}
                    className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 cursor-pointer ${
                      researchEnabled
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 ring-1 ring-blue-500/20'
                        : darkMode
                        ? 'text-neutral-400 bg-[#141413] border-[#31302b]'
                        : 'text-neutral-500 bg-[#faf9f5] border-[#dedcd1]'
                    }`}
                    title="Toggle Research Mode"
                  >
                    <Globe className={`w-3.5 h-3.5 ${researchEnabled ? 'animate-pulse text-blue-500' : ''}`} />
                    <span>Research</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${researchEnabled ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-600'}`} />
                  </button>

                  {/* Voice Button */}
                  {user?.email === 'naiknirmal654@gmail.com' && (
                    <button
                      type="button"
                      onClick={onSwitchToVoice}
                      className={`p-1 border rounded-full transition-all hover:opacity-80 active:scale-95 cursor-pointer ${
                        darkMode ? 'border-[#31302b] bg-[#141413] text-[#e6e4db]' : 'border-[#dedcd1] bg-[#faf9f5] text-[#141413]'
                      }`}
                      title="IRA Live Voice (Founder Beta)"
                    >
                      <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className={`p-1.5 border rounded-full transition-all ${
                      darkMode 
                        ? 'bg-[#e6e4db] text-[#141413] border-[#e6e4db] hover:bg-white' 
                        : 'bg-[#141413] text-[#faf9f5] border-[#141413] hover:bg-black'
                    } disabled:opacity-20 cursor-pointer`}
                    title="Submit Inquiry"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            <div className="flex justify-between items-center mt-2.5">
              <span className={`text-[10px] tracking-wide ${darkMode ? 'text-[#706e64]' : 'text-[#a09e95]'}`}>
                Press <kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded-sm">Enter</kbd> to submit, <kbd className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded-sm">Shift+Enter</kbd> for newline.
              </span>
              <span className={`text-[10px] font-mono select-none px-1.5 py-0.5 border ${
                darkMode ? 'border-[#31302b] text-[#706e64]' : 'border-[#dedcd1] text-[#a09e95]'
              }`}>
                Academic Integrity Guaranteed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
