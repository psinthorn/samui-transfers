/**
 * Enhanced Booking Form with Rate Integration
 * 
 * Integrates rate calculation, price display, and payment into the booking flow
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BookingStep from './BookingStep';
import ConfirmationStep from './ConfirmationStep';
import ThankYouStep from './ThankYouStep';
import StepNavigation from './StepNavigation';
import { useRequestTransferContext, requestTransferType } from '@/context/RequestTransferContext';
import { useLanguage } from '@/context/LanguageContext';
import { pick } from '@/data/i18n/core';
import { bookingText } from '@/data/content/booking';
import { useRateCalculation } from '@/hooks/useRateCalculation';
import { PriceDisplay } from '@/components/booking/PriceDisplay';
import { StripeCheckout } from '@/components/form/StripeCheckout';
import { AlertCircle } from 'lucide-react';

interface EnhancedBookingFormProps {
  bookingData?: Partial<requestTransferType>;
}

const defaultBookingData: requestTransferType = {
  requestNumber: '',
  firstName: '',
  lastName: '',
  address: '',
  email: '',
  mobile: '',
  luggage: '',
  date: '',
  time: '',
  arrival: '',
  departure: '',
  flightNo: '',
  flightTime: '',
  pickupPoint: '',
  dropoffPoint: '',
  passengers: 0,
  distance: 0,
  quantity: 0,
  rate: 0,
  total: 0,
  carType: '',
  carModel: '',
  notes: '',
};

export default function EnhancedBookingForm({ bookingData }: EnhancedBookingFormProps) {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext();
  const [formData, setFormData] = useState<requestTransferType>({
    ...defaultBookingData,
    ...(bookingData ?? {}),
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Rate calculation hook
  const {
    calculation,
    isLoading: rateLoading,
    error: rateError,
    calculateRate,
    finalPrice,
    priceBreakdown,
  } = useRateCalculation();

  const { lang } = useLanguage();
  const stepLabels = useMemo(() => bookingText.steps.labels.map((l: any) => pick(lang, l)), [lang]);

  useEffect(() => {
    if (bookingData) {
      setFormData((prevData) => ({
        ...prevData,
        ...bookingData,
      }));
    }
  }, [bookingData]);

  // Auto-calculate rate when key fields change
  useEffect(() => {
    const calculateOnChange = async () => {
      // Only calculate if we have the minimum required data
      if (formData.distance && formData.carType && formData.date) {
        try {
          // Build Date objects for pickup date and time
          const pickupDateObj = new Date(formData.date);
          const pickupTimeObj = new Date(formData.date);

          if (formData.time) {
            const [hoursStr, minutesStr] = formData.time.split(':');
            const hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
              pickupTimeObj.setHours(hours, minutes, 0, 0);
            }
          } else {
            // Default to 09:00 if time not provided
            pickupTimeObj.setHours(9, 0, 0, 0);
          }

            await calculateRate({
            vehicleType: formData.carType.toUpperCase(),
            distance: Number(formData.distance),
            pickupTime: pickupTimeObj,
            pickupDate: pickupDateObj,
            returnTrip: formData.quantity === 2,
          });
        } catch (err) {
          console.error('Rate calculation error:', err);
        }
      }
    };

    const timer = setTimeout(calculateOnChange, 500); // Debounce
    return () => clearTimeout(timer);
  }, [formData.distance, formData.carType, formData.date, formData.time, formData.quantity, calculateRate]);

  // Update formData with calculated rate
  useEffect(() => {
    if (finalPrice && finalPrice > 0) {
      setFormData((prev) => ({
        ...prev,
        rate: finalPrice,
        total: finalPrice * (prev.passengers || 1),
      }));
    }
  }, [finalPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numeric = new Set(['passengers', 'distance', 'quantity', 'rate', 'total']);
    setFormData((prev) => ({
      ...prev,
      [name]: numeric.has(name) ? Number(value || 0) : value,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSendmail = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.();
    setServerErrors({});

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result?.errors?.fieldErrors) {
          setServerErrors(result.errors.fieldErrors as Record<string, string[]>);
        }
        setResponseMessage(
          result.message || 'There was a problem. Please review highlighted fields.'
        );
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
        return;
      }

      // Success - store booking ID and move to payment step
      setBookingId(result.data?.id || '');
      setResponseMessage(result.message || 'Booking confirmed. Proceeding to payment...');
      setShowMessage(true);
      setShowPayment(true);

      // Move to payment step (step 3)
      nextStep();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResponseMessage(message);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  };

  const handlePaymentSuccess = async () => {
    // Move to thank you step
    nextStep();
  };

  return (
    <section className="bg-blue-50 dark:bg-slate-200 py-8 flex justify-center items-center min-h-screen">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <p className="text-base font-semibold uppercase tracking-wide text-gray-900 dark:text-blue-200">
            {pick(lang, bookingText.form.kicker)}
          </p>
          <h2 className="font-heading mb-4 font-bold tracking-tight text-primary dark:text-white text-3xl sm:text-5xl">
            {pick(lang, bookingText.form.title)}
          </h2>
        </div>

        {showMessage && (
          <p
            className={`mt-4 mb-4 text-center font-semibold ${
              responseMessage.includes('error') || responseMessage.includes('problem')
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {responseMessage}
          </p>
        )}

        <StepNavigation currentStep={currentStep} steps={stepLabels} />

        {/* Step 1: Booking Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <BookingStep
              bookingData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
              serverErrors={serverErrors}
            />

            {/* Price Display (shown while filling out booking) */}
            {formData.distance && formData.carType && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Estimated Pricing</h3>
                {rateError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{rateError}</span>
                  </div>
                )}
                <PriceDisplay
                  basePrice={calculation?.basePrice ? Number(calculation.basePrice) : undefined}
                  finalPrice={finalPrice ?? undefined}
                  breakdown={priceBreakdown || undefined}
                  appliedRules={calculation?.appliedRules || []}
                  isLoading={rateLoading}
                  error={rateError}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 2 && (
          <ConfirmationStep
            formData={formData}
            prevStep={prevStep}
            handleSendmail={handleSendmail}
          />
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && showPayment && bookingId && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment</h2>
            <p className="text-sm text-slate-600 mb-4">
              Please complete your payment to confirm your booking. Your booking ID is:{' '}
              <code className="bg-slate-100 px-2 py-1 rounded">{bookingId}</code>
            </p>

            <StripeCheckout
              bookingId={bookingId}
              amount={Math.round((finalPrice ?? 0) * 100)} // Stripe expects amount in cents; fallback to 0 if null
              customerEmail={formData.email}
              onSuccess={handlePaymentSuccess}
            />

            <button
              onClick={prevStep}
              className="mt-4 w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {pick(lang, bookingText.review.back)}
            </button>
          </div>
        )}

        {/* Step 4: Thank You */}
        {currentStep === 4 && <ThankYouStep formData={formData} />}
      </div>
    </section>
  );
}
