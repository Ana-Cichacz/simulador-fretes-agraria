import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText, ShieldCheck } from 'lucide-react';
import { FreightPredictionResult, FreightInput } from '../types/freight';
import { ROUTES_CONFIG, VEHICLE_DETAILS, CARGO_DETAILS } from '../data/historicalDataset';
import { formatCurrency } from '../utils/freightCalculator';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: FreightPredictionResult;
  input: FreightInput;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  input,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const route = ROUTES_CONFIG[input.destinationState];
  const vehicle = VEHICLE_DETAILS[input.vehicle];
  const cargo = CARGO_DETAILS[input.cargo];
  const { totalCost, baseFreight, taxAmount, confidence, accuracy, negotiationRecommendation } = prediction;

  const generatedDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const textSummary = `=====================================================
COOPERATIVA AGRÁRIA AGROINDUSTRIAL - PREVISÃO DE FRETE
SISTEMA PREDITIVO CATBOOST ML & ACURÁCIA LOGÍSTICA
Data/Hora: ${generatedDate}
=====================================================

1. DADOS DA OPERAÇÃO:
• Origem: Polo Entre Rios / Guarapuava (PR)
• Destino: ${route.name} (${input.destinationCity || route.mainDestination})
• Distância Efetiva: ${input.distanceKm} km
• Produto / Carga: ${cargo.label}
• Peso Total: ${(input.weightKg / 1000).toFixed(1)} t (${input.weightKg.toLocaleString('pt-BR')} kg)
• Veículo / Carroceria: ${vehicle.label}

2. ESTIMATIVA DE CUSTOS (CATBOOST REGRESSOR):
• Custo Total Previsto: ${formatCurrency(totalCost)}
• Frete Líquido Base: ${formatCurrency(baseFreight)} (Original: ${formatCurrency(prediction.unadjustedBaseFreight)})
• Reajuste IPCA (IBGE): ${prediction.ipcaAnalysis?.isApplied ? `+${prediction.ipcaAnalysis.ipcaRatePercent}% (+${formatCurrency(prediction.ipcaAnalysis.correctionAmountBrl)}) [${prediction.ipcaAnalysis.periodLabel}]` : 'Não aplicado'}
• Vale-Pedágio Obrigatório (Lei 10.209/01): ${formatCurrency(prediction.totalTollCost)} (${prediction.tollAnalysis?.plazasCount} praças · ${prediction.tollAnalysis?.vehicleAxlesCount} eixos · Isento ICMS)
• Impostos (ICMS ${input.taxRatePercent}%): ${formatCurrency(taxAmount)}
• Custo Unitário: ${formatCurrency(prediction.costPerTon)}/ton | ${formatCurrency(prediction.costPerKm)}/km

3. BASE DE COMBUSTÍVEL OFICIAL (ANP / GOV.BR & ANTT):
• Preço Médio Rota Diesel S10: ${formatCurrency(prediction.fuelAnalysis?.routeAveragePrice || 6.21)}/L (PR: ${formatCurrency(prediction.fuelAnalysis?.originPrice || 6.18)}/L | Destino: ${formatCurrency(prediction.fuelAnalysis?.destinationPrice || 6.24)}/L)
• Consumo Estimado: ${prediction.fuelAnalysis?.totalLitersConsumed} L (Gasto estimado: ${formatCurrency(prediction.fuelAnalysis?.totalFuelCostBrl || 0)})
• Parcela do Combustível no Frete: ${prediction.fuelAnalysis?.fuelSharePercent}%
• Gatilho ANTT (Lei 13.703/18): ${prediction.fuelAnalysis?.anttTriggerStatus} (Delta: ${prediction.fuelAnalysis?.anttDeltaPercent}%)

4. PROBABILIDADE DE ACERTO & INTERVALO DE CONFIANÇA:
• Chance de Acerto (Tolerância ±${accuracy.selectedTolerancePercent}%): ${accuracy.hitProbabilityPercent}%
• Faixa de Tolerância: ${formatCurrency(accuracy.lowerBoundCost)} a ${formatCurrency(accuracy.upperBoundCost)}
• Desvio Padrão (σ): ±${accuracy.standardDeviationPercent}%
• Confiabilidade da Rota: Nível ${accuracy.confidenceLevel} (${accuracy.routeSampleDensity.toLocaleString('pt-BR')} viagens na base)
• R² Score do Modelo: ${accuracy.r2Score} | MAPE: ${accuracy.mapePercent}%

5. BALIZADORES DE NEGOCIAÇÃO (QUANTIS P10-P50-P90):
• Piso Otimista (P10): ${formatCurrency(confidence.p10Optimistic)}
• Alvo Central (P50): ${formatCurrency(confidence.p50Median)}
• Teto Orçamentário (P90): ${formatCurrency(confidence.p90Conservative)}
• Recomendação: ${negotiationRecommendation.advice}

=====================================================
Emitido via Agrária Freight ML Core v2.4
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Relatório de Balizamento de Frete</h3>
              <p className="text-xs text-slate-400">Resumo executivo com índices de probabilidade e bandas de negociação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Header Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Cooperativa Agrária Agroindustrial</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {cargo.label} • {route.name}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Entre Rios (PR) → {input.distanceKm} km • {(input.weightKg / 1000).toFixed(1)}t em {vehicle.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Custo Total Previsto</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(totalCost)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Impostos: {input.taxRatePercent}% inclusos</div>
            </div>
          </div>

          {/* Accuracy & Confidence Highlight */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Chance Estatística de Acerto: {accuracy.hitProbabilityPercent}%</span>
              </span>
              <span className="font-mono text-xs text-emerald-400">Tolerância: ±{accuracy.selectedTolerancePercent}%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Com base no modelo CatBoost treinado em 14.820 fretes da Agrária e na densidade amostral da rota{' '}
              ({accuracy.routeSampleDensity.toLocaleString('pt-BR')} registros), a chance do valor final contratado
              ficar entre <strong>{formatCurrency(accuracy.lowerBoundCost)}</strong> e{' '}
              <strong>{formatCurrency(accuracy.upperBoundCost)}</strong> é de{' '}
              <strong className="text-emerald-300 font-mono">{accuracy.hitProbabilityPercent}%</strong>.
            </p>
          </div>

          {/* Official ANP Diesel Base Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Parâmetro de Combustível (ANP / Gov.br):</span>
              <span className="font-mono text-emerald-400">Diesel S10: {formatCurrency(prediction.fuelAnalysis?.routeAveragePrice || 6.21)}/L</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Consumo: <strong className="text-slate-200 font-mono">{prediction.fuelAnalysis?.totalLitersConsumed} L</strong></div>
              <div>Custo Total: <strong className="text-slate-200 font-mono">{formatCurrency(prediction.fuelAnalysis?.totalFuelCostBrl || 0)}</strong></div>
              <div>Peso no Frete: <strong className="text-emerald-400 font-mono">{prediction.fuelAnalysis?.fuelSharePercent}%</strong></div>
            </div>
          </div>

          {/* Vale-Pedágio & IPCA Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Vale-Pedágio (Lei 10.209/01) & IPCA:</span>
              <span className="font-mono text-emerald-400">Pedágio: {formatCurrency(prediction.totalTollCost)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Praças: <strong className="text-slate-200 font-mono">{prediction.tollAnalysis?.plazasCount} praças</strong></div>
              <div>Eixos Veículo: <strong className="text-slate-200 font-mono">{prediction.tollAnalysis?.vehicleAxlesCount} eixos</strong></div>
              <div>IPCA ({prediction.ipcaAnalysis?.periodLabel}): <strong className="text-blue-400 font-mono">+{formatCurrency(prediction.ipcaAnalysis?.correctionAmountBrl || 0)}</strong></div>
            </div>
          </div>

          {/* Quantiles Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Piso de Abertura (P10)</div>
              <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                {formatCurrency(confidence.p10Optimistic)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ponto de partida ideal</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400">Estimativa Alvo (P50)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatCurrency(confidence.p50Median)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Valor justo do mercado</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Teto Limite (P90)</div>
              <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                {formatCurrency(confidence.p90Conservative)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Limite para aprovação</div>
            </div>
          </div>

          {/* Practical Advice */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-white mb-1">Parecer para Negociação:</div>
            <p className="text-xs text-slate-300 leading-relaxed">{negotiationRecommendation.advice}</p>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-500 font-mono">Gerado em: {generatedDate}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
