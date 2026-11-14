import React from 'react';
import {
  Weight,
  MapPin,
  Route,
  Truck,
  Receipt,
  Sparkles,
  Calendar,
  Fuel,
  CornerDownLeft,
} from 'lucide-react';
import { FreightInput, StateCode, VehicleType, CargoType, SeasonalityType } from '../types/freight';
import { ROUTES_CONFIG, VEHICLE_DETAILS, CARGO_DETAILS } from '../data/historicalDataset';
import { OFFICIAL_ANP_DIESEL_DATABASE } from '../data/anpDieselData';
import { formatCurrency } from '../utils/freightCalculator';

interface ParametersFormProps {
  input: FreightInput;
  onChange: (updated: Partial<FreightInput>) => void;
  onAutoAdjustDistance: (state: StateCode) => void;
}

export const ParametersForm: React.FC<ParametersFormProps> = ({
  input,
  onChange,
  onAutoAdjustDistance,
}) => {
  const currentRoute = ROUTES_CONFIG[input.destinationState];

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Parâmetros da Carga & Rota</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Origem: Polo Entre Rios / Guarapuava (PR)
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          CatBoost v2.4
        </span>
      </div>

      {/* Tipo de Carga */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Produto / Tipo de Carga Agrária
        </label>
        <select
          value={input.cargo}
          onChange={(e) => onChange({ cargo: e.target.value as CargoType })}
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
        >
          {Object.entries(CARGO_DETAILS).map(([key, item]) => (
            <option key={key} value={key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Estado / Destino */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estado & Corredor de Destino</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {currentRoute.sampleCount.toLocaleString('pt-BR')} fretes na base
          </span>
        </div>
        <select
          value={input.destinationState}
          onChange={(e) => {
            const newState = e.target.value as StateCode;
            onChange({ destinationState: newState });
            onAutoAdjustDistance(newState);
          }}
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
        >
          {Object.entries(ROUTES_CONFIG).map(([key, r]) => (
            <option key={key} value={key}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>Destino principal: {currentRoute.mainDestination}</span>
          <span className="text-emerald-400 font-mono">Confiança Rota: {currentRoute.routeConfidence}%</span>
        </div>
      </div>

      {/* Peso Transportado */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Peso da Carga (kg)</span>
          </label>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            {input.weightKg.toLocaleString('pt-BR')} kg ({(input.weightKg / 1000).toFixed(1)} t)
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="50000"
          step="500"
          value={input.weightKg}
          onChange={(e) => onChange({ weightKg: Number(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center gap-1.5 mt-2">
          {[
            { label: '14t', value: 14000 },
            { label: '28t Padrão', value: 28000 },
            { label: '36t Bitrem', value: 36000 },
            { label: '48t Rodotrem', value: 48000 },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange({ weightKg: preset.value })}
              className={`px-2 py-1 text-[11px] rounded-md font-mono transition-colors ${
                input.weightKg === preset.value
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distância Estimada */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span>Distância Efetiva Rodoviária (km)</span>
          </label>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            {input.distanceKm.toLocaleString('pt-BR')} km
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="2200"
          step="25"
          value={input.distanceKm}
          onChange={(e) => onChange({ distanceKm: Number(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>50 km</span>
          <button
            type="button"
            onClick={() => onAutoAdjustDistance(input.destinationState)}
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Usar média da rota ({currentRoute.defaultKm} km)</span>
          </button>
          <span>2.200 km</span>
        </div>
      </div>

      {/* Tipo de Veículo */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Tipo de Veículo / Carroceria
        </label>
        <select
          value={input.vehicle}
          onChange={(e) => onChange({ vehicle: e.target.value as VehicleType })}
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
        >
          {Object.entries(VEHICLE_DETAILS).map(([key, v]) => (
            <option key={key} value={key}>
              {v.label} - {v.description}
            </option>
          ))}
        </select>
      </div>

      {/* Alíquota de Impostos & Pedágio */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Impostos (ICMS) + Taxas & Pedágio (%)</span>
          </label>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            {input.taxRatePercent.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="24"
          step="0.5"
          value={input.taxRatePercent}
          onChange={(e) => onChange({ taxRatePercent: Number(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>4% (Isento parcial)</span>
          <span>12% (Padrão interestadual)</span>
          <span>20% (ICMS pleno + pedágios)</span>
        </div>
      </div>

      {/* Condições Operacionais Avançadas */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fatores de Mercado & Volatilidade</span>
        </div>

        {/* Sazonalidade */}
        <div>
          <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>Sazonalidade Agrícola</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'safra_alta', label: 'Pico Safra (+10%)' },
              { id: 'entressafra', label: 'Entressafra (-6%)' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ seasonality: s.id as SeasonalityType })}
                className={`py-1.5 px-2 text-xs rounded-lg transition-colors text-center ${
                  input.seasonality === s.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Retorno com Carga Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2">
            <CornerDownLeft className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Frete de Retorno Assegurado</div>
              <div className="text-[10px] text-slate-400">
                Transporte de fertilizantes ou insumos de volta reduz o custo (~14%)
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ hasReturnFreight: !input.hasReturnFreight })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              input.hasReturnFreight ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                input.hasReturnFreight ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Diesel Integration: Official ANP Gov.br vs Manual */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-slate-200">Base de Diesel (ANP / Gov.br)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  useANPOfficialDiesel: !input.useANPOfficialDiesel,
                  dieselVariationPercent: 0,
                })
              }
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition ${
                input.useANPOfficialDiesel
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {input.useANPOfficialDiesel ? '✓ Oficial ANP' : 'Modo Manual'}
            </button>
          </div>

          {input.useANPOfficialDiesel ? (
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>
                  PR (Origem):{' '}
                  <strong className="text-white">
                    {formatCurrency(OFFICIAL_ANP_DIESEL_DATABASE.PR.dieselS10Avg)}/L
                  </strong>
                </span>
                <span>
                  {input.destinationState} (Destino):{' '}
                  <strong className="text-emerald-400">
                    {formatCurrency(
                      (OFFICIAL_ANP_DIESEL_DATABASE[input.destinationState] || OFFICIAL_ANP_DIESEL_DATABASE.SP)
                        .dieselS10Avg
                    )}
                    /L
                  </strong>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Levantamento Semanal ANP (10/02/2026)</span>
                <span className="text-emerald-400 font-medium">+12% precisão</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="text-slate-400">Variação Simulada:</span>
                <span
                  className={`font-mono font-medium ${
                    input.dieselVariationPercent > 0
                      ? 'text-amber-400'
                      : input.dieselVariationPercent < 0
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {input.dieselVariationPercent > 0 ? `+${input.dieselVariationPercent}%` : `${input.dieselVariationPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="20"
                step="1"
                value={input.dieselVariationPercent}
                onChange={(e) => onChange({ dieselVariationPercent: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>-15%</span>
                <span>0%</span>
                <span>+20%</span>
              </div>
            </div>
          )}
        </div>

        {/* IPCA Inflation Indexation */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">Reajuste Inflacionário (IPCA / IBGE)</span>
            <span className="text-[10px] font-mono text-blue-400">
              {input.ipcaPeriod === 'none' ? 'Sem IPCA' : input.ipcaPeriod === '6m' ? '+2,15%' : input.ipcaPeriod === '12m' ? '+4,40%' : '+8,92%'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'none', label: '0%' },
              { id: '6m', label: '6m (+2,1%)' },
              { id: '12m', label: '12m (+4,4%)' },
              { id: '24m', label: '24m (+8,9%)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ipcaPeriod: p.id as any })}
                className={`py-1 text-[11px] font-mono rounded-lg transition ${
                  input.ipcaPeriod === p.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vale-Pedágio Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-medium text-slate-200">Vale-Pedágio Obrigatório (Lei 10.209/01)</div>
            <div className="text-[10px] text-slate-400">
              {input.includeTollInTotal ? 'Somado ao custo total (Recomendado)' : 'Destacado à parte do frete'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ includeTollInTotal: !input.includeTollInTotal })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              input.includeTollInTotal ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                input.includeTollInTotal ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
