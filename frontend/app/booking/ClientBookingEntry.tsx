"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useJsApiLoader } from "@react-google-maps/api";
import BookingForm from "@/components/form/BookingForm";
import { useRequestTransferContext } from "@/context/RequestTransferContext";
import { useLanguage } from "@/context/LanguageContext";

const ClientBookingEntry: React.FC = () => {
  const { requestTransfer, setRequestTransfer } = useRequestTransferContext();
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const [userInitialData, setUserInitialData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Keep libraries reference stable across renders
  const LIBRARIES = useMemo(() => ["places"] as ("places")[], []);

  const loaderOptions = useMemo(
    () => ({
      id: "script-loader",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
      libraries: LIBRARIES,
      language: lang === "th" ? "th" : "en",
      region: lang === "th" ? "TH" : "US",
    }),
    [lang, LIBRARIES]
  );

  const { isLoaded } = useJsApiLoader(loaderOptions);

  // Update user data when session is loaded
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // First, try to restore booking data from sessionStorage
      let restoredBookingData = null;
      try {
        const storedData = sessionStorage.getItem('pendingBookingData');
        if (storedData) {
          restoredBookingData = JSON.parse(storedData);
          // Update context with restored data
          setRequestTransfer(restoredBookingData);
          // Clear the sessionStorage after restoring
          sessionStorage.removeItem('pendingBookingData');
          console.log('✅ Booking data restored from sessionStorage:', restoredBookingData);
        }
      } catch (error) {
        console.error('❌ Error restoring booking data:', error);
      }

      // Then update user info
      const nameParts = session.user.name?.split(" ") || [];
      const userData = {
        firstName: (restoredBookingData?.firstName) || requestTransfer?.firstName || nameParts[0] || "",
        lastName: (restoredBookingData?.lastName) || requestTransfer?.lastName || nameParts.slice(1).join(" ") || "",
        email: (restoredBookingData?.email) || requestTransfer?.email || session.user.email || "",
      };
      
      setUserInitialData(userData);
      console.log("✅ User session loaded:", {
        name: session.user.name,
        email: session.user.email,
        hasRestoredData: !!restoredBookingData,
      });
    }
  }, [status, session, requestTransfer, setRequestTransfer]);

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <BookingForm 
      bookingData={{
        ...userInitialData,
        ...requestTransfer
      }} 
    />
  );
};

export default ClientBookingEntry;
