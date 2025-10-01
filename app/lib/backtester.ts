import { sarosService } from './sarosService';
import { 
  PriceData, 
  StrategyParams, 
  BacktestResult, 
  DailyResult, 
  StrategyType 
} from "../types/index";

export class DLMMBacktester {
  private readonly DAILY_VOLUME_TO_FEES_RATIO: number = 0.0025;
  private readonly GAS_COST_PER_REBALANCE: number = 0.01;

  // Main method now uses REAL Saros SDK
  public async simulateStrategy(params: StrategyParams): Promise<BacktestResult> {
    
    try {
      // Use Saros SDK backed calculation (returns results + pool health)
      const { results: dailyResults, poolHealthData } = await sarosService.calculateRealDLMMFees(params, params.priceData);
      
      // Format the results using real data and attach pool health snapshot
      const formatted = this.formatResultsFromRealData(params, dailyResults);
      formatted.poolHealth = {
        totalLiquidity: poolHealthData.totalLiquidity,
        volume24h: poolHealthData.volume24h,
        isActive: poolHealthData.isActive,
        poolAddress: poolHealthData.poolAddress,
        warning: poolHealthData.warning
      };
      return formatted;
      
    } catch {
      
      // Fallback to enhanced simulation if SDK fails
      return this.simulateStrategyFallback(params);
    }
  }

  private formatResultsFromRealData(params: StrategyParams, dailyResults: DailyResult[]): BacktestResult {
    if (dailyResults.length === 0) {
      throw new Error('No daily results from real Saros data');
    }

    const finalResult = dailyResults[dailyResults.length - 1];
    const daysInRange = dailyResults.filter(day => day.inRange).length;
    const totalDays = dailyResults.length;
    
    // Calculate additional metrics
    let rebalanceCount = 0;
    let totalGasCosts = 0;
    
    if (params.strategyType === StrategyType.ACTIVE_REBALANCING) {
      // Estimate rebalances from daily results
      for (let i = 1; i < dailyResults.length; i++) {
        const priceChange = Math.abs(dailyResults[i].price - dailyResults[i-1].price) / dailyResults[i-1].price;
        if (priceChange > (params.rebalanceThreshold || 0.05)) {
          rebalanceCount++;
          totalGasCosts += this.GAS_COST_PER_REBALANCE;
        }
      }
    }



    return {
      totalInvestment: params.investmentAmount,
      totalFees: finalResult.cumulativeFees,
      impermanentLoss: finalResult.impermanentLoss,
      netProfit: finalResult.netPL,
      roi: (finalResult.netPL / params.investmentAmount) * 100,
      timeInRange: (daysInRange / totalDays) * 100,
      dailyBreakdown: dailyResults,
      summary: {
        bestDay: Math.max(...dailyResults.map(d => d.dailyFees)),
        worstDay: Math.min(...dailyResults.map(d => d.dailyFees)),
        avgDailyFees: finalResult.cumulativeFees / totalDays,
        rebalanceCount: rebalanceCount,
        totalGasCosts: totalGasCosts
      }
    };
  }

  // Fallback simulation methods (keep your existing logic)
  private simulateStrategyFallback(params: StrategyParams): BacktestResult {

    
    switch (params.strategyType) {
      case StrategyType.CONCENTRATED:
        return this.simulateConcentratedStrategy(params);
      case StrategyType.WIDE:
        return this.simulateWideStrategy(params);
      case StrategyType.ACTIVE_REBALANCING:
        return this.simulateActiveStrategy(params);
      default:
        throw new Error('Invalid strategy type');
    }
  }

