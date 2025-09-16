"use client"

import React from 'react';
import BookingForm from '../../components/form/BookingForm';
import { useRequestTransferContext } from '@/context/RequestTransferContext';

export default function Booking() {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext();
  console.log("Booking Request is: ", requestTransfer);
  // // Set the initial form data
  //   const [formData, setFormData] = useState({
  //     ...requestTransfer,
  //     // firstName: '',
  //     // lastName: '',
  //     // address: '',
  //     // email: '',
  //     // mobile: '',
  //     // luggage: '',
  
  //     // date: '',
  //     // time: '',
  
  //     // arrival: '',
  //     // departure: '',
  //     // flightNo: '',
  //     // flightTime: '',
      
  //     // // carType: carType? carType : '',
  //     // carType: requestTransfer?.carType ,
  //     // carModel: requestTransfer?.carModel,
      
  //     // distance: requestTransfer?.distance,
  //     // passengers: requestTransfer?.passengers,
  //     // rate: requestTransfer?.rate,
  //     // total: '', // Total price calculation from the rate and passengers

  //     // pickupPoint: requestTransfer?.pickupPoint,
  //     // dropoffPoint: requestTransfer?.dropoffPoint,
  
  //     // note: '',
  
  //     // cardNumber: '',
  //     // cardHolder: '',
  //     // expiryDate: '',
  //     // cvv: '',
  
  //     // status: '',
  //   });

  // console.log("Form Data on Main Booking Page: ", formData);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <BookingForm bookingData={requestTransfer} />
      </div>
    </main>
  );
}