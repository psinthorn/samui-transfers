"use server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function updateVehicleRate(vehicleId: string, newRate: number) {
  await requireAdmin()
  if (!vehicleId || !Number.isFinite(newRate) || newRate < 0) {
    return { ok: false, message: "Invalid input" }
  }
  // Example: assuming a Vehicle model exists with a numeric rate field; adjust to your schema.
  try {
    // await db.vehicle.update({ where: { id: vehicleId }, data: { rate: newRate } })
    // Placeholder while schema is not defined
    return { ok: true }
  } catch (e) {
    return { ok: false, message: "Failed to update rate" }
  }
}
