"use client"

import { parseWithZod } from "@conform-to/zod"
import { useForm } from "@conform-to/react"
import { requestSchema } from "@/components/utilities/ZodSchemas"
import { useEffect, useState } from "react"
import { useRequestTransferContext } from "@/context/RequestTransferContext"
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { bookingText } from "@/data/content/booking"

const BookingStep = ({ bookingData, handleChange, nextStep }: any) => {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext()
  const [isFormValid, setIsFormValid] = useState(false)
  const { lang } = useLanguage()

  const [form, fields] = useForm({
    onValidate({ formData }: { formData: FormData }) {
      const submission = parseWithZod(formData, { schema: requestSchema })

      // If valid, persist to context and advance to confirmation
      if (submission.status === "success") {
        setIsFormValid(true)
        const dataObj = Object.fromEntries(formData.entries()) as Record<string, any>
        setRequestTransfer({
          ...bookingData,
          ...dataObj,
          passengers: Number(dataObj.passengers) || Number(requestTransfer?.passengers) || 1,
          requestNumber: requestTransfer?.requestNumber || `REQ-${Math.floor(Math.random() * 1_000_000_000)}`,
        })
        nextStep()
      }
      return submission
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  // Ensure defaults hydrate from bookingData/context on mount/update
  useEffect(() => {
    // no extra local state needed; defaults are set on inputs below
  }, [bookingData, requestTransfer])

  const errorText = (err: unknown) => Array.isArray(err) ? err.join(", ") : (err as string)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <form id={form.id} onSubmit={form.onSubmit} noValidate className="flex flex-col gap-4">
        <header>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">{pick(lang, bookingText.form.passengerDetails.title)}</h2>
          <p className="text-sm text-slate-600 mt-1">{pick(lang, bookingText.form.passengerDetails.subtitle)}</p>
        </header>

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={fields.firstName.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.firstName)} <span className="text-red-500">*</span>
            </label>
            <input
              id={fields.firstName.id}
              name={fields.firstName.name}
              key={fields.firstName.key}
              defaultValue={requestTransfer?.firstName || ""}
              type="text"
              autoComplete="given-name"
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.firstName.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.firstName.errors)}</p>
            )}
          </div>
          <div>
            <label htmlFor={fields.lastName.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.lastName)} <span className="text-red-500">*</span>
            </label>
            <input
              id={fields.lastName.id}
              name={fields.lastName.name}
              key={fields.lastName.key}
              defaultValue={requestTransfer?.lastName || ""}
              type="text"
              autoComplete="family-name"
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.lastName.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.lastName.errors)}</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={fields.email.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.email)} <span className="text-red-500">*</span>
            </label>
            <input
              id={fields.email.id}
              name={fields.email.name}
              key={fields.email.key}
              defaultValue={requestTransfer?.email || ""}
              type="email"
              autoComplete="email"
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.email.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.email.errors)}</p>
            )}
          </div>
          <div>
            <label htmlFor={fields.mobile.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.mobile)} <span className="text-red-500">*</span>
            </label>
            <input
              id={fields.mobile.id}
              name={fields.mobile.name}
              key={fields.mobile.key}
              defaultValue={requestTransfer?.mobile || ""}
              type="tel"
              autoComplete="tel"
              placeholder={pick(lang, bookingText.form.passengerDetails.mobilePlaceholder)}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.mobile.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.mobile.errors)}</p>
            )}
          </div>
        </div>

        {/* Trip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-1">
            <label htmlFor={fields.date.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.pickupDateTime)} <span className="text-red-500">*</span>
            </label>
            <input
              id={fields.date.id}
              name={fields.date.name}
              key={fields.date.key}
              defaultValue={requestTransfer?.date || ""}
              type="datetime-local"
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.date.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.date.errors)}</p>
            )}
          </div>

          {/* Passengers */}
          <div className="sm:col-span-1">
            <label htmlFor="passengers" className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.passengers)} <span className="text-red-500">*</span>
            </label>
            <input
              id="passengers"
              name={/* if schema includes it, use that field; else fall back */ (fields as any)?.passengers?.name || "passengers"}
              key={(fields as any)?.passengers?.key || "passengers"}
              defaultValue={
                (fields as any)?.passengers?.initialValue ||
                requestTransfer?.passengers ||
                bookingData?.passengers ||
                1
              }
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              step={1}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {(fields as any)?.passengers?.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText((fields as any).passengers.errors)}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">{pick(lang, bookingText.form.passengerDetails.passengersHint)}</p>
          </div>
        </div>

        {/* Optional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={fields.flightNo.id} className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.flightNo)}
            </label>
            <input
              id={fields.flightNo.id}
              name={fields.flightNo.name}
              key={fields.flightNo.key}
              defaultValue={requestTransfer?.flightNo || ""}
              type="text"
              placeholder="TG123"
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
            {fields.flightNo.errors && (
              <p className="mt-1 text-xs text-red-600">{errorText(fields.flightNo.errors)}</p>
            )}
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm text-slate-700">
              {pick(lang, bookingText.form.passengerDetails.notes)}
            </label>
            <textarea
              id="notes"
              name={(fields as any)?.notes?.name || "notes"}
              defaultValue={requestTransfer?.notes || ""}
              rows={3}
              onChange={handleChange}
              placeholder={pick(lang, bookingText.form.passengerDetails.notesPlaceholder)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Summary (read-only vehicle/route) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-700">{pick(lang, bookingText.form.passengerDetails.vehicle)}</label>
            <input
              type="text"
              name={fields.carModel.name}
              key={fields.carModel.key}
              defaultValue={fields.carModel.initialValue || bookingData?.carModel || ""}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">{pick(lang, bookingText.form.passengerDetails.rate)}</label>
            <input
              type="text"
              name={fields.rate.name}
              key={fields.rate.key}
              defaultValue={fields.rate.initialValue || bookingData?.rate || ""}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">{pick(lang, bookingText.form.passengerDetails.pickup)}</label>
            <input
              type="text"
              name={fields.pickupPoint.name}
              key={fields.pickupPoint.key}
              defaultValue={bookingData?.pickupPoint || ""}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">{pick(lang, bookingText.form.passengerDetails.dropoff)}</label>
            <input
              type="text"
              name={fields.dropoffPoint.name}
              key={fields.dropoffPoint.key}
              defaultValue={fields.dropoffPoint.initialValue || bookingData?.dropoffPoint || ""}
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            {pick(lang, bookingText.form.passengerDetails.reviewCta)}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookingStep