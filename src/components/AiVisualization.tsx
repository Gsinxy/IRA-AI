import React, { useState } from 'react';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Table, 
  Network, 
  Eye, 
  Code,
  Sparkles,
  Maximize2
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
import MermaidRenderer from './MermaidRenderer';

interface VisualData {
  type: 'line' | 'bar' | 'pie' | 'comparison';
  title: string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  data?: any[];
  columns?: string[];
  headers?: string[];
}

interface AiVisualizationProps {
  id: string;
  type: 'chart' | 'mermaid';
  rawCode: string;
  parsedData?: VisualData;
  darkMode: boolean;
}

export default function AiVisualization({ id, type, rawCode, parsedData, darkMode }: AiVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Elegant colors matching IRA AI aesthetic
  const CHART_COLORS = [
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#f43f5e', // rose-500
    '#14b8a6', // teal-500
  ];

  const renderChart = () => {
    if (!parsedData) return null;

    const { type: chartType, data = [], xAxisKey = 'name', yAxisKeys = ['value'] } = parsedData;

    if (data.length === 0) {
      return (
        <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-xs">
          No structured data points available for this chart.
        </div>
      );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        // For pie chart, label is empty/index, we can use pld.name as the primary identifier
        const titleText = label || payload[0].name;
        return (
          <div className={`p-3 rounded-xl border text-xs shadow-lg transition-all duration-200 ${
            darkMode 
              ? 'bg-[#1c1b18]/95 border-neutral-800/80 text-[#faf9f5]' 
              : 'bg-white/95 border-neutral-200/80 text-[#141413]'
          } backdrop-blur-md`}>
            <p className="font-semibold mb-1.5 font-sans border-b border-neutral-500/10 pb-1">{titleText}</p>
            {payload.map((pld: any, index: number) => {
              // Safely obtain percentage if present (especially in Pie charts)
              const percentValue = pld.percent !== undefined ? pld.percent : pld.payload?.percent;
              const percentText = percentValue !== undefined 
                ? ` (${(percentValue * 100).toFixed(0)}%)` 
                : '';
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

    let chartElement = null;

    switch (chartType) {
      case 'line':
        chartElement = (
          <div className="h-[320px] w-full" id={`line-chart-${id}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2924' : '#f0ede4'} />
                <XAxis 
                  dataKey={xAxisKey} 
                  stroke={darkMode ? '#8c8a7c' : '#8a887b'} 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke={darkMode ? '#8c8a7c' : '#8a887b'} 
                  fontSize={10} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                  verticalAlign="bottom"
                  height={32}
                />
                {yAxisKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3, strokeWidth: 1 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        break;

      case 'bar':
        chartElement = (
          <div className="h-[320px] w-full" id={`bar-chart-${id}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2a2924' : '#f0ede4'} />
                <XAxis 
                  dataKey={xAxisKey} 
                  stroke={darkMode ? '#8c8a7c' : '#8a887b'} 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke={darkMode ? '#8c8a7c' : '#8a887b'} 
                  fontSize={10} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                  verticalAlign="bottom"
                  height={32}
                />
                {yAxisKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        break;

      case 'pie':
        const firstKey = yAxisKeys[0] || 'value';
        chartElement = (
          <div className="h-[320px] w-full flex items-center justify-center font-sans text-xs" id={`pie-chart-${id}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey={firstKey}
                  nameKey={xAxisKey}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        break;

      case 'comparison':
        const columns = parsedData.columns || (data[0] ? Object.keys(data[0]) : []);
        const headers = parsedData.headers || columns.map(c => c.charAt(0).toUpperCase() + c.slice(1));
        
        chartElement = (
          <div className="overflow-x-auto w-full max-h-[280px] rounded-xl border border-neutral-200/55 dark:border-neutral-800/60 shadow-xs" id={`comparison-table-${id}`}>
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs font-sans">
              <thead className={`${darkMode ? 'bg-[#141413]' : 'bg-neutral-50/70'} font-semibold font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400`}>
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} scope="col" className="px-5 py-3.5">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y divide-neutral-100 dark:divide-neutral-800/40 font-light ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>
                {data.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.01]'}`}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-5 py-3 truncate max-w-[200px]" title={row[col]}>
                        {typeof row[col] === 'number' ? (
                          <span className="font-mono font-medium">{row[col]}</span>
                        ) : (
                          row[col]?.toString() || '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;

      default:
        return null;
    }

    // Extract potential source or default
    const sourceText = (parsedData as any).source || (parsedData as any).attribution;

    return (
      <div className="flex flex-col w-full">
        {chartElement}
        {sourceText && (
          <div className="mt-3.5 text-center border-t border-dashed border-neutral-200/40 dark:border-neutral-800/40 pt-3">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans font-light tracking-wide inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 inline-block" />
              Source Attribution: {sourceText}
            </span>
          </div>
        )}
      </div>
    );
  };

  const visualHeader = () => {
    let icon = <Network className="w-4 h-4 text-amber-500 animate-pulse" />;
    let typeName = "Concept Diagram";

    if (type === 'chart' && parsedData) {
      typeName = `${parsedData.type.charAt(0).toUpperCase() + parsedData.type.slice(1)} Chart`;
      if (parsedData.type === 'line') icon = <LineChartIcon className="w-4 h-4 text-blue-500" />;
      if (parsedData.type === 'bar') icon = <BarChartIcon className="w-4 h-4 text-emerald-500" />;
      if (parsedData.type === 'pie') icon = <PieChartIcon className="w-4 h-4 text-amber-500" />;
      if (parsedData.type === 'comparison') {
        icon = <Table className="w-4 h-4 text-rose-500" />;
        typeName = "Comparison Matrix";
      }
    }

    const titleText = parsedData?.title || (type === 'mermaid' ? "Concept Flow & System Map" : "Knowledge Insight Map");

    return (
      <div className={`flex items-center justify-between px-5 py-3 border-b text-xs transition-all ${
        darkMode ? 'bg-[#1c1b18] border-neutral-800/60' : 'bg-white border-neutral-200/50'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-dashed border-neutral-500/20">
            {icon}
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-neutral-800 dark:text-[#faf9f5] tracking-tight">{titleText}</h4>
            <span className={`text-[10px] uppercase font-mono tracking-widest ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              AI-Generated {typeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tabs */}
          <div className="flex p-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-900/60">
            <button
              onClick={() => setActiveTab('visual')}
              className={`p-1.5 px-3 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'visual'
                  ? (darkMode ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs')
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`p-1.5 px-3 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'code'
                  ? (darkMode ? 'bg-neutral-800 text-white shadow-xs' : 'bg-white text-black shadow-xs')
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source</span>
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
    );
  };

  const fullContainerClass = isFullscreen
    ? `fixed inset-4 sm:inset-10 z-50 flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-[#141413] ${
        darkMode ? 'border-neutral-800 text-white' : 'border-neutral-300 text-black'
      }`
    : `w-full rounded-2xl border overflow-hidden transition-all duration-300 ${
        darkMode ? 'border-neutral-800/60 bg-[#1c1b18]/60 shadow-black/10' : 'border-neutral-200/50 bg-white/70 shadow-neutral-100/50'
      } backdrop-blur-xs`;

  return (
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      
      <div className={`${fullContainerClass} mb-4`}>
        {visualHeader()}

        <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-center transition-colors min-h-[220px] ${
          darkMode ? 'bg-[#141413]/30' : 'bg-neutral-50/[0.15]'
        }`}>
          {activeTab === 'visual' ? (
            type === 'mermaid' ? (
              <MermaidRenderer chart={rawCode} id={id} darkMode={darkMode} />
            ) : (
              renderChart()
            )
          ) : (
            <div className="rounded-xl border p-4 font-mono text-[10px] leading-relaxed overflow-x-auto whitespace-pre bg-[#1a1916] text-[#f7f6f0] border-neutral-800/40">
              <div className="flex justify-between items-center pb-2 border-b border-[#31302b] mb-3 text-[9px] text-[#706e64] uppercase tracking-wider">
                <span>Format: {type === 'mermaid' ? 'Mermaid Syntax' : 'Structured JSON Schema'}</span>
                <span>Ready to Edit</span>
              </div>
              <code className="block">{rawCode}</code>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
