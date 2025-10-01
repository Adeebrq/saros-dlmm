import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { PriceData, StrategyParams, DailyResult } from '../types/index';

// Pool health data interface
export interface PoolHealthData {
  totalLiquidity: number;
  volume24h: number;
  isActive: boolean;
  warning?: string;
  poolAddress: string;
}

// Extended result interface  
export interface SarosBacktestResult {
  results: DailyResult[];
  poolHealthData: PoolHealthData;
}

// REAL Saros Program Addresses
const SAROS_PROGRAM_ADDRESSES = {
  mainnet: '1qbkdrr3z4ryLA7pZykqxvxWPoeifcVKo6ZG9CfkvVE',
  devnet: 'EZoLi7fVCWjns7ukzjggSeDpG2GEGJbGs3MTRxAE29d4'
};

// SIMPLIFIED Pool Config - Let SDK provide decimals dynamically
const REAL_SAROS_POOLS = {
  'SOL/USDC': {
    address: '8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS',
    baseTicker: 'SOL',
    quoteTicker: 'USDC'
  },
  'UNIBTC/XBTC': {
    address: '7hc6hXjDPcFnhGBPBGTKUtViFsQuyWw8ph4ePHF1aTYG',
    baseTicker: 'UNIBTC',
    quoteTicker: 'XBTC'
  },
  'USDS/USDC': {
    address: 'DHXKB9fSff4LjubMFieKxaBrvNY6AzXVwaRLk5N2vs87',
    baseTicker: 'USDS',
    quoteTicker: 'USDC'
  },
  'USDC/USDT': {
    address: '9P3N4QxjMumpTNNdvaNNskXu2t7VHMMXtePQB72kkSAk',
    baseTicker: 'USDC',
    quoteTicker: 'USDT'
  },
  'DZSOL/SOL': {
    address: '9TxcJsmNPaZz6grcLgQxQ9FChAJxztCL54oj6rekwsdD',
    baseTicker: 'DZSOL',
    quoteTicker: 'SOL'
  },
  'MSTRR/USD1': {
    address: 'BJBShFvoKhUyb4k45Gep1ciQjZYPy3HpMmzxgpxx1bfK',
    baseTicker: 'MSTRR',
    quoteTicker: 'USD1'
  },
  'USD1/USDC':{
    address: '8yrUdy1XufCuupHgbpptcer1npNkQDVh95sLnc67CfR2',
    baseTicker: 'USD1',
    quoteTicker: 'USDC'
  },
  'LAUNCHCOIN/USDC':{
    address: 'Cy75bt7SkreqcEE481HsKChWJPM7kkS3svVWKRPpS9UK',
    baseTicker: 'LAUNCHCOIN',
    quoteTicker: 'USDC'
}
};

// Fallback decimals if SDK doesn't provide them
const FALLBACK_DECIMALS = {
  'SOL': 9,
  'USDC': 6,
  'USDT': 6,
  'USDS': 6,
  'SAROS': 6,
  'BONK': 5,
  'WIF': 6,
  'UNIBTC': 8,
  'XBTC': 8,
  'DZSOL': 9,
  'MSTRR': 6,
  'USD1': 6
};

export class SarosService {
  private liquidityBook: LiquidityBookServices;
  private connection: Connection;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    this.liquidityBook = new LiquidityBookServices({
      mode: MODE.MAINNET,
      options: {
        rpcUrl,
        commitmentOrConfig: 'confirmed'
      }
    });
    
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async discoverRealPools(): Promise<string[]> {
    try {
      const poolAddresses = await this.liquidityBook.fetchPoolAddresses();
      return poolAddresses;
    } catch (error) {
      return [];
    }
  }

