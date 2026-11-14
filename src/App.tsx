import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ParametersForm } from './components/ParametersForm';
import { PredictionSummary } from './components/PredictionSummary';
import { AccuracyProbabilityCard } from './components/AccuracyProbabilityCard';
import { ConfidenceBandsCard } from './components/ConfidenceBandsCard';
import { ShapAndCompositionCard } from './components/ShapAndCompositionCard';
import { BacktestingTable } from './components/BacktestingTable';
import { ReportExportModal } from './components/ReportExportModal';
import { FreightInput, StateCode } from './types/freight';
import { calculateFreightPrediction } from './utils/freightCalculator';
import { ROUTES_CONFIG } from './data/historicalDataset';
import { ANPDieselCard } from './components/ANPDieselCard';
import { TollAndIpcaCard } from './components/TollAndIpcaCard';
import { Cpu, ShieldCheck, Sparkles, Fuel, Landmark } from 'lucide-react';

const DEFAULT_INPUT: FreightInput = {
  cargo: 'cevada_malte',
  weightKg: 28000,
  destinationState: 'SP',
  destinationCity: 'Campinas / Região de Santos',
  distanceKm: 580,
  vehicle: 'bitren',
  taxRatePercent: 12.0,
  seasonality: 'normal',
  hasReturnFreight: false,
  dieselVariationPercent: 0,
  useANPOfficialDiesel: true,
  anpDieselType: 'S10',
  ipcaPeriod: 'none', // Desativado por padrão para fretes correntes (evita sobrepreço de 4.4%)
  ipcaCustomPercent: 4.4,
  includeTollInTotal: false, // Vale-pedágio destacado separadamente conforme Lei 10.209/01 (evita bitributação e dupla contagem)
  hasElectronicTollTag: true,
};

export default function App() {
  const [input, setInput] = useState<FreightInput>(DEFAULT_INPUT);
  const [selectedTolerance, setSelectedTolerance] = useState<number>(5); // default ±5%
  const [activeTab, setActiveTab] = useState<'simulador' | 'acuracia' | 'historico' | 'diesel' | 'pedagio'>('simulador');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Recalculate freight and accuracy metrics dynamically
  const prediction = useMemo(() => {
    return calculateFreightPrediction(input, selectedTolerance);
  }, [input, selectedTolerance]);

  const handleParamChange = (updated: Partial<FreightInput>) => {
    setInput((prev) => ({ ...prev, ...updated }));
  };

  const handleAutoAdjustDistance = (state: StateCode) => {
    const route = ROUTES_CONFIG[state];
    if (route) {
      setInput((prev) => ({
        ...prev,
        destinationState: state,
        distanceKm: route.defaultKm,
        destinationCity: route.mainDestination,
      }));
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setSelectedTolerance(5);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Bar Header */}
      <Header
        onReset={handleReset}
        onOpenReport={() => setIsReportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8">
        
        {/* Informative Context Hero Banner */}
        <section className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/25 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mt-1 border border-emerald-500/20 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Agrária Freight ML Predictor & Motor de Acurácia
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                  R² = 0.946
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Previsão de custos rodoviários e <strong>probabilidade de acerto estatístico</strong> para fretes da
                Cooperativa Agrária. O modelo CatBoost calcula o custo mediano (P50), as bandas de incerteza (P10 a P90)
                e a taxa de conformidade para negociações com transportadoras e terceirizados.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 text-xs shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chance ±{selectedTolerance}%: <strong className="text-emerald-400 font-mono">{prediction.accuracy.hitProbabilityPercent}%</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base: <strong className="text-white font-mono">14.820 fretes</strong></span>
            </div>
          </div>
        </section>

        {/* Dynamic Workspace based on Active Tab */}
        {activeTab === 'simulador' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Parameters Form (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <ParametersForm
                input={input}
                onChange={handleParamChange}
                onAutoAdjustDistance={handleAutoAdjustDistance}
              />
            </div>

            {/* Right Side: Prediction Results, Probability & Bands (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cost Summary Metric Cards */}
              <PredictionSummary prediction={prediction} input={input} />

              {/* Accuracy & Probability Card (The Core Question) */}
              <AccuracyProbabilityCard
                prediction={prediction}
                input={input}
                selectedTolerance={selectedTolerance}
                onSelectTolerance={setSelectedTolerance}
              />

              {/* Toll & IPCA Analysis Card */}
              <TollAndIpcaCard input={input} onChange={handleParamChange} prediction={prediction} />

              {/* Official ANP Diesel Base Card */}
              <ANPDieselCard input={input} onChange={handleParamChange} prediction={prediction} />

              {/* Confidence Bands (P10 - P50 - P90) */}
              <ConfidenceBandsCard prediction={prediction} />

              {/* SHAP & Composition Breakdown */}
              <ShapAndCompositionCard prediction={prediction} />
            </div>
          </div>
        )}

        {/* Dedicated Toll & IPCA Tab View */}
        {activeTab === 'pedagio' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Vale-Pedágio Obrigatório (Lei 10.209/01) & Indexação por IPCA</h2>
                  <p className="text-xs text-slate-400">
                    Cálculo automático de praças, tarifas por eixo comercial das concessionárias e correção monetária IBGE.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('simulador')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Voltar ao simulador
              </button>
            </div>

            {/* Toll & IPCA Dedicated Card */}
            <TollAndIpcaCard input={input} onChange={handleParamChange} prediction={prediction} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictionSummary prediction={prediction} input={input} />
              <ShapAndCompositionCard prediction={prediction} />
            </div>
          </div>
        )}

        {/* Dedicated Diesel Tab View */}
        {activeTab === 'diesel' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Base Oficial de Combustíveis ANP (Gov.br) & Tabela ANTT</h2>
                  <p className="text-xs text-slate-400">
                    Série oficial de preços de diesel S10 por estado, consumo estimado da frota e monitoramento do gatilho da Lei 13.703/18.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('simulador')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Voltar ao simulador
              </button>
            </div>

            {/* ANP Diesel Full Card */}
            <ANPDieselCard input={input} onChange={handleParamChange} prediction={prediction} />

            {/* Quick parameter link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictionSummary prediction={prediction} input={input} />
              <ConfidenceBandsCard prediction={prediction} />
            </div>
          </div>
        )}

        {activeTab === 'acuracia' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Análise Detalhada de Acurácia & Risco</h2>
                  <p className="text-xs text-slate-400">
                    Comportamento estocástico do modelo frente à volatilidade das rotas da Agrária.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('simulador')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Voltar aos parâmetros
              </button>
            </div>

            {/* Prominent Accuracy Probability Card */}
            <AccuracyProbabilityCard
              prediction={prediction}
              input={input}
              selectedTolerance={selectedTolerance}
              onSelectTolerance={setSelectedTolerance}
            />

            {/* ANP Diesel Card */}
            <ANPDieselCard input={input} onChange={handleParamChange} prediction={prediction} />

            {/* Confidence Bands */}
            <ConfidenceBandsCard prediction={prediction} />

            {/* SHAP Explainability */}
            <ShapAndCompositionCard prediction={prediction} />
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="space-y-6">
            {/* Full-width Historical Backtesting Table */}
            <BacktestingTable currentDestinationState={input.destinationState} />
          </div>
        )}

        {/* If in simulator mode, also show Backtesting Table below for fast verification */}
        {activeTab === 'simulador' && (
          <section className="pt-4">
            <BacktestingTable currentDestinationState={input.destinationState} />
          </section>
        )}
      </main>

      {/* Domain Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Cooperativa Agrária Agroindustrial &copy; 2026</span>
            <span aria-hidden="true">·</span>
            <span>Maltaria Agrária & Logística de Grãos</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Entre Rios, Guarapuava - PR</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>CatBoost Regressor + SHAP</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 font-mono">MAPE: 4,6%</span>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        prediction={prediction}
        input={input}
      />
    </div>
  );
}
