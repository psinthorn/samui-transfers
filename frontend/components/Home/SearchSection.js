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
import { CircleCheckIcon, CircleChevronDown, AlertCircle, CheckCircle2, Lock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'
import RateCalculate from '@/components/utilities/RateCalculate'

const LABELS = {
  en: {
    priceNote: 'Select your pickup and drop-off locations to see available vehicles.',
    bookNowTitle: 'Available Vehicles',
    prompt: 'Enter pickup and drop‑off to see price and route.',
    availableHeader: 'Select a Vehicle',
    avgDistance: 'Distance:',
    chooseVehicle: 'Available vehicles for your trip.',
    unitKm: 'KM',
    loading: 'Loading vehicles...',
    noVehicles: 'No vehicles available for this route.',
    statusAvailable: 'Available',
    statusMaintenance: 'Under Maintenance',
    statusRetired: 'Retired',
    statusUnavailable: 'Unavailable',
    disabled: 'Disabled',
    selectVehicle: 'Select',
    baseRate: 'Base Rate',
    seats: 'Seats',
    capacity: 'Capacity',
    estimatedFare: 'Estimated Fare',
  },
  th: {
    priceNote: 'เลือกจุดรับและจุดส่งเพื่อดูรถที่พร้อมให้บริการ',
    bookNowTitle: 'รถที่พร้อมให้บริการ',
    prompt: 'กรอกจุดรับและจุดส่งเพื่อดูราคาและเส้นทาง',
    availableHeader: 'เลือกรถ',
    avgDistance: 'ระยะทาง:',
    chooseVehicle: 'รถที่พร้อมให้บริการสำหรับการเดินทางของคุณ',
    unitKm: 'กม.',
    loading: 'กำลังโหลดรถ...',
    noVehicles: 'ไม่มีรถที่พร้อมให้บริการสำหรับเส้นทางนี้',
    statusAvailable: 'พร้อมใช้',
    statusMaintenance: 'อยู่ระหว่างซ่อมแซม',
    statusRetired: 'เลิกใช้งาน',
    statusUnavailable: 'ไม่พร้อมใช้',
    disabled: 'ปิด',
    selectVehicle: 'เลือก',
    baseRate: 'อัตราพื้นฐาน',
    seats: 'ที่นั่ง',
    capacity: 'ความจุ',
    estimatedFare: 'ค่าโดยสารโดยประมาณ',
  },
}

// Default service rates for vehicles (from ServiceRate table)
const DEFAULT_RATES = {
  minibus: { basePrice: 500, distanceRate: 45 },
  suv: { basePrice: 350, distanceRate: 35 },
  sedan: { basePrice: 300, distanceRate: 30 },
  pickup: { basePrice: 400, distanceRate: 40 },
  van: { basePrice: 450, distanceRate: 42 },
  bus: { basePrice: 600, distanceRate: 50 },
  truck: { basePrice: 700, distanceRate: 60 },
  other: { basePrice: 350, distanceRate: 35 },
};

const SearchSection = ({ mapsReady = true }) => {
  const {source, setSource} = useSourceContext();
  const {destination, setDestination} = useDestinationContext(); 
  const {requestTransfer, setRequestTransfer} = useRequestTransferContext();
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDistanceInKiloMeter, setRouteDistanceInKiloMeter] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const router = useRouter();
  const { lang } = useLanguage();
  const L = LABELS[lang === 'th' ? 'th' : 'en'];

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  });

  // Fetch vehicles from database
  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await fetch('/api/vehicles?status=AVAILABLE&limit=20');
      const data = await response.json();
      if (data.data) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Calculate distance between source and destination
  const calculateDistance = () => {
    if (source && destination) {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(source.lat, source.lng)],
          destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response?.rows[0]?.elements[0]) {
            const distanceInMeters = response.rows[0].elements[0].distance.value;
            const distanceInKilometers = distanceInMeters / 1000;
            setRouteDistance(distanceInMeters);
            setRouteDistanceInKiloMeter(distanceInKilometers);
          } else {
            console.error('Error calculating distance:', status);
          }
        }
      );
    }
  };

  // Fetch vehicles when locations are selected
  useEffect(() => {
    if (source && destination) {
      calculateDistance();
      fetchVehicles();
      setSelectedVehicle(null);
    }
  }, [source, destination]);

  // Calculate fare for a specific vehicle
  const calculateFare = (vehicle) => {
    if (!routeDistanceInKiloMeter) return 0;
    const rate = DEFAULT_RATES[vehicle.vehicleType?.toLowerCase()] || DEFAULT_RATES.other;
    const distance = routeDistanceInKiloMeter;
    
    // Base price + (distance - 5km minimum) * rate per km
    // If distance < 5km, charge base price only
    const calculatedDistance = Math.max(distance - 5, 0);
    const fare = rate.basePrice + (calculatedDistance * rate.distanceRate);
    return Math.round(fare);
  };

  // Get status badge color and text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'AVAILABLE': { color: 'bg-green-100 text-green-800 border-green-300', text: L.statusAvailable },
      'MAINTENANCE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: L.statusMaintenance },
      'RETIRED': { color: 'bg-gray-100 text-gray-800 border-gray-300', text: L.statusRetired },
      'OUT_OF_SERVICE': { color: 'bg-red-100 text-red-800 border-red-300', text: L.statusUnavailable },
    };
    return statusMap[status] || statusMap.AVAILABLE;
  };

  // Handle vehicle selection and book
  const handleSelectVehicle = (vehicle) => {
    const fare = calculateFare(vehicle);
    const bookingData = {
      ...requestTransfer,
      pickupPoint: source.label,
      dropoffPoint: destination.label,
      distance: Math.round(routeDistanceInKiloMeter * 100) / 100,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.vehicleType,
      rate: fare,
      total: fare,
      carType: vehicle.vehicleType,
      carModel: vehicle.name,
    };

    // Persist booking data to sessionStorage before navigation
    sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    
    setRequestTransfer(bookingData);
    setSelectedVehicle(vehicle);
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
          {routeDistance ? (
            <div>
              <div className='mb-4'>
                <h2 className='font-semibold text-2xl text-tertiary pt-8'>{L.availableHeader}</h2>
                <p className='text-md text-muted-foreground'>
                  {L.avgDistance} <span className='font-semibold'>{routeDistanceInKiloMeter.toFixed(2)}</span> {L.unitKm}
                </p>
              </div>
              <p className='flex p-1 gap-2 text-sm text-slate-600'> {L.chooseVehicle} <CircleChevronDown size={16} /></p> 
            </div>
          ) : null}          
          
          {routeDistance ? (
            <div className='mt-6'>
              {loadingVehicles ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                  <span className='ml-2 text-sm text-slate-600'>{L.loading}</span>
                </div>
              ) : vehicles.length > 0 ? (
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {vehicles.map((vehicle) => {
                    const fare = calculateFare(vehicle);
                    const isAvailable = vehicle.status === 'AVAILABLE';
                    const statusDisplay = getStatusDisplay(vehicle.status);

                    return (
                      <div
                        key={vehicle.id}
                        className={`p-4 border rounded-lg transition-all ${
                          isAvailable
                            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              <h3 className='font-semibold text-slate-900'>{vehicle.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusDisplay.color}`}>
                                {statusDisplay.text}
                              </span>
                              {!isAvailable && <Lock size={14} className='text-slate-500' />}
                            </div>
                            <p className='text-sm text-slate-600 mb-3'>{vehicle.vehicleType} • {L.capacity}: {vehicle.capacity} {L.seats}</p>
                            
                            <div className='grid grid-cols-2 gap-3 text-sm'>
                              <div>
                                <p className='text-xs font-semibold text-slate-500 uppercase'>{L.estimatedFare}</p>
                                <p className='text-lg font-bold text-blue-600'>{formatter.format(fare)}</p>
                              </div>
                              <div>
                                <p className='text-xs font-semibold text-slate-500 uppercase'>{L.baseRate}</p>
                                <p className='text-sm text-slate-700'>
                                  {formatter.format(DEFAULT_RATES[vehicle.vehicleType?.toLowerCase()] || DEFAULT_RATES.other).basePrice}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {isAvailable && (
                            <button
                              onClick={() => handleSelectVehicle(vehicle)}
                              className='ml-4 shrink-0 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors'
                            >
                              {L.selectVehicle}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-slate-500'>
                  <AlertCircle size={24} className='mb-2' />
                  <p className='text-sm'>{L.noVehicles}</p>
                </div>
              )}
            </div>
          ) : (
            <MainBanner />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchSection;