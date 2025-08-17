"use client"

import GoogleMapsSection from '@/components/Home/GoogleMapsSection'
import SearchSection from '@/components/Home/SearchSection'
import SourceContext, { useSourceContext } from '@/context/SourceContext'
import DestinationContext, { useDestinationContext } from '@/context/DestinationContext'
import WhyChooseUs from '@/components/why-us/WhyChooseUs'
// import GoogleApiKeyContext from '@/context/GoogleApiKeyContext'
import { useState, useEffect, useContext } from "react";
import { LoadScript } from '@react-google-maps/api'
import MainBanner from '@/components/hero/MainBanner'

import { useRequestTransferContext } from '@/context/RequestTransferContext'
import MiniVanVisual from '@/components/utilities/MiniVanVisual'
import AIChat from '@/components/ai/AIChat'
// import CarListOptions from '../components/vehicle/CarListOptions'

export default function Home() {
// const googleAPiKeyContext = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const { source, setSource } = useSourceContext();
const { destination, setDestination } = useDestinationContext();
  return (   
          <LoadScript 
            libraries={['places']}
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-2 gap-0 bg-white">
                <div>
                  <SearchSection />
                </div>
                <div className="col-span-1 relative">
                  { !source || !destination ? <MainBanner />  : <GoogleMapsSection /> }
                  
                </div>
                
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-24 gap-0 bg-white">
                <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                  <h1 className='text-bold text-7xl text-primary'>Start Chat</h1>
                  <p>Chat with us for quick answers about our transfers, pricing, or routes.</p>
                  
                  {/* <SearchSection /> */}
                </div>
                <div className="col-span-1 p-8 relative">
                  <AIChat />
                </div>
                
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-24 gap-0 bg-white">
                <div className="col-span-1 p-8 relative">
                  <video
                    src="/videos/minibus-original.mov"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto rounded-lg shadow"
                    poster="/images/minivan-poster.jpg" // optional
                  />
                </div>
                <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                  <h1 className='text-bold text-7xl text-primary'>Minibus</h1>
                  <p>Our minivans are spacious, air-conditioned vehicles ideal for families, small groups, or travelers with extra luggage. Enjoy a comfortable ride with plenty of room for up to 7 passengers and their bags—perfect for airport transfers, tours, or group trips around Koh Samui.</p>
                  {/* <SearchSection /> */}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-24 gap-0 bg-white">
                <div className='col-span-1 flex flex-col justify-center gap-4 p-8'>
                  <h1 className='text-bold text-7xl text-primary'>SUV</h1>
                  <p>Travel in style and comfort with our SUVs. Suitable for up to 4 passengers, these vehicles offer a smooth ride, extra luggage space, and are perfect for couples, small families, or business travelers.
                  </p>
                  {/* <SearchSection /> */}
                </div>
                  <div className="col-span-1 p-8 relative">
                    <video
                      src="/videos/suv-original.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto rounded-lg shadow"
                      poster="/images/minivan-poster.jpg" // optional
                    />
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
              <div className='w-full min-h-96'>
                {/* <MiniVanVisual /> */}
                {/* <AboutUs /> */}
              </div>
            </div>
          </LoadScript>    
      
  );
}
