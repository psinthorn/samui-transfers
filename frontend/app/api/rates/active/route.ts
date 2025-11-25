/**
 * Active Rates Endpoint
 * GET /api/rates/active
 * 
 * Returns all active service rates and pricing rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveRates, getAllActivePricingRules } from '@/lib/rates';

export async function GET(request: NextRequest) {
  try {
    const [serviceRates, pricingRules] = await Promise.all([
      getAllActiveRates(),
      getAllActivePricingRules(),
    ]);

    // Transform Decimal values to strings for JSON serialization
    const transformedRates = serviceRates.map((rate) => ({
      ...rate,
      basePrice: rate.basePrice.toString(),
      distanceRate: rate.distanceRate.toString(),
    }));

    const transformedRules = pricingRules.map((rule) => ({
      ...rule,
      multiplier: rule.multiplier.toString(),
    }));

    return NextResponse.json({
      success: true,
      serviceRates: transformedRates,
      pricingRules: transformedRules,
    });
  } catch (error) {
    console.error('Error fetching active rates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
