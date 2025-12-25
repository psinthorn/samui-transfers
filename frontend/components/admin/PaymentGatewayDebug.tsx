"use client"

import { useEffect, useState } from "react"

export function PaymentGatewayDebug() {
  const [status, setStatus] = useState<string>("Loading...")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [fullResponse, setFullResponse] = useState<string>("")

  useEffect(() => {
    const test = async () => {
      try {
        setStatus("Fetching from /api/admin/payment-gateways...")
        const response = await fetch("/api/admin/payment-gateways")
        setStatus(`Response status: ${response.status}`)
        
        const text = await response.text()
        setFullResponse(text)
        console.log("Response text:", text)
        
        if (!response.ok) {
          setError(`Error: ${response.status}`)
          try {
            const json = JSON.parse(text)
            setError(`Error: ${response.status} - ${JSON.stringify(json, null, 2)}`)
          } catch {
            setError(`Error: ${response.status} - ${text}`)
          }
          return
        }
        
        const json = JSON.parse(text)
        setData(json)
        setStatus(`Success! Found ${json.length} gateways`)
      } catch (err: any) {
        setError(`Fetch error: ${err.message}`)
        setStatus("Error during fetch")
        console.error("Full error:", err)
      }
    }

    test()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-2 font-mono text-sm">
      <div>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div className="text-red-700 bg-red-50 p-2 rounded whitespace-pre-wrap">
          <strong>Error:</strong>
          <div>{error}</div>
        </div>
      )}
      {data && (
        <div>
          <strong>Data found:</strong>
          <pre className="bg-white p-2 rounded mt-2 text-xs overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {fullResponse && !data && (
        <div>
          <strong>Full Response:</strong>
          <pre className="bg-white p-2 rounded mt-2 text-xs overflow-auto max-h-64">
            {fullResponse}
          </pre>
        </div>
      )}
    </div>
  )
}
