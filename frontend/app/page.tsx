"use client"

import GoogleMapsSection from '@/components/Home/GoogleMapsSection'
import SearchSection from '@/components/Home/SearchSection'
import SourceContext, { useSourceContext } from '@/context/SourceContext'
import DestinationContext, { useDestinationContext } from '@/context/DestinationContext'
import WhyChooseUs from '@/components/why-us/WhyChooseUs'
// import GoogleApiKeyContext from '@/context/GoogleApiKeyContext'
import { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript } from '@react-google-maps/api'
import MainBanner from '@/components/hero/MainBanner'

import { useRequestTransferContext } from '@/context/RequestTransferContext'
import MiniVanVisual from '@/components/utilities/MiniVanVisual'
import AIChat from '@/components/ai/AIChat'
import CarListOptions from '@/components/vehicle/CarListOptions'



export default function Home() {
// const googleAPiKeyContext = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const { source, setSource } = useSourceContext();
const { destination, setDestination } = useDestinationContext();

console.log('source', source);
console.log('destination', destination);

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
  console.log('canShowMap', canShowMap);


  return (
    (
      <LoadScript 
        libraries={['places']}
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 py-4 gap-0 bg-white">
            <div>
              <SearchSection />
            </div>
          </div>
              {/* { source && destination && (   */}
                <div className="grid grid-cols-1 w-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 mb-24 py-4 gap-0 bg-white mt-8">
                  <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                    <h1 className='text-bold text-7xl text-primary'>Route</h1>
                    <p>Preview your trip on the map from pickup to drop‑off.</p>   
                    {/* <SearchSection /> */}
                  </div>
                  <div className="col-span-1 p-4 min-h-[400px] max-h-[600px] space-y-4 md:p-8">
                      <GoogleMapsSection />
                  </div>
                </div>
               {/* )} */}

              
            <div className='w-full mx-auto p-6 gap-5  bg-white border-rounded-lg '>
              <div className='w-full text-center py-12'>
                <h1 className='items-center text-center text-7xl'>Vehicles & Drivers</h1>
                <p className='text-sm text-thin'>Choose from a variety of vehicles and professional drivers for your trip.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-24 gap-0 bg-white">
                <div className="col-span-1 p-8 ">
                  <video
                    src="/videos/minibus-original.mov"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto rounded-lg shadow"
                    // poster="/images/minivan-poster.jpg" // optional
                  />
                </div>
                <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                  <h1 className='text-bold text-7xl'>Minibus</h1>
                  <p>Our minivans are spacious, air-conditioned vehicles ideal for families, small groups, or travelers with extra luggage. Enjoy a comfortable ride with plenty of room for up to 7 passengers and their bags—perfect for airport transfers, tours, or group trips around Koh Samui.</p>
                  {/* <SearchSection /> */}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-24 gap-0 bg-white">
                <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                  <h1 className='text-bold text-7xl '>SUV</h1>
                  <p>Travel in style and comfort with our SUVs. Suitable for up to 4 passengers, these vehicles offer a smooth ride, extra luggage space, and are perfect for couples, small families, or business travelers.
                  </p>
                  {/* <SearchSection /> */}
                </div>
                  <div className="col-span-1 p-8 ">
                    <video
                      src="/videos/suv-original.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto rounded-lg shadow"
                      // poster="/images/minivan-poster.jpg" // optional
                    />
                  </div>
              </div>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-5 ">
                <div >
                    {/* <SearchSection /> */}
                </div>
              </div>
              <div className='w-full mx-auto p-6 gap-5'>
                <WhyChooseUs />
              </div>
              {/* <div id="faqs" className='w-full min-h-96 mb-32'>
                <Faq />
              </div> */}
              <div className='w-full mx-auto text-center min-h-96 py-12'>  
                <div className="py-12">
                  <h1 className='text-bold text-7xl text-primary sm:pt-12 md:pt-0'>Start Chat</h1>
                  <p>Chat with us for quick answers about our services, frequently asked questions, contact information or routes.</p>
                </div>
                <AIChat />
              </div>
            </div>
      </LoadScript>    
  ));
}
