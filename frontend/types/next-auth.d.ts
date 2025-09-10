import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

// Module augmentation for NextAuth to include role
// (Requires enabling "typeRoots" or including this file via tsconfig include.)
declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & { id: string; role?: string | null }
  }
  interface User extends DefaultUser {
    role?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string | null
  }
}
