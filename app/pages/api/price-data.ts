// src/pages/api/price-data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { priceDataService } from '../../lib/priceDataService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { tokenPair, timePeriod } = req.query;
    
    if (!tokenPair || !timePeriod) {
      return res.status(400).json({ 
        message: 'Missing required parameters: tokenPair, timePeriod' 
      });
    }

    
    const priceData = await priceDataService.fetchHistoricalPrices(
      tokenPair as string,
      timePeriod as string
    );

    if (priceData.length === 0) {
      return res.status(404).json({ 
        message: 'No price data found for the specified parameters' 
      });
    }

    res.status(200).json({
      success: true,
      data: priceData,
      count: priceData.length,
      tokenPair,
      timePeriod
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch price data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
