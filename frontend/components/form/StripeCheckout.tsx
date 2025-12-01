/**
 * Stripe Checkout Component
 * 
 * Handles payment processing using Stripe Elements
 * Supports both card payments and recurring payments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export interface StripeCheckoutProps {
  bookingId: string;
  amount: number; // in currency units (THB)
  customerEmail: string;
  customerName?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  paymentIntentId?: string;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
};

export function StripeCheckout({
  bookingId,
  amount,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  isLoading = false,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: 'idle',
  });
  const [cardComplete, setCardComplete] = useState(false);

  // Validate inputs
  useEffect(() => {
    if (!bookingId || !amount || !customerEmail) {
      setPaymentState({
        status: 'error',
        message: 'Missing required booking information',
      });
    }
  }, [bookingId, amount, customerEmail]);

  /**
   * Step 1: Create payment intent on backend
   */
  const createPaymentIntent = async (): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  } | null> => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          customerEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      setPaymentState({
        status: 'error',
        message: `Failed to initialize payment: ${message}`,
      });
      return null;
    }
  };

  /**
   * Step 2: Confirm payment with Stripe
   */
  const confirmPayment = async (clientSecret: string, paymentIntentId: string) => {
    if (!stripe || !elements) {
      setPaymentState({
        status: 'error',
        message: 'Stripe not initialized',
      });
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName || 'Customer',
            email: customerEmail,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentIntent) {
        throw new Error('Payment intent not returned from Stripe');
      }

      // Step 3: Confirm with backend
      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          bookingId,
        }),
      });

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      // Success!
      setPaymentState({
        status: 'success',
        message: 'Payment successful! Your booking is confirmed.',
        paymentIntentId,
      });

      if (onSuccess) {
        onSuccess(paymentIntentId);
      }

      // Clear card element
      cardElement.clear();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      setPaymentState({
        status: 'error',
        message: `Payment error: ${message}`,
      });

      if (onError) {
        onError(message);
      }
    }
  };

  /**
   * Main payment handler
   */
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setPaymentState({
        status: 'error',
        message: 'Payment system not initialized',
      });
      return;
    }

    setPaymentState({ status: 'processing' });

    try {
      // Step 1: Create payment intent
      const intentData = await createPaymentIntent();
      if (!intentData) {
        return;
      }

      const { clientSecret, paymentIntentId } = intentData;

      // Step 2 & 3: Confirm payment
      await confirmPayment(clientSecret, paymentIntentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment processing failed';
      setPaymentState({
        status: 'error',
        message,
      });
    }
  };

  const isProcessing = paymentState.status === 'processing' || isLoading;
  const hasError = paymentState.status === 'error';
  const isSuccessful = paymentState.status === 'success';

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Amount Display */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Total Amount</span>
          <span className="text-2xl font-bold text-slate-900">
            ฿{amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {hasError && paymentState.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription>{paymentState.message}</AlertDescription>
        </Alert>
      )}

      {isSuccessful && paymentState.message && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Payment Successful</AlertTitle>
          <AlertDescription className="text-green-800">
            {paymentState.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Card Element */}
      {!isSuccessful && (
        <>
          <div className="border border-slate-300 rounded-lg p-4 bg-white">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Card Details
            </label>
            <CardElement
              options={cardElementOptions}
              onChange={(event) => {
                setCardComplete(event.complete);
                if (event.error) {
                  setPaymentState({
                    status: 'error',
                    message: event.error.message,
                  });
                } else {
                  setPaymentState({ status: 'idle' });
                }
              }}
            />
          </div>

          {/* Email Display */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-sm text-slate-600">
              Receipt will be sent to: <span className="font-medium">{customerEmail}</span>
            </p>
          </div>

          {/* Payment Button */}
          <Button
            type="submit"
            disabled={!stripe || !cardComplete || isProcessing}
            className="w-full h-12 text-base"
            variant={isProcessing ? 'secondary' : 'default'}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ฿${amount.toFixed(2)}`
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-slate-500 text-center">
            🔒 Your payment information is secure and encrypted with Stripe
          </p>
        </>
      )}

      {/* Success State */}
      {isSuccessful && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Booking Confirmed!</h3>
            <p className="text-sm text-slate-600 mt-2">
              Your payment has been processed and confirmed.
              You will receive a confirmation email shortly.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
