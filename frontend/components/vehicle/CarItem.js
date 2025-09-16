"use client"

import Image from "next/image"
import React, { useMemo, useState } from "react"
import { HiUser, HiOutlineBriefcase } from "react-icons/hi"
import RateCalculate from "../utilities/RateCalculate"
import { useRequestTransferContext } from "@/context/RequestTransferContext"
import { useLanguage } from "@/context/LanguageContext"

const CarItem = ({ car, distance }) => {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext()
  const [activeID, setActiveID] = useState()
  const { lang } = useLanguage()
  const locale = lang === "th" ? "th-TH" : "en-US"

  const LABELS = lang === "th"
    ? {
        noImage: "ไม่มีรูปภาพ",
        estimated: "ประมาณค่าโดยสาร",
        seats: "ที่นั่ง",
        luggage: "สัมภาระ",
        selected: "เลือกแล้ว",
        choose: "เลือกรถ",
      }
    : {
        noImage: "No image",
        estimated: "Estimated fare",
        seats: "seats",
        luggage: "luggage",
        selected: "Selected",
        choose: "Choose vehicle",
      }

  // Compute estimated rate (no state race conditions)
  const rateEstimate = useMemo(() => {
    if (!distance || !car?.rate) return 0
    try {
      return Number(RateCalculate({ distance }, car.rate)) || 0
    } catch {
      return 0
    }
  }, [distance, car?.rate])

  const isSelected =
    activeID === car?.ID ||
    requestTransfer?.carModel === car?.model ||
    requestTransfer?.carType === car?.type

  const handleSelect = () => {
    setActiveID(car?.ID)
    setRequestTransfer({
      ...requestTransfer,
      carType: car?.type,
      carModel: car?.model,
      vehicleId: car?.ID,
      rate: Math.round(rateEstimate),
    })
  }

  const currency = "THB"
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [locale]
  )
  const priceText = rateEstimate > 0 ? formatter.format(Math.round(rateEstimate)) : "—"

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={isSelected}
      className={[
        "w-full text-left rounded-lg border p-3 sm:p-4 transition",
        "bg-white hover:bg-slate-50",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-slate-200",
        "flex items-start gap-3 sm:gap-4",
      ].join(" ")}
    >
      {/* Image */}
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded md:h-24 md:w-40">
        {car?.image ? (
          <Image
            src={car.image}
            alt={car?.model || car?.type || (lang === "th" ? "รถ" : "Vehicle")}
            fill
            sizes="(max-width: 768px) 128px, 160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
            {LABELS.noImage}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {car?.type}
            </h3>
            {car?.model ? (
              <p className="truncate text-xs text-slate-500">{car.model}</p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{priceText}</p>
            <p className="text-xs text-slate-500">{LABELS.estimated}</p>
          </div>
        </div>

        {/* Meta: seats/luggage */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <HiUser className="h-4 w-4 text-slate-500" />
            {car?.seat || "-"} {LABELS.seats}
          </span>
          {car?.luggage ? (
            <span className="inline-flex items-center gap-1">
              <HiOutlineBriefcase className="h-4 w-4 text-slate-500" />
              {car.luggage} {LABELS.luggage}
            </span>
          ) : null}
        </div>

        {/* Description */}
        {car?.desc ? (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{car.desc}</p>
        ) : null}

        {/* CTA */}
        <div className="mt-3">
          <span
            className={[
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold",
              isSelected
                ? "bg-primary text-white"
                : "bg-white text-primary ring-1 ring-inset ring-primary hover:bg-primary/5",
            ].join(" ")}
          >
            {isSelected ? LABELS.selected : LABELS.choose}
          </span>
        </div>
      </div>
    </button>
  )
}

export default CarItem