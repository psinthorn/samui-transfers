"use client";

import React, { useState, useEffect, useMemo } from 'react';
import BookingStep from './BookingStep';
import ConfirmationStep from './ConfirmationStep';
import ThankYouStep from './ThankYouStep';
import StepNavigation from './StepNavigation';
import { useRequestTransferContext, requestTransferType } from '@/context/RequestTransferContext';
import { useLanguage } from '@/context/LanguageContext';
import { pick } from '@/data/i18n/core';
import { bookingText } from '@/data/content/booking';

interface BookingFormProps {
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

const BookingForm: React.FC<BookingFormProps> = ({ bookingData }) => {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext();
  const [formData, setFormData] = useState<requestTransferType>({
    ...defaultBookingData,
    ...(bookingData ?? {}),
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (bookingData) {
      setFormData((prevData) => ({
        ...prevData,
        ...bookingData,
      }));
    }
    // setRequestTransfer(formData)
  }, [bookingData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numeric = new Set([
      'passengers', 'distance', 'quantity', 'rate', 'total'
    ])
    setFormData((prev) => ({
      ...prev,
      [name]: numeric.has(name) ? Number(value || 0) : value,
    }))
  };

  // const handleRecaptchaChange = (token: string) => {
  //   setRecaptchaToken(token);
  // };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // handle form with POST to api/booking route
  const handleSendmail = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.();
    setServerErrors({});
    const response = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData }),
    });
    const result = await response.json();
    if (!response.ok) {
      // Map zod errors if present
      if (result?.errors?.fieldErrors) {
        setServerErrors(result.errors.fieldErrors as Record<string, string[]>)
      }
      setResponseMessage(result.message || 'There was a problem. Please review highlighted fields.');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      return; // do not advance
    }
    setResponseMessage(result.message || 'Submitted');
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
    nextStep(); // Move to the next step after submission on success
  };

  const { lang } = useLanguage();
  const stepLabels = useMemo(() => bookingText.steps.labels.map((l: any) => pick(lang, l)), [lang]);

  return (
    <section className="bg-blue-50 dark:bg-slate-200 py-8 flex justify-center items-center min-h-screen">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <p className="text-base font-semibold uppercase tracking-wide  text-gray-900 dark:text-blue-200">
            {pick(lang, bookingText.form.kicker)}
          </p>
          <h2 className="font-heading mb-4 font-bold tracking-tight text-primary dark:text-white text-3xl sm:text-5xl">
            {pick(lang, bookingText.form.title)}
          </h2>
        </div>
        {showMessage && (
          <p className="mt-4 mb-4 text-center text-green-600">{responseMessage}</p>
        )}
        <StepNavigation currentStep={currentStep} steps={stepLabels} />
        {currentStep === 1 && (
          <BookingStep bookingData={formData} handleChange={handleChange} nextStep={nextStep} serverErrors={serverErrors} />
        )}
        {currentStep === 2 && (
          <ConfirmationStep formData={formData} prevStep={prevStep} handleSendmail={handleSendmail} />
        )}
        {currentStep === 3 && (
          <ThankYouStep formData={formData} />
        )}
      </div>
    </section>
  );
};

export default BookingForm;