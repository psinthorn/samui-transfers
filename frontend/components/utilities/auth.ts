import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import prisma from "./db"

// Extend session type via callbacks instead of declaration merging for brevity here

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
  },
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest(params) {
        const { identifier, url, provider } = params
        // Basic styled HTML email (customizable)
        const host = new URL(url).host
        const escapedEmail = identifier.replace(/\./g, '&#8203;.')
        const html = `<!DOCTYPE html><html><body style="background:#f7f7f7;padding:24px;font-family:system-ui,Arial,sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eee;">
          <tr><td style="padding:24px;text-align:center;background:#0f172a;color:#fff;font-weight:600;font-size:20px;">Sign in to ${host}</td></tr>
          <tr><td style="padding:24px;font-size:14px;color:#334155;">Hello <strong>${escapedEmail}</strong>,<br/><br/>Click the button below to sign in. This link will expire shortly.</td></tr>
          <tr><td style="padding:0 24px 24px 24px;text-align:center;">
            <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Sign in</a>
          </td></tr>
          <tr><td style="padding:0 24px 32px 24px;font-size:12px;color:#64748b;">If you did not request this, you can ignore this email.</td></tr>
        </table></body></html>`
        const text = `Sign in to ${host}\n${url}\n\n`
        // Use provider's built-in send if available (Nodemailer provider provides a transporter)
        const result = await (provider as any).transport.sendMail({
          to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text,
            html,
        })
        const failed = (result.rejected ?? []).concat(result.pending ?? [])
        if (failed.length) throw new Error('Email(s) could not be sent: ' + failed.join(', '))
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ].filter(Boolean),
  callbacks: {
    async session({ session, user }) {
      // Attach role from user record
      if (session.user) {
        (session.user as any).role = (user as any).role || 'USER'
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    verifyRequest: '/verify',
    // signIn: '/sign-in', // custom page if desired
  },
  events: {
    async createUser({ user }) {
      // Ensure default role on first creation if not set
      if (!(user as any).role) {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'USER' } })
      }
    },
  },
  // Add a debug flag optionally
  debug: process.env.NODE_ENV === 'development',
})