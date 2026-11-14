import React from 'react';
import { DollarSign, Package, Receipt, Landmark, TrendingUp, Info } from 'lucide-react';
import { FreightPredictionResult, FreightInput } from '../types/freight';
import { formatCurrency } from '../utils/freightCalculator';

interface PredictionSummaryProps {
  prediction: FreightPredictionResult;
  input: FreightInput;
}

export const PredictionSummary: React.FC<PredictionSummaryProps> = ({ prediction, input }) => {
  const { totalCost, baseFreight, taxAmount, totalTollCost, costPerTon, costPerKm, accuracy, ipcaAnalysis, tollAnalysis } = prediction;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Predicted Cost Card */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {input.includeTollInTotal ? 'Custo Global da Viagem' : 'Frete Contratado (com ICMS)'}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(totalCost)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>CatBoost ML</span>
          </span>
          <span className="text-emerald-400 font-mono font-medium">
            ±{accuracy.selectedTolerancePercent}% ({accuracy.hitProbabilityPercent}% acerto)
          </span>
        </div>
      </div>

      {/* Base Freight Card with IPCA Tag */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valor Líquido Base
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
            {formatCurrency(baseFreight)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Remuneração transportador</span>
          <span className={`font-mono ${ipcaAnalysis?.isApplied ? 'text-blue-400 font-semibold' : 'text-slate-500'}`}>
            {ipcaAnalysis?.isApplied ? `IPCA: +${ipcaAnalysis.ipcaRatePercent}%` : 'Sem IPCA (Spot justo)'}
          </span>
        </div>
      </div>

      {/* Vale-Pedágio Obrigatório (Lei 10.209/01) */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-emerald-500/30 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>Vale-Pedágio</span>
              <span className="text-[10px] text-emerald-400 font-mono">(Lei 10.209)</span>
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {formatCurrency(totalTollCost)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{tollAnalysis?.plazasCount} praças · {tollAnalysis?.vehicleAxlesCount} eixos</span>
          <span className="font-mono text-emerald-400">
            {input.includeTollInTotal ? 'Embutido no total' : 'Destacado à parte'}
          </span>
        </div>
      </div>

      {/* Taxes (ICMS) & Unitary Rates */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Impostos & Tarifas
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono text-white">
              {formatCurrency(taxAmount)}
              <span className="text-[10px] text-slate-400 font-normal ml-1">ICMS ({input.taxRatePercent}%)</span>
            </div>
          </div>
          <div className="mt-1 text-xs font-mono text-emerald-300 flex justify-between">
            <span>{formatCurrency(costPerTon)}/t</span>
            <span>{formatCurrency(costPerKm)}/km</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{(input.weightKg / 1000).toFixed(1)}t transportadas</span>
          <span>{input.distanceKm} km</span>
        </div>
      </div>
    </div>
  );
};
