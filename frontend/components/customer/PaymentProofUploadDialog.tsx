"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Upload, FileText } from "lucide-react"
import { toast } from "react-toastify"

interface PaymentProofUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  bookingReference: string
  paymentAmount: number
  onUploadSuccess?: () => void
}

export function PaymentProofUploadDialog({
  open,
  onOpenChange,
  bookingId,
  bookingReference,
  paymentAmount,
  onUploadSuccess,
}: PaymentProofUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload JPG, PNG, WebP, or PDF files only")
      return
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)
    setFileName(selectedFile.name)

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bookingId", bookingId)
      formData.append("referenceNumber", bookingReference)
      formData.append("expectedAmount", paymentAmount.toString())

      const response = await fetch(`/api/bookings/${bookingId}/upload-proof`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to upload proof")
        return
      }

      toast.success("Payment proof uploaded successfully! Admin will verify it shortly.")
      setFile(null)
      setFileName("")
      setPreview(null)
      onOpenChange(false)
      onUploadSuccess?.()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Error uploading file. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload your bank transfer receipt or payment screenshot for booking{" "}
            <span className="font-semibold text-slate-900">{bookingReference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Expected Payment Amount:</p>
                <p className="text-lg font-semibold text-blue-900">฿{paymentAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* File Requirements */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-slate-900">Accepted Files:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• JPG, PNG, WebP images</li>
              <li>• PDF documents</li>
              <li>• Maximum 5MB per file</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label htmlFor="file-upload" className="text-slate-900 font-medium">
              Choose File
            </Label>
            <div className="relative">
              <Input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="cursor-pointer"
              />
            </div>

            {fileName && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <FileText className="w-5 h-5 text-green-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">{fileName}</p>
                  <p className="text-xs text-green-700">Ready to upload</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setFile(null)
                setFileName("")
                setPreview(null)
              }}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 bg-[#005B9A] hover:bg-[#004480]"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </>
              )}
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-slate-500 text-center">
            Your payment proof will be verified by our admin team within 24 hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
