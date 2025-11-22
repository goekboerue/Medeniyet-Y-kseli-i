import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Scroll, Sparkles } from 'lucide-react';

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
              return 'bg-purple-900/20 border border-purple-700/30 text-purple-100';
          case 'crisis':
              return 'bg-red-900/20 border border-red-700/30 text-red-200 font-semibold';
          case 'warning':
              return 'bg-orange-900/20 border border-orange-700/30 text-orange-200 font-mono text-xs';
          default:
              return 'bg-gray-800 border border-gray-700 text-gray-300';
      }
  };

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-xl flex flex-col h-[400px] lg:h-full sticky top-4 shadow-2xl backdrop-blur-sm">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 rounded-t-xl flex justify-between items-center">
        <h2 className="text-lg font-cinzel font-bold text-gray-200 flex items-center gap-2">
          <Scroll size={18} />
          Medeniyet Tarihçesi
        </h2>
        <button
          onClick={onGenerateHistory}
          disabled={isGenerating}
          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 text-xs text-white rounded-lg flex items-center gap-1 transition-all shadow-lg hover:shadow-purple-500/20"
        >
          <Sparkles size={14} />
          {isGenerating ? 'Yazılıyor...' : 'Tarihi Yaz'}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 && (
            <div className="text-gray-500 text-center italic mt-10">Henüz bir tarih yazılmadı...</div>
        )}
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`p-3 rounded-lg text-sm leading-relaxed animate-fade-in ${getLogStyle(log.type)}`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1 font-mono">{log.timestamp}</div>
            {log.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};