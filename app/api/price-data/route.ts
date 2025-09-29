import { NextRequest, NextResponse } from 'next/server';
import { priceDataService } from '../../lib/priceDataService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenPair = searchParams.get('tokenPair');
    const timePeriod = searchParams.get('timePeriod');

    if (!tokenPair || !timePeriod) {
      return NextResponse.json(
        { message: 'Missing required parameters: tokenPair, timePeriod' },
        { status: 400 }
      );
    }

    const priceData = await priceDataService.fetchHistoricalPrices(
      tokenPair,
      timePeriod
    );

    if (!priceData || priceData.length === 0) {
      return NextResponse.json(
        { message: 'No price data found for the specified parameters' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: priceData,
        count: priceData.length,
        tokenPair,
        timePeriod,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Price data API error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch price data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


