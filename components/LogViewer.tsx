import React from 'react';

interface LogViewerProps {
  logs: string;
  highlightKeyword?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, highlightKeyword }) => {
  const lines = logs.split('\n');

  return (
    <div className="h-full w-full bg-[#0d1117] rounded-lg border border-slate-700 overflow-hidden flex flex-col font-mono text-xs md:text-sm shadow-inner">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <span className="text-slate-400 font-medium">Raw Logs</span>
        <span className="text-xs text-slate-500">{lines.length} lines</span>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar whitespace-pre">
        {lines.map((line, i) => {
          let className = "text-slate-300 py-0.5 px-1 rounded hover:bg-slate-800/50 block";
          if (line.includes('[ERROR]')) className = "text-rose-400 bg-rose-950/30 py-0.5 px-1 rounded block border-l-2 border-rose-500";
          if (line.includes('[WARN]')) className = "text-amber-400 py-0.5 px-1 rounded block";
          
          // Basic highlighting of related terms if provided (e.g., ID)
          const isHighlighted = highlightKeyword && line.includes(highlightKeyword);
          
          return (
            <div key={i} className={`${className} ${isHighlighted ? 'bg-slate-700' : ''}`}>
              <span className="text-slate-600 select-none mr-3 w-6 inline-block text-right">{i + 1}</span>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogViewer;
