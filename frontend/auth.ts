import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

const config: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || ""
        const password = (credentials?.password as string) || ""

        if (!email || !password) {
          throw new Error("Email and password are required")
        }

        const user = await db.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          throw new Error("User not found or password not set")
        }

        // Check if user is disabled
        if (user.disabled) {
          throw new Error("User account is disabled")
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role as "USER" | "ADMIN",
          disabled: user.disabled,
          emailVerified: user.emailVerified
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role as "USER" | "ADMIN"
        token.disabled = user.disabled
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = (token.email as string) || session.user.email
        session.user.name = (token.name as string) || session.user.name
        session.user.role = token.role as "USER" | "ADMIN"
        session.user.disabled = token.disabled as boolean | undefined
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
export const GET = handlers.GET
export const POST = handlers.POST
