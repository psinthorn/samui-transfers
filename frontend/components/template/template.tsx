import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#333] font-sans">
      <header className="bg-[#005B9A] text-white py-6 shadow">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Samui Transfers</h1>
          <nav className="space-x-4">
            <a href="#about" className="hover:underline">About</a>
            <a href="#services" className="hover:underline">Services</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <section className="bg-[#F4F4F4] py-20 text-center" id="hero">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#005B9A] mb-4">Reliable Transfers on Koh Samui</h2>
          <p className="text-lg text-[#333] mb-6">Local service. Friendly drivers. Comfortable rides.</p>
          <a href="#contact" className="bg-[#D94141] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-red-600 transition">Book Now</a>
        </div>
      </section>

      <section className="py-20 text-center" id="about">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-[#005B9A] mb-6">About Us</h3>
          <p className="text-lg max-w-2xl mx-auto">Samui-Transfers.com is a locally owned transfer service based on Koh Samui, offering safe and reliable rides with minivans and SUVs. Our drivers are experienced locals who know the island inside and out.</p>
        </div>
      </section>

      <section className="bg-[#F4F4F4] py-20 text-center" id="services">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-[#005B9A] mb-6">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold text-[#005B9A] mb-2">Airport Transfers</h4>
              <p>Door-to-door service from Samui Airport to your hotel or villa.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold text-[#005B9A] mb-2">Island Tours</h4>
              <p>Explore Koh Samui’s beaches, temples, and viewpoints with our custom tour service.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-xl font-semibold text-[#005B9A] mb-2">Private Chauffeur</h4>
              <p>Flexible transportation with a dedicated driver for your day.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-center" id="contact">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-[#005B9A] mb-6">Contact Us</h3>
          <p className="mb-4">Ready to book your ride? Reach out now via phone, email, or online form.</p>
          <a href="mailto:info@samui-transfers.com" className="bg-[#3AA76D] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-green-700 transition">Email Us</a>
        </div>
      </section>

      <footer className="bg-[#005B9A] text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Samui Transfers. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
