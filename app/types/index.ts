// src/types/index.ts

export interface PriceData {
    timestamp: string;
    price: number;
    volume: number;
  }
  
  export interface ConcentrationRange {
    min: number;
    max: number;
  }
  
  export enum StrategyType {
    CONCENTRATED = 'concentrated',
    WIDE = 'wide', 
    ACTIVE_REBALANCING = 'active'
  }
  
  export interface StrategyParams {
    investmentAmount: number;
    priceData: PriceData[];
    strategyType: StrategyType;
    concentrationRange?: ConcentrationRange;
    rebalanceThreshold?: number;
    tokenPair: string;
  }
  
  export interface DailyResult {
    date: string;
    price: number;
    inRange: boolean;
    dailyFees: number;
    cumulativeFees: number;
    impermanentLoss: number;
    netPL: number;
  }
  
  export interface BacktestSummary {
    bestDay: number;
    worstDay: number;
    avgDailyFees: number;
    rebalanceCount?: number;
    totalGasCosts?: number;
  }
  
  export interface BacktestResult {
    totalInvestment: number;
    totalFees: number;
    impermanentLoss: number;
    netProfit: number;
    roi: number;
    timeInRange: number;
    dailyBreakdown: DailyResult[];
    summary: BacktestSummary;
    // Optional Saros pool health snapshot for this run
    poolHealth?: {
      totalLiquidity: number;
      volume24h: number;
      isActive: boolean;
      poolAddress: string;
      warning?: string;
    };
  }
  

  // src/types/index.ts - Add any missing types

export interface SarosBinData {
    binId: number;
    reserveX: number;
    reserveY: number;
    totalSupply: number;
    liquidityShare?: any;
  }
  
  export interface SarosPoolInfo {
    binStep: number;
    activeId: number;
    baseFactor: number;
    tokenMintX: string;
    tokenMintY: string;
    staticFeeParameters: {
      baseFactor: number;
      protocolShare: number;
    };
  }
  