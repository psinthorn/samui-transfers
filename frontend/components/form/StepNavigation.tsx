import React from "react"

type Props = {
  currentStep: number
  steps?: string[]
  className?: string
}

const DEFAULT_STEPS = ["Booking", "Confirmation", "Payment"] as const

export default function StepNavigation({ currentStep, steps = DEFAULT_STEPS as unknown as string[], className = "" }: Props) {
  const total = Math.max(steps.length, 1)
  const clamped = Number.isFinite(currentStep) ? Math.min(Math.max(currentStep, 1), total) : 1
  const pct = total > 1 ? ((clamped - 1) / (total - 1)) * 100 : 0

  return (
    <nav aria-label="Progress" className={`relative ${className}`}>
      {/* Track */}
      <div className="absolute left-0 right-0 top-4 h-1 bg-slate-200 rounded-full" aria-hidden="true" />
      {/* Progress fill */}
      <div
        className="absolute left-0 top-4 h-1 bg-primary rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />

      <ol role="list" className="relative z-10 grid grid-cols-3 gap-0">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1
          const isCompleted = stepNumber < clamped
          const isCurrent = stepNumber === clamped
          return (
            <li key={label} className="flex flex-col items-center text-center">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  isCompleted ? "bg-primary text-white" : isCurrent ? "bg-primary text-white ring-2 ring-primary/30" : "bg-slate-200 text-slate-700",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${label} step ${stepNumber} of ${total}`}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                    <path fill="currentColor" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.6a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0z" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-slate-700">{label}</span>
            </li>
          )
        })}
      </ol>

      {/* Progress semantics for AT */}
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={clamped}
        className="sr-only"
      >
        Step {clamped} of {total}
      </div>
    </nav>
  )
}