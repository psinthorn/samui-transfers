"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle, FileText, Download, Eye } from "lucide-react"
import { toast } from "react-toastify"

interface PaymentProof {
  id: string
  fileName: string
  originalFileName: string
  uploadedAt: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  fileSize: number
  expectedAmount: number
  filePath: string
}

interface PaymentProofVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  bookingReference: string
  actualPaymentAmount?: number
  onVerified?: () => void
}

export function PaymentProofVerification({
  open,
  onOpenChange,
  bookingId,
  bookingReference,
  actualPaymentAmount,
  onVerified,
}: PaymentProofVerificationProps) {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [previewProof, setPreviewProof] = useState<PaymentProof | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (open) {
      loadProofs()
    }
  }, [open])

  const loadProofs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/payment-proofs?bookingId=${bookingId}`)
      const data = await response.json()

      if (response.ok) {
        setProofs(data.proofs || [])
      } else {
        toast.error(data.error || "Failed to load payment proofs")
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error("Error loading payment proofs")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (proofId: string) => {
    try {
      setVerifying(proofId)
      const response = await fetch(`/api/admin/payment-proofs/${proofId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId,
          amountReceived: actualPaymentAmount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Payment proof verified and booking updated")
        loadProofs()
        onVerified?.()
      } else {
        toast.error(data.error || "Failed to verify payment proof")
      }
    } catch (error) {
      console.error("Verify error:", error)
      toast.error("Error verifying payment proof")
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (proofId: string) => {
    const reason = prompt("Enter rejection reason (optional):")
    if (reason === null) return

    try {
      setVerifying(proofId)
      const response = await fetch(`/api/admin/payment-proofs/${proofId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId,
          reason: reason || "No reason provided",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Payment proof rejected")
        loadProofs()
      } else {
        toast.error(data.error || "Failed to reject payment proof")
      }
    } catch (error) {
      console.error("Reject error:", error)
      toast.error("Error rejecting payment proof")
    } finally {
      setVerifying(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified
          </div>
        )
      case "REJECTED":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </div>
        )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Payment Proof</DialogTitle>
            <DialogDescription>
              Review and verify payment proofs for booking{" "}
              <span className="font-semibold text-slate-900">{bookingReference}</span>
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-[#005B9A] border-t-transparent rounded-full" />
            </div>
          ) : proofs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No payment proofs uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proofs.map((proof) => (
                <div key={proof.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{proof.originalFileName}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(proof.uploadedAt).toLocaleString()} • {formatFileSize(proof.fileSize)}
                      </p>
                    </div>
                    {getStatusBadge(proof.status)}
                  </div>

                  {/* Amount Check */}
                  <div className="bg-slate-50 rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Expected Amount:</span>
                      <span className="font-semibold text-slate-900">฿{proof.expectedAmount.toLocaleString()}</span>
                    </div>
                    {actualPaymentAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Actual Received:</span>
                        <span
                          className={`font-semibold ${
                            actualPaymentAmount >= proof.expectedAmount ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          ฿{actualPaymentAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {proof.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewProof(proof)
                          setShowPreview(true)
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(proof.filePath, "_blank")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(proof.id)}
                        disabled={verifying === proof.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(proof.id)}
                        disabled={verifying === proof.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {verifying === proof.id ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewProof && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Proof Preview</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              {previewProof.fileName.endsWith(".pdf") ? (
                <div className="flex items-center justify-center bg-slate-100 rounded h-96">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 mb-4">PDF File - Click download to view</p>
                    <Button
                      onClick={() => window.open(previewProof.filePath, "_blank")}
                      className="bg-[#005B9A] hover:bg-[#004480]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <img src={previewProof.filePath} alt="Payment proof" className="w-full rounded" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
