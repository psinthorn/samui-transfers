import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("DEBUG API called")
    
    // Check environment variables
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30),
    }

    console.log("ENV CHECK:", envCheck)

    // Try to connect to database
    let dbStatus = "unknown"
    let testUser = null
    let userCheckError = null

    try {
      const { db } = await import("@/lib/db")
      console.log("DB imported successfully")
      
      const users = await db.user.findMany({ take: 1 })
      dbStatus = "connected"
      console.log("Database query successful")
      
      // Check if test user exists
      const user = await db.user.findUnique({
        where: { email: "adminx@admin.com" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          disabled: true,
          emailVerified: true,
          password: false // Don't expose password
        }
      })
      
      testUser = user ? {
        ...user,
        emailVerified: user.emailVerified ? "verified ✓" : "NOT VERIFIED ✗"
      } : null
      
      console.log("Test user found:", testUser)
      
    } catch (error) {
      dbStatus = "failed"
      userCheckError = (error as any)?.message
      console.error("DB Error:", userCheckError)
    }

    const response = {
      status: "debug",
      environment: envCheck,
      database: {
        status: dbStatus,
        error: userCheckError
      },
      testUser: testUser,
      timestamp: new Date().toISOString(),
      helpText: "If emailVerified shows NOT VERIFIED ✗, that's why login is failing. Mark the user as verified in the database."
    }
    
    console.log("Returning response:", response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("DEBUG endpoint error:", error)
    return NextResponse.json({
      error: (error as any)?.message,
      stack: (error as any)?.stack
    }, { status: 500 })
  }
}
