import { StateCode, VehicleType } from '../types/freight';
import { OFFICIAL_ANP_DIESEL_DATABASE, ANPStateDieselInfo, ANP_WEEKLY_HISTORY } from '../data/anpDieselData';

export interface RouteFuelAnalysis {
  originState: StateCode;
  destinationState: StateCode;
  originPrice: number;
  destinationPrice: number;
  routeAveragePrice: number;
  vehicleKmPerLiter: number;
  totalLitersConsumed: number;
  totalFuelCostBrl: number;
  fuelCostPerKm: number;
  anttTriggerStatus: 'Normal' | 'Alerta de Reajuste' | 'Gatilho Disparado (>5%)';
  anttDeltaPercent: number;
  lastSyncTimestamp: string;
}

// Consumo médio rodoviário parametrizado pelo IPEA / ANTT / Esalq-LOG para frotas agrícolas
const VEHICLE_KM_PER_LITER: Record<VehicleType, number> = {
  truck: 3.2,
  sider: 2.45,
  vanderleia: 2.25,
  bitren: 2.05,
  rodotrem: 1.75,
};

export class ANPDieselService {
  /**
   * Obtém o registro oficial da ANP para determinado estado
   */
  static getPriceForState(state: StateCode): ANPStateDieselInfo {
    return OFFICIAL_ANP_DIESEL_DATABASE[state] || OFFICIAL_ANP_DIESEL_DATABASE.PR;
  }

  /**
   * Obtém o preço médio nacional da ANP
   */
  static getNationalAverage(): ANPStateDieselInfo {
    return OFFICIAL_ANP_DIESEL_DATABASE.BR;
  }

  /**
   * Calcula o consumo de combustível e custo para o percurso
   */
  static calculateRouteFuel(
    destinationState: StateCode,
    vehicle: VehicleType,
    distanceKm: number,
    dieselType: 'S10' | 'S500' = 'S10'
  ): RouteFuelAnalysis {
    const originInfo = OFFICIAL_ANP_DIESEL_DATABASE.PR; // Guarapuava / PR
    const destInfo = OFFICIAL_ANP_DIESEL_DATABASE[destinationState] || OFFICIAL_ANP_DIESEL_DATABASE.SP;

    const originPrice = dieselType === 'S10' ? originInfo.dieselS10Avg : originInfo.dieselS500Avg;
    const destinationPrice = dieselType === 'S10' ? destInfo.dieselS10Avg : destInfo.dieselS500Avg;

    // Preço ponderado do trajeto (50% abastecimento na base PR, 50% no destino)
    const routeAveragePrice = Number(((originPrice + destinationPrice) / 2).toFixed(2));

    const kmPerLiter = VEHICLE_KM_PER_LITER[vehicle] || 2.05;
    const totalLitersConsumed = Math.round(distanceKm / kmPerLiter);
    const totalFuelCostBrl = Math.round(totalLitersConsumed * routeAveragePrice);
    const fuelCostPerKm = Number((totalFuelCostBrl / distanceKm).toFixed(2));

    // Regra da ANTT (Lei 13.703/2018): gatilho de reajuste automático a cada 5% de variação
    const anttReference = destInfo.anttReferencePrice;
    const anttDeltaPercent = Number((((routeAveragePrice - anttReference) / anttReference) * 100).toFixed(2));

    let anttTriggerStatus: 'Normal' | 'Alerta de Reajuste' | 'Gatilho Disparado (>5%)' = 'Normal';
    if (Math.abs(anttDeltaPercent) >= 5.0) {
      anttTriggerStatus = 'Gatilho Disparado (>5%)';
    } else if (Math.abs(anttDeltaPercent) >= 3.5) {
      anttTriggerStatus = 'Alerta de Reajuste';
    }

    return {
      originState: 'PR',
      destinationState,
      originPrice,
      destinationPrice,
      routeAveragePrice,
      vehicleKmPerLiter: kmPerLiter,
      totalLitersConsumed,
      totalFuelCostBrl,
      fuelCostPerKm,
      anttTriggerStatus,
      anttDeltaPercent,
      lastSyncTimestamp: destInfo.lastSurveyDate,
    };
  }

  /**
   * Histórico das últimas 8 semanas da ANP
   */
  static getWeeklyHistory() {
    return ANP_WEEKLY_HISTORY;
  }
}
