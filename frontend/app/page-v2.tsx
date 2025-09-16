"use client"

import { useJsApiLoader } from "@react-google-maps/api"
import { useRef, useMemo } from "react"
import { useLanguage } from "@/context/LanguageContext"
import dynamic from "next/dynamic"
import { useSourceContext } from "@/context/SourceContext"
import { useDestinationContext } from "@/context/DestinationContext"
import WhyChooseUs from "@/components/why-us/WhyChooseUs"
import AIChat from "@/components/ai/AIChat"
import Image from "next/image"

const GoogleMapsSection = dynamic(() => import("@/components/Home/GoogleMapsSection"), { ssr: false })
const SearchSection = dynamic(() => import("@/components/Home/SearchSection"), { ssr: false })

export default function Home() {
  const { lang } = useLanguage()
  const initialLangRef = useRef(lang)
  const loaderOptions = useMemo(
    () => ({
      id: "google-maps",
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
      libraries: ["places"] as any,
      language: initialLangRef.current,
      region: initialLangRef.current === "th" ? "TH" : "US",
    }),
    []
  )
  const { isLoaded, loadError } = useJsApiLoader(loaderOptions)

  const { source } = useSourceContext()
  const { destination } = useDestinationContext()

  // Normalize coords from place result or raw lat/lng
  const getCoords = (pt: any) => {
    if (!pt) return null
    if (typeof pt.lat === "number" && typeof pt.lng === "number") return { lat: pt.lat, lng: pt.lng }
    const loc = pt?.geometry?.location || pt?.location
    const lat = typeof loc?.lat === "function" ? loc.lat() : loc?.lat
    const lng = typeof loc?.lng === "function" ? loc.lng() : loc?.lng
    return typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null
  }
  const canShowMap = !!(getCoords(source) && getCoords(destination))

  if (loadError) return <div className="p-4 text-red-600 text-sm">Failed to load Google Maps.</div>
  if (!isLoaded) return <div className="p-4 text-sm text-gray-600">Loading map…</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <section className="py-6 sm:py-8">
          <SearchSection />
        </section>

        {/* Route map */}
        {canShowMap && (
          <section className="mb-12 rounded-xl bg-white p-8 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Route</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Visualize your journey from pickup to drop‑off on the map.
                </p>
              </div>
              <div className="min-h-[300px] sm:min-h-[420px]">
                <GoogleMapsSection />
              </div>
            </div>
          </section>
        )}

        {/* Vehicles */}
        <section className="mb-12 rounded-xl bg-white p-4 sm:p-6 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Vehicles & Drivers</h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose from a variety of vehicles and professional drivers for your trip.
            </p>
          </div>

          {/* Minibus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 p-8 gap-12 mb-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src="/toyota-commuter-nathon-pier-169.png"
                alt="Toyota Commuter in daylight"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl sm:text-2xl font-semibold text-primary">Minibus</h3>
              <p className="mt-2 text-sm text-slate-600">
                Our minivans are spacious, air‑conditioned vehicles ideal for families, small groups, or travelers with
                extra luggage. Comfortable for up to 7 passengers and their bags—perfect for airport transfers, tours,
                or group trips around Koh Samui.
              </p>
            </div>
          </div>

          {/* SUV */}
          <div className="grid grid-cols-1 lg:grid-cols-2 p-8 gap-12">
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-primary">SUV</h3>
              <p className="mt-2 text-sm text-slate-600">
                Travel in style and comfort with our SUVs. Suitable for up to 4 passengers, these vehicles offer a
                smooth ride and extra luggage space—great for couples, small families, or business travelers.
              </p>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg order-1 lg:order-2">
              <Image
                src="/toyota-fortuner-169.png"
                alt="Toyota Fortuner on the beach"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="mb-12">
          <WhyChooseUs />
        </section>

        {/* AI Chat */}
        <section className="mb-12 rounded-xl bg-white p-4 sm:p-6 shadow-sm text-center">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary">Start Chat</h2>
            <p className="mt-2 text-sm text-slate-600">
              Chat with us for quick answers about services, FAQs, contact info, or routes.
            </p>
          </div>
          <AIChat />
        </section>
      </div>
    </div>
  )
}
