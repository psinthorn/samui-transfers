/**
 * useRateCalculation Hook
 * 
 * Manages rate calculation and caching
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface RateCalculation {
  basePrice: string;
  distanceCharge: string;
  peakHourMultiplier: number;
  seasonalMultiplier: number;
  discountMultiplier: number;
  subtotal: string;
  finalPrice: string;
  appliedRules: string[];
}

export interface RateCalculationInput {
  vehicleType: string;
  distance: number;
  pickupTime: Date;
  pickupDate: Date;
  bookingId?: string;
  returnTrip?: boolean;
}

interface UseRateCalculationReturn {
  calculation: RateCalculation | null;
  isLoading: boolean;
  error: string | null;
  calculateRate: (input: RateCalculationInput) => Promise<void>;
  finalPrice: number | null;
  priceBreakdown: {
    label: string;
    value: string;
    isMultiplier?: boolean;
  }[] | null;
}

export function useRateCalculation(): UseRateCalculationReturn {
  const [calculation, setCalculation] = useState<RateCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRate = useCallback(
    async (input: RateCalculationInput) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!input.vehicleType || input.distance <= 0) {
          throw new Error('Invalid input: vehicleType and distance required');
        }

        const response = await fetch('/api/rates/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleType: input.vehicleType,
            distance: input.distance,
            pickupTime: input.pickupTime.toISOString(),
            pickupDate: input.pickupDate.toISOString(),
            bookingId: input.bookingId,
            returnTrip: input.returnTrip || false,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to calculate rate');
        }

        const data = await response.json();
        setCalculation(data.calculation);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setCalculation(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Parse final price to number
  const finalPrice = useMemo(() => {
    if (!calculation?.finalPrice) return null;
    return parseFloat(calculation.finalPrice);
  }, [calculation?.finalPrice]);

  // Generate price breakdown for display
  const priceBreakdown = useMemo(() => {
    if (!calculation) return null;

    const breakdown = [
      { label: 'Base Price', value: `฿${calculation.basePrice}` },
      { label: 'Distance Charge', value: `฿${calculation.distanceCharge}` },
    ];

    if (calculation.peakHourMultiplier > 1) {
      breakdown.push({
        label: 'Peak Hour Surcharge',
        value: `×${calculation.peakHourMultiplier.toFixed(2)}`,
        isMultiplier: true,
      });
    }

    if (calculation.seasonalMultiplier > 1) {
      breakdown.push({
        label: 'Seasonal Pricing',
        value: `×${calculation.seasonalMultiplier.toFixed(2)}`,
        isMultiplier: true,
      });
    }

    if (calculation.discountMultiplier < 1) {
      breakdown.push({
        label: 'Discount',
        value: `×${calculation.discountMultiplier.toFixed(2)}`,
        isMultiplier: true,
      });
    }

    breakdown.push({ label: 'Total', value: `฿${calculation.finalPrice}` });

    return breakdown;
  }, [calculation]);

  return {
    calculation,
    isLoading,
    error,
    calculateRate,
    finalPrice,
    priceBreakdown,
  };
}