  // CRITICAL FIX: Dynamic decimal detection from Saros SDK
  private async extractRealPoolData(tokenPair: string) {
    try {
      const poolConfig = REAL_SAROS_POOLS[tokenPair as keyof typeof REAL_SAROS_POOLS];
      if (!poolConfig) {
        throw new Error(`Pool configuration not found for ${tokenPair}`);
      }

      const poolPublicKey = new PublicKey(poolConfig.address);
      
      const metadata = await this.liquidityBook.fetchPoolMetadata(poolConfig.address);
      const pairAccount = await this.liquidityBook.getPairAccount(poolPublicKey);
      
      // CRITICAL: Saros SDK swaps the decimal fields in metadata.extra!
      // tokenBaseDecimal actually refers to QUOTE token decimals
      // tokenQuoteDecimal actually refers to BASE token decimals
      let actualBaseDecimals: number;
      let actualQuoteDecimals: number;
      
      if (metadata.extra?.tokenQuoteDecimal !== undefined && metadata.extra?.tokenBaseDecimal !== undefined) {
        // Use SDK-provided decimals (but they're swapped!)
        actualBaseDecimals = metadata.extra.tokenQuoteDecimal;
        actualQuoteDecimals = metadata.extra.tokenBaseDecimal;
      } else {
        // Fallback to our known decimals
        actualBaseDecimals = FALLBACK_DECIMALS[poolConfig.baseTicker as keyof typeof FALLBACK_DECIMALS] || 6;
        actualQuoteDecimals = FALLBACK_DECIMALS[poolConfig.quoteTicker as keyof typeof FALLBACK_DECIMALS] || 6;
      }
      
      // Parse raw reserves with dynamically detected decimals
      const baseReserveRaw = parseFloat(metadata.baseReserve) || 0;
      const quoteReserveRaw = parseFloat(metadata.quoteReserve) || 0;
      
      // Convert using the corrected decimals
      const baseTokenAmount = baseReserveRaw / Math.pow(10, actualBaseDecimals);
      const quoteTokenAmount = quoteReserveRaw / Math.pow(10, actualQuoteDecimals);
      
      // Smart USD liquidity calculation based on token types
      let totalLiquidityUSD = 0;
      
      // USD-pegged stablecoins
      if (['USDC', 'USDT', 'USDS', 'USD1'].includes(poolConfig.quoteTicker)) {
        totalLiquidityUSD = quoteTokenAmount * 2; // Both sides approximated
      } else if (['USDC', 'USDT', 'USDS', 'USD1'].includes(poolConfig.baseTicker)) {
        totalLiquidityUSD = baseTokenAmount * 2;
      }
      // SOL-based pairs
      else if (poolConfig.baseTicker === 'SOL' || poolConfig.quoteTicker === 'SOL') {
        const solPrice = 150; // Current SOL price estimate
        if (poolConfig.baseTicker === 'SOL') {
          totalLiquidityUSD = baseTokenAmount * solPrice * 2;
        } else {
          totalLiquidityUSD = quoteTokenAmount * solPrice * 2;
        }
      }
      // Bitcoin-based pairs
      else if (poolConfig.baseTicker.includes('BTC') || poolConfig.quoteTicker.includes('BTC')) {
        const btcPrice = 65000; // Current BTC price estimate
        if (poolConfig.baseTicker.includes('BTC')) {
          totalLiquidityUSD = baseTokenAmount * btcPrice * 2;
        } else {
          totalLiquidityUSD = quoteTokenAmount * btcPrice * 2;
        }
      }
      // SAROS pairs (estimate $0.50 per SAROS)
      else if (poolConfig.baseTicker === 'SAROS' || poolConfig.quoteTicker === 'SAROS') {
        const sarosPrice = 0.50;
        if (poolConfig.baseTicker === 'SAROS') {
          totalLiquidityUSD = baseTokenAmount * sarosPrice * 2;
        } else {
          totalLiquidityUSD = quoteTokenAmount * sarosPrice * 2;
        }
      }
      // Other meme/alt coins - conservative estimate
      else {
        const estimatedPrice = 0.01; // Very conservative $0.01 per token
        totalLiquidityUSD = Math.max(baseTokenAmount, quoteTokenAmount) * estimatedPrice * 2;
      }
      
      const realData = {
        isActive: totalLiquidityUSD > 1000, // $1K minimum for active status
        totalLiquidity: totalLiquidityUSD,
        baseReserve: baseTokenAmount,
        quoteReserve: quoteTokenAmount,
        baseReserveRaw,
        quoteReserveRaw,
        actualBaseDecimals,
        actualQuoteDecimals,
        activeId: pairAccount.activeId,
        binStep: pairAccount.binStep,
        baseFee: pairAccount.staticFeeParameters?.baseFactor || 0,
        feeRate: (pairAccount.staticFeeParameters?.baseFactor || 0) / 1000000,
        poolConfig
      };
      
      return realData;
      
    } catch (error) {
      throw error;
    }
  }

