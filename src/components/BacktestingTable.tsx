import React, { useState } from 'react';
import { Database, Filter, ScatterChart, Table as TableIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { HistoricalFreightRecord, StateCode } from '../types/freight';
import { MOCK_HISTORICAL_DATASET } from '../data/historicalDataset';
import { formatCurrency } from '../utils/freightCalculator';

interface BacktestingTableProps {
  currentDestinationState: StateCode;
}

export const BacktestingTable: React.FC<BacktestingTableProps> = ({ currentDestinationState }) => {
  const [filterState, setFilterState] = useState<string>('all');
  const [onlyWithinMargin, setOnlyWithinMargin] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'scatter'>('table');

  const filteredRecords = MOCK_HISTORICAL_DATASET.filter((record) => {
    if (filterState === 'current' && record.destinationState !== currentDestinationState) {
      return false;
    }
    if (filterState !== 'all' && filterState !== 'current' && record.destinationState !== filterState) {
      return false;
    }
    if (onlyWithinMargin && !record.isWithinMargin5) {
      return false;
    }
    return true;
  });

  const totalFiltered = filteredRecords.length;
  const withinMarginCount = filteredRecords.filter((r) => r.isWithinMargin5).length;
  const actualHitRate = totalFiltered > 0 ? ((withinMarginCount / totalFiltered) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Backtesting: Validação em Fretes Reais (Base Agrária)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparativo empírico entre os valores reais faturados e a estimativa calculada pelo CatBoost.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('scatter')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition flex items-center gap-1.5 ${
                viewMode === 'scatter' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScatterChart className="w-3.5 h-3.5" />
              <span>Dispersão Real vs Previsto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filtro:</span>
          </span>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="all">Todos os Estados</option>
            <option value="current">Apenas Estado Atual ({currentDestinationState})</option>
            <option value="PR">Apenas Paraná (PR)</option>
            <option value="SP">Apenas São Paulo (SP)</option>
            <option value="SC">Apenas Santa Catarina (SC)</option>
            <option value="RS">Apenas Rio Grande do Sul (RS)</option>
            <option value="MT">Apenas Mato Grosso (MT)</option>
          </select>

          <button
            onClick={() => setOnlyWithinMargin(!onlyWithinMargin)}
            className={`px-2.5 py-1 rounded-lg border text-xs transition ${
              onlyWithinMargin
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Apenas dentro da margem ±5%
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">
            Amostras:{' '}
            <strong className="text-white">
              {totalFiltered}/{MOCK_HISTORICAL_DATASET.length}
            </strong>
          </span>
          <span className="text-slate-400">
            Acurácia (≤ ±5%):{' '}
            <strong className="text-emerald-400">{actualHitRate}%</strong>
          </span>
        </div>
      </div>

      {/* View: Table Mode */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Cód. Frete</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Destino</th>
                <th className="py-2.5 px-3">Carga & Peso</th>
                <th className="py-2.5 px-3">Veículo</th>
                <th className="py-2.5 px-3 text-right">Valor Real Pago</th>
                <th className="py-2.5 px-3 text-right">Valor Previsto</th>
                <th className="py-2.5 px-3 text-right">Desvio</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {filteredRecords.map((item) => {
                const isExact = Math.abs(item.errorPercent) <= 2;
                const isWithin5 = Math.abs(item.errorPercent) <= 5;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{item.id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-200 font-sans">{item.destinationCity}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-slate-200">{item.cargoName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(item.weightKg / 1000).toFixed(1)} toneladas
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans capitalize">{item.vehicle}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      {formatCurrency(item.actualPaidTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatCurrency(item.predictedTotal)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isExact
                          ? 'text-emerald-400'
                          : isWithin5
                          ? 'text-emerald-300'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.errorPercent > 0 ? `+${item.errorPercent.toFixed(1)}%` : `${item.errorPercent.toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                          isExact
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isWithin5
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isWithin5 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* View: Scatter Plot Mode */
        <div className="space-y-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>
              Gráfico de Dispersão: <strong>Valor Real Pago (Eixo X)</strong> vs{' '}
              <strong>Valor Previsto (Eixo Y)</strong>
            </span>
            <span className="text-emerald-400 font-mono">Linha diagonal tracejada = Acerto Perfeito (1:1)</span>
          </div>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800">
            <svg viewBox="0 0 600 240" className="w-full h-60">
              {/* Axes and grid */}
              <line x1="50" y1="20" x2="50" y2="210" stroke="#334155" strokeWidth="1" />
              <line x1="50" y1="210" x2="570" y2="210" stroke="#334155" strokeWidth="1" />

              {/* 45 degree diagonal line (perfect prediction) */}
              <line
                x1="50"
                y1="210"
                x2="550"
                y2="20"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.7"
              />

              {/* Scatter points */}
              {filteredRecords.map((r) => {
                const minVal = 2000;
                const maxVal = 25000;
                const cx = 50 + ((r.actualPaidTotal - minVal) / (maxVal - minVal)) * 500;
                const cy = 210 - ((r.predictedTotal - minVal) / (maxVal - minVal)) * 190;
                const isWithin5 = r.isWithinMargin5;

                return (
                  <g key={r.id}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5"
                      fill={isWithin5 ? '#10b981' : '#f59e0b'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:r-7 transition-all"
                    >
                      <title>{`${r.id} (${r.destinationCity}): Real ${formatCurrency(r.actualPaidTotal)} | Previsto ${formatCurrency(r.predictedTotal)} (Erro: ${r.errorPercent}%)`}</title>
                    </circle>
                  </g>
                );
              })}

              {/* Labels */}
              <text x="300" y="235" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
                Valor Real Faturado (R$)
              </text>
              <text
                x="15"
                y="115"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                transform="rotate(-90 15 115)"
              >
                Valor Previsto (R$)
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
