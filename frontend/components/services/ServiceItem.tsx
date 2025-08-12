import { CircleChevronRight, Users, Map, Star, Plane } from 'lucide-react'
import React from 'react'

const ServiceItem = ({service}: any) => {
  const Icon = service.icon 
  return (
    <div className='flex flex-row gap-4 px-4 py-1'>
      <Icon size={32} className='text-tertiary' /> <span className='text-xl font-light text-slate-800'>{ service.title }</span>
    </div>
  )
}

export default ServiceItem