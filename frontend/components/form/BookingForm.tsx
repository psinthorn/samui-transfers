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
import { useSourceContext } from '@/context/SourceContext';
import { useDestinationContext } from '@/context/DestinationContext';
import InputItem from '@/components/Home/InputItem';
import { AlertCircle, ArrowRight } from 'lucide-react';
import RateCalculate from '@/components/utilities/RateCalculate';
import { CarListData } from '@/data/CarListData';
import { MapPin, DollarSign, Users } from 'lucide-react';

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
  const { source } = useSourceContext();
  const { destination } = useDestinationContext();
  
  const [formData, setFormData] = useState<requestTransferType>({
    ...defaultBookingData,
    ...(bookingData ?? {}),
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  // Check if pickup and dropoff data exists
  const hasLocationData = formData.pickupPoint && formData.dropoffPoint;
  const hasContextLocations = source && destination;

  useEffect(() => {
    if (bookingData) {
      setFormData((prevData) => ({
        ...prevData,
        ...bookingData,
      }));
    }
    // setRequestTransfer(formData)
  }, [bookingData]);

  // Sync context locations to form data when they change
  useEffect(() => {
    if (hasContextLocations && !hasLocationData) {
      setFormData(prev => ({
        ...prev,
        pickupPoint: (source as any)?.label || (source as any)?.name || '',
        dropoffPoint: (destination as any)?.label || (destination as any)?.name || '',
      }));
    }
  }, [source, destination, hasContextLocations, hasLocationData]);

  // Calculate distance and fare when locations change
  useEffect(() => {
    if (source && destination) {
      const g = typeof window !== 'undefined' ? window.google : undefined
      if (!g?.maps) return

      const service = new g.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new g.maps.LatLng((source as any).lat, (source as any).lng)],
          destinations: [new g.maps.LatLng((destination as any).lat, (destination as any).lng)],
          travelMode: g.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status === g.maps.DistanceMatrixStatus.OK && response?.rows[0]?.elements[0]) {
            const distanceInMeters = response.rows[0].elements[0].distance.value;
            const distanceInKm = distanceInMeters / 1000;

            // Calculate fare based on selected car type or default to SUV
            const carType = formData.carType || 'SUV';
            const selectedCar = CarListData.find(car => car.type === carType);
            const calculatedRate = selectedCar ? Math.round(RateCalculate({ distance: distanceInKm }, selectedCar.rate) || 0) : 0;

            setFormData(prev => ({
              ...prev,
              distance: Math.round(distanceInKm * 100) / 100,
              rate: calculatedRate,
              total: calculatedRate,
            }));
          }
        }
      );
    }
  }, [source, destination, formData.carType]);

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

  // Always show selector if no location data AND no context locations
  const showLocationSelector = !hasLocationData && !hasContextLocations;

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

        {/* Show location selector if no pickup/dropoff data */}
        {showLocationSelector && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Select Your Route</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Please select your pickup and drop-off locations to proceed with your booking.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Location</label>
                <InputItem type="source" mapsReady={true} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Drop-off Location</label>
                <InputItem type="destination" mapsReady={true} />
              </div>

              {source && destination && (
                <div className="pt-4 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        pickupPoint: (source as any)?.label || (source as any)?.name,
                        dropoffPoint: (destination as any)?.label || (destination as any)?.name,
                      }));
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue with Selected Route
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show booking form only if location data exists */}
        {!showLocationSelector && (
          <>
            {/* Vehicle Selection Step */}
            {!formData.carType && (
              <div className="mb-6">
                {/* Route Summary */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Your Journey</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600">Pickup</p>
                        <p className="text-sm font-medium text-slate-900">{formData.pickupPoint}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600">Drop-off</p>
                        <p className="text-sm font-medium text-slate-900">{formData.dropoffPoint}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pt-2 border-t border-blue-200">
                      <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600">Distance</p>
                        <p className="text-sm font-medium text-slate-900">{formData.distance.toFixed(2)} km</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Select Vehicle Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CarListData.map((car) => {
                      const fare = Math.round(RateCalculate({ distance: formData.distance }, car.rate) || 0);
                      const formatter = new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
                        style: 'currency',
                        currency: 'THB',
                        maximumFractionDigits: 0,
                      });

                      return (
                        <button
                          key={car.ID}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              carType: car.type,
                              carModel: car.model,
                              rate: fare,
                              total: fare,
                            }));
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                        >
                          <h4 className="font-semibold text-slate-900">{car.model}</h4>
                          <p className="text-sm text-slate-600 mt-1">{car.seat} seats • {car.Luggage} luggage</p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Distance:</span>
                              <span className="font-medium text-slate-900">{formData.distance.toFixed(2)} km</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-xs text-slate-600">Estimated Fare:</span>
                              <span className="text-lg font-bold text-blue-600">{formatter.format(fare)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {formData.carType && (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show booking form after vehicle is selected */}
            {formData.carType && (
              <>
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
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BookingForm;