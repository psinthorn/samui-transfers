import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

interface AssignDriverInput {
  driverId: string
  bookingId: string
  pickupLatitude?: number
  pickupLongitude?: number
}

interface UpdateDriverLocationInput {
  driverId: string
  latitude: number
  longitude: number
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get all available drivers (status = "available")
 */
export async function getAvailableDrivers() {
  const drivers = await prisma.driver.findMany({
    where: {
      status: "available",
      acceptingRides: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      averageRating: "desc",
    },
  })

  return drivers
}

/**
 * Find nearby drivers based on location
 */
export async function findNearbyDrivers(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  limit: number = 5
) {
  const availableDrivers = await getAvailableDrivers()

  const nearbyDrivers = availableDrivers
    .filter((driver) => {
      if (
        !driver.currentLatitude ||
        !driver.currentLongitude ||
        !driver.locationUpdatedAt
      ) {
        return false
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        driver.currentLatitude.toNumber(),
        driver.currentLongitude.toNumber()
      )

      return distance <= radiusKm
    })
    .map((driver) => ({
      ...driver,
      distance: calculateDistance(
        latitude,
        longitude,
        driver.currentLatitude!.toNumber(),
        driver.currentLongitude!.toNumber()
      ),
    }))
    .sort((a, b) => {
      // Sort by rating first, then by distance
      if (b.averageRating !== a.averageRating) {
        return (b.averageRating?.toNumber() || 0) - (a.averageRating?.toNumber() || 0)
      }
      return a.distance - b.distance
    })
    .slice(0, limit)

  return nearbyDrivers
}

/**
 * Assign a driver to a booking
 */
export async function assignDriverToBooking(input: AssignDriverInput) {
  try {
    // Check if driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: input.driverId },
    })

    if (!driver) {
      throw new Error("Driver not found")
    }

    if (driver.status !== "available") {
      throw new Error("Driver is not available")
    }

    // Check if driver already has an assignment
    const existingAssignment = await prisma.driverAssignment.findUnique({
      where: { bookingId: input.bookingId },
    })

    if (existingAssignment) {
      throw new Error("Booking already has a driver assignment")
    }

    // Create the assignment
    const assignment = await prisma.driverAssignment.create({
      data: {
        driverId: input.driverId,
        bookingId: input.bookingId,
        pickupLatitude: input.pickupLatitude
          ? new Decimal(input.pickupLatitude)
          : undefined,
        pickupLongitude: input.pickupLongitude
          ? new Decimal(input.pickupLongitude)
          : undefined,
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Update driver status to busy
    await prisma.driver.update({
      where: { id: input.driverId },
      data: { status: "busy" },
    })

    return assignment
  } catch (error) {
    console.error("Failed to assign driver:", error)
    throw error
  }
}

/**
 * Update driver location
 */
export async function updateDriverLocation(input: UpdateDriverLocationInput) {
  try {
    const driver = await prisma.driver.update({
      where: { id: input.driverId },
      data: {
        currentLatitude: new Decimal(input.latitude),
        currentLongitude: new Decimal(input.longitude),
        locationUpdatedAt: new Date(),
      },
    })

    return driver
  } catch (error) {
    console.error("Failed to update driver location:", error)
    throw error
  }
}

/**
 * Complete a driver assignment
 */
export async function completeDriverAssignment(
  assignmentId: string,
  rating?: number,
  comment?: string
) {
  try {
    const assignment = await prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: {
        assignmentStatus: "completed",
        completedAt: new Date(),
        rating: rating ? Math.min(Math.max(rating, 1), 5) : undefined,
        ratingComment: comment,
      },
      include: {
        driver: true,
      },
    })

    if (!assignment.driver) {
      throw new Error("Driver not found")
    }

    // Update driver status to available
    await prisma.driver.update({
      where: { id: assignment.driverId },
      data: { status: "available" },
    })

    // Update driver statistics
    const updatedDriver = await prisma.driver.update({
      where: { id: assignment.driverId },
      data: {
        completedTrips: { increment: 1 },
        totalTrips: { increment: 1 },
      },
    })

    // If rating was provided, update average rating
    if (rating) {
      const allRatings = await prisma.driverAssignment.findMany({
        where: {
          driverId: assignment.driverId,
          rating: { not: null },
        },
        select: { rating: true },
      })

      if (allRatings.length > 0) {
        const avgRating = new Decimal(
          allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) /
            allRatings.length
        )
        await prisma.driver.update({
          where: { id: assignment.driverId },
          data: {
            averageRating: avgRating,
            totalReviews: allRatings.length,
          },
        })
      }
    }

    return assignment
  } catch (error) {
    console.error("Failed to complete driver assignment:", error)
    throw error
  }
}

/**
 * Cancel driver assignment
 */
export async function cancelDriverAssignment(
  assignmentId: string,
  reason: string
) {
  try {
    const assignment = await prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: {
        assignmentStatus: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        driver: true,
      },
    })

    if (!assignment.driver) {
      throw new Error("Driver not found")
    }

    // Update driver status to available
    await prisma.driver.update({
      where: { id: assignment.driverId },
      data: { status: "available" },
    })

    // Update driver statistics
    await prisma.driver.update({
      where: { id: assignment.driverId },
      data: {
        cancelledTrips: { increment: 1 },
        totalTrips: { increment: 1 },
      },
    })

    return assignment
  } catch (error) {
    console.error("Failed to cancel driver assignment:", error)
    throw error
  }
}

/**
 * Get driver statistics
 */
export async function getDriverStats(driverId: string) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        assignments: {
          select: {
            assignmentStatus: true,
            createdAt: true,
          },
        },
        ratings: true,
      },
    })

    if (!driver) {
      throw new Error("Driver not found")
    }

    // Calculate completion rate
    const completionRate =
      driver.totalTrips > 0
        ? Math.round((driver.completedTrips / driver.totalTrips) * 100)
        : 0

    // Calculate cancellation rate
    const cancellationRate =
      driver.totalTrips > 0
        ? Math.round((driver.cancelledTrips / driver.totalTrips) * 100)
        : 0

    // Get this month's trips
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthTrips = driver.assignments.filter(
      (a) => a.createdAt >= monthStart
    ).length

    return {
      id: driver.id,
      name: driver.user?.name || "Unknown",
      status: driver.status,
      averageRating: driver.averageRating?.toNumber() || 0,
      totalReviews: driver.totalReviews,
      totalTrips: driver.totalTrips,
      completedTrips: driver.completedTrips,
      cancelledTrips: driver.cancelledTrips,
      completionRate,
      cancellationRate,
      thisMonthTrips,
      licenseVerified: driver.licenseVerified,
      backgroundCheckStatus: driver.backgroundCheckStatus,
    }
  } catch (error) {
    console.error("Failed to get driver stats:", error)
    throw error
  }
}

/**
 * Get current assignment for a driver
 */
export async function getDriverCurrentAssignment(driverId: string) {
  try {
    const assignment = await prisma.driverAssignment.findFirst({
      where: {
        driverId,
        assignmentStatus: { in: ["assigned", "accepted", "ongoing"] },
      },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
      },
    })

    return assignment
  } catch (error) {
    console.error("Failed to get driver assignment:", error)
    throw error
  }
}

/**
 * Update driver status
 */
export async function updateDriverStatus(
  driverId: string,
  status: "available" | "busy" | "offline" | "on_break"
) {
  try {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    })

    return driver
  } catch (error) {
    console.error("Failed to update driver status:", error)
    throw error
  }
}
