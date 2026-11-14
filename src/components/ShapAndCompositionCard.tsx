import React from 'react';
import { PieChart, Activity, Info, Landmark } from 'lucide-react';
import { FreightPredictionResult } from '../types/freight';
import { formatCurrency } from '../utils/freightCalculator';

interface ShapAndCompositionCardProps {
  prediction: FreightPredictionResult;
}

export const ShapAndCompositionCard: React.FC<ShapAndCompositionCardProps> = ({ prediction }) => {
  const { baseFreight, taxAmount, totalTollCost, totalCost, shap, ipcaAnalysis, tollAnalysis } = prediction;

  const baseRatio = Math.round((baseFreight / totalCost) * 100);
  const tollRatio = Math.round((totalTollCost / totalCost) * 100);
  const taxRatio = Math.max(1, 100 - baseRatio - tollRatio);

  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  
  const baseDash = (baseRatio / 100) * circumference;
  const tollDash = (tollRatio / 100) * circumference;
  const taxDash = (taxRatio / 100) * circumference;

  const tollOffset = -baseDash;
  const taxOffset = -(baseDash + tollDash);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cost Composition Donut Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Composição do Frete</span>
          </h3>
          <span className="text-[11px] text-slate-400">Frete + Vale-Pedágio + ICMS</span>
        </div>

        <div className="py-3 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
              />
              {/* Base Freight slice */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray={`${baseDash} ${circumference}`}
                strokeDashoffset={0}
              />
              {/* Toll slice */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="12"
                strokeDasharray={`${tollDash} ${circumference}`}
                strokeDashoffset={tollOffset}
              />
              {/* Tax slice */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#047857"
                strokeWidth="12"
                strokeDasharray={`${taxDash} ${circumference}`}
                strokeDashoffset={taxOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400">Total</span>
              <span className="text-xs font-bold text-white font-mono">100%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2.5 text-xs w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-300">Frete Líquido Base:</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-white">{formatCurrency(baseFreight)}</div>
                <div className="text-[10px] text-slate-400">{baseRatio}% {ipcaAnalysis?.isApplied ? '(com IPCA)' : ''}</div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" />
                <span className="text-slate-300">Vale-Pedágio (Lei 10.209):</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sky-300">{formatCurrency(totalTollCost)}</div>
                <div className="text-[10px] text-slate-400">{tollRatio}% (Isento ICMS)</div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-700 inline-block" />
                <span className="text-slate-300">Impostos & Taxas:</span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-200">{formatCurrency(taxAmount)}</div>
                <div className="text-[10px] text-slate-400">{taxRatio}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>O Vale-Pedágio Obrigatório é destacado por lei para evitar bitributação de ICMS e previdência.</span>
        </div>
      </div>

      {/* SHAP Feature Importance Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Explicabilidade SHAP (Impacto no Valor)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Pesos do CatBoost</span>
        </div>

        <div className="py-2 space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Distância Rodoviária (km)</span>
              <span className="text-emerald-400 font-mono font-bold">{shap.distancePercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${shap.distancePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Peso Transportado (kg)</span>
              <span className="text-emerald-400 font-mono font-bold">{shap.weightPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${shap.weightPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Tipo de Veículo / Eixos</span>
              <span className="text-emerald-400 font-mono font-bold">{shap.vehiclePercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${shap.vehiclePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Estado & Corredor de Destino</span>
              <span className="text-emerald-400 font-mono font-bold">{shap.regionPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${shap.regionPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Sazonalidade de Safra / Diesel / IPCA</span>
              <span className="text-emerald-400 font-mono font-bold">{Math.max(2, shap.seasonalityPercent)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, shap.seasonalityPercent)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Interpretação: Os valores SHAP revelam a contribuição marginal de cada feature.</span>
          <span className="font-mono text-emerald-400 font-semibold">Total: 100%</span>
        </div>
      </div>
    </div>
  );
};
