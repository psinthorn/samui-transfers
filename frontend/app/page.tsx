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
import AboutUs from '@/components/AboutUs/AboutUs'
import { useRequestTransferContext } from '@/context/RequestTransferContext'
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
                {/* <AboutUs /> */}
              </div>
            </div>
          </LoadScript>    
      
  );
}
