import React from 'react';
import { Truck, RotateCcw, FileText, BarChart3, Sliders, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenReport: () => void;
  activeTab: 'simulador' | 'acuracia' | 'historico' | 'diesel' | 'pedagio';
  setActiveTab: (tab: 'simulador' | 'acuracia' | 'historico' | 'diesel' | 'pedagio') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenReport,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Truck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Agrária Fretes ML
          </span>
        </div>

        {/* Zone 2: Navigation Links (interactive filter/view tabs) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('simulador')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'simulador'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulador</span>
          </button>

          <button
            onClick={() => setActiveTab('diesel')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'diesel'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⛽ Diesel ANP</span>
          </button>

          <button
            onClick={() => setActiveTab('pedagio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'pedagio'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛣️ Pedágio & IPCA</span>
          </button>

          <button
            onClick={() => setActiveTab('acuracia')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'acuracia'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chance de Acerto</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'historico'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Backtesting Histórico</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
            title="Redefinir parâmetros padrão"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-emerald-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatório de Negociação</span>
          </button>
        </div>
      </div>
    </header>
  );
};
