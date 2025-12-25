import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET all payment gateways (for admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all gateways sorted by display order
    const gateways = await db.paymentGateway.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return NextResponse.json(gateways)
  } catch (error: any) {
    console.error("Error fetching payment gateways:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      { 
        error: "Failed to fetch payment gateways",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT to update a payment gateway
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { id, isPublic, enabled, displayOrder, processingTime, fees } = body

    if (!id) {
      return NextResponse.json(
        { error: "Gateway ID is required" },
        { status: 400 }
      )
    }

    // Update the gateway
    const updated = await db.paymentGateway.update({
      where: { id },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(enabled !== undefined && { enabled }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(processingTime !== undefined && { processingTime }),
        ...(fees !== undefined && { fees }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating payment gateway:", error)
    return NextResponse.json(
      { error: "Failed to update payment gateway" },
      { status: 500 }
    )
  }
}

// POST to create a new payment gateway
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { type, displayName, description, icon, processingTime, fees, metadata } = body

    // Validate required fields
    if (!type || !displayName) {
      return NextResponse.json(
        { error: "Type and displayName are required" },
        { status: 400 }
      )
    }

    // Check if type already exists
    const existing = await db.paymentGateway.findUnique({
      where: { type },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Gateway type '${type}' already exists` },
        { status: 409 }
      )
    }

    // Get max display order
    const maxOrder = await db.paymentGateway.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    })

    const displayOrder = (maxOrder?.displayOrder || 0) + 1

    // Create new gateway
    const newGateway = await db.paymentGateway.create({
      data: {
        type,
        displayName,
        description: description || null,
        icon: icon || null,
        processingTime: processingTime || null,
        fees: fees || null,
        metadata: metadata || null,
        displayOrder,
        isPublic: true,
        enabled: true,
      },
    })

    return NextResponse.json(newGateway, { status: 201 })
  } catch (error: any) {
    console.error("Error creating payment gateway:", error)
    return NextResponse.json(
      { error: "Failed to create payment gateway", details: error?.message },
      { status: 500 }
    )
  }
}

// DELETE a payment gateway
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and admin role
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get gateway ID from query parameter
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Gateway ID is required" },
        { status: 400 }
      )
    }

    // Delete the gateway
    await db.paymentGateway.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting payment gateway:", error)
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Payment gateway not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete payment gateway", details: error?.message },
      { status: 500 }
    )
  }
}
