"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

/**
 * Server action for signing in with credentials
 * This uses NextAuth's Credentials provider for secure authentication
 * 
 * @param email - User email
 * @param password - User password
 * @param redirect - Whether to redirect after successful login
 * @returns Object with success status and callback URL
 */
export const loginAction = async (
  email: string,
  password: string,
  callbackUrl?: string
) => {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    return {
      success: true,
      callbackUrl: callbackUrl || "/dashboard",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.cause?.err?.message || "Authentication failed",
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
};