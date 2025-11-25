"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef, useState } from "react"
import { useJsApiLoader } from "@react-google-maps/api"
import { useSourceContext } from '@/context/SourceContext'
import { useDestinationContext } from '@/context/DestinationContext'
import WhyChooseUs from '@/components/Home/WhyChooseUs'
import AIChat from '@/components/ai/AIChat'
import Image from 'next/image'
import { useLanguage } from "@/context/LanguageContext"
import { pick } from "@/data/i18n/core"
import { homeText } from "@/data/content/home"
import { Skeleton } from "@/components/ui/Skeleton"
import GoogleMapsSection from "@/components/Home/GoogleMapsSection"

type SearchSectionProps = { mapsReady?: boolean }
const SearchSection = dynamic<SearchSectionProps>(() => import("@/components/Home/SearchSection"), { ssr: false })

export default function Home() {
  const { lang } = useLanguage()

  // Freeze Google Maps loader options to the initial language to avoid reloading the script with different options
  const initialLangRef = useRef(lang)

  // Keep libraries reference stable across renders
  const LIBRARIES = useMemo(() => ["places"] as ("places")[], [])

  const loaderOptions = useMemo(
    () => ({
      // Use static id to ensure consistency across all pages
      id: "script-loader",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
      libraries: LIBRARIES,
      language: initialLangRef.current,
      region: initialLangRef.current === "th" ? "TH" : "US",
    }),
    [LIBRARIES]
  )

  const { isLoaded, loadError } = useJsApiLoader(loaderOptions)

  const { source } = useSourceContext();
  const { destination } = useDestinationContext();

  // Normalize and verify coords
  const getCoords = (pt: any) => {
    if (!pt) return null;
    if (typeof pt.lat === 'number' && typeof pt.lng === 'number') return { lat: pt.lat, lng: pt.lng };
    const loc = pt?.geometry?.location || pt?.location;
    const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat;
    const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng;
    return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
  };
  const canShowMap = !!(getCoords(source) && getCoords(destination));

  function MapSlot({
    loadError,
    isLoaded,
  }: {
    loadError: unknown;
    isLoaded: boolean;
  }) {
    if (loadError) {
      return (
        <div
          role="alert"
          className="card card-padding text-center border border-red-200 bg-red-50 text-red-700"
        >
          <p className="text-sm font-medium">We couldn't load the map.</p>
          <p className="mt-1 text-xs text-red-600/80">
            Please check your connection or try again later.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Open Google Maps
            </a>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div role="status" aria-live="polite" className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }

    return <GoogleMapsSection />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 py-4 gap-0 bg-white">
          <div>
            <SearchSection mapsReady={isLoaded} />
          </div>
        </div>

        {/* Route map: Option A - directly after the search block */}
        {canShowMap && (
          <div className="grid grid-cols-1 lg:grid-cols-2 mb-24 py-4 bg-white mt-8">
            <div className="col-span-1 flex flex-col justify-center gap-4 p-8">
              <h1 className="text-primary text-3xl sm:text-3xl md:text-5xl lg:text-7xl">
                {pick(lang, homeText.route.title)}
              </h1>
              <p>{pick(lang, homeText.route.subtitle)}</p>
            </div>
            <div className="col-span-1 p-4 min-h-[400px] max-h-[600px] space-y-4 md:p-8">
              <MapSlot loadError={loadError} isLoaded={isLoaded} />
            </div>
          </div>
        )}

        {/* Why Choose Us: Option C - directly after the search block */}
        <div className="mt-8">
          <WhyChooseUs lang={lang as any} showLanguageSelector={false} />
        </div>

        <div className='w-full mx-auto p-6 gap-5 bg-white border-rounded-lg'>
          <div className='w-full text-center py-8 sm:py-12 md:py-16 lg:py-24'>
            <h1 className='text-primary items-center  text-center text-3xl sm:text-3xl md:text-5xl lg:text-7xl'>{pick(lang, homeText.vehicles.title)}</h1>
            <p>{pick(lang, homeText.vehicles.subtitle)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2  gap-0 bg-white w-full text-center py-8 sm:py-12 md:py-16 lg:py-24">
            <div className="col-span-1 p-8 ">
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <Image
                  src="/toyota-commuter-nathon-pier-169.png"
                  alt="Toyota Commuter in daylight"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
              <h1 className='text-primary text-left text-3xl sm:text-3xl md:text-5xl lg:text-7xl'>{pick(lang, homeText.vehicles.minibusTitle)}</h1>
              <p className='text-left'>{pick(lang, homeText.vehicles.minibusDesc)}</p>
              {/* <SearchSection /> */}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-0 bg-white w-full text-center py-8 sm:py-12 md:py-16 lg:py-24">
            <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
              <h1 className='text-primary text-left text-3xl sm:text-3xl md:text-5xl lg:text-7xl'>{pick(lang, homeText.vehicles.suvTitle)}</h1>
              <p className='text-left'>{pick(lang, homeText.vehicles.suvDesc)}
              </p>
              {/* <SearchSection /> */}
            </div>
            <div className="col-span-1 p-8 ">
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <Image
                  src="/toyota-fortuner-169.png"
                  alt="Toyota Fortuner on the beach"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-5 ">
          <div >
              {/* <SearchSection /> */}
          </div>
        </div>
        {/* <div className='w-full mx-auto p-6 gap-5'>
          <WhyChooseUs />
        </div> */}
        {/* <div id="faqs" className='w-full min-h-96 mb-32'>
          <Faq />
        </div> */}
        {/* <div className='w-full mx-auto text-center min-h-96  py-8 sm:py-12 md:py-16 lg:py-24'>  
          <div className="py-12">
            <h1 className='  text-primary sm:pt-12 md:pt-0 text-3xl sm:text-3xl md:text-5xl lg:text-7xl'>{pick(lang, homeText.chat.title)}</h1>
            <p>{pick(lang, homeText.chat.subtitle)}</p>
          </div>
          <AIChat />
        </div> */}
      </div>
    </main>
  );
}
