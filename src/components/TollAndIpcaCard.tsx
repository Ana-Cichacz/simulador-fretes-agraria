import React from 'react';
import { Landmark, TrendingUp, DollarSign, CheckCircle2, ShieldAlert, Tag, Percent } from 'lucide-react';
import { FreightInput, FreightPredictionResult } from '../types/freight';
import { IPCA_BENCHMARKS, ROUTE_TOLL_DATABASE, VEHICLE_AXLES } from '../data/tollAndIpcaData';
import { formatCurrency } from '../utils/freightCalculator';

interface TollAndIpcaCardProps {
  input: FreightInput;
  onChange: (updated: Partial<FreightInput>) => void;
  prediction: FreightPredictionResult;
}

export const TollAndIpcaCard: React.FC<TollAndIpcaCardProps> = ({
  input,
  onChange,
  prediction,
}) => {
  const toll = prediction.tollAnalysis;
  const ipca = prediction.ipcaAnalysis;
  const tollConfig = ROUTE_TOLL_DATABASE[input.destinationState] || ROUTE_TOLL_DATABASE.SP;
  const vehicleAxle = VEHICLE_AXLES[input.vehicle] || VEHICLE_AXLES.bitren;

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Vale-Pedágio Obrigatório & Reajuste por IPCA (IBGE)</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cálculo de tarifas por eixo comercial (Lei 10.209/2001) e cláusula de indexação inflacionária da Agrária.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Lei nº 10.209/01
          </span>
          <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            IBGE 12m: +4,40%
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns (Vale-Pedágio & IPCA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Vale-Pedágio Obrigatório */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Vale-Pedágio Obrigatório da Rota
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {vehicleAxle.axlesCount} eixos comerciais
              </span>
            </div>

            {/* Toll Cost Highlight */}
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Custo Total de Pedágio:</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(toll?.netTollCostBrl || 0)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Praças no Percurso:</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {toll?.plazasCount} praças
                </div>
              </div>
            </div>

            {/* Axle details */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Composição:</span>
                <span className="font-mono text-white">{vehicleAxle.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tarifa Média por Eixo/Praça:</span>
                <span className="font-mono text-white">{formatCurrency(toll?.avgTollPerAxle || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Desconto Tag Eletrônica (DBT 5%):</span>
                <span className="font-mono text-emerald-400">
                  {input.hasElectronicTollTag ? `-${formatCurrency(toll?.tagDiscountBrl || 0)}` : 'Não aplicado'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Custo por Quilômetro:</span>
                <span className="font-mono text-emerald-300">{formatCurrency(toll?.tollCostPerKm || 0)}/km</span>
              </div>
            </div>
          </div>

          {/* Electronic Tag DBT Toggle & Legal Note */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-slate-300">Desconto DBT Tag Eletrônica (5%)</span>
              </div>
              <button
                type="button"
                onClick={() => onChange({ hasElectronicTollTag: !input.hasElectronicTollTag })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  input.hasElectronicTollTag ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    input.hasElectronicTollTag ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-snug">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção Jurídica:</strong> Conforme Lei 10.209/01, o pedágio deve ser antecipado ao transportador
                e é <strong>isento de ICMS</strong>. O valor é destacado do frete líquido.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Reajuste por IPCA (IBGE) */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Correção Monetária por IPCA (IBGE)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Indexação de Contratos
              </span>
            </div>

            {/* IPCA Adjustment Highlight */}
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Acréscimo Inflacionário:</span>
                <div className="text-2xl font-black font-mono text-blue-400 mt-0.5">
                  +{formatCurrency(ipca?.correctionAmountBrl || 0)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Taxa Aplicada:</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  +{ipca?.ipcaRatePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Base freight comparison */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Frete Original (Tabela Histórica):</span>
                <span className="font-mono text-slate-400">{formatCurrency(prediction.unadjustedBaseFreight)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Correção pelo IPCA ({ipca?.periodLabel}):</span>
                <span className="font-mono text-blue-400">+{formatCurrency(ipca?.correctionAmountBrl || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800">
                <span>Frete Base Atualizado:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(prediction.baseFreight)}</span>
              </div>
            </div>
          </div>

          {/* Period selector buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-300">
                Cláusula de Reajuste Inflacionário:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {input.ipcaPeriod === 'none' ? '✓ Desativado (Modo Spot Justo)' : 'Reajuste Ativo'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: '0%', sub: 'Spot Corrente (Justo)' },
                { id: '6m', label: '+2,15%', sub: 'Contrato 6m' },
                { id: '12m', label: '+4,40%', sub: 'Contrato Anual' },
                { id: '24m', label: '+8,92%', sub: 'Plurianual 24m' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ ipcaPeriod: p.id as any })}
                  className={`p-2 rounded-lg border text-center transition ${
                    input.ipcaPeriod === p.id
                      ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-mono">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.sub}</div>
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 leading-snug pt-1">
              <strong>Critério Técnico:</strong> Para fretes spot de safra diários, mantenha em <strong>0%</strong> para não inflar a cotação com a transportadora. Utilize reajuste apenas na renovação de contratos anuais de fornecimento.
            </div>
          </div>
        </div>
      </div>

      {/* Concessionaires on Route Strip */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Concessionárias do Corredor:</span>
          <span className="text-white font-medium">
            {tollConfig.concessionaires.join(' · ')}
          </span>
        </div>
        <div className="text-slate-400">
          Rodovias: <span className="font-mono text-emerald-400">{tollConfig.highwayCorridors.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};
