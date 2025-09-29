// src/lib/priceDataService.ts

import { PriceData } from '../types/index';

interface JupiterPriceResponse {
  data: {
    [tokenMint: string]: {
      id: string;
      mintSymbol: string;
      vsToken: string;
      vsTokenSymbol: string;
      price: number;
    };
  };
  timeTaken: number;
}

interface BirdeyeHistoricalResponse {
  data: {
    items: Array<{
      unixTime: number;
      value: number;
      volume?: number;
    }>;
  };
  success: boolean;
}

// Token mint addresses for Solana
const TOKEN_MINTS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
};

export class PriceDataService {
  private readonly JUPITER_API_BASE = 'https://price.jup.ag/v4';
  private readonly BIRDEYE_API_BASE = 'https://public-api.birdeye.so/defi';
  private readonly COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

  async fetchHistoricalPrices(
    tokenPair: string,
    timePeriod: string
  ): Promise<PriceData[]> {
    const [baseToken, quoteToken] = tokenPair.split('/');
    
    try {
      // Try Birdeye first (best for Solana historical data)
      const birdeyeData = await this.fetchFromBirdeye(baseToken, quoteToken, timePeriod);
      if (birdeyeData.length > 0) {
        console.log(`Fetched ${birdeyeData.length} data points from Birdeye`);
        return birdeyeData;
      }
    } catch (error) {
      console.warn('Birdeye API failed, trying CoinGecko:', error);
    }

    try {
      // Fallback to CoinGecko
      const coingeckoData = await this.fetchFromCoinGecko(baseToken, quoteToken, timePeriod);
      if (coingeckoData.length > 0) {
        console.log(`Fetched ${coingeckoData.length} data points from CoinGecko`);
        return coingeckoData;
      }
    } catch (error) {
      console.warn('CoinGecko API failed:', error);
    }

    // If all APIs fail, return mock data with warning
    console.warn('All APIs failed, using mock data');
    return this.generateMockData(timePeriod);
  }

  private async fetchFromBirdeye(
    baseToken: string,
    quoteToken: string,
    timePeriod: string
  ): Promise<PriceData[]> {
    const baseTokenMint = TOKEN_MINTS[baseToken as keyof typeof TOKEN_MINTS];
    const quoteTokenMint = TOKEN_MINTS[quoteToken as keyof typeof TOKEN_MINTS];
    
    if (!baseTokenMint || !quoteTokenMint) {
      throw new Error(`Token mint not found for ${baseToken}/${quoteToken}`);
    }

    const { timeType, timeFrom } = this.getPeriodParams(timePeriod);
    const timeToNow = Math.floor(Date.now() / 1000);

    const url = `${this.BIRDEYE_API_BASE}/history_price?address=${baseTokenMint}&address_to=${quoteTokenMint}&type=${timeType}&time_from=${timeFrom}&time_to=${timeToNow}`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '', // You'll need to get this
      },
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data: BirdeyeHistoricalResponse = await response.json();
    
    if (!data.success || !data.data?.items) {
      throw new Error('Invalid Birdeye response');
    }

    return data.data.items.map((item, index) => ({
      timestamp: new Date(item.unixTime * 1000).toISOString().split('T')[0],
      price: item.value,
      volume: item.volume || this.estimateVolume(item.value, index) // Fallback volume
    }));
  }

  private async fetchFromCoinGecko(
    baseToken: string,
    quoteToken: string,
    timePeriod: string
  ): Promise<PriceData[]> {
    const coinGeckoIds = {
      'SOL': 'solana',
      'RAY': 'raydium',
      'USDC': 'usd-coin',
      'BONK': 'bonk',
      'JUP': 'jupiter-exchange-solana'
    };

    const coinId = coinGeckoIds[baseToken as keyof typeof coinGeckoIds];
    const vsCurrency = quoteToken.toLowerCase();
    
    if (!coinId) {
      throw new Error(`CoinGecko ID not found for ${baseToken}`);
    }

    const days = this.getDaysFromPeriod(timePeriod);
    const url = `${this.COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=daily`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid CoinGecko response');
    }

    return data.prices.map(([timestamp, price]: [number, number], index: number) => ({
      timestamp: new Date(timestamp).toISOString().split('T')[0],
      price: price,
      volume: data.total_volumes?.[index]?.[1] || this.estimateVolume(price, index)
    }));
  }

  private getPeriodParams(timePeriod: string) {
    const now = Math.floor(Date.now() / 1000);
    const periods = {
      '7d': { timeType: '1H', timeFrom: now - (7 * 24 * 60 * 60) },
      '30d': { timeType: '4H', timeFrom: now - (30 * 24 * 60 * 60) },
      '90d': { timeType: '1D', timeFrom: now - (90 * 24 * 60 * 60) },
      '180d': { timeType: '1D', timeFrom: now - (180 * 24 * 60 * 60) },
      '1y': { timeType: '1D', timeFrom: now - (365 * 24 * 60 * 60) },
    };

    return periods[timePeriod as keyof typeof periods] || periods['90d'];
  }

  private getDaysFromPeriod(timePeriod: string): number {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '1y': 365,
    };
    return days[timePeriod as keyof typeof days] || 90;
  }

  private estimateVolume(price: number, index: number): number {
    // Simple volume estimation based on price and some randomness
    const baseVolume = price * 1000000; // Base volume proportional to price
    const volatility = 0.2 + (Math.sin(index * 0.5) * 0.3); // Some pattern variation
    return baseVolume * (1 + volatility);
  }

  private generateMockData(timePeriod: string): PriceData[] {
    const days = this.getDaysFromPeriod(timePeriod);
    const mockData: PriceData[] = [];
    const basePrice = 50; // Starting price for SOL
    
    for (let i = 0; i < Math.min(days, 30); i++) { // Limit mock data to 30 points
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const volatility = (Math.random() - 0.5) * 0.1; // ±5% daily volatility
      const trendFactor = Math.sin((i / days) * Math.PI) * 0.2; // Some trend
      const price = basePrice * (1 + trendFactor + volatility);
      
      mockData.push({
        timestamp: date.toISOString().split('T')[0],
        price: Math.max(price, 1), // Ensure positive price
        volume: 1000000 + (Math.random() * 2000000) // Random volume 1-3M
      });
    }
    
    return mockData;
  }
}

export const priceDataService = new PriceDataService();
