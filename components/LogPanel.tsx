
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Scroll, Sparkles, ChevronDown, Activity } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
  onGenerateHistory: () => void;
  isGenerating: boolean;
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onGenerateHistory, isGenerating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogStyle = (type: LogEntry['type']) => {
      switch (type) {
          case 'ai':
              return 'text-purple-300 border-l-2 border-purple-500 pl-2';
          case 'crisis':
              return 'text-red-400 font-bold border-l-2 border-red-500 pl-2';
          case 'warning':
              return 'text-orange-300 border-l-2 border-orange-500 pl-2';
          case 'tech':
              return 'text-cyan-300 border-l-2 border-cyan-500 pl-2';
          default:
              return 'text-gray-300';
      }
  };

  return (
    <div className="w-full h-[160px] bg-gray-900 border-t border-gray-700 flex flex-col shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700 text-xs">
         <div className="flex items-center gap-2 text-gray-400 font-cinzel font-bold">
            <Activity size={14} />
            İmparatorluk Günlükleri
         </div>
         <button
            onClick={onGenerateHistory}
            disabled={isGenerating}
            className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 text-[10px] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <Sparkles size={12} />
            {isGenerating ? 'Yazılıyor...' : 'Tarihi Yaz'}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-2 bg-black/40">
        {logs.length === 0 && (
            <div className="text-gray-600 italic text-xs">Henüz bir kayıt yok...</div>
        )}
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`py-1 animate-fade-in ${getLogStyle(log.type)}`}
          >
            <span className="text-gray-600 text-[10px] mr-3 select-none">[{log.timestamp}]</span>
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
