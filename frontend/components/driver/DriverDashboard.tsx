"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  AlertCircle,
  Loader,
  MapPinCheck,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface DriverData {
  id: string
  status: string
  acceptingRides: boolean
  currentLatitude?: number
  currentLongitude?: number
  locationUpdatedAt?: string
  averageRating?: number
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
}

interface CurrentAssignment {
  id: string
  bookingId: string
  assignmentStatus: string
  assignedAt: string
  pickupLatitude?: number
  pickupLongitude?: number
  driver: {
    user: {
      name?: string
    }
  }
}

export function DriverDashboard() {
  const [driver, setDriver] = useState<DriverData | null>(null)
  const [assignment, setAssignment] = useState<CurrentAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  // Load driver data on mount
  useEffect(() => {
    const loadDriver = async () => {
      try {
        setLoading(true)
        // Note: This would be fetched from the API endpoint
        setDriver({
          id: "driver-1",
          status: "available",
          acceptingRides: true,
          averageRating: 4.8,
          totalTrips: 156,
          completedTrips: 152,
          cancelledTrips: 4,
        })
      } catch (err) {
        setError("Failed to load driver information")
      } finally {
        setLoading(false)
      }
    }

    loadDriver()
  }, [])

  // Request geolocation updates
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch("/api/drivers/location", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          })

          if (response.ok) {
            const data = await response.json()
            setAssignment(data.currentAssignment)
          }
        } catch (err) {
          console.error("Failed to update location:", err)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const updateStatus = async (newStatus: string) => {
    try {
      setStatusLoading(true)
      const response = await fetch("/api/drivers/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        setDriver(data.driver)
      }
    } catch (err) {
      setError("Failed to update status")
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!driver) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load driver information</AlertDescription>
      </Alert>
    )
  }

  const completionRate = driver.totalTrips > 0
    ? Math.round((driver.completedTrips / driver.totalTrips) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your availability and assignments</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Driver Status</CardTitle>
          <div className={`w-4 h-4 rounded-full ${
            driver.status === "available"
              ? "bg-green-500"
              : driver.status === "busy"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }`} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <p className="text-2xl font-bold capitalize">{driver.status}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => updateStatus("available")}
              disabled={statusLoading || driver.status === "available"}
              variant={driver.status === "available" ? "default" : "outline"}
            >
              Available
            </Button>
            <Button
              onClick={() => updateStatus("on_break")}
              disabled={statusLoading || driver.status === "on_break"}
              variant={driver.status === "on_break" ? "default" : "outline"}
            >
              On Break
            </Button>
            <Button
              onClick={() => updateStatus("offline")}
              disabled={statusLoading || driver.status === "offline"}
              variant={driver.status === "offline" ? "default" : "outline"}
            >
              Offline
            </Button>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={driver.acceptingRides}
                onChange={(e) => {
                  setDriver({
                    ...driver,
                    acceptingRides: e.target.checked,
                  })
                }}
                className="rounded"
              />
              <span className="text-sm font-medium">Accepting new rides</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold">{driver.averageRating?.toFixed(1)}/5</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {driver.completedTrips} completed / {driver.totalTrips} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Trips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{driver.completedTrips}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{driver.cancelledTrips}</p>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driver.currentLatitude && driver.currentLongitude ? (
              <>
                <div>
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="text-sm font-mono">
                    {driver.currentLatitude.toFixed(4)}, {driver.currentLongitude.toFixed(4)}
                  </p>
                </div>
                {driver.locationUpdatedAt && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(driver.locationUpdatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">No location data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Assignment Card */}
      {assignment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinCheck className="w-5 h-5" />
              Current Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="font-mono text-sm">{assignment.bookingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                assignment.assignmentStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : assignment.assignmentStatus === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {assignment.assignmentStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Assigned At</p>
                <p className="text-sm">
                  {new Date(assignment.assignedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No active assignment</p>
            <p className="text-sm text-gray-500 mt-1">
              You will receive a notification when a new ride is assigned
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
