'use client'

import React from 'react'
import {
  CheckCircle2,
  Circle,
  CreditCard,
  FileCheck,
  Truck,
  Flag,
} from 'lucide-react'

interface TimelineStep {
  step: number
  title: string
  description?: string
  completed: boolean
  timestamp?: Date
}

interface BookingTimelineProps {
  steps: TimelineStep[]
  currentStep: number
  estimatedCompletionTime?: Date
  lang?: string
}

const getStepIcon = (step: number, completed: boolean) => {
  const baseProps = 'w-6 h-6'
  const completedClass = 'text-green-600'
  const pendingClass = 'text-slate-400'
  const className = completed ? completedClass : pendingClass

  switch (step) {
    case 1:
      return <CheckCircle2 className={`${baseProps} ${className}`} />
    case 2:
      return <CreditCard className={`${baseProps} ${className}`} />
    case 3:
      return <FileCheck className={`${baseProps} ${className}`} />
    case 4:
      return <Truck className={`${baseProps} ${className}`} />
    case 5:
      return <Flag className={`${baseProps} ${className}`} />
    default:
      return <Circle className={`${baseProps} ${className}`} />
  }
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({
  steps,
  currentStep,
  estimatedCompletionTime,
  lang = 'en',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        {lang === 'th' ? 'ความคืบหน้าการจอง' : 'Booking Progress'}
      </h2>

      {/* Timeline */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.step} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                {getStepIcon(step.step, step.completed)}
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-1 h-12 mt-2 ${
                    step.completed ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3
                    className={`font-semibold ${
                      step.completed ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
                {step.completed && (
                  <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
                    ✓ {lang === 'th' ? 'เสร็จสิ้น' : 'Complete'}
                  </span>
                )}
              </div>

              {/* Timestamp */}
              {step.timestamp && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(step.timestamp).toLocaleDateString(
                    lang === 'th' ? 'th-TH' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              )}

              {/* Current Step Indicator */}
              {step.step === currentStep && !step.completed && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-sm text-blue-600 font-medium">
                    {lang === 'th' ? 'อยู่ระหว่างการดำเนิน' : 'In Progress'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estimated Completion Time */}
      {estimatedCompletionTime && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-2">
            {lang === 'th' ? 'เวลาที่คาดว่าจะเสร็จสิ้น' : 'Estimated Completion Time'}:
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {new Date(estimatedCompletionTime).toLocaleTimeString(
              lang === 'th' ? 'th-TH' : 'en-US',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            )}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {lang === 'th' ? 'ประมาณการตามเวลาปัจจุบัน' : 'Based on current time'}
          </p>
        </div>
      )}
    </div>
  )
}
