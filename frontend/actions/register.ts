"use server";

import { registerSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export const registerAction = async (name: string, email: string, password: string) => {
  try {
    // Validate input
    const parsedData = registerSchema.safeParse({ name, email, password });

    if (!parsedData.success) {
      return { 
        success: false, 
        message: "Invalid input", 
        errors: parsedData.error.issues 
      };
    }

    const { name: validName, email: validEmail, password: validPassword } = parsedData.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(validEmail);
    if (existingUser) {
      return { 
        success: false, 
        message: "Email is already registered." 
      };
    }

    // Hash password with 12 salt rounds for better security
    const hashedPassword = await bcrypt.hash(validPassword, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with unverified email
    const user = await db.user.create({
      data: {
        name: validName,
        email: validEmail,
        password: hashedPassword,
        role: "USER",
        emailVerified: null, // Not verified yet
      },
    });

    // Create verification token in database
    await db.verificationToken.create({
      data: {
        identifier: validEmail,
        token: verificationToken,
        expires: verificationTokenExpires,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: validEmail,
        name: validName,
        token: verificationToken,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email sending fails
      // User can request email resend
    }

    return { 
      success: true, 
      message: "Registration successful! Please check your email to verify your account.",
      redirectUrl: "/verify-email",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during registration. Please try again.",
    };
  }
};