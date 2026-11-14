import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { FreightPredictionResult, FreightInput } from '../types/freight';
import { formatCurrency, generateGaussianPoints } from '../utils/freightCalculator';

interface AccuracyProbabilityCardProps {
  prediction: FreightPredictionResult;
  input: FreightInput;
  selectedTolerance: number;
  onSelectTolerance: (tolerance: number) => void;
}

export const AccuracyProbabilityCard: React.FC<AccuracyProbabilityCardProps> = ({
  prediction,
  input,
  selectedTolerance,
  onSelectTolerance,
}) => {
  const { accuracy, totalCost } = prediction;
  const [hoveredPoint, setHoveredPoint] = useState<{ cost: number; probDensity: number } | null>(null);

  // Generate 80 discrete points for smooth SVG Gaussian Bell Curve
  const gaussian = generateGaussianPoints(
    totalCost,
    accuracy.standardDeviationPercent,
    selectedTolerance,
    80
  );

  // SVG viewBox coordinates
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Coordinate mapper
  const getCoordinates = (cost: number, probDensity: number) => {
    const xRatio = (cost - gaussian.minX) / (gaussian.maxX - gaussian.minX);
    const yRatio = probDensity / gaussian.maxY;
    const x = paddingX + xRatio * chartWidth;
    const y = svgHeight - paddingY - yRatio * chartHeight;
    return { x, y };
  };

  // Build SVG path strings
  const fullPathPoints = gaussian.points.map((p) => {
    const { x, y } = getCoordinates(p.cost, p.probDensity);
    return `${x},${y}`;
  });

  const fullLinePath = `M ${fullPathPoints.join(' L ')}`;

  // Shaded area under curve for tolerance bounds
  const tolerancePoints = gaussian.points.filter((p) => p.isWithinTolerance);
  let shadedTolerancePath = '';
  if (tolerancePoints.length > 0) {
    const startCoord = getCoordinates(tolerancePoints[0].cost, tolerancePoints[0].probDensity);
    const endCoord = getCoordinates(
      tolerancePoints[tolerancePoints.length - 1].cost,
      tolerancePoints[tolerancePoints.length - 1].probDensity
    );
    const bottomY = svgHeight - paddingY;

    const topPath = tolerancePoints
      .map((p) => {
        const { x, y } = getCoordinates(p.cost, p.probDensity);
        return `L ${x},${y}`;
      })
      .join(' ');

    shadedTolerancePath = `M ${startCoord.x},${bottomY} ${topPath} L ${endCoord.x},${bottomY} Z`;
  }

  // Vertical markers coordinates
  const centerCoord = getCoordinates(totalCost, gaussian.maxY);
  const lowerCoord = getCoordinates(accuracy.lowerBoundCost, 0);
  const upperCoord = getCoordinates(accuracy.upperBoundCost, 0);

  const monetaryDeviation = totalCost * (selectedTolerance / 100);

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Top Banner / Question Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-white">
              Probabilidade de Acerto & Intervalo de Precisão
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cálculo estatístico da chance do valor contratado em negociação real ficar dentro da margem estipulada.
          </p>
        </div>

        {/* Global Confidence Tag */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Confiabilidade do Modelo</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nível {accuracy.confidenceLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Highlight Block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Chance of Hit Percentage (Big Hero Stat) */}
        <div className="md:col-span-5 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-950 p-5 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Chance Real de Acerto</span>
              <span className="font-mono text-emerald-400 font-semibold">Tolerância: ±{selectedTolerance}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {accuracy.hitProbabilityPercent}%
              </span>
              <span className="text-xs font-medium text-emerald-400">probabilidade</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Há <strong className="text-emerald-300 font-mono">{accuracy.hitProbabilityPercent}%</strong> de chance
              do frete negociado fechar entre{' '}
              <strong className="text-white font-mono">{formatCurrency(accuracy.lowerBoundCost)}</strong> e{' '}
              <strong className="text-white font-mono">{formatCurrency(accuracy.upperBoundCost)}</strong>.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-slate-400">
            <span>Margem Máxima em Reais:</span>
            <span className="font-mono text-emerald-300 font-semibold">
              ± {formatCurrency(monetaryDeviation)}
            </span>
          </div>
        </div>

        {/* Tolerance Preset Selection Buttons */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-2 block flex items-center justify-between">
              <span>Selecione a Tolerância de Negociação Aceita:</span>
              <span className="text-[11px] text-slate-400">Clique para recalcular</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { percent: 3, label: '± 3%', sub: 'Alta Precisão (Spot)' },
                { percent: 5, label: '± 5%', sub: 'Padrão Agrária' },
                { percent: 8, label: '± 8%', sub: 'Banda Confortável' },
                { percent: 10, label: '± 10%', sub: 'Mercado Aberto' },
              ].map((tol) => (
                <button
                  key={tol.percent}
                  onClick={() => onSelectTolerance(tol.percent)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTolerance === tol.percent
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold font-mono text-emerald-400">{tol.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tol.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mini statistics row */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Desvio Padrão (σ)</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">
                ±{accuracy.standardDeviationPercent}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Viagens na Rota</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">
                {accuracy.routeSampleDensity.toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Acerto no Histórico</span>
              <span className="font-mono font-semibold text-emerald-400 text-sm">
                {accuracy.historicalHitRateInRoute}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bell Curve / Gaussian SVG Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              Distribuição de Probabilidade do Custo (Curva de Resíduos)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-emerald-500/40 inline-block border border-emerald-500/60" />
              <span>Área de Acerto ({accuracy.hitProbabilityPercent}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
              <span>P50 Central</span>
            </span>
          </div>
        </div>

        {/* The SVG Container */}
        <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 cursor-crosshair select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, (mouseX - (paddingX * rect.width) / svgWidth) / ((chartWidth * rect.width) / svgWidth)));
              const cost = gaussian.minX + ratio * (gaussian.maxX - gaussian.minX);
              const diff = cost - totalCost;
              const sigma = totalCost * (accuracy.standardDeviationPercent / 100);
              const density = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-(diff * diff) / (2 * sigma * sigma));
              setHoveredPoint({ cost, probDensity: density });
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="toleranceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Baseline horizontal grid line */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Shaded tolerance hit area */}
            {shadedTolerancePath && (
              <path d={shadedTolerancePath} fill="url(#toleranceGradient)" />
            )}

            {/* Full curve line */}
            <path
              d={fullLinePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Tolerance boundary vertical dashed lines */}
            <line
              x1={lowerCoord.x}
              y1={svgHeight - paddingY}
              x2={lowerCoord.x}
              y2={paddingY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <line
              x1={upperCoord.x}
              y1={svgHeight - paddingY}
              x2={upperCoord.x}
              y2={paddingY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Central P50 predicted value line */}
            <line
              x1={centerCoord.x}
              y1={svgHeight - paddingY}
              x2={centerCoord.x}
              y2={centerCoord.y}
              stroke="#34d399"
              strokeWidth="2"
            />
            <circle cx={centerCoord.x} cy={centerCoord.y} r="4" fill="#34d399" />

            {/* Interactive hover line */}
            {hoveredPoint && (
              <>
                {(() => {
                  const coord = getCoordinates(hoveredPoint.cost, hoveredPoint.probDensity);
                  return (
                    <>
                      <line
                        x1={coord.x}
                        y1={svgHeight - paddingY}
                        x2={coord.x}
                        y2={coord.y}
                        stroke="#f8fafc"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle cx={coord.x} cy={coord.y} r="4" fill="#ffffff" />
                    </>
                  );
                })()}
              </>
            )}

            {/* Axis labels inside SVG */}
            <text
              x={lowerCoord.x}
              y={svgHeight - 8}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              -{selectedTolerance}%
            </text>
            <text
              x={centerCoord.x}
              y={svgHeight - 8}
              fill="#34d399"
              fontSize="11"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              P50: {formatCurrency(totalCost)}
            </text>
            <text
              x={upperCoord.x}
              y={svgHeight - 8}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              +{selectedTolerance}%
            </text>
          </svg>

          {/* Tooltip on hover */}
          {hoveredPoint && (
            <div className="absolute top-4 left-6 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg text-slate-200">
              <span>Valor simulado: </span>
              <strong className="text-white">{formatCurrency(hoveredPoint.cost)}</strong>
              <span className="text-slate-400">
                {' '}
                ({((hoveredPoint.cost - totalCost) / totalCost >= 0 ? '+' : '')}
                {(((hoveredPoint.cost - totalCost) / totalCost) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Legend under chart */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <div>
            Piso seguro: <span className="font-mono text-slate-200">{formatCurrency(accuracy.lowerBoundCost)}</span>
          </div>
          <div>
            Centro previsto: <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(totalCost)}</span>
          </div>
          <div>
            Teto tolerável: <span className="font-mono text-slate-200">{formatCurrency(accuracy.upperBoundCost)}</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Validation Metrics Strip */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Métricas de Validação do Algoritmo CatBoost (Base Agrária)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {accuracy.totalTrainedSamples.toLocaleString('pt-BR')} amostras auditadas (2024-2026)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">R² Score (Acurácia)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{accuracy.r2Score}</div>
            <div className="text-[10px] text-slate-400">94,6% da variância explicada</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">MAPE (Erro Percentual)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{accuracy.mapePercent}%</div>
            <div className="text-[10px] text-slate-400">Erro médio percentual</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">MAE (Erro Absoluto)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">± {formatCurrency(accuracy.maeBrl)}</div>
            <div className="text-[10px] text-slate-400">Desvio médio em Reais</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">Validação Cruzada</div>
            <div className="text-lg font-bold font-mono text-slate-200">5-Fold K-Fold</div>
            <div className="text-[10px] text-slate-400">Treino, validação e teste</div>
          </div>
        </div>
      </div>
    </div>
  );
};
