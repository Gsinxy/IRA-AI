import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "loose",
    fontFamily: "Inter, sans-serif",
  });
} catch (e) {
  console.error("Mermaid initialization failed:", e);
}

interface MermaidRendererProps {
  chart: string;
  id: string;
  darkMode: boolean;
}

export default function MermaidRenderer({ chart, id, darkMode }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function draw() {
      try {
        setError(null);
        // Normalize any weird characters and trim
        const cleanChart = chart.trim();
        
        // Render asynchronously
        const uniqueId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);
        
        if (active) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        // Extract a clean error message if possible
        if (active) {
          setError(err?.message || "Failed to render concept diagram. Check Mermaid syntax.");
        }
      }
    }

    draw();

    return () => {
      active = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400 text-xs">
        <div className="flex items-center gap-2 mb-1.5 font-semibold">
          <span>⚠️ Diagram Render Error</span>
        </div>
        <p className="font-light leading-relaxed mb-2">Mermaid diagram compilation failed. See code below:</p>
        <pre className="p-3 bg-black/5 dark:bg-white/5 rounded-lg font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-neutral-400 dark:text-neutral-500 text-xs gap-2">
        <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-500 rounded-full animate-spin" />
        <span>Generating Concept Diagram...</span>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden flex flex-col items-center rounded-xl border p-4 sm:p-6 transition-colors shadow-2xs ${
      darkMode 
        ? "bg-[#1c1b18] border-neutral-800/60" 
        : "bg-white border-neutral-200/50"
    }`}>
      <div 
        className="w-full overflow-x-auto flex justify-center py-2" 
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
}
