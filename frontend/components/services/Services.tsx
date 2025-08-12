import React from 'react'
import ServiceItem from './ServiceItem'
import { Label } from '../ui/label';

const Services = () => {
  const services = [
    
    {
      id: 1,
      title: 'Private Airport Transfers',
      description: 'We provide private airport transfers to and from the airport. Our drivers are professional and will make sure you get to your destination on time.',
      icon: 'PlaneDeparture' // Assuming you have an icon component for this
    },
    {
      id: 2,
      title: 'Group & Family Transport',
      description: 'We provide group and family transport services. Our drivers are professional and will make sure you get to your destination on time.',
      icon: 'Users' // Assuming you have an icon component for this
    },
    {
      id: 3,
      title: 'Around The Island',
      description: 'We provide VIP and luxury car services. Our drivers are professional and will make sure you get to your destination on time.',
      icon: 'Map'
    },
    {
      id: 4,
      title: 'Custom Transport Solutions for Events & Tours',
      description: 'We provide custom transport solutions for events and tours. Our drivers are professional and will make sure you get to your destination on time.',
      icon: 'Star'
    },
];

  return (
    <div className='rounded-t-none p-2'>
    <Label className='font-bold text-2xl text-primary'>Our Services</Label>
      <div className='bg-gray-100 p-2 mt-0 border-none rounded-xl'>
        {services.map((service) => (
          <ServiceItem key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}

export default Services