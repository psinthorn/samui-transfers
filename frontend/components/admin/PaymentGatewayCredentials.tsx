"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Save, AlertCircle, CheckCircle } from "lucide-react"

interface Credentials {
  type: string
  // Stripe
  stripePublicKey?: string
  stripeSecretKey?: string
  stripeAccountId?: string
  // PayPal
  paypalClientId?: string
  paypalSecret?: string
  paypalAccountId?: string
  paypalMode?: "SANDBOX" | "LIVE"
  // Bank
  bankAccountName?: string
  bankAccountNumber?: string
  bankBankName?: string
  // Thailand-specific
  bankSwiftCode?: string
  bankBankBranch?: string
  // International transfers
  bankIban?: string
  bankRoutingNumber?: string
}

interface CredentialsResponse {
  id: string
  gatewayId: string
  isConfigured: boolean
  verificationStatus?: string
  lastVerified?: string
  // Masked values
  stripePublicKey?: string
  stripeSecretKey?: string | null
  stripeAccountId?: string | null
  paypalClientId?: string | null
  paypalSecret?: string | null
  paypalAccountId?: string | null
  paypalMode?: string
  bankAccountName?: string | null
  bankAccountNumber?: string | null
  bankBankName?: string
  // Thailand-specific
  bankSwiftCode?: string | null
  bankBankBranch?: string | null
  // International transfers
  bankIban?: string | null
  bankRoutingNumber?: string | null
}

interface PaymentGatewayCredentialsProps {
  gatewayId: string
  gatewayType: string
  gatewayName: string
}

export function PaymentGatewayCredentials({
  gatewayId,
  gatewayType,
  gatewayName,
}: PaymentGatewayCredentialsProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    type: gatewayType,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [currentStatus, setCurrentStatus] = useState<
    "PENDING" | "VALID" | "INVALID"
  >("PENDING")

  useEffect(() => {
    fetchCredentials()
  }, [gatewayId])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/payment-gateways/${gatewayId}/credentials`
      )
      if (!response.ok) throw new Error("Failed to fetch credentials")

      const data = await response.json()
      setCurrentStatus(data.credentials?.verificationStatus || "PENDING")
      // Reset form with masked values (user will enter new ones if needed)
      setCredentials({ type: gatewayType })
    } catch (err: any) {
      console.error("Error fetching credentials:", err)
      setError("Failed to load credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (gatewayType === "stripe") {
      if (!credentials.stripePublicKey || !credentials.stripeSecretKey) {
        setError("Stripe: Public Key and Secret Key are required")
        return
      }
    } else if (gatewayType === "paypal") {
      if (!credentials.paypalClientId || !credentials.paypalSecret) {
        setError("PayPal: Client ID and Secret are required")
        return
      }
    } else if (gatewayType === "bank_transfer") {
      if (
        !credentials.bankAccountName ||
        !credentials.bankAccountNumber ||
        !credentials.bankBankName
      ) {
        setError("Bank: Account Name, Account Number, and Bank Name are required")
        return
      }
    }

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch(
        `/api/admin/payment-gateways/${gatewayId}/credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: gatewayType,
            credentials,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save credentials")
      }

      const result = await response.json()
      setSuccess("✓ Credentials saved successfully (encrypted in database)")
      setCurrentStatus(result.verificationStatus)

      // Clear the form
      setCredentials({ type: gatewayType })

      // Refresh to show masked values
      setTimeout(() => fetchCredentials(), 1000)
    } catch (err: any) {
      console.error("Error saving credentials:", err)
      setError(err.message || "Failed to save credentials")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {gatewayName} Credentials
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          All sensitive data is encrypted before storing in the database
        </p>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {currentStatus === "VALID" ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Credentials configured and verified
              </span>
            </>
          ) : currentStatus === "INVALID" ? (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                Credentials configured but verification failed
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">
                Credentials not yet configured
              </span>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stripe Credentials */}
        {gatewayType === "stripe" && (
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Public Key (Publishable) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="pk_live_... or pk_test_..."
                value={credentials.stripePublicKey || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    stripePublicKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
              <p className="text-xs text-slate-500 mt-1">
                Safe to expose in frontend code
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Secret Key <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecrets["stripe_secret"] ? "text" : "password"}
                  placeholder="sk_live_... or sk_test_..."
                  value={credentials.stripeSecretKey || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      stripeSecretKey: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowSecrets({
                      ...showSecrets,
                      stripe_secret: !showSecrets["stripe_secret"],
                    })
                  }
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {showSecrets["stripe_secret"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Encrypted and stored securely
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Your Stripe Account ID"
                value={credentials.stripeAccountId || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    stripeAccountId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* PayPal Credentials */}
        {gatewayType === "paypal" && (
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mode <span className="text-red-600">*</span>
              </label>
              <select
                value={credentials.paypalMode || "SANDBOX"}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    paypalMode: e.target.value as "SANDBOX" | "LIVE",
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="SANDBOX">Sandbox (Testing)</option>
                <option value="LIVE">Live (Production)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Your PayPal Client ID"
                value={credentials.paypalClientId || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    paypalClientId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Secret <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecrets["paypal_secret"] ? "text" : "password"}
                  placeholder="Your PayPal Client Secret"
                  value={credentials.paypalSecret || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      paypalSecret: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowSecrets({
                      ...showSecrets,
                      paypal_secret: !showSecrets["paypal_secret"],
                    })
                  }
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {showSecrets["paypal_secret"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Your PayPal Merchant Account ID"
                value={credentials.paypalAccountId || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    paypalAccountId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* Bank Transfer Credentials */}
        {gatewayType === "bank_transfer" && (
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bank Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bangkok Bank, Kasikornbank"
                value={credentials.bankBankName || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankBankName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Account holder name"
                value={credentials.bankAccountName || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankAccountName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Number <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecrets["bank_account"] ? "text" : "password"}
                  placeholder="Bank account number"
                  value={credentials.bankAccountNumber || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      bankAccountNumber: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowSecrets({
                      ...showSecrets,
                      bank_account: !showSecrets["bank_account"],
                    })
                  }
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {showSecrets["bank_account"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SWIFT Code (Thailand) *
              </label>
              <input
                type="text"
                placeholder="e.g., BKKATH22 for Bangkok Bank"
                value={credentials.bankSwiftCode || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankSwiftCode: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase"
                disabled={saving}
              />
              <p className="text-xs text-slate-500 mt-1">Society for Worldwide Interbank Financial Telecommunication code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bank Branch (Thailand)
              </label>
              <input
                type="text"
                placeholder="e.g., Bangkok Branch"
                value={credentials.bankBankBranch || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankBankBranch: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            <hr className="my-4" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                IBAN (International Transfers)
              </label>
              <input
                type="text"
                placeholder="International Bank Account Number"
                value={credentials.bankIban || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankIban: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
              <p className="text-xs text-slate-500 mt-1">Used for EU and international transfers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Routing Number (US/Alternative)
              </label>
              <input
                type="text"
                placeholder="9-digit US routing number or alternative code"
                value={credentials.bankRoutingNumber || ""}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    bankRoutingNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save & Encrypt Credentials"}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900 font-medium mb-2">🔒 Security Information</p>
        <ul className="text-xs text-blue-900 space-y-1">
          <li>• All credentials are encrypted using AES-256-GCM before storage</li>
          <li>• Encryption key is stored securely in environment variables</li>
          <li>• Never displayed in plain text in the admin panel</li>
          <li>• Decrypted only when needed for payment processing</li>
          <li>• All changes are logged with timestamp and admin ID</li>
        </ul>
      </div>
    </div>
  )
}
