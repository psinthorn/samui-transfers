"use client";

import { createContext, useContext, useState } from 'react';

type RequestTransferProviderProps = {
  children: React.ReactNode;
};

type requestTransferType = {
  requestNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  mobile: string;
  luggage: string;
  
  date: string;
  time: string;
  
  arrival: string;
  departure: string;
  flightNo: string;
  flightTime: string;

  pickupPoint: string;
  dropoffPoint: string;

  distance: number;
  quantity: number;
  rate: number;
  total: number;

  carType: string;
  carModel: string;
  
};

type RequestTransferContextType = {
  requestTransfer: requestTransferType | undefined;
  setRequestTransfer: React.Dispatch<React.SetStateAction<requestTransferType | undefined>>;
};

const RequestTransferContext = createContext<RequestTransferContextType | undefined>(undefined);

export default function RequestTransferContextProvider({ children }: RequestTransferProviderProps) {
  const [requestTransfer, setRequestTransfer] = useState<requestTransferType | undefined>(undefined);

  return (
    <RequestTransferContext.Provider 
      value={{ 
        requestTransfer, 
        setRequestTransfer 
        }}>
        {children}
    </RequestTransferContext.Provider>
  )
};

export function useRequestTransferContext() {
  const context = useContext(RequestTransferContext);
  if (!context) {
    throw new Error('useRequestTransfer must be used within a RequestTransferContextProvider');
  }
  return context;
}