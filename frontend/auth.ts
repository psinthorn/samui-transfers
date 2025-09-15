import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail } from "@/data/user"
// Import or define saltAndHashPassword
import bcrypt from "bcryptjs"

function saltAndHashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null
 
        // logic to salt and hash password
        if (typeof credentials.password !== "string") {
          throw new Error("Password must be a string.")
        }
        const pwHash = saltAndHashPassword(credentials.password)
 
        // logic to verify if the user exists
        if (typeof credentials.email !== "string") {
          throw new Error("Email must be a string.")
        }
        user = await getUserByEmail(credentials.email)
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.")
        }

        // compare password 
        if (user) {
          if (typeof user.password !== "string") {
            throw new Error("User password is invalid.")
          }
          const isPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isPassword) {
            throw new Error("Invalid password credentials.")
          }
        }
 
        // return user object with their profile data
        return user
      },
    }),
  ],
})