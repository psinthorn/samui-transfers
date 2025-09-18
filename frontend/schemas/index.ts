import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const confirmPasswordSchema = z
  .object({
    password: passwordSchema.shape.password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const settingsSchema = z.object({
  preferredLanguage: z.enum(["en", "th"], { required_error: "Language is required" }),
  marketingEmails: z.boolean().optional().default(false),
});

export const profileSchema = z.object({
  name: z
    .string({ required_error: "name_required" })
    .trim()
    .min(1, { message: "name_required" })
    .max(100, { message: "name_too_long" }),
});

// Booking payload validation: normalize types and strip unknown/sensitive fields
export const bookingRequestSchema = z
  .object({
    requestNumber: z.string().trim().min(1).optional(),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Valid email is required"),
    mobile: z.string().trim().min(6, "Phone is required"),
    address: z.string().trim().optional(),
    flightNo: z.string().trim().optional(),
    flightTime: z.string().trim().optional(),
    arrival: z.string().trim().optional(),
    departure: z.string().trim().optional(),
    date: z.string().trim().min(1, "Pickup date/time is required"),
    time: z.string().trim().optional(),
    pickupPoint: z.string().trim().min(1, "Pickup point is required"),
    dropoffPoint: z.string().trim().min(1, "Drop-off point is required"),
    carType: z.string().trim().optional(),
    carModel: z.string().trim().optional(),
    passengers: z.coerce.number().int().min(1, "At least 1 passenger"),
    distance: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().int().min(0).optional(),
    rate: z.coerce.number().min(0).optional(),
    total: z.coerce.number().min(0).optional(),
    luggage: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    recaptchaToken: z.string().optional(),
  })
  .refine((d) => {
    // Simple validation that pickup and dropoff are not identical
    if (!d.pickupPoint || !d.dropoffPoint) return true
    return d.pickupPoint.trim().toLowerCase() !== d.dropoffPoint.trim().toLowerCase()
  }, { message: "Pickup and drop-off must differ", path: ["dropoffPoint"] })
  // Zod strips unknown keys by default; using .strict() would error on extra keys
;

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

