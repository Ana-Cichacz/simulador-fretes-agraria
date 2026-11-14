import { StateCode, VehicleType } from '../types/freight';

export interface RouteTollConfig {
  destinationState: StateCode;
  plazasCount: number;
  avgBaseTollPerAxle: number; // Tarifa média básica por eixo comercial (R$)
  concessionaires: string[];
  highwayCorridors: string[];
}

export interface IPCAPeriodConfig {
  id: 'none' | '6m' | '12m' | '24m' | 'custom';
  label: string;
  accumulatedPercent: number;
  description: string;
}

// Configuração oficial de eixos comerciais por tipo de veículo (ANTT)
export const VEHICLE_AXLES: Record<VehicleType, { axlesCount: number; name: string }> = {
  truck: { axlesCount: 3, name: 'Truck 3 Eixos' },
  sider: { axlesCount: 5, name: 'Carreta Sider 5 Eixos' },
  vanderleia: { axlesCount: 6, name: 'Vanderléia 6 Eixos' },
  bitren: { axlesCount: 7, name: 'Bitrem Articulado 7 Eixos' },
  rodotrem: { axlesCount: 9, name: 'Rodotrem 9 Eixos' },
};

// Dados oficiais de praças e concessionárias a partir do Polo Agrária (Entre Rios / Guarapuava - PR)
export const ROUTE_TOLL_DATABASE: Record<StateCode, RouteTollConfig> = {
  PR: {
    destinationState: 'PR',
    plazasCount: 4,
    avgBaseTollPerAxle: 14.20,
    concessionaires: ['Via Araucária (Lote 1)', 'EPR Litoral Pioneiro (Lote 2)'],
    highwayCorridors: ['BR-277', 'BR-373', 'BR-376'],
  },
  SP: {
    destinationState: 'SP',
    plazasCount: 8,
    avgBaseTollPerAxle: 13.50,
    concessionaires: ['Via Araucária', 'Arteris Régis Bittencourt', 'CCR AutoBAn', 'Ecorodovias'],
    highwayCorridors: ['BR-277', 'BR-116 (Régis Bittencourt)', 'SP-280 (Castelo Branco)'],
  },
  SC: {
    destinationState: 'SC',
    plazasCount: 5,
    avgBaseTollPerAxle: 11.80,
    concessionaires: ['Arteris Litoral Sul', 'Via Araucária'],
    highwayCorridors: ['BR-376', 'BR-101'],
  },
  RS: {
    destinationState: 'RS',
    plazasCount: 6,
    avgBaseTollPerAxle: 12.40,
    concessionaires: ['Arteris Planalto Sul', 'CCR ViaSul'],
    highwayCorridors: ['BR-116', 'BR-386'],
  },
  MS: {
    destinationState: 'MS',
    plazasCount: 6,
    avgBaseTollPerAxle: 11.20,
    concessionaires: ['CCR MSVia'],
    highwayCorridors: ['BR-163 (Corredor Sul)', 'BR-267'],
  },
  MT: {
    destinationState: 'MT',
    plazasCount: 11,
    avgBaseTollPerAxle: 12.80,
    concessionaires: ['Nova Rota do Oeste', 'CCR MSVia'],
    highwayCorridors: ['BR-163 (Eixo da Soja)', 'BR-364'],
  },
  MG: {
    destinationState: 'MG',
    plazasCount: 8,
    avgBaseTollPerAxle: 12.10,
    concessionaires: ['Eco050', 'Arteris Fernão Dias', 'EPR Triângulo'],
    highwayCorridors: ['BR-050', 'BR-381'],
  },
  GO: {
    destinationState: 'GO',
    plazasCount: 8,
    avgBaseTollPerAxle: 11.90,
    concessionaires: ['Triunfo Concebra', 'Eco153'],
    highwayCorridors: ['BR-153', 'BR-060'],
  },
};

// Histórico oficial de IPCA acumulado (IBGE / Banco Central)
export const IPCA_BENCHMARKS: Record<string, IPCAPeriodConfig> = {
  none: {
    id: 'none',
    label: 'Sem Reajuste (0,0%)',
    accumulatedPercent: 0.0,
    description: 'Preço base de tabela corrente',
  },
  '6m': {
    id: '6m',
    label: 'Últimos 6 meses (+2,15%)',
    accumulatedPercent: 2.15,
    description: 'Reajuste semestral conforme cláusula contratual curta',
  },
  '12m': {
    id: '12m',
    label: 'Últimos 12 meses (+4,40%)',
    accumulatedPercent: 4.40,
    description: 'Padrão anual de repactuação da Cooperativa Agrária (IBGE 12m)',
  },
  '24m': {
    id: '24m',
    label: 'Últimos 24 meses (+8,92%)',
    accumulatedPercent: 8.92,
    description: 'Contratos plurianuais sem reajuste intermediário',
  },
  custom: {
    id: 'custom',
    label: 'Taxa Personalizada',
    accumulatedPercent: 5.0,
    description: 'Índice de inflação acordado entre as partes',
  },
};