  // Keep all your existing simulation methods as fallbacks
  private simulateConcentratedStrategy(params: StrategyParams): BacktestResult {
    const { investmentAmount, priceData, concentrationRange } = params;
    
    if (!concentrationRange) {
      throw new Error('Concentration range required for concentrated strategy');
    }

    let totalFees = 0;
    let daysInRange = 0;
    const totalDays = priceData.length;
    const dailyResults: DailyResult[] = [];

    const initialPrice = priceData[0].price;
    const tokenAmount = investmentAmount / 2 / initialPrice;
    const usdcAmount = investmentAmount / 2;

    for (let i = 0; i < priceData.length; i++) {
      const dayData = priceData[i];
      const price = dayData.price;
      const volume = dayData.volume;
      
      const inRange = price >= concentrationRange.min && price <= concentrationRange.max;
      
      let dailyFees = 0;
      if (inRange) {
        const liquidityShare = this.estimateLiquidityShare(investmentAmount, volume);
        dailyFees = volume * this.DAILY_VOLUME_TO_FEES_RATIO * liquidityShare;
        totalFees += dailyFees;
        daysInRange++;
      }

      const currentIL = this.calculateImpermanentLoss(initialPrice, price, tokenAmount, usdcAmount);
      
      dailyResults.push({
        date: dayData.timestamp,
        price: price,
        inRange: inRange,
        dailyFees: dailyFees,
        cumulativeFees: totalFees,
        impermanentLoss: currentIL,
        netPL: totalFees - currentIL
      });
    }

    const finalPrice = priceData[priceData.length - 1].price;
    const finalIL = this.calculateImpermanentLoss(initialPrice, finalPrice, tokenAmount, usdcAmount);
    const netProfit = totalFees - finalIL;

    return {
      totalInvestment: investmentAmount,
      totalFees: totalFees,
      impermanentLoss: finalIL,
      netProfit: netProfit,
      roi: (netProfit / investmentAmount) * 100,
      timeInRange: (daysInRange / totalDays) * 100,
      dailyBreakdown: dailyResults,
      summary: {
        bestDay: Math.max(...dailyResults.map(d => d.dailyFees)),
        worstDay: Math.min(...dailyResults.map(d => d.dailyFees)),
        avgDailyFees: totalFees / totalDays
      }
    };
  }

  private simulateWideStrategy(params: StrategyParams): BacktestResult {
    const { investmentAmount, priceData } = params;
    
    const initialPrice = priceData[0].price;
    const wideRange = {
      min: initialPrice * 0.8,
      max: initialPrice * 1.2
    };

    let totalFees = 0;
    let daysInRange = 0;
    const totalDays = priceData.length;
    const dailyResults: DailyResult[] = [];

    const tokenAmount = investmentAmount / 2 / initialPrice;
    const usdcAmount = investmentAmount / 2;

    for (let i = 0; i < priceData.length; i++) {
      const dayData = priceData[i];
      const price = dayData.price;
      const volume = dayData.volume;
      
      const inRange = price >= wideRange.min && price <= wideRange.max;
      
      let dailyFees = 0;
      if (inRange) {
        const liquidityShare = this.estimateLiquidityShare(investmentAmount, volume) * 0.5;
        dailyFees = volume * this.DAILY_VOLUME_TO_FEES_RATIO * liquidityShare;
        totalFees += dailyFees;
        daysInRange++;
      }

      const currentIL = this.calculateImpermanentLoss(initialPrice, price, tokenAmount, usdcAmount);
      
      dailyResults.push({
        date: dayData.timestamp,
        price: price,
        inRange: inRange,
        dailyFees: dailyFees,
        cumulativeFees: totalFees,
        impermanentLoss: currentIL,
        netPL: totalFees - currentIL
      });
    }

    const finalPrice = priceData[priceData.length - 1].price;
    const finalIL = this.calculateImpermanentLoss(initialPrice, finalPrice, tokenAmount, usdcAmount);
    const netProfit = totalFees - finalIL;

    return {
      totalInvestment: investmentAmount,
      totalFees: totalFees,
      impermanentLoss: finalIL,
      netProfit: netProfit,
      roi: (netProfit / investmentAmount) * 100,
      timeInRange: (daysInRange / totalDays) * 100,
      dailyBreakdown: dailyResults,
      summary: {
        bestDay: Math.max(...dailyResults.map(d => d.dailyFees)),
        worstDay: Math.min(...dailyResults.map(d => d.dailyFees)),
        avgDailyFees: totalFees / totalDays
      }
    };
  }