  // More realistic volume estimation
  private estimatePoolVolume(priceData: PriceData[], poolLiquidity: number): number {
    if (!priceData || priceData.length === 0) return 0;
    
    const totalMarketVolume = priceData.reduce((sum, d) => sum + d.volume, 0);
    const avgDailyVolume = totalMarketVolume / priceData.length;
    
    // More realistic pool volume share estimation
    let poolVolumeShare = 0.001; // Default 0.1% (very conservative)
    
    if (poolLiquidity > 10000000) {       // $10M+ pools
      poolVolumeShare = 0.02;             // 2% of market volume
    } else if (poolLiquidity > 5000000) {  // $5M+ pools  
      poolVolumeShare = 0.01;             // 1% of market volume
    } else if (poolLiquidity > 1000000) {  // $1M+ pools
      poolVolumeShare = 0.005;            // 0.5% of market volume
    } else if (poolLiquidity > 100000) {   // $100K+ pools
      poolVolumeShare = 0.002;            // 0.2% of market volume
    }
    
    return avgDailyVolume * poolVolumeShare;
  }

  // Main calculation method with dynamic data extraction
  async calculateRealDLMMFees(
    params: StrategyParams, 
    priceData: PriceData[]
  ): Promise<SarosBacktestResult> {
    try {
      const poolData = await this.extractRealPoolData(params.tokenPair);
      
      // Estimate pool volume with realistic expectations
      const estimatedDailyVolume = this.estimatePoolVolume(priceData, poolData.totalLiquidity);
      
      if (!poolData.isActive) {
        if (poolData.totalLiquidity > 0) {
        }
      }

      // Calculate results with dynamic data
      const results = await this.calculateWithDynamicData(params, priceData, poolData);

      // Create pool health data for UI
      const poolHealthData: PoolHealthData = {
        totalLiquidity: poolData.totalLiquidity,
        volume24h: estimatedDailyVolume,
        isActive: poolData.isActive,
        poolAddress: poolData.poolConfig.address,
        warning: this.generatePoolWarning(poolData, params.investmentAmount)
      };

      return {
        results,
        poolHealthData
      };

    } catch (error) {
      return {
        results: [],
        poolHealthData: {
          totalLiquidity: 0,
          volume24h: 0,
          isActive: false,
          poolAddress: '',
          warning: 'Failed to fetch pool data - calculations may be inaccurate'
        }
      };
    }
  }

  // Realistic warnings
  private generatePoolWarning(poolData: any, investmentAmount: number): string | undefined {
    if (poolData.totalLiquidity < 1000) {
      return `Extremely low liquidity ($${poolData.totalLiquidity.toFixed(2)}) - returns will be near zero`;
    }
    
    if (poolData.totalLiquidity < 100000) {
      return `Low liquidity pool ($${poolData.totalLiquidity.toLocaleString()}) - limited trading activity expected`;
    }
    
    const investmentShare = investmentAmount / (poolData.totalLiquidity + investmentAmount);
    if (investmentShare > 0.1) {
      return `Your $${investmentAmount.toLocaleString()} investment is ${(investmentShare * 100).toFixed(1)}% of pool - results may be unrealistic`;
    }
    
    if (investmentShare > 0.05) {
      return `Large position (${(investmentShare * 100).toFixed(1)}% of pool) - consider smaller test amount first`;
    }
    
    return undefined;
  }

