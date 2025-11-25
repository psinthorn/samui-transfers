/**
 * usePayment Hook
 * 
 * Manages payment state and operations
 */

'use client';

import { useState, useCallback } from 'react';

export interface PaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount?: number;
  date?: string;
}

interface UsePaymentReturn {
  checkPaymentStatus: (bookingId: string) => Promise<PaymentStatus | null>;
  isLoading: boolean;
  error: string | null;
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(
    async (bookingId: string): Promise<PaymentStatus | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/status/${bookingId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }

        const data = await response.json();
        return {
          status: data.paymentStatus,
          amount: data.paymentAmount,
          date: data.paymentDate,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    checkPaymentStatus,
    isLoading,
    error,
  };
}
