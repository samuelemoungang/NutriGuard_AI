'use client';

import { useEffect, useRef } from 'react';
import { TerminalLog } from '@/types';

interface TerminalUIProps {
  title: string;
  logs: TerminalLog[];
  isProcessing?: boolean;
}

export default function TerminalUI({ title, logs, isProcessing = false }: TerminalUIProps) {
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'processing':
        return 'text-cyan-400';
      default:
        return 'text-slate-300';
    }
  };

  const getLogPrefix = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success':
        return '[OK]';
      case 'warning':
        return '[WARN]';
      case 'error':
        return '[ERR]';
      case 'processing':
        return '[...]';
      default:
        return '[i]';
    }
  };

  return (
    <div className="terminal-window w-full">
      <div className="terminal-header flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="terminal-dot bg-red-500"></div>
          <div className="terminal-dot bg-yellow-500"></div>
          <div className="terminal-dot bg-green-500"></div>
        </div>
        <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-slate-400 font-mono truncate max-w-[150px] sm:max-w-none">{title}</span>
        {isProcessing && (
          <span className="ml-auto flex items-center gap-1 sm:gap-2 text-cyan-400 text-xs sm:text-sm">
            <span className="animate-pulse">●</span>
            <span className="hidden sm:inline">Processing...</span>
          </span>
        )}
      </div>
      <div ref={terminalBodyRef} className="terminal-body min-h-[150px] sm:min-h-[200px] max-h-[250px] sm:max-h-[400px]">
        {logs.length === 0 ? (
          <div className="text-slate-500 font-mono text-xs sm:text-sm">
            <span className="text-cyan-400">$</span> Waiting for input...
            <span className="animate-pulse">_</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="font-mono text-xs sm:text-sm mb-1.5 sm:mb-2 flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
              <span className="text-slate-600 text-xs hidden sm:inline">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={`${getLogColor(log.type)} font-semibold shrink-0`}>
                {getLogPrefix(log.type)}
              </span>
              <span className={`${getLogColor(log.type)} break-words`}>{log.message}</span>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="font-mono text-xs sm:text-sm text-cyan-400 flex items-center gap-2">
            <span className="animate-spin">⟳</span>
            <span>Agent is reasoning...</span>
          </div>
        )}
      </div>
    </div>
  );
}
