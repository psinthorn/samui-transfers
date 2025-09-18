"use client"

import { useEffect, useState } from 'react';
import InputItem from './InputItem'
import { useSourceContext } from '@/context/SourceContext';
import { useDestinationContext } from '@/context/DestinationContext';
import { useRequestTransferContext } from '@/context/RequestTransferContext';
import Services from '../services/Services';
import { useRouter } from 'next/navigation';
import ContactBanner from './ContactBanner';
import MiniVanVisual from '../utilities/MiniVanVisual';
import MainBanner from '../hero/MainBanner';
import { CircleCheckIcon, CircleChevronDown } from 'lucide-react';
import CarListOptions from '@/components/vehicle/CarListOptions'
import { useLanguage } from '@/context/LanguageContext'

const LABELS = {
  en: {
    priceNote: 'From 350 THB. After 5 km, rates are based on distance.',
    bookNowTitle: 'Book Now',
    prompt: 'Enter pickup and drop‑off to see price and route.',
    availableHeader: 'Available Book Now',
    avgDistance: 'Average Distance:',
    chooseVehicle: 'Choose the vehicle that fits your group and comfort.',
    unitKm: 'KM',
  },
  th: {
    priceNote: 'เริ่มต้น 350 บาท หลังจาก 5 กม. คิดตามระยะทาง',
    bookNowTitle: 'จองเลย',
    prompt: 'กรอกจุดรับและจุดส่งเพื่อดูราคาและเส้นทาง',
    availableHeader: 'พร้อมให้จอง',
    avgDistance: 'ระยะทางเฉลี่ย:',
    chooseVehicle: 'เลือกรถที่เหมาะกับจำนวนคนและความสะดวกสบายของคุณ',
    unitKm: 'กม.',
  },
}

const SearchSection = ({ mapsReady = true }) => {
  const {source, setSource} = useSourceContext();
  const {destination, setDestination} = useDestinationContext(); 
  const {requestTransfer, setRequestTransfer} = useRequestTransferContext();
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDistanceInKiloMeter, setRouteDistanceInKiloMeter] = useState(0);
  const router = useRouter();
  const { lang } = useLanguage();
  const L = LABELS[lang === 'th' ? 'th' : 'en'];
 
  // Calculate distance between source and destination
  const calculateDistance  = () => {
    console.log("source: ", source);
    console.log("destination: ", destination);
    if ( source && destination ) {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [new google.maps.LatLng(source.lat, source.lng)],
            destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
              const distanceInMeters = response.rows[0].elements[0].distance.value;
              const distanceInKilometers = distanceInMeters / 1000;

              setRouteDistance(distanceInMeters);
              setRouteDistanceInKiloMeter(distanceInKilometers);
        
            } else {
              console.error('Error calculating distance:', status);
            }
          }
        );
    } else {
      console.error('Google Maps JavaScript API is not loaded or geometry library is not available.');
    };
};

  // Calculate distance when source and destination are set
  useEffect(() => {
    if (source){ setSource(source) }
    if (destination){ setDestination(destination) }
    if (source && destination) { calculateDistance()}
  }, [source, destination]);

  // Handle book now and push to booking page
  const handleBookNow = ({carType, carModel, rate} ) => {
      setRequestTransfer({
        ...requestTransfer,
        pickupPoint: source.label,
        dropoffPoint: destination.label,
        distance: routeDistanceInKiloMeter
      });
      console.log("after Request Transfer is: ", requestTransfer);
      router.push('/booking');
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 py-4 gap-0 bg-white'>
      <div className='p-4 items-center'>
          <div className='mx-auto placeholder:p-4 md:p-6 border-0 rounded-t-xl rounded-b-none'>
            <span className='font-thin text-sm sm:text-base md:text-lg lg:text-xl'>{L.priceNote}</span>
            <p className='text-xl sm:text-2xl md:text-4xl lg:text-5xl text-secondary font-semibold m-2'>{L.bookNowTitle}</p>
            <p className='font-thin text-sm sm:text-base md:text-lg lg:text-xl'>
              {L.prompt}
            </p>
            <InputItem type='source' mapsReady={mapsReady} />
            <InputItem type='destination' mapsReady={mapsReady} /> 
          </div>
          <div className=''>
              <div className='w-full text-2xl font-light items-center'>            
               <div>
                  <MiniVanVisual />
                  <ContactBanner />
              </div>         
              </div>
          </div>        
      </div>
      <div>
            <div className='mt-2 px-4'>
              { routeDistance ? 
              <div>
                <div>
                    <h2 className='font-semibold text-2xl text-tertiary pt-8'>{L.availableHeader}</h2>
                    <p className='text-md text-muted-foreground'>{L.avgDistance} <span>{ routeDistanceInKiloMeter.toFixed(2)}</span>{L.unitKm}</p>
                </div>
                <p className='flex p-1 gap-2'> {L.chooseVehicle} <CircleChevronDown /></p> 
              </div>
                : 
                null }            
              { routeDistance ? 
              
                <CarListOptions 
                  distance={routeDistanceInKiloMeter.toFixed(2)}
                  source={source}
                  destination={destination} 
                  handleBookNow={handleBookNow} 
                /> 
                : 
                <MainBanner />}
            </div>
          </div>
     </div>
  )
}

export default SearchSection;