import Image from 'next/image'
import React from 'react'
import Banner from '../../public/samui-transfers-001.jpeg'

const MainBanner = () => {
  return (
    // use max-h-96 if need the search box show in the middle of the banner
    <div className='space-y-4 p-4 hidden lg:block md:w-full md:h-[95%] md:p-6'>
      <Image src={Banner} alt='samui transfers main banner' />
    </div>
  )
}

export default MainBanner