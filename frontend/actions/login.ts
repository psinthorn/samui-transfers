"use server";

import * as z from "zod";
import { loginSchema } from "@/schemas";

export const loginAction = async (email: string, password: string) => {
  // Simulate an API call to authenticate the user
  const parsedData = loginSchema.safeParse({ email, password });

  if (!parsedData.success) {
    return { success: false, message: "Invalid input", errors: parsedData.error.issues };
  }

  const { email: validEmail, password: validPassword } = parsedData.data;

  // Dummy authentication logic
  if (validEmail === "admin@admin.com" && validPassword === "123") {
    return { success: true, message: "Login successful!" };
  } else {
    return { success: false, message: "Invalid email or password." };
  }
};