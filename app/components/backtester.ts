interface PriceData {
  timestamp: string;
  price: number;
  volume: number;
}

interface ConcentrationRange {
  min: number;
  max: number;
}

interface StrategyParams {
  investmentAmount: number;
  priceData: PriceData[];
  concentrationRange: ConcentrationRange;
  tokenPair: string;
}

interface DailyResult {
  date: string;
  price: number;
  inRange: boolean;
  dailyFees: number;
  cumulativeFees: number;
  impermanentLoss: number;
  netPL: number;
}

interface BacktestSummary {
  bestDay: number;
  worstDay: number;
  avgDailyFees: number;
}

interface BacktestResult {
  totalInvestment: number;
  totalFees: number;
  impermanentLoss: number;
  netProfit: number;
  roi: number;
  timeInRange: number;
  dailyBreakdown: DailyResult[];
  summary: BacktestSummary; 
  tokenPair: string;
}

// Main Backtester Class
class DLMMBacktester {
  private readonly DAILY_VOLUME_TO_FEES_RATIO: number = 0.0025; // 0.25% daily fees estimation
  private readonly GAS_COST_PER_REBALANCE: number = 0.01; // ~$0.01 SOL transaction cost

  public simulateConcentratedStrategy(params: StrategyParams): BacktestResult {
    const {
      investmentAmount,
      priceData,
      concentrationRange,
      tokenPair
    } = params;

    let totalFees: number = 0;
    let impermanentLoss: number = 0;
    let daysInRange: number = 0;
    const totalDays: number = priceData.length;
    const dailyResults: DailyResult[] = [];

    // Starting token ratio (50/50 split)
    const initialPrice: number = priceData[0].price;
    const tokenAmount: number = investmentAmount / 2 / initialPrice;
    const usdcAmount: number = investmentAmount / 2;

    for (let i = 0; i < priceData.length; i++) {
      const dayData: PriceData = priceData[i];
      const price: number = dayData.price;
      const volume: number = dayData.volume;
      
      // Check if liquidity is in range
      const inRange: boolean = price >= concentrationRange.min && price <= concentrationRange.max;
      
      let dailyFees: number = 0;
      if (inRange) {
        // Estimate user's share of trading volume based on liquidity concentration
        const liquidityShare: number = this.estimateLiquidityShare(investmentAmount, volume);
        dailyFees = volume * this.DAILY_VOLUME_TO_FEES_RATIO * liquidityShare;
        totalFees += dailyFees;
        daysInRange++;
      }

      // Calculate impermanent loss at current price
      const currentIL: number = this.calculateImpermanentLoss(initialPrice, price, tokenAmount, usdcAmount);
      
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

    const finalPrice: number = priceData[priceData.length - 1].price;
    const finalIL: number = this.calculateImpermanentLoss(initialPrice, finalPrice, tokenAmount, usdcAmount);
    const netProfit: number = totalFees - finalIL;

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
      },
      tokenPair: tokenPair // ← ADDED THIS LINE
    };
  }

  private calculateImpermanentLoss(
    initialPrice: number, 
    currentPrice: number, 
    tokenAmount: number, 
    usdcAmount: number
  ): number {
    // Standard IL formula for 50/50 pools
    const priceRatio: number = currentPrice / initialPrice;
    const holdValue: number = tokenAmount * currentPrice + usdcAmount;
    const lpValue: number = 2 * Math.sqrt(priceRatio) * (tokenAmount * initialPrice + usdcAmount);
    return Math.max(0, holdValue - lpValue);
  }

  private estimateLiquidityShare(userLiquidity: number, poolVolume: number): number {
    // Rough estimation - in reality this would use actual pool TVL data
    const estimatedPoolSize: number = poolVolume * 0.1; // Assume pool TVL is 10% of daily volume
    return Math.min(userLiquidity / estimatedPoolSize, 0.05); // Cap at 5% share
  }
}

// Test Data and Usage
const mockPriceData: PriceData[] = [
  { timestamp: '2025-06-01', price: 50.0, volume: 2000000 },
  { timestamp: '2025-06-02', price: 51.5, volume: 2200000 },
  { timestamp: '2025-06-03', price: 49.8, volume: 1800000 },
  { timestamp: '2025-06-04', price: 52.1, volume: 2400000 },
  { timestamp: '2025-06-05', price: 48.5, volume: 1600000 }, // Out of range
  { timestamp: '2025-06-06', price: 50.8, volume: 2100000 },
  { timestamp: '2025-06-07', price: 51.2, volume: 2300000 },
];

// Test the backtester
const backtester = new DLMMBacktester();

const testParams: StrategyParams = {
  investmentAmount: 5000,
  priceData: mockPriceData,
  concentrationRange: { min: 49, max: 52 }, // Tight range around $50
  tokenPair: "SOL/USDC"
};

const result = backtester.simulateConcentratedStrategy(testParams);


export default DLMMBacktester;
