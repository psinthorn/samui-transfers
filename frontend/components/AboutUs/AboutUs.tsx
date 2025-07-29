import React from 'react'

const AboutUs = () => {
  const AboutUs = [
    {
      id: 1,
      title: 'Welcome to Samui Transfers',
      description: `Welcome to Samui-Transfers.com, your trusted local transfer service based right here on the beautiful island of Koh Samui, Thailand. As a locally owned and operated company, we specialize in providing safe, reliable, and comfortable transportation for travelers, families, and groups across the island. Whether you're arriving at the airport, heading to your resort, or exploring the island’s stunning beaches and attractions, our fleet of well-maintained minivans and SUVs is ready to get you there on time—with a smile.
At Samui Transfers, we pride ourselves on local knowledge, personalized service, and a deep commitment to making your travel experience smooth and stress-free. Our professional drivers are friendly, punctual, and familiar with every corner of the island, ensuring a seamless journey from pickup to drop-off.
Let us take the wheel while you sit back, relax, and enjoy the ride on paradise island.`,
      shortDescription: 'Samui-Transfers.com – Local, Reliable, Island-Ready.',
    },
    {
      id: 2,
      title: 'Our Mission',
      description: 'At Samui Transfers, our mission is to make your journey as smooth and stress-free as possible. We understand that travel can be hectic, which is why we offer reliable and efficient transfer services tailored to your needs. Our team of experienced drivers is committed to ensuring your safety and comfort while you explore the breathtaking beauty of Koh Samui.',
      
    }
  ]
  return (
    <div className='p-4 bg-slate-50 sm:p-2 md:16 lg:p-16'>
      
      <div className="grid grid-cols-1 w-full sm:grid-cols-1 sm:p-4  md:grid-cols-2 md:p-8 lg:grid-cols-2 lg:p-8  gap-10">
          {/* <div>
            Image here
          </div> */}
          <div className='m-auto'>
            <h1 className='text-7xl text-center text-primary font-light'>
              About Us
            </h1>
              <span className='text-sm text-center text-muted-foreground'>{AboutUs[0].shortDescription}</span>
            
          </div>
          <div>
            <div className="py-4">
              <h2 className='text-3xl text-primary p-1'>{AboutUs[0].title}</h2>
              <p className='text-lg text-muted-foreground p-1'>{AboutUs[0].description}</p>
            </div>
            <div className="py-4">
              <h2 className='text-3xl text-primary p-1'>{AboutUs[1].title}</h2>
              <p className='text-lg text-muted-foreground p-1'>{AboutUs[1].description}</p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AboutUs