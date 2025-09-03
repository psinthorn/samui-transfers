"use client"

import { CarListData } from "../../data/CarListData"
import CarItem from "./CarItem"
import { useState, useMemo } from "react"
import { useRequestTransferContext } from "@/context/RequestTransferContext"
// If RateCalculate exists, uncomment the line below to compute an estimate when needed.
import RateCalculate from "../utilities/RateCalculate"

const CarListOptions = ({ distance, handleBookNow }) => {
  const [selectedCar, setSelectedCar] = useState()
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext()

  const handleClick = (index) => {
    const car = CarListData[index]
    setSelectedCar(car)

    // Compute estimated fare when a car is selected
    let calcRate = 0
    try {
      if (car?.rate && distance) {
        calcRate = Math.round(Number(RateCalculate({ distance }, car.rate)) || 0)
      }
    } catch {}

    setRequestTransfer({
      ...requestTransfer,
      carType: car?.type,
      carModel: car?.model,
      vehicleId: car?.ID,
      rate: calcRate, // store for downstream steps
    })
  }

  // Prefer context rate; otherwise compute from current selection + distance
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

  return (
    <div className="relative">
      <div className="p-4 overflow-auto">
        {CarListData.map((car, index) => (
          <button
            key={car.ID}
            type="button"
            onClick={() => handleClick(index)}
            className="block w-full text-left"
          >
            <div className="cursor-pointer p-2">
              <CarItem car={car} distance={distance} />
            </div>
          </button>
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
                onClick={() => handleBookNow(selectedCar?.type, selectedCar?.model)}
                className="shrink-0 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                aria-label="Proceed to book selected vehicle"
              >
                Book now
              </button>
            </div>

            {/* Safe-area spacer for iOS */}
            <div className="pt-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CarListOptions