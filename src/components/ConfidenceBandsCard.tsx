import React from 'react';
import { Target, TrendingDown, TrendingUp, Compass, ArrowRight } from 'lucide-react';
import { ConfidenceIntervals, FreightPredictionResult } from '../types/freight';
import { formatCurrency } from '../utils/freightCalculator';

interface ConfidenceBandsCardProps {
  prediction: FreightPredictionResult;
}

export const ConfidenceBandsCard: React.FC<ConfidenceBandsCardProps> = ({ prediction }) => {
  const { confidence, totalCost, negotiationRecommendation } = prediction;

  // Percentage spread relative to P10..P90
  const range = confidence.p90Conservative - confidence.p10Optimistic;
  const getPercentPos = (val: number) => {
    if (range <= 0) return 50;
    return Math.max(0, Math.min(100, ((val - confidence.p10Optimistic) / range) * 100));
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Bandas de Incerteza & Quantis de Negociação (P10 - P50 - P90)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estimativa por Regressão Quantílica CatBoost: limites estatísticos para balizar contratação de fretes.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400">Spread P10–P90:</span>
          <span className="text-xs font-mono font-bold text-emerald-400 ml-1.5">
            {formatCurrency(confidence.spreadP10P90)} ({confidence.spreadPercent}%)
          </span>
        </div>
      </div>

      {/* Visual Quantile Meter */}
      <div className="space-y-4 pt-2">
        <div className="relative pt-6 pb-2">
          {/* Background track */}
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 relative overflow-hidden">
            {/* Fair price zone (P25 to P75) */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-500/50"
              style={{
                left: `${getPercentPos(confidence.p25FairLow)}%`,
                width: `${getPercentPos(confidence.p75FairHigh) - getPercentPos(confidence.p25FairLow)}%`,
              }}
            />
          </div>

          {/* Marker: P10 */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${getPercentPos(confidence.p10Optimistic)}%` }}
          >
            <span className="text-[10px] font-mono text-emerald-300 font-semibold mb-1">P10</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 mt-1" />
          </div>

          {/* Marker: P50 (Center Target) */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${getPercentPos(confidence.p50Median)}%` }}
          >
            <span className="text-[10px] font-mono text-white font-bold mb-1">P50 (Alvo)</span>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-slate-950 shadow-md shadow-emerald-400/50 mt-0.5" />
          </div>

          {/* Marker: P90 */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${getPercentPos(confidence.p90Conservative)}%` }}
          >
            <span className="text-[10px] font-mono text-amber-300 font-semibold mb-1">P90</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-950 mt-1" />
          </div>
        </div>

        {/* 3 Main Quantile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* P10 Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingDown className="w-3.5 h-3.5" /> Piso (P10)
              </span>
              <span className="text-[10px] font-mono">10% menor</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300">
              {formatCurrency(confidence.p10Optimistic)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Cenário otimista com alta oferta de caminhões na praça ou frotas parceiras.
            </p>
          </div>

          {/* P50 Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-sm shadow-emerald-950/40">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Target className="w-3.5 h-3.5" /> Mediana (P50)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Valor Central</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {formatCurrency(confidence.p50Median)}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Estimativa mais provável para orçamentos e custos padrões da Agrária.
            </p>
          </div>

          {/* P90 Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> Teto (P90)
              </span>
              <span className="text-[10px] font-mono">90% coberto</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {formatCurrency(confidence.p90Conservative)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Teto orçamentário para contingência em dias de alta demanda e escassez.
            </p>
          </div>
        </div>
      </div>

      {/* Practical Procurement Guidance Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              Recomendação Estratégica para Compradores de Frete
            </div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {negotiationRecommendation.advice}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Oferta Inicial Sugerida</div>
            <div className="font-mono font-bold text-emerald-400 text-sm">
              {formatCurrency(negotiationRecommendation.targetOpeningOffer)}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400">Teto Máximo Tolerado</div>
            <div className="font-mono font-bold text-amber-400 text-sm">
              {formatCurrency(negotiationRecommendation.ceilingLimit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