  private simulateActiveStrategy(params: StrategyParams): BacktestResult {
    const { investmentAmount, priceData, rebalanceThreshold = 0.05 } = params;
    
    let totalFees = 0;
    let totalGasCosts = 0;
    let rebalanceCount = 0;
    const dailyResults: DailyResult[] = [];

    const initialPrice = priceData[0].price;
    const tokenAmount = investmentAmount / 2 / initialPrice;
    const usdcAmount = investmentAmount / 2;

    let currentRangeCenter = initialPrice;
    let currentRange = {
      min: currentRangeCenter * 0.96,
      max: currentRangeCenter * 1.04
    };

    for (let i = 0; i < priceData.length; i++) {
      const dayData = priceData[i];
      const price = dayData.price;
      const volume = dayData.volume;

      const priceDeviation = Math.abs(price - currentRangeCenter) / currentRangeCenter;
      
      if (priceDeviation > rebalanceThreshold) {
        currentRangeCenter = price;
        currentRange = {
          min: price * 0.96,
          max: price * 1.04
        };
        totalGasCosts += this.GAS_COST_PER_REBALANCE;
        rebalanceCount++;
      }

      const inRange = price >= currentRange.min && price <= currentRange.max;
      
      let dailyFees = 0;
      if (inRange) {
        const liquidityShare = this.estimateLiquidityShare(investmentAmount, volume);
        dailyFees = volume * this.DAILY_VOLUME_TO_FEES_RATIO * liquidityShare;
        totalFees += dailyFees;
      }

      const currentIL = this.calculateImpermanentLoss(initialPrice, price, tokenAmount, usdcAmount);
      
      dailyResults.push({
        date: dayData.timestamp,
        price: price,
        inRange: inRange,
        dailyFees: dailyFees,
        cumulativeFees: totalFees,
        impermanentLoss: currentIL,
        netPL: totalFees - currentIL - totalGasCosts
      });
    }

    const finalPrice = priceData[priceData.length - 1].price;
    const finalIL = this.calculateImpermanentLoss(initialPrice, finalPrice, tokenAmount, usdcAmount);
    const netProfit = totalFees - finalIL - totalGasCosts;

    return {
      totalInvestment: investmentAmount,
      totalFees: totalFees,
      impermanentLoss: finalIL,
      netProfit: netProfit,
      roi: (netProfit / investmentAmount) * 100,
      timeInRange: 100,
      dailyBreakdown: dailyResults,
      summary: {
        bestDay: Math.max(...dailyResults.map(d => d.dailyFees)),
        worstDay: Math.min(...dailyResults.map(d => d.dailyFees)),
        avgDailyFees: totalFees / priceData.length,
        rebalanceCount: rebalanceCount,
        totalGasCosts: totalGasCosts
      }
    };
  }

  private calculateImpermanentLoss(
    initialPrice: number, 
    currentPrice: number, 
    tokenAmount: number, 
    usdcAmount: number
  ): number {
    const priceRatio = currentPrice / initialPrice;
    const holdValue = tokenAmount * currentPrice + usdcAmount;
    const lpValue = 2 * Math.sqrt(priceRatio) * (tokenAmount * initialPrice + usdcAmount);
    return Math.max(0, holdValue - lpValue);
  }

  private estimateLiquidityShare(userLiquidity: number, poolVolume: number): number {
    const estimatedPoolSize = poolVolume * 0.1;
    return Math.min(userLiquidity / estimatedPoolSize, 0.05);
  }
}

// Mock data for testing (keep this)
export const mockPriceData: PriceData[] = [
  { timestamp: '2025-06-01', price: 50.0, volume: 2000000 },
  { timestamp: '2025-06-02', price: 51.5, volume: 2200000 },
  { timestamp: '2025-06-03', price: 49.8, volume: 1800000 },
  { timestamp: '2025-06-04', price: 52.1, volume: 2400000 },
  { timestamp: '2025-06-05', price: 48.5, volume: 1600000 },
  { timestamp: '2025-06-06', price: 50.8, volume: 2100000 },
  { timestamp: '2025-06-07', price: 51.2, volume: 2300000 },
];
