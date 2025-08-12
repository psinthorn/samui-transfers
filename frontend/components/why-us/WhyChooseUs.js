import React from 'react'
import WhyChooseUsItem from '@/components/why-us/WhyChooseUsItem'
import { Car, Clock, DollarSign, ShieldCheck, Smile } from 'lucide-react';

const WhyChooseUs = () => {
  const items = [
    {
      id: 1,
      title: 'Ready',
      description: 'We’re always prepared for your trip.',
      icon: <Clock/>,
    },
    {
      id: 2,
      title: 'Safety',
      description: 'Professional drivers and safe vehicles.',
      icon: <ShieldCheck className='w-full' />,
    },
    {
      id: 3,
      title: 'Fair Pricing',
      description: 'Pay only for the distance you travel.',
      icon: <DollarSign />,
    },
    
    {
      id: 4,
      title: 'Fast & Smooth',
      description: 'Quick, door-to-door service.',
      icon: <Smile/>,
    },
    // {
    //   id: 5,
    //   title: 'Group & VIP Transfers',
    //   description: 'Options for families, business travelers, and luxury services.',
    //   },
      
  ];

  return (
  //   <div className='my-2 relative w-7xl'>
  //   <h1 className='text-center text-7xl md:text-7xl text-primary'>Why Choose Us</h1>
  //   <p className='text-center font-light mt-1 md:text-lg text-sm mb-8 text-slate-600'>
  //     At Samui Transfers, we are dedicated to making your journey as smooth and enjoyable as possible. 
  //     Our team is always ready to serve you, ensuring that your transfer is on time and stress-free. 
  //     Safety is our top priority, with professional drivers and well-maintained vehicles for your peace of mind. 
  //     We believe in fair pricing, so you only pay for the distance you travel—no hidden fees or surprises. 
  //     With our swift and simple booking process, you can count on quick, door-to-door service that fits your schedule. 
  //     Choose us for a reliable, safe, and affordable transfer experience in Koh Samui.
  //   </p>
  //   <div className="grid grid-cols-1 w-full sm:grid-cols-2 sm:p-8 sm:bg-none  md:grid-cols-2 md:p-16 lg:grid-cols-4 lg:py-24  gap-8">
  //     {items.map((item) => (
  //       <div key={item.id}>
  //         <WhyChooseUsItem title={item.title} description={item.description} icon={item.icon} />
  //       </div>
  //     ))}
  //   </div>
  // </div>
    <div className='my-2 relative'>
      <h1 className='text-center text-7xl md:text-7xl text-primary'>Why Choose Us</h1>
      <p className='text-center  font-light mt-1 md:text-lg text-sm mb-8 text-slate-600'>We are committed to </p>
      <div className="grid grid-cols-1 w-full sm:grid-cols-2 sm:p-8 sm:bg-none  md:grid-cols-2 md:p-16 lg:grid-cols-2 lg:py-24  gap-8">
      
          {items.map((item) => (
            <div key={item.id}>
              <WhyChooseUsItem title={item.title} description={item.description} icon={item.icon} />
            </div>
            )
          )}
        </div>
    </div>
  )
}
export default WhyChooseUs