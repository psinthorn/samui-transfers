"use client";

import React from "react";
import BookingForm from "@/components/form/BookingForm";
import { useRequestTransferContext } from "@/context/RequestTransferContext";

const ClientBookingEntry: React.FC = () => {
  const { requestTransfer } = useRequestTransferContext();
  return <BookingForm bookingData={requestTransfer} />;
};

export default ClientBookingEntry;
