"use client"

import React, { useState } from 'react';
import PaymentStep from '../../components/form/PaymentStep';

const PaymentPage = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle payment submission logic here
    console.log('Preparing to submit payment form');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Payment</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">Complete your payment</h1>
        </header>
        <PaymentStep formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
      </div>
    </main>
  );
};

export default PaymentPage;