"use client"

import { useEffect, useState } from 'react';
import InputItem from './InputItem'
import { useSourceContext } from '@/context/SourceContext';
import { useDestinationContext } from '@/context/DestinationContext';
import { useRequestTransferContext } from '@/context/RequestTransferContext';
import CarListOptions from '../vehicle/CarListOptions';
import Services from '../services/Services';
import { CircleChevronDown } from 'lucide-react';
import IconAnimate from '../utilities/IconAnimate';
import { useRouter } from 'next/navigation';
import ContactBanner from './ContactBanner';
import MiniVanVisual from '../utilities/MiniVanVisual';

const SearchSection = () => {
  const {source, setSource} = useSourceContext();
  const {destination, setDestination} = useDestinationContext(); 
  const {requestTransfer, setRequestTransfer} = useRequestTransferContext();
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDistanceInKiloMeter, setRouteDistanceInKiloMeter] = useState(0);
  const router = useRouter();
 
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
    <div className='space-y-4 p-4 bg-white rounded-none h-full md:p-6'>
        <div className='p-4 md:p-6 border-0 rounded-t-xl rounded-b-none'>
          <span className='font-thin text-lg sm:text-md'>From 350 THB. After 5 km, rates are based on distance.</span>
          <p className='text-5xl text-secondary font-semibold m-2 sm:text-1xl'>Book Now </p>
          <p className='text-lg font-thin mt-4 sm:text-md'>
              Choose your pickup and dropoff location, <span>We show youre route.</span>
          </p>
          <InputItem type='source' />
          <InputItem type='destination' /> 
        </div>
        {/* <div className=''>
            <div className='w-full text-2xl font-light items-center'>
              {routeDistance ? 
                  <div>
                  <h2 className='font-semibold text-2xl text-tertiary pt-8'>Available Book Now</h2>
                  <p className='text-sm text-muted-foreground'>Distance: <span>{ routeDistanceInKiloMeter.toFixed(2)}</span>KM</p>
                  </div>
              : 
                <MiniVanVisual />
                // <IconAnimate />
              }
            </div>
        </div> */}
        {/* <div className='mt-2'>
          { routeDistance ? 
            <p className='flex p-1 gap-2'> Select car type for your comfortable <CircleChevronDown /></p> 
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
            null }
        </div> */}
        {
          routeDistance ? 
          <MiniVanVisual />
            : 
            <>
            <ContactBanner />
            <Services />
          </>
        }
      </div>
  )
}

export default SearchSection;