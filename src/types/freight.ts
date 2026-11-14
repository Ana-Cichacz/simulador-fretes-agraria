export type StateCode = 'PR' | 'SC' | 'RS' | 'SP' | 'MS' | 'MT' | 'MG' | 'GO';

export type VehicleType = 'truck' | 'sider' | 'vanderleia' | 'bitren' | 'rodotrem';

export type CargoType = 'soja' | 'cevada_malte' | 'milho' | 'fertilizante' | 'trigo' | 'ensacados';

export type SeasonalityType = 'safra_alta' | 'entressafra' | 'normal';

export interface RouteInfo {
  state: StateCode;
  name: string;
  defaultKm: number;
  sampleCount: number;
  routeConfidence: number; // 0 to 100
  regionalVolatility: number; // e.g., 0.03 to 0.07 standard deviation
  mainDestination: string;
}

export interface FreightInput {
  cargo: CargoType;
  weightKg: number;
  destinationState: StateCode;
  destinationCity: string;
  distanceKm: number;
  vehicle: VehicleType;
  taxRatePercent: number;
  seasonality: SeasonalityType;
  hasReturnFreight: boolean;
  dieselVariationPercent: number;
  useANPOfficialDiesel: boolean;
  anpDieselType: 'S10' | 'S500';
  ipcaPeriod: 'none' | '6m' | '12m' | '24m' | 'custom';
  ipcaCustomPercent: number;
  includeTollInTotal: boolean;
  hasElectronicTollTag: boolean;
}

export interface ConfidenceIntervals {
  p10Optimistic: number;
  p25FairLow: number;
  p50Median: number;
  p75FairHigh: number;
  p90Conservative: number;
  spreadP10P90: number;
  spreadPercent: number;
}

export interface AccuracyMetrics {
  selectedTolerancePercent: number; // e.g. 5 for ±5%
  hitProbabilityPercent: number; // e.g. 91.8%
  lowerBoundCost: number;
  upperBoundCost: number;
  confidenceLevel: 'Muito Alta' | 'Alta' | 'Moderada' | 'Atenção';
  routeSampleDensity: number;
  standardDeviationPercent: number;
  historicalHitRateInRoute: number; // % in historical dataset within tolerance
  
  // Model Global Validation Metrics
  r2Score: number;
  mapePercent: number;
  maeBrl: number;
  rmseBrl: number;
  totalTrainedSamples: number;
}

export interface ShapBreakdown {
  distancePercent: number;
  weightPercent: number;
  vehiclePercent: number;
  regionPercent: number;
  seasonalityPercent: number;
}

export interface FreightPredictionResult {
  baseFreight: number;
  unadjustedBaseFreight: number; // Frete antes do reajuste de IPCA
  taxAmount: number;
  totalTollCost: number; // Vale-Pedágio Obrigatório (Lei 10.209/01)
  totalCostWithoutToll: number; // Frete Líquido + Impostos (sem pedágio)
  totalCost: number; // Custo Operacional Total
  costPerTon: number;
  costPerKm: number;
  confidence: ConfidenceIntervals;
  accuracy: AccuracyMetrics;
  shap: ShapBreakdown;
  fuelAnalysis?: {
    originPrice: number;
    destinationPrice: number;
    routeAveragePrice: number;
    totalFuelCostBrl: number;
    totalLitersConsumed: number;
    fuelCostPerKm: number;
    fuelSharePercent: number;
    anttTriggerStatus: 'Normal' | 'Alerta de Reajuste' | 'Gatilho Disparado (>5%)';
    anttDeltaPercent: number;
    surveyDate: string;
    isOfficialANP: boolean;
  };
  ipcaAnalysis?: {
    period: string;
    periodLabel: string;
    ipcaRatePercent: number;
    correctionAmountBrl: number;
    isApplied: boolean;
  };
  tollAnalysis?: {
    plazasCount: number;
    vehicleAxlesCount: number;
    avgTollPerAxle: number;
    grossTollCostBrl: number;
    tagDiscountBrl: number;
    netTollCostBrl: number;
    tollCostPerKm: number;
    tollSharePercent: number;
    concessionaires: string[];
    highwayCorridors: string[];
    isMandatoryValePedagio: boolean;
  };
  negotiationRecommendation: {
    targetOpeningOffer: number;
    fairTargetCost: number;
    ceilingLimit: number;
    advice: string;
  };
}

export interface HistoricalFreightRecord {
  id: string;
  date: string;
  origin: string;
  destinationState: StateCode;
  destinationCity: string;
  cargo: CargoType;
  cargoName: string;
  weightKg: number;
  vehicle: VehicleType;
  actualPaidTotal: number;
  predictedTotal: number;
  errorPercent: number; // (actual - predicted) / actual * 100
  isWithinMargin5: boolean;
  status: 'Exato' | 'Dentro da Margem' | 'Desvio Aceitável' | 'Outlier';
}
