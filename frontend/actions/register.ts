"use server";

import { registerSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const registerAction = async (name: string, email: string, password: string) => {
  // Simulate an API call to register the user
  const parsedData = registerSchema.safeParse({ name, email, password });

  if (!parsedData.success) {
    return { success: false, message: "Invalid input", errors: parsedData.error.issues };
  }

  const { name: validName, email: validEmail, password: validPassword } = parsedData.data;

  const existingUser = await getUserByEmail(validEmail);
  if (existingUser) {
    return { success: false, message: "Email is already registered." };
  }

  // collect user data and store in database
  // This is a placeholder; replace with actual database logic
  const user = {
    name: validName,
    email: validEmail,
    password: validPassword, // In a real app, never store plain passwords
  };

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(validPassword, 10);

  await db.user.create({
    data: {
      name: validName,
      email: validEmail,
      password: hashedPassword,
    },
  });

  // TODO: Send a verification email to the user

  // Return success response
  return { success: true, message: "User registered successfully" };
};