/**
 * Payment utility functions
 */

export interface PaymentAmount {
  value: number
  currency: string
  formatted: string
}

/**
 * Format amount for display
 */
export function formatPaymentAmount(amount: number, currency: string = "THB"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse amount from string
 */
export function parsePaymentAmount(amount: string | number): number {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return isNaN(num) ? 0 : num
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number, minAmount: number = 0): {
  valid: boolean
  error?: string
} {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return { valid: false, error: "Invalid amount" }
  }

  if (amount <= minAmount) {
    return { valid: false, error: `Amount must be greater than ${minAmount}` }
  }

  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email address" }
  }
  return { valid: true }
}

/**
 * Format payment method display name
 */
export function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    stripe: "Credit/Debit Card (Stripe)",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
    cash: "Cash on Arrival",
  }
  return methods[method] || method
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: string): {
  label: string
  color: string
  icon: string
} {
  const statuses: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    pending: { label: "Pending", color: "yellow", icon: "⏳" },
    processing: { label: "Processing", color: "blue", icon: "⚙️" },
    completed: { label: "Completed", color: "green", icon: "✓" },
    paid: { label: "Paid", color: "green", icon: "✓" },
    failed: { label: "Failed", color: "red", icon: "✗" },
    cancelled: { label: "Cancelled", color: "gray", icon: "—" },
    refunded: { label: "Refunded", color: "orange", icon: "↩️" },
  }
  return statuses[status] || { label: status, color: "gray", icon: "?" }
}

/**
 * Calculate payment fee (for display purposes)
 */
export function calculatePaymentFee(
  amount: number,
  method: "stripe" | "paypal",
  currency: string = "THB"
): {
  fee: number
  total: number
  formatted: string
} {
  // Typical payment processing fees
  const fees: Record<string, number> = {
    stripe: 0.029, // 2.9% + fixed amount handled by Stripe
    paypal: 0.035, // 3.5% + fixed amount
  }

  const feePercentage = fees[method] || 0
  const fee = amount * feePercentage
  const total = amount + fee

  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
    formatted: formatPaymentAmount(total, currency),
  }
}

/**
 * Generate idempotency key for payment requests
 */
export function generateIdempotencyKey(bookingId: string, method: string): string {
  return `${bookingId}-${method}-${Date.now()}`
}

/**
 * Parse Stripe error response
 */
export function parseStripeError(error: any): string {
  if (typeof error === "string") return error
  if (error?.message) return error.message
  if (error?.error?.message) return error.error.message
  return "An error occurred while processing your payment"
}

/**
 * Parse PayPal error response
 */
export function parsePayPalError(error: any): string {
  if (typeof error === "string") return error
  if (error?.message) return error.message
  if (error?.details?.[0]?.issue) return error.details[0].issue
  return "An error occurred while processing your PayPal payment"
}

/**
 * Check if payment is retryable
 */
export function isPaymentRetryable(errorCode: string): boolean {
  const nonRetryableErrors = [
    "card_declined",
    "expired_card",
    "lost_card",
    "stolen_card",
    "insufficient_funds",
    "processing_error", // Some processing errors might be retryable, but be cautious
  ]
  return !nonRetryableErrors.includes(errorCode)
}

/**
 * Get payment status badge color for UI
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-orange-100 text-orange-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

/**
 * Convert currency code to symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    THB: "฿",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    AUD: "$",
    CAD: "$",
    SGD: "$",
    MYR: "RM",
  }
  return symbols[currency] || currency
}

/**
 * Calculate payment schedule (installments)
 */
export function calculatePaymentSchedule(
  totalAmount: number,
  installments: number,
  interestRate: number = 0
): Array<{ month: number; amount: number; cumulative: number }> {
  const baseAmount = totalAmount / installments
  const interest = (totalAmount * interestRate) / 100
  const interestPerInstallment = interest / installments

  return Array.from({ length: installments }, (_, i) => ({
    month: i + 1,
    amount: Math.round((baseAmount + interestPerInstallment) * 100) / 100,
    cumulative: Math.round((baseAmount + interestPerInstallment) * (i + 1) * 100) / 100,
  }))
}
