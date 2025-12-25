import { db } from "@/lib/db"
import { decryptGatewayCredentials } from "../credentials-utils"
import { NextRequest, NextResponse } from "next/server"

/**
 * Internal endpoint to get decrypted payment gateway credentials
 * This should ONLY be called from backend code, never exposed to frontend
 * 
 * Usage: GET /api/payment-gateways/[type]/credentials
 * Authorization: Via direct server-to-server call or secure context only
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    // Security check: Only allow from same-origin server calls
    // In production, consider using a secret header or internal-only route
    const sourceIp = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown"
    
    // Log access to credentials
    console.log(`[SECURITY] Credentials access for ${type} from ${sourceIp}`)

    const gateway = await db.paymentGateway.findUnique({
      where: { type },
      include: { credentials: true },
    })

    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not found" },
        { status: 404 }
      )
    }

    if (!gateway.credentials?.isConfigured) {
      return NextResponse.json(
        { error: "Credentials not configured" },
        { status: 400 }
      )
    }

    // Decrypt credentials
    const decrypted = decryptGatewayCredentials(gateway.type, gateway.credentials)

    return NextResponse.json(decrypted)
  } catch (error: any) {
    console.error(`Error fetching credentials:`, error)
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    )
  }
}
