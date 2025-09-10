"use client"

import { CarListData } from "../../data/CarListData"
import CarItem from "./CarItem"
import { useMemo, useState } from "react"
import { useRequestTransferContext } from "@/context/RequestTransferContext"
import RateCalculate from "../utilities/RateCalculate"

const CarListOptions = ({ distance, handleBookNow }) => {
  const { requestTransfer } = useRequestTransferContext()
  const [booking, setBooking] = useState(false)

  // Derive selected car from context to avoid wrapping CarItem (button) in another button
  const selectedCar = useMemo(() => {
    if (requestTransfer?.vehicleId) {
      return CarListData.find((c) => c.ID === requestTransfer.vehicleId)
    }
    if (requestTransfer?.carModel) {
      return CarListData.find((c) => c.model === requestTransfer.carModel)
    }
    if (requestTransfer?.carType) {
      return CarListData.find((c) => c.type === requestTransfer.carType)
    }
    return undefined
  }, [requestTransfer?.vehicleId, requestTransfer?.carModel, requestTransfer?.carType])

  // Prefer stored rate; fallback to compute from selected + distance
  const displayRate = useMemo(() => {
    const r = Number(requestTransfer?.rate)
    if (!Number.isNaN(r) && r > 0) return r
    try {
      if (selectedCar?.rate && distance) {
        return Math.round(Number(RateCalculate({ distance }, selectedCar.rate)) || 0)
      }
    } catch {}
    return 0
  }, [requestTransfer?.rate, selectedCar?.ID, distance])

  const priceText = displayRate > 0 ? `${displayRate.toLocaleString()} THB` : "—"

  const onBookNow = async () => {
    if (!selectedCar || booking) return
    setBooking(true)
    try {
      const ret = handleBookNow?.(selectedCar?.type, selectedCar?.model)
      if (ret && typeof ret.then === "function") await ret
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="relative">
      <div className="p-4 overflow-auto">
        {CarListData.map((car) => (
          <div key={car.ID} className="p-2">
            <CarItem car={car} distance={distance} />
          </div>
        ))}
      </div>

      {selectedCar ? (
        <div className="sticky inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Selected vehicle</p>
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  {selectedCar?.type}
                  {selectedCar?.model ? <span className="text-slate-500"> — {selectedCar.model}</span> : null}
                </h2>
                <p className="text-xs text-slate-600">
                  Estimated fare: <span className="font-medium text-slate-900">{priceText}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onBookNow}
                disabled={booking}
                aria-busy={booking}
                className="shrink-0 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {booking ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                    </svg>
                    Booking…
                  </>
                ) : (
                  "Book now"
                )}
              </button>
            </div>
            <div className="pt-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CarListOptions