import React, { useState, useEffect, useRef } from 'react';
import { 
  Table as TableIcon, 
  BarChart2, 
  LineChart as LineIcon, 
  PieChart as PieIcon, 
  Layers, 
  Calendar, 
  Activity, 
  Award, 
  Sparkles, 
  Maximize2, 
  Eye, 
  Code, 
  Search, 
  ArrowUpDown, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Image as ImageIcon, 
  FileText, 
  HelpCircle,
  Clock,
  Play,
  Heart,
  Brain,
  Info,
  Compass,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import MermaidRenderer from './MermaidRenderer';

// Define exported types
export interface EducationalBlock {
  id: string;
  type: 'TEXT' | 'TABLE' | 'CHART' | 'DIAGRAM' | 'IMAGE' | 'TIMELINE' | 'FLOWCHART' | 'MINDMAP' | 'QUIZ' | 'NOTES';
  rawCode: string;
  parsedData?: any;
}

/**
 * -------------------------------------------------------------
 * 1. COMPREHENSIVE TEXT BLOCK PARSER
 * -------------------------------------------------------------
 */
export function parseEducationalContent(content: string, messageId: string): EducationalBlock[] {
  if (!content) return [];

  const blocks: EducationalBlock[] = [];
  
  // RegEx to find ANY markdown block that matches our special tags
  const blockRegex = /```(educational_table|educational_chart|json_visualization|educational_diagram|educational_image|educational_timeline|educational_quiz|educational_notes|educational_flowchart|educational_mindmap|mermaid)\s*([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match;
  let blockCounter = 0;

  while ((match = blockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      blocks.push({
        id: `${messageId}-block-text-${blockCounter++}`,
        type: 'TEXT',
        rawCode: textBefore.trim()
      });
    }

    const tag = match[1].toLowerCase();
    const rawCode = match[2].trim();
    
    let type: EducationalBlock['type'] = 'TEXT';
    let parsedData: any = undefined;

    try {
      if (tag === 'educational_table') {
        type = 'TABLE';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_chart' || tag === 'json_visualization') {
        type = 'CHART';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_diagram') {
        type = 'DIAGRAM';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_image') {
        type = 'IMAGE';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_timeline') {
        type = 'TIMELINE';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_quiz') {
        type = 'QUIZ';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_notes') {
        type = 'NOTES';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_flowchart') {
        type = 'FLOWCHART';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'educational_mindmap') {
        type = 'MINDMAP';
        parsedData = JSON.parse(rawCode);
      } else if (tag === 'mermaid') {
        const isMindmap = rawCode.toLowerCase().includes('mindmap');
        type = isMindmap ? 'MINDMAP' : 'FLOWCHART';
      }
    } catch (e) {
      console.error(`[Output Engine] Failed to parse JSON for tag: ${tag}`, e);
      type = 'TEXT';
      blocks.push({
        id: `${messageId}-block-error-${blockCounter++}`,
        type: 'TEXT',
        rawCode: `*Failed to render interactive ${tag}. Showing raw data fallback:*\n\n\`\`\`json\n${rawCode}\n\`\`\``
      });
      lastIndex = blockRegex.lastIndex;
      continue;
    }

    if (type !== 'TEXT') {
      blocks.push({
        id: `${messageId}-block-${tag}-${blockCounter++}`,
        type,
        rawCode,
        parsedData
      });
    }

    lastIndex = blockRegex.lastIndex;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter.trim()) {
    blocks.push({
      id: `${messageId}-block-text-${blockCounter++}`,
      type: 'TEXT',
      rawCode: textAfter.trim()
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      id: `${messageId}-block-text-0`,
      type: 'TEXT',
      rawCode: content
    });
  }

  return blocks;
}

/**
 * -------------------------------------------------------------
 * 2. COMPONENT BLOCK RENDERERS
 * -------------------------------------------------------------
 */

// Elegant generic wrapper with Fullscreen, Source views, and beautiful IRA styling
interface BlockFrameProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  darkMode: boolean;
  rawCode: string;
  children: React.ReactNode;
}

