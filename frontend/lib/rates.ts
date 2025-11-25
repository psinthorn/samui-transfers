/**
 * Rate Calculation Engine
 * 
 * Handles all pricing calculations including:
 * - Base pricing by vehicle type
 * - Distance-based adjustments
 * - Peak hour surcharges
 * - Seasonal pricing
 * - Discount application
 */

import { db as prismaDb } from './db';
import type { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Type-safe Prisma access with proper model references
const prisma = prismaDb as unknown as PrismaClient;

export interface RateCalculationInput {
  vehicleType: string; // 'minibus', 'suv', 'sedan', etc.
  distance: number; // in kilometers
  pickupTime: Date;
  pickupDate: Date;
  returnTrip?: boolean;
}

export interface RateCalculationResult {
  basePrice: Decimal;
  distanceCharge: Decimal;
  peakHourMultiplier: number;
  seasonalMultiplier: number;
  discountMultiplier: number;
  subtotal: Decimal;
  finalPrice: Decimal;
  appliedRules: string[];
}

/**
 * Get active service rates for a vehicle type
 */
export async function getServiceRate(vehicleType: string) {
  return prisma.serviceRate.findFirst({
    where: {
      vehicleType: vehicleType.toUpperCase(),
      isActive: true,
    },
  });
}

/**
 * Calculate peak hour multiplier
 */
export async function calculatePeakHourMultiplier(
  pickupTime: Date,
  pickupDate: Date
): Promise<{ multiplier: number; applied: boolean }> {
  const hour = pickupTime.getHours();
  const dayOfWeek = pickupDate.getDay();

  // Get peak hour rules
  const peakHourRules = await prisma.pricingRule.findMany({
    where: {
      ruleType: 'PEAK_HOUR',
      isActive: true,
    },
  });

  for (const rule of peakHourRules) {
    // Check if day of week matches
    if (rule.dayOfWeek && !rule.dayOfWeek.includes(dayOfWeek)) {
      continue;
    }

    const startHour = rule.startTime.getHours();
    const endHour = rule.endTime.getHours();

    // Check if current hour is within peak hour range
    if (hour >= startHour && hour < endHour) {
      return {
        multiplier: rule.multiplier.toNumber(),
        applied: true,
      };
    }
  }

  return { multiplier: 1, applied: false };
}

/**
 * Calculate seasonal multiplier
 */
export async function calculateSeasonalMultiplier(
  pickupDate: Date
): Promise<{ multiplier: number; applied: boolean }> {
  // Get active seasonal rules that match the date
  const seasonalRules = await prisma.pricingRule.findMany({
    where: {
      ruleType: 'SEASONAL',
      isActive: true,
      startDate: {
        lte: pickupDate,
      },
      endDate: {
        gte: pickupDate,
      },
    },
  });

  if (seasonalRules.length > 0) {
    // Apply highest multiplier if multiple rules apply
    const maxMultiplier = Math.max(
      ...seasonalRules.map((r) => r.multiplier.toNumber())
    );
    return { multiplier: maxMultiplier, applied: true };
  }

  return { multiplier: 1, applied: false };
}

/**
 * Calculate discount multiplier (e.g., for bulk bookings, loyalty)
 */
export async function calculateDiscountMultiplier(
  basePrice: Decimal
): Promise<{ multiplier: number; applied: boolean }> {
  // Get active discount rules
  const discountRules = await prisma.pricingRule.findMany({
    where: {
      ruleType: 'DISCOUNT',
      isActive: true,
    },
  });

  // Apply the first matching discount rule
  // In a real system, you might have more complex logic here
  if (discountRules.length > 0) {
    return {
      multiplier: discountRules[0].multiplier.toNumber(),
      applied: true,
    };
  }

  return { multiplier: 1, applied: false };
}

/**
 * Main rate calculation function
 */
export async function calculateRate(
  input: RateCalculationInput
): Promise<RateCalculationResult | null> {
  const appliedRules: string[] = [];

  // Get base service rate
  const serviceRate = await getServiceRate(input.vehicleType);
  if (!serviceRate) {
    throw new Error(`Service rate not found for vehicle type: ${input.vehicleType}`);
  }

  // Calculate base price
  let basePrice = serviceRate.basePrice;
  appliedRules.push(`ServiceRate: ${serviceRate.vehicleType}`);

  // Check if distance meets minimum requirements
  if (input.distance < serviceRate.minDistance) {
    basePrice = serviceRate.basePrice; // Use minimum price
    appliedRules.push('MinimumDistanceApplied');
  }

  // Calculate distance charge
  let distanceCharge = new Decimal(0);
  if (input.distance > serviceRate.minDistance) {
    const excessDistance = input.distance - serviceRate.minDistance;
    distanceCharge = serviceRate.distanceRate.mul(excessDistance);
  }
  appliedRules.push(`Distance: ${input.distance}km`);

  // Calculate peak hour multiplier
  const { multiplier: peakMultiplier, applied: peakApplied } =
    await calculatePeakHourMultiplier(input.pickupTime, input.pickupDate);
  if (peakApplied) {
    appliedRules.push(`PeakHour: ${(peakMultiplier * 100).toFixed(0)}%`);
  }

  // Calculate seasonal multiplier
  const { multiplier: seasonalMultiplier, applied: seasonalApplied } =
    await calculateSeasonalMultiplier(input.pickupDate);
  if (seasonalApplied) {
    appliedRules.push(`Seasonal: ${(seasonalMultiplier * 100).toFixed(0)}%`);
  }

  // Calculate discount multiplier
  const subtotalBeforeDiscount = basePrice.add(distanceCharge);
  const { multiplier: discountMultiplier, applied: discountApplied } =
    await calculateDiscountMultiplier(subtotalBeforeDiscount);
  if (discountApplied) {
    appliedRules.push(`Discount: ${(discountMultiplier * 100).toFixed(0)}%`);
  }

  // Calculate subtotal
  let subtotal = subtotalBeforeDiscount
    .mul(peakMultiplier)
    .mul(seasonalMultiplier);

  // Apply discount
  let finalPrice = subtotal.mul(discountMultiplier);

  // Apply return trip discount if applicable
  if (input.returnTrip) {
    finalPrice = finalPrice.mul(0.9); // 10% discount for return trips
    appliedRules.push('ReturnTrip: -10%');
  }

  return {
    basePrice,
    distanceCharge,
    peakHourMultiplier: peakMultiplier,
    seasonalMultiplier: seasonalMultiplier,
    discountMultiplier: discountMultiplier,
    subtotal,
    finalPrice,
    appliedRules,
  };
}

/**
 * Save rate calculation history
 */
export async function saveRateHistory(
  bookingId: string,
  vehicleType: string,
  calculation: RateCalculationResult
) {
  return prisma.rateHistory.create({
    data: {
      bookingId,
      vehicleType,
      basePrice: calculation.basePrice,
      distanceRate: calculation.distanceCharge,
      appliedRules: calculation.appliedRules,
      finalPrice: calculation.finalPrice,
    },
  });
}

/**
 * Get all active service rates
 */
export async function getAllActiveRates() {
  return prisma.serviceRate.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      vehicleType: 'asc',
    },
  });
}

/**
 * Get all active pricing rules
 */
export async function getAllActivePricingRules() {
  return prisma.pricingRule.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ ruleType: 'asc' }, { startTime: 'asc' }],
  });
}
