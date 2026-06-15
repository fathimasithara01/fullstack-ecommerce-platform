'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { api } from '../../lib/api';

interface PaymentFormProps {
  orderId: string;
  onSuccess: () => void;
  onFailure: (msg: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, onSuccess, onFailure }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Prevents forced document reloads to process state transformations inline
      });

      if (error) {
        onFailure(error.message || 'Payment execution block failed.');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Post state tracking synchronization telemetry frames to system backends
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
          orderId,
        });
        onSuccess();
      }
    } catch (err: any) {
      onFailure(err.message || 'Exception occurred during transaction validation step.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmission} className="space-y-6">
      <PaymentElement />
      <button
        disabled={isProcessing || !stripe}
        className="w-full rounded-md bg-indigo-600 py-3 text-sm font-bold text-white shadow hover:bg-indigo-500 transition disabled:opacity-50"
      >
        {isProcessing ? 'Processing Transaction Core Locks...' : 'Authorize Vault Settlement'}
      </button>
    </form>
  );
};