function BlockFrame({ title, subtitle, icon, darkMode, rawCode, children }: BlockFrameProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'source'>('canvas');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerClass = isFullscreen
    ? `fixed inset-4 sm:inset-10 z-50 flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-[#141413] ${
        darkMode ? 'border-neutral-800 text-white' : 'border-neutral-300 text-black'
      }`
    : `w-full rounded-2xl border overflow-hidden transition-all duration-300 mb-6 ${
        darkMode ? 'border-neutral-800/60 bg-[#1c1b18]/60 shadow-black/10' : 'border-neutral-200/50 bg-white/70 shadow-neutral-100/50'
      } backdrop-blur-xs`;

  return (
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div className={containerClass}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b text-xs transition-all ${
          darkMode ? 'bg-[#1c1b18] border-neutral-800/60' : 'bg-white border-neutral-200/50'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-dashed border-neutral-500/20">
              {icon}
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-neutral-800 dark:text-[#faf9f5] tracking-tight">{title}</h4>
              <span className={`text-[10px] uppercase font-mono tracking-widest ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex p-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-900/60">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`p-1.5 px-3 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'canvas'
                    ? (darkMode ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs')
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Canvas</span>
              </button>
              <button
                onClick={() => setActiveTab('source')}
                className={`p-1.5 px-3 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'source'
                    ? (darkMode ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs')
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Data</span>
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 border rounded-full transition-all cursor-pointer ${
                darkMode ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-500'
              }`}
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className={`p-5 flex-1 flex flex-col justify-center transition-colors min-h-[220px] ${
          darkMode ? 'bg-[#141413]/30' : 'bg-neutral-50/[0.15]'
        }`}>
          {activeTab === 'canvas' ? (
            children
          ) : (
            <div className="rounded-xl border p-4 font-mono text-[10px] leading-relaxed overflow-x-auto whitespace-pre bg-[#1a1916] text-[#f7f6f0] border-neutral-800/40">
              <code className="block">{rawCode}</code>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 2.1. TABLE RENDERER
interface TableData {
  title: string;
  headers: string[];
  columns: string[];
  data: any[];
  caption?: string;
  source?: string;
}

function TableRenderer({ parsedData, rawCode, darkMode }: { parsedData: TableData; rawCode: string; darkMode: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { title = 'Educational Data Table', headers = [], columns = [], data = [], caption, source } = parsedData;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => 
        columns.some(col => String(row[col] ?? '').toLowerCase().includes(query))
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return sortConfig.direction === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return result;
  }, [data, searchQuery, sortConfig, columns]);

  return (
    <BlockFrame 
      title={title} 
      subtitle="Interactive Educational Matrix" 
      icon={<TableIcon className="w-4 h-4 text-emerald-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 rounded-xl text-xs border transition-all ${
                darkMode 
                  ? 'bg-[#141413] border-neutral-800 text-white focus:border-amber-500/50' 
                  : 'bg-white border-neutral-200 text-neutral-800 focus:border-amber-500/50'
              } focus:outline-none`}
            />
          </div>
          {caption && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 italic max-w-xs truncate">
              {caption}
            </span>
          )}
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto w-full max-h-[350px] rounded-xl border border-neutral-200/55 dark:border-neutral-800/60 shadow-xs">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs font-sans">
            <thead className={`${darkMode ? 'bg-[#141413]' : 'bg-neutral-50/70'} font-semibold font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400`}>
              <tr>
                {headers.map((header, idx) => {
                  const colKey = columns[idx];
                  return (
                    <th 
                      key={idx} 
                      onClick={() => colKey && handleSort(colKey)}
                      className={`px-5 py-3 cursor-pointer hover:bg-neutral-200/30 dark:hover:bg-neutral-800/30 transition-colors select-none`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{header}</span>
                        {colKey && <ArrowUpDown className="w-3 h-3 text-neutral-400 shrink-0" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={`divide-y divide-neutral-100 dark:divide-neutral-800/40 font-light ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>
              {filteredData.length > 0 ? (
                filteredData.map((row, rIdx) => (
                  <tr key={rIdx} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'}`}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-5 py-3 truncate max-w-[240px]" title={row[col]}>
                        {typeof row[col] === 'number' ? (
                          <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{row[col]}</span>
                        ) : (
                          row[col]?.toString() || '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-5 py-8 text-center text-xs text-neutral-400">
                    No matching educational data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Source Citation */}
        {source && (
          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans font-light flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Source Citation: <span className="italic font-medium">{source}</span>
          </div>
        )}
      </div>
    </BlockFrame>
  );
}

// 2.2. CHART RENDERER
interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'comparison';
  title: string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  data: any[];
  columns?: string[];
  headers?: string[];
  source?: string;
}

function ChartRenderer({ parsedData, rawCode, darkMode }: { parsedData: ChartData; rawCode: string; darkMode: boolean }) {
  const CHART_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f43f5e', '#14b8a6'];
  const { type = 'line', title = 'Educational Statistics', xAxisKey = 'name', yAxisKeys = ['value'], data = [], source } = parsedData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const titleText = label || payload[0].name;
      return (
        <div className={`p-3 rounded-xl border text-xs shadow-lg transition-all duration-200 ${
          darkMode 
            ? 'bg-[#1c1b18]/95 border-neutral-800/80 text-[#faf9f5]' 
            : 'bg-white/95 border-neutral-200/80 text-[#141413]'
        } backdrop-blur-md`}>
          <p className="font-semibold mb-1.5 font-sans border-b border-neutral-500/10 pb-1">{titleText}</p>
          {payload.map((pld: any, index: number) => {
            const percentValue = pld.percent !== undefined ? pld.percent : pld.payload?.percent;
            const percentText = percentValue !== undefined ? ` (${(percentValue * 100).toFixed(0)}%)` : '';
            return (
              <p key={index} className="font-mono flex items-center justify-between gap-4 text-[11px] py-0.5">
                <span className="flex items-center gap-1.5 font-light text-neutral-500 dark:text-neutral-400">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: pld.color || pld.fill }} />
                  {pld.name}:
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {pld.value}{percentText}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderChartLayout = () => {
    if (!data || data.length === 0) {
      return <div className="p-8 text-center text-neutral-400 text-xs">No chart points available.</div>;
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2924' : '#f0ede4'} />
              <XAxis dataKey={xAxisKey} stroke={darkMode ? '#8c8a7c' : '#8a887b'} fontSize={10} tickLine={false} />
              <YAxis stroke={darkMode ? '#8c8a7c' : '#8a887b'} fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} verticalAlign="bottom" height={32} />
              {yAxisKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2924' : '#f0ede4'} />
              <XAxis dataKey={xAxisKey} stroke={darkMode ? '#8c8a7c' : '#8a887b'} fontSize={10} tickLine={false} />
              <YAxis stroke={darkMode ? '#8c8a7c' : '#8a887b'} fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} verticalAlign="bottom" height={32} />
              {yAxisKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const firstKey = yAxisKeys[0] || 'value';
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey={firstKey}
                nameKey={xAxisKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="p-8 text-center text-neutral-400 text-xs">Unsupported chart style.</div>;
    }
  };

  return (
    <BlockFrame 
      title={title} 
      subtitle={`${type.charAt(0).toUpperCase() + type.slice(1)} Chart Visualization`} 
      icon={type === 'pie' ? <PieIcon className="w-4 h-4 text-amber-500" /> : type === 'bar' ? <BarChart2 className="w-4 h-4 text-emerald-500" /> : <LineIcon className="w-4 h-4 text-blue-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="flex flex-col gap-4 w-full">
        {renderChartLayout()}
        {source && (
          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans font-light flex items-center gap-1.5 border-t border-dashed border-neutral-200/40 dark:border-neutral-800/40 pt-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Source Database: <span className="italic font-medium">{source}</span>
          </div>
        )}
      </div>
    </BlockFrame>
  );
}

// 2.3. DIAGRAM RENDERER
interface DiagramLabel {
  id: string;
  name: string;
  description: string;
}

interface DiagramData {
  title: string;
  subject: string;
  labels: DiagramLabel[];
  summary: string;
  notes?: string;
}

function DiagramRenderer({ parsedData, rawCode, darkMode }: { parsedData: DiagramData; rawCode: string; darkMode: boolean }) {
  const { title = 'Anatomical Structure', subject = 'Concept Map', labels = [], summary, notes } = parsedData;
  const [activeLabelId, setActiveLabelId] = useState<string | null>(labels[0]?.id || null);

  const activeLabel = labels.find(l => l.id === activeLabelId);

  return (
    <BlockFrame 
      title={`${title} (${subject})`} 
      subtitle="Interactive Diagram Workbook" 
      icon={<Layers className="w-4 h-4 text-rose-500 animate-pulse" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
        {/* Schematic Mockup Container (with structural layout mapping) */}
        <div className="md:col-span-5 flex flex-col justify-between items-center p-6 border rounded-2xl bg-neutral-100/45 dark:bg-[#141413]/55 border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden min-h-[260px]">
          <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-wider text-neutral-400">
            <Activity className="w-3 h-3 text-red-500" />
            <span>Educational Workbench</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-6 w-full relative">
            <div className={`w-32 h-32 rounded-full border border-dashed flex flex-col items-center justify-center relative ${
              darkMode ? 'border-amber-500/35 bg-amber-500/5' : 'border-amber-500/25 bg-amber-500/[0.02]'
            }`}>
              <BookOpen className="w-8 h-8 text-amber-500 opacity-60 mb-1" />
              <span className="font-serif text-[11px] font-bold text-center px-3 text-neutral-600 dark:text-neutral-400">
                {subject}
              </span>

              {/* Hotspot Indicators */}
              {labels.map((lbl, idx) => {
                const angle = (idx / labels.length) * 2 * Math.PI;
                const radius = 64; // pixels distance from center
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                const isActive = lbl.id === activeLabelId;

                return (
                  <button
                    key={lbl.id}
                    onClick={() => setActiveLabelId(lbl.id)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                    className={`absolute w-6 h-6 rounded-full font-mono text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500 text-black shadow-lg scale-110 ring-4 ring-amber-500/20' 
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-amber-500 hover:text-black hover:scale-105'
                    }`}
                  >
                    {lbl.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans text-center px-4 leading-normal">
            Click hot spots or list items to isolate functional structures.
          </div>
        </div>

        {/* Details and Explanations Pane */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h5 className="font-serif font-bold text-sm text-neutral-800 dark:text-[#faf9f5]">Anatomical Component Explorer</h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">{summary}</p>

            {/* List selector */}
            <div className="flex flex-wrap gap-2 mt-2">
              {labels.map((lbl) => {
                const isActive = lbl.id === activeLabelId;
                return (
                  <button
                    key={lbl.id}
                    onClick={() => setActiveLabelId(lbl.id)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold' 
                        : 'bg-[#141413]/5 border-neutral-200 dark:border-neutral-800 dark:bg-white/[0.02] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center ${
                      isActive ? 'bg-amber-500 text-black' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400'
                    }`}>
                      {lbl.id}
                    </span>
                    <span>{lbl.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected detail panel */}
            <AnimatePresence mode="wait">
              {activeLabel && (
                <motion.div
                  key={activeLabel.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`mt-3 p-4 rounded-xl border ${
                    darkMode ? 'bg-[#141413]/80 border-amber-500/25' : 'bg-amber-500/[0.03] border-amber-500/15'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold mb-1 text-amber-600 dark:text-amber-400 font-sans">
                    <span>Component {activeLabel.id}:</span>
                    <span className="font-bold">{activeLabel.name}</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-light font-sans">
                    {activeLabel.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {notes && (
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans italic border-t border-dashed border-neutral-200/45 dark:border-neutral-800/45 pt-2">
              💡 Key Study Note: {notes}
            </div>
          )}
        </div>
      </div>
    </BlockFrame>
  );
}

// 2.4. IMAGE RENDERER
interface ImageLabel {
  x: number;
  y: number;
  label: string;
  description: string;
}

interface ImageData {
  title: string;
  prompt: string;
  fallbackMessage: string;
  imageUrl?: string;
  interactiveLabels?: ImageLabel[];
}

function ImageRenderer({ parsedData, rawCode, darkMode }: { parsedData: ImageData; rawCode: string; darkMode: boolean }) {
  const { title = 'Concept Illustration', prompt, fallbackMessage, imageUrl, interactiveLabels = [] } = parsedData;
  const [renderedUrl, setRenderedUrl] = useState<string | null>(imageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLabel, setActiveLabel] = useState<ImageLabel | null>(null);

  const generateAcademicAsset = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ira_token');
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt, title })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setRenderedUrl(data.imageUrl);
      } else {
        // Fallback Unsplash image if response lacks imageUrl
        setRenderedUrl(`https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800`);
      }
    } catch (err) {
      console.error("[ImageRenderer] On-demand image generation error:", err);
      setRenderedUrl(`https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlockFrame 
      title={title} 
      subtitle="Interactive Schematic Illustration" 
      icon={<ImageIcon className="w-4 h-4 text-violet-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/40 dark:bg-[#141413]/60 min-h-[250px] flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <span className="text-xs font-semibold text-neutral-800 dark:text-[#faf9f5] block">Generating Visual Asset...</span>
                <span className="text-[10px] text-neutral-400 block mt-1">Refining resolution & rendering anatomical layers</span>
              </div>
            </div>
          ) : renderedUrl ? (
            <div className="w-full relative flex flex-col items-center">
              <img 
                src={renderedUrl} 
                alt={title}
                className="max-h-[300px] object-cover rounded-xl shadow-md w-full"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay labels overlay on image */}
              {interactiveLabels.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveLabel(item)}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                    activeLabel?.label === item.label
                      ? 'bg-amber-500 text-black scale-110 ring-4 ring-amber-500/30'
                      : 'bg-black/75 text-white hover:bg-amber-500 hover:text-black'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center max-w-sm flex flex-col items-center justify-center py-6">
              <div className="p-3.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-3 text-violet-500">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h5 className="font-serif font-bold text-sm text-neutral-800 dark:text-[#faf9f5] mb-1">Illustration Layer Ready</h5>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-4">
                {fallbackMessage || "An academic artwork layer is ready for generation. Start the render to view the complete diagram."}
              </p>
              <button
                onClick={generateAcademicAsset}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Render Illustration Block</span>
              </button>
            </div>
          )}
        </div>

        {/* Selected Image Label Detail */}
        {activeLabel && (
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-[#141413]/70 border-violet-500/20' : 'bg-violet-500/[0.02] border-violet-500/10'}`}>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 block mb-1">
              Isolated Layer: {activeLabel.label}
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
              {activeLabel.description}
            </p>
          </div>
        )}
      </div>
    </BlockFrame>
  );
}

// 2.5. TIMELINE RENDERER
interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type?: 'major' | 'minor';
}

interface TimelineData {
  title: string;
  events: TimelineEvent[];
  summary: string;
}

function TimelineRenderer({ parsedData, rawCode, darkMode }: { parsedData: TimelineData; rawCode: string; darkMode: boolean }) {
  const { title = 'Chronological Roadmap', events = [], summary } = parsedData;

  return (
    <BlockFrame 
      title={title} 
      subtitle="Interactive Academic Timeline" 
      icon={<Calendar className="w-4 h-4 text-blue-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="flex flex-col gap-5 w-full font-sans">
        {summary && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed border-b border-neutral-200/40 dark:border-neutral-800/40 pb-3">
            {summary}
          </p>
        )}

        <div className="relative pl-6 border-l-2 border-dashed border-neutral-300 dark:border-neutral-800 space-y-6 py-2">
          {events.map((evt, idx) => {
            const isMajor = evt.type === 'major' || !evt.type;
            return (
              <div key={idx} className="relative group transition-all">
                {/* Dotted Marker */}
                <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isMajor 
                    ? 'bg-amber-500 border-amber-500 group-hover:scale-110' 
                    : 'bg-white dark:bg-[#141413] border-blue-400'
                }`} />

                {/* Event card content */}
                <div className={`p-4 rounded-xl border transition-all ${
                  darkMode 
                    ? 'bg-[#1c1b18] border-neutral-800/80 hover:bg-[#1c1b18] hover:border-neutral-700/80' 
                    : 'bg-white border-neutral-200/50 hover:border-neutral-300/80 hover:shadow-xs'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      {evt.date}
                    </span>
                    {isMajor && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[8px] font-mono uppercase font-bold tracking-widest shrink-0 self-start sm:self-center">
                        Key Milestone
                      </span>
                    )}
                  </div>
                  <h5 className="font-serif font-bold text-xs text-neutral-800 dark:text-[#faf9f5] mb-1">
                    {evt.title}
                  </h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                    {evt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BlockFrame>
  );
}

// 2.6. QUIZ RENDERER (Interactive Micro Assessment MCQ)
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

function QuizRenderer({ parsedData, rawCode, darkMode }: { parsedData: QuizData; rawCode: string; darkMode: boolean }) {
  const { title = 'Active Retrieval practice', questions = [] } = parsedData;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = questions[currentIdx];

  const handleOptionClick = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedIdx(optIdx);
  };

  const handleVerifyAnswer = () => {
    if (selectedIdx === null || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedIdx === activeQuestion.answerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <BlockFrame 
      title={title} 
      subtitle="Intelligent Assessment Suite" 
      icon={<Award className="w-4 h-4 text-amber-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="flex flex-col gap-4 w-full font-sans">
        {quizFinished ? (
          <div className="text-center py-6 flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 animate-bounce">
              <Award className="w-10 h-10" />
            </div>
            <h5 className="font-serif font-bold text-lg text-neutral-800 dark:text-[#faf9f5]">Micro-Quiz Completed!</h5>
            <p className="text-xs text-neutral-400 mt-1 mb-4">Great work actively reinforcing your memory retrieval limits.</p>
            
            <div className="mb-6">
              <span className="text-4xl font-mono font-bold text-amber-500">
                {((score / questions.length) * 100).toFixed(0)}%
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mt-1">
                Score: {score} of {questions.length} Correct
              </span>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Assessment</span>
            </button>
          </div>
        ) : activeQuestion ? (
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-neutral-400 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-2.5">
              <span>Retrieval Question {currentIdx + 1} of {questions.length}</span>
              <span className="font-semibold text-amber-500">Current Score: {score}</span>
            </div>

            {/* Question Text */}
            <h5 className="font-serif font-bold text-sm text-neutral-800 dark:text-[#faf9f5] leading-relaxed">
              {activeQuestion.question}
            </h5>

            {/* Options list */}
            <div className="space-y-2 mt-2">
              {activeQuestion.options.map((option, optIdx) => {
                const isSelected = selectedIdx === optIdx;
                const isCorrect = optIdx === activeQuestion.answerIndex;
                const showSuccess = isAnswered && isCorrect;
                const showFailure = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(optIdx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-light flex items-center justify-between transition-all select-none ${
                      isAnswered
                        ? (isCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-medium' 
                            : (isSelected 
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400 font-medium' 
                                : 'bg-neutral-100 dark:bg-white/[0.01] border-neutral-200 dark:border-neutral-800/40 text-neutral-400 opacity-65'))
                        : (isSelected 
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400 font-medium ring-2 ring-amber-500/10' 
                            : 'bg-white dark:bg-white/[0.02] border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-white/[0.03] cursor-pointer')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center ${
                        isSelected 
                          ? 'bg-amber-500 text-black' 
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer feedback Explanation */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-3 p-4 rounded-xl border text-xs leading-relaxed ${
                    selectedIdx === activeQuestion.answerIndex
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-neutral-700 dark:text-neutral-300'
                      : 'bg-neutral-500/[0.02] border-neutral-200 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-neutral-800 dark:text-[#faf9f5]">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Academic Explanation</span>
                  </div>
                  <p className="font-light">{activeQuestion.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-end mt-4 border-t border-dashed border-neutral-200/40 dark:border-neutral-800/40 pt-4">
              {!isAnswered ? (
                <button
                  disabled={selectedIdx === null}
                  onClick={handleVerifyAnswer}
                  className={`px-4 py-2 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedIdx === null 
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed' 
                      : 'bg-amber-500 text-black hover:bg-amber-600 active:scale-95 shadow-md shadow-amber-500/5'
                  }`}
                >
                  <span>Submit Answer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-amber-500 text-black hover:bg-amber-600 active:scale-95 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/5 animate-pulse"
                >
                  <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Assessment'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-neutral-400">Loading quiz content...</div>
        )}
      </div>
    </BlockFrame>
  );
}

// 2.7. NOTES RENDERER
interface NoteSection {
  header: string;
  bullets: string[];
}

interface NotesData {
  title: string;
  sections: NoteSection[];
}

function NotesRenderer({ parsedData, rawCode, darkMode }: { parsedData: NotesData; rawCode: string; darkMode: boolean }) {
  const { title = 'Key Revision Notes', sections = [] } = parsedData;

  return (
    <BlockFrame 
      title={title} 
      subtitle="Study Review Sheet" 
      icon={<FileText className="w-4 h-4 text-amber-500" />} 
      darkMode={darkMode} 
      rawCode={rawCode}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {sections.map((sec, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
              darkMode 
                ? 'bg-[#1c1b18] border-neutral-800/80 hover:border-neutral-700/80' 
                : 'bg-white border-neutral-200/50 hover:border-neutral-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <h5 className="font-serif font-bold text-xs text-neutral-800 dark:text-[#faf9f5]">
                {sec.header}
              </h5>
            </div>

            <ul className="space-y-1.5 list-disc pl-4 text-xs font-light text-neutral-600 dark:text-neutral-300">
              {sec.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="leading-relaxed">
                  {/* Process formatting inline bold keywords natively */}
                  {bullet.split('**').map((text, sIdx) => 
                    sIdx % 2 === 1 ? <strong key={sIdx} className="font-semibold text-neutral-900 dark:text-white">{text}</strong> : text
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </BlockFrame>
  );
}

/**
 * -------------------------------------------------------------
 * 3. CORE UNIVERSAL OUTPUT ENGINE WRAPPER
 * -------------------------------------------------------------
 */
interface UniversalOutputEngineProps {
  messageId: string;
  content: string;
  darkMode: boolean;
  onRenderMarkdown: (text: string) => React.ReactNode;
}

export default function UniversalOutputEngine({ messageId, content, darkMode, onRenderMarkdown }: UniversalOutputEngineProps) {
  const [blocks, setBlocks] = useState<EducationalBlock[]>([]);

  useEffect(() => {
    setBlocks(parseEducationalContent(content, messageId));
  }, [content, messageId]);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {blocks.map((block) => {
        switch (block.type) {
          case 'TABLE':
            return (
              <div key={block.id} className="w-full">
                <TableRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );
          
          case 'CHART':
            return (
              <div key={block.id} className="w-full">
                <ChartRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'DIAGRAM':
            return (
              <div key={block.id} className="w-full">
                <DiagramRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'IMAGE':
            return (
              <div key={block.id} className="w-full">
                <ImageRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'TIMELINE':
            return (
              <div key={block.id} className="w-full">
                <TimelineRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'FLOWCHART':
            return (
              <div key={block.id} className="w-full">
                <BlockFrame 
                  title="Process Flow diagram" 
                  subtitle="System/State Workflow" 
                  icon={<Layers className="w-4 h-4 text-emerald-500 animate-pulse" />} 
                  darkMode={darkMode} 
                  rawCode={block.rawCode}
                >
                  <MermaidRenderer chart={block.rawCode} id={block.id} darkMode={darkMode} />
                </BlockFrame>
              </div>
            );

          case 'MINDMAP':
            return (
              <div key={block.id} className="w-full">
                <BlockFrame 
                  title="Conceptual Mindmap" 
                  subtitle="Logical hierarchy tree" 
                  icon={<BookOpen className="w-4 h-4 text-amber-500 animate-pulse" />} 
                  darkMode={darkMode} 
                  rawCode={block.rawCode}
                >
                  <MermaidRenderer chart={block.rawCode} id={block.id} darkMode={darkMode} />
                </BlockFrame>
              </div>
            );

          case 'QUIZ':
            return (
              <div key={block.id} className="w-full">
                <QuizRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'NOTES':
            return (
              <div key={block.id} className="w-full">
                <NotesRenderer parsedData={block.parsedData} rawCode={block.rawCode} darkMode={darkMode} />
              </div>
            );

          case 'TEXT':
          default:
            return (
              <div key={block.id} className="w-full">
                {onRenderMarkdown(block.rawCode)}
              </div>
            );
        }
      })}
    </div>
  );
}
