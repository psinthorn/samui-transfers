"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useJsApiLoader } from "@react-google-maps/api";
import BookingForm from "@/components/form/BookingForm";
import { useRequestTransferContext } from "@/context/RequestTransferContext";
import { useLanguage } from "@/context/LanguageContext";

const ClientBookingEntry: React.FC = () => {
  const { requestTransfer } = useRequestTransferContext();
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
      const nameParts = session.user.name?.split(" ") || [];
      setUserInitialData({
        firstName: requestTransfer?.firstName || nameParts[0] || "",
        lastName: requestTransfer?.lastName || nameParts.slice(1).join(" ") || "",
        email: requestTransfer?.email || session.user.email || "",
      });
      console.log("✅ User session loaded:", {
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [status, session, requestTransfer]);

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
