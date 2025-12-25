import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

interface LogActivityInput {
  actorId: string
  action: string
  resourceType: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  details?: string
  ipAddress?: string
  userAgent?: string
}

interface ActivityLogFilter {
  actorId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Log an activity to the ActivityLog table
 */
export async function logActivity(input: LogActivityInput) {
  try {
    // Get IP and User-Agent if not provided
    let ipAddress = input.ipAddress
    let userAgent = input.userAgent

    if (!ipAddress || !userAgent) {
      try {
        const headersList = await headers()
        ipAddress = ipAddress || (headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown")
        userAgent = userAgent || (headersList.get("user-agent") || "unknown")
      } catch (e) {
        // Headers might not be available in some contexts
        ipAddress = ipAddress || "unknown"
        userAgent = userAgent || "unknown"
      }
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        oldValues: input.oldValues,
        newValues: input.newValues,
        details: input.details,
        ipAddress,
        userAgent,
      },
    })

    return activityLog
  } catch (error) {
    console.error("Failed to log activity:", error)
    // Don't throw - logging should not break the main operation
    return null
  }
}

/**
 * Get activity log entries with optional filtering
 */
export async function getActivityLog(filter: ActivityLogFilter = {}) {
  const {
    actorId,
    action,
    resourceType,
    resourceId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = filter

  const where: any = {}

  if (actorId) where.actorId = actorId
  if (action) where.action = action
  if (resourceType) where.resourceType = resourceType
  if (resourceId) where.resourceId = resourceId

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    logs,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  }
}

/**
 * Get activity log for a specific resource
 */
export async function getResourceActivityLog(
  resourceType: string,
  resourceId: string
) {
  const logs = await prisma.activityLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return logs
}

/**
 * Get activity by actor (user)
 */
export async function getActorActivityLog(userId: string, limit: number = 100) {
  const logs = await prisma.activityLog.findMany({
    where: { actorId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return logs
}

/**
 * Generate audit report for a date range
 */
export async function generateAuditReport(startDate: Date, endDate: Date) {
  const logs = await prisma.activityLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Group by action
  const byAction: Record<string, typeof logs> = {}
  const byResource: Record<string, typeof logs> = {}
  const byActor: Record<string, typeof logs> = {}

  logs.forEach((log) => {
    // Group by action
    if (!byAction[log.action]) byAction[log.action] = []
    byAction[log.action].push(log)

    // Group by resource type
    if (!byResource[log.resourceType]) byResource[log.resourceType] = []
    byResource[log.resourceType].push(log)

    // Group by actor
    const actorKey = log.actor?.email || log.actorId
    if (!byActor[actorKey]) byActor[actorKey] = []
    byActor[actorKey].push(log)
  })

  return {
    startDate,
    endDate,
    totalEvents: logs.length,
    logs,
    summary: {
      byAction: Object.entries(byAction).map(([action, events]) => ({
        action,
        count: events.length,
      })),
      byResource: Object.entries(byResource).map(([resourceType, events]) => ({
        resourceType,
        count: events.length,
      })),
      topActors: Object.entries(byActor)
        .map(([actor, events]) => ({
          actor,
          count: events.length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    },
  }
}

/**
 * Archive old activity logs (older than specified days)
 */
export async function archiveOldActivityLogs(olderThanDays: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const result = await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  return result
}

/**
 * Get activity summary for dashboard
 */
export async function getActivitySummary(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const logs = await prisma.activityLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  })

  // Group by date
  const byDate: Record<string, number> = {}
  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split("T")[0]
    byDate[date] = (byDate[date] || 0) + 1
  })

  // Group by action
  const byAction: Record<string, number> = {}
  logs.forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1
  })

  return {
    totalActivities: logs.length,
    avgPerDay: Math.round(logs.length / days),
    byDate,
    byAction,
  }
}

/**
 * Common activity logging helpers
 */
export const ActivityActions = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_DISABLED: "USER_DISABLED",
  USER_ENABLED: "USER_ENABLED",

  // Booking actions
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_UPDATED: "BOOKING_UPDATED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",

  // Payment actions
  PAYMENT_CREATED: "PAYMENT_CREATED",
  PAYMENT_PROCESSED: "PAYMENT_PROCESSED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  PAYMENT_FAILED: "PAYMENT_FAILED",

  // Driver actions
  DRIVER_ASSIGNED: "DRIVER_ASSIGNED",
  DRIVER_STATUS_CHANGED: "DRIVER_STATUS_CHANGED",
  DRIVER_LOCATION_UPDATED: "DRIVER_LOCATION_UPDATED",
  DRIVER_REMOVED: "DRIVER_REMOVED",

  // Admin actions
  ADMIN_SETTING_CHANGED: "ADMIN_SETTING_CHANGED",
  ADMIN_TEMPLATE_UPDATED: "ADMIN_TEMPLATE_UPDATED",
  ADMIN_BULK_ACTION: "ADMIN_BULK_ACTION",

  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",
} as const

export const ResourceTypes = {
  USER: "USER",
  BOOKING: "BOOKING",
  PAYMENT: "PAYMENT",
  DRIVER: "DRIVER",
  SETTINGS: "SETTINGS",
  TEMPLATE: "TEMPLATE",
} as const
