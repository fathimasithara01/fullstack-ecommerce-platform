'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ clientSecret, children }) => {
  const stripe = getStripe();

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: { colorPrimary: '#4f46e5' }, // Injects base corporate Tailwind theme parameters
        },
      }}
    >
      {children}
    </Elements>
  );
};