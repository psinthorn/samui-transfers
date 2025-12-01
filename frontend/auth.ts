import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// Debug logging helper
const debug = (label: string, data?: any) => {
  if (process.env.NODE_ENV === "development" || process.env.DEBUG_AUTH) {
    console.log(`[AUTH] ${label}`, data ? JSON.stringify(data, null, 2) : "")
  }
}

const config: NextAuthConfig = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        debug("Authorize called", { email: credentials?.email })

        const email = (credentials?.email as string) || ""
        const password = (credentials?.password as string) || ""

        if (!email || !password) {
          debug("Missing email or password", { email, password: "***" })
          throw new Error("Email and password are required")
        }

        try {
          const user = await db.user.findUnique({ where: { email } })

          if (!user || !user.password) {
            debug("User not found or no password", { email })
            throw new Error("User not found or password not set")
          }

          // Check if user is disabled
          if (user.disabled) {
            debug("User is disabled", { email })
            throw new Error("User account is disabled")
          }

          // Check if email is verified
          if (!user.emailVerified) {
            debug("Email not verified", { email })
            throw new Error("Please verify your email before signing in")
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            debug("Invalid password", { email })
            throw new Error("Invalid password")
          }

          debug("User authorized successfully", { email, role: user.role })

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role as "USER" | "ADMIN",
            disabled: user.disabled,
            emailVerified: user.emailVerified
          }
        } catch (error) {
          debug("Authorization error", { error: (error as any)?.message })
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      debug("JWT callback called", { user: !!user, account: !!account })

      try {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.role = user.role as "USER" | "ADMIN"
          token.disabled = user.disabled
          token.emailVerified = user.emailVerified
          debug("JWT token updated with user data", { email: user.email, role: user.role })
        }

        return token
      } catch (error) {
        debug("JWT callback error", { error: (error as any)?.message })
        throw error
      }
    },
    async session({ session, token }) {
      debug("Session callback called", { email: token.email })

      try {
        if (session.user && token) {
          session.user.id = token.id as string
          session.user.email = (token.email as string) || session.user.email
          session.user.name = (token.name as string) || session.user.name
          session.user.role = token.role as "USER" | "ADMIN"
          session.user.disabled = token.disabled as boolean | undefined
          session.user.emailVerified = token.emailVerified as Date | null
          debug("Session updated successfully", { email: session.user.email, role: session.user.role })
        }

        return session
      } catch (error) {
        debug("Session callback error", { error: (error as any)?.message })
        throw error
      }
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Vercel-specific configuration
  basePath: "/api/auth",
}

debug("NextAuth config initialized", {
  strategy: "jwt",
  trustHost: true,
  basePath: "/api/auth",
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  cookies: "sessionToken, callbackUrl configured"
})

export const { handlers, auth, signIn, signOut } = NextAuth(config)
export const GET = handlers.GET
export const POST = handlers.POST