  // Dynamic calculation with SDK-provided decimals
  private async calculateWithDynamicData(
    params: StrategyParams,
    priceData: PriceData[],
    poolData: any
  ): Promise<DailyResult[]> {
    const results: DailyResult[] = [];
    let totalFees = 0;
    
    const initialPrice = priceData[0].price;
    const tokenAmount = params.investmentAmount / 2 / initialPrice;
    const usdcAmount = params.investmentAmount / 2;
    
    // Calculate realistic pool share
    const yourActualPoolShare = poolData.totalLiquidity > 0 ? 
      params.investmentAmount / (poolData.totalLiquidity + params.investmentAmount) : 0;
    
    for (let i = 0; i < priceData.length; i++) {
      const dayData = priceData[i];
      const currentPrice = dayData.price;
      
      // Realistic range check
      const inRange = this.isRealisticallyInRange(
        currentPrice,
        initialPrice,
        params.strategyType
      );
      
      // Fee calculation with proper expectations
      let dailyFees = 0;
      if (inRange && poolData.isActive) {
        dailyFees = this.calculateRealisticSarosFees(
          params.investmentAmount,
          poolData.totalLiquidity,
          poolData.feeRate,
          dayData.volume,
          yourActualPoolShare
        );
        totalFees += dailyFees;
      }
      
      // Standard IL calculation
      const currentIL = this.calculateHonestImpermanentLoss(
        initialPrice,
        currentPrice,
        tokenAmount,
        usdcAmount
      );
      
      results.push({
        date: dayData.timestamp,
        price: currentPrice,
        inRange,
        dailyFees,
        cumulativeFees: totalFees,
        impermanentLoss: currentIL,
        netPL: totalFees - currentIL
      });
    }
    
    const daysInRange = results.filter(r => r.inRange).length;
    
    return results;
  }

  // Realistic range check
  private isRealisticallyInRange(
    currentPrice: number,
    initialPrice: number,
    strategyType: string
  ): boolean {
    let rangePercent = 0;
    switch (strategyType) {
      case 'concentrated': rangePercent = 0.10; break; // ±10%
      case 'wide': rangePercent = 0.30; break;         // ±30%
      case 'active': rangePercent = 0.15; break;       // ±15%
      default: rangePercent = 0.20; break;
    }
    
    const minPrice = initialPrice * (1 - rangePercent);
    const maxPrice = initialPrice * (1 + rangePercent);
    return currentPrice >= minPrice && currentPrice <= maxPrice;
  }

  // Conservative fee calculation
  private calculateRealisticSarosFees(
    userInvestment: number,
    realPoolLiquidity: number,
    realFeeRate: number,
    marketVolume: number,
    yourPoolShare: number
  ): number {
    
    if (realPoolLiquidity < 1000) {
      return 0; // Essentially dead pool
    }
    
    // Very conservative pool volume estimation
    let poolVolumeShare = 0.0005; // Default 0.05% of market volume
    
    if (realPoolLiquidity > 5000000) {       // $5M+ pools
      poolVolumeShare = 0.01;                // 1% of market volume
    } else if (realPoolLiquidity > 1000000) { // $1M+ pools  
      poolVolumeShare = 0.005;               // 0.5% of market volume
    } else if (realPoolLiquidity > 100000) {  // $100K+ pools
      poolVolumeShare = 0.001;               // 0.1% of market volume
    }
    
    const estimatedPoolVolume = marketVolume * poolVolumeShare;
    const dailyFees = estimatedPoolVolume * realFeeRate * yourPoolShare;
    
    return Math.max(dailyFees, 0);
  }

  // Standard IL calculation
  private calculateHonestImpermanentLoss(
    initialPrice: number,
    currentPrice: number,
    tokenAmount: number,
    usdcAmount: number
  ): number {
    const priceRatio = currentPrice / initialPrice;
    const holdValue = tokenAmount * currentPrice + usdcAmount;
    const initialTokenValue = tokenAmount * initialPrice;
    const lpValue = 2 * Math.sqrt(priceRatio) * Math.sqrt(initialTokenValue * usdcAmount);
    const impermanentLoss = Math.max(0, holdValue - lpValue);
    return impermanentLoss;
  }

  // Test connection with dynamic data
  async testConnection(tokenPair: string = 'SOL/USDC'): Promise<boolean> {
    try {
      const poolData = await this.extractRealPoolData(tokenPair);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPoolMetadata(tokenPair: string) {
    try {
      const poolConfig = REAL_SAROS_POOLS[tokenPair as keyof typeof REAL_SAROS_POOLS];
      if (!poolConfig) {
        return { error: 'Pool configuration not found' };
      }
      
      const metadata = await this.liquidityBook.fetchPoolMetadata(poolConfig.address);
      
      return { metadata, poolConfig };
      
    } catch (error) {
      return { error: 'Failed to fetch pool metadata' };
    }
  }
}

export const sarosService = new SarosService();
