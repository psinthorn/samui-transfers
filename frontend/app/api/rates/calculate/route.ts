/**
 * Rate Calculation API Endpoint
 * POST /api/rates/calculate
 * 
 * Calculates the fare for a booking based on distance, vehicle type, and timing
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateRate, saveRateHistory } from '@/lib/rates';

export async function POST(request: NextRequest) {
  try {
    const {
      vehicleType,
      distance,
      pickupTime,
      pickupDate,
      bookingId,
      returnTrip,
    } = await request.json();

    // Validate input
    if (!vehicleType || !distance || !pickupTime || !pickupDate) {
      return NextResponse.json(
        {
          error: 'Missing required fields: vehicleType, distance, pickupTime, pickupDate',
        },
        { status: 400 }
      );
    }

    if (distance <= 0) {
      return NextResponse.json(
        { error: 'Distance must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate the rate
    const rateCalculation = await calculateRate({
      vehicleType,
      distance: parseFloat(distance.toString()),
      pickupTime: new Date(pickupTime),
      pickupDate: new Date(pickupDate),
      returnTrip: returnTrip || false,
    });

    if (!rateCalculation) {
      return NextResponse.json(
        { error: 'Could not calculate rate' },
        { status: 400 }
      );
    }

    // Save calculation history if booking ID provided
    if (bookingId) {
      try {
        await saveRateHistory(
          bookingId,
          vehicleType,
          rateCalculation
        );
      } catch (error) {
        console.warn('Failed to save rate history:', error);
        // Don't fail the request if history saving fails
      }
    }

    return NextResponse.json({
      success: true,
      calculation: {
        basePrice: rateCalculation.basePrice.toString(),
        distanceCharge: rateCalculation.distanceCharge.toString(),
        peakHourMultiplier: rateCalculation.peakHourMultiplier,
        seasonalMultiplier: rateCalculation.seasonalMultiplier,
        discountMultiplier: rateCalculation.discountMultiplier,
        subtotal: rateCalculation.subtotal.toString(),
        finalPrice: rateCalculation.finalPrice.toString(),
        appliedRules: rateCalculation.appliedRules,
      },
    });
  } catch (error) {
    console.error('Error calculating rate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
