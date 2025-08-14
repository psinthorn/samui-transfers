import { CircleChevronRight, Users, Map, Star, Plane, Car } from 'lucide-react'
import { FaMapMarkerAlt, FaShuttleVan, FaMapPin } from 'react-icons/fa'

import React from 'react'

const ServiceItem = ({service}: any) => {
  const Icon = service.icon 
  return (
    <div className='flex flex-row gap-4 px-4 py-1'>
      <Star size={24} className='text-thin text-gray-400' /> <span className='text-xl font-light text-slate-800'>{ service.title }</span>
    </div>
  )
}

export default ServiceItem