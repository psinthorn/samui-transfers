import React from 'react'

const AboutUs: React.FC = () => {
  const aboutItems = [
    {
      id: 1,
      title: 'Welcome to Samui Transfers',
      description: `Welcome to Samui-Transfers.com, your trusted local transfer service based right here on the beautiful island of Koh Samui, Thailand. As a locally owned and operated company, we specialize in providing safe, reliable, and comfortable transportation for travelers, families, and groups across the island.

Whether you're arriving at the airport, heading to your resort, or exploring the island’s stunning beaches and attractions, our fleet of well-maintained minivans and SUVs is ready to get you there on time—with a smile.

At Samui Transfers, we pride ourselves on local knowledge, personalized service, and a deep commitment to making your travel experience smooth and stress-free. Our professional drivers are friendly, punctual, and familiar with every corner of the island, ensuring a seamless journey from pickup to drop-off.

Let us take the wheel while you sit back, relax, and enjoy the ride on paradise island.`,
      short: 'Samui-Transfers.com – Local, Reliable, Island-Ready.',
    },
    {
      id: 2,
      title: 'Our Mission',
      description:
        'At Samui Transfers, our mission is to make your journey as smooth and stress-free as possible. We offer reliable transfer services tailored to your needs, with experienced drivers focused on safety and comfort while you explore Koh Samui.',
    },
  ];

  return (
    <section className="bg-slate-50 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <header className="m-auto text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary font-light">About Us</h1>
          <p className="text-sm text-muted-foreground">{aboutItems[0].short}</p>
        </header>

        <div>
          <article className="py-4">
            <h2 className="text-2xl sm:text-3xl text-primary mb-2">{aboutItems[0].title}</h2>
            <p className="text-base sm:text-lg text-muted-foreground whitespace-pre-line">
              {aboutItems[0].description}
            </p>
          </article>

          <article className="py-4">
            <h2 className="text-2xl sm:text-3xl text-primary mb-2">{aboutItems[1].title}</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {aboutItems[1].description}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;