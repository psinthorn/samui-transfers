'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Localized } from '@/data/i18n/core';
import {
  Car,
  Waves,
  MapPin,
  Gift,
  Calendar,
} from 'lucide-react';

interface Service {
  id: string;
  name: Localized<string>;
  description: Localized<string>;
  icon: React.ReactNode;
  color: string;
  href: string; // Link to service-specific booking
  count?: number; // Available offerings count
}

interface ServicesSectionProps {
  lang: 'en' | 'th';
  onServiceSelect?: (serviceType: string) => void;
}

const services: Service[] = [
  {
    id: 'TRANSFER',
    name: {
      en: 'Airport Transfers',
      th: 'รับส่งสนามบิน',
    },
    description: {
      en: 'Reliable airport pickup and drop-off services with professional drivers',
      th: 'บริการรับส่งสนามบินที่เชื่อถือได้กับคนขับมืออาชีพ',
    },
    icon: <Car className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-600',
    href: '/book?service=TRANSFER',
  },
  {
    id: 'BOAT',
    name: {
      en: 'Speedboat Tours',
      th: 'ทัวร์เรือเร็ว',
    },
    description: {
      en: 'Explore stunning islands and beaches on our fast speedboat service',
      th: 'สำรวจเกาะและหาดทรายสวยงามด้วยเรือเร็ว',
    },
    icon: <Waves className="w-8 h-8" />,
    color: 'from-cyan-500 to-cyan-600',
    href: '/book?service=BOAT',
  },
  {
    id: 'TOUR',
    name: {
      en: 'Guided Tours',
      th: 'ทัวร์ท่องเที่ยว',
    },
    description: {
      en: 'Discover Koh Samui\'s top attractions with our experienced tour guides',
      th: 'ค้นพบสถานที่ท่องเที่ยวชั้นนำของสมุยกับไกด์ท่องเที่ยวของเรา',
    },
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-emerald-500 to-emerald-600',
    href: '/tour-locations',
  },
  {
    id: 'EVENT',
    name: {
      en: 'Event Services',
      th: 'บริการอีเวนต์',
    },
    description: {
      en: 'Transportation and coordination for your special events and celebrations',
      th: 'บริการขนส่งและประสานงานสำหรับงานพิเศษและการเฉลิมฉลอง',
    },
    icon: <Calendar className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-600',
    href: '/book?service=EVENT',
  },
  {
    id: 'PACKAGE',
    name: {
      en: 'Package Deals',
      th: 'แพ็คเกจสุดพิเศษ',
    },
    description: {
      en: 'Bundled services with discounts for multi-day trips and group bookings',
      th: 'บริการรวมพร้อมส่วนลดสำหรับการเดินทางหลายวันและจองกลุ่ม',
    },
    icon: <Gift className="w-8 h-8" />,
    color: 'from-rose-500 to-rose-600',
    href: '/book?service=PACKAGE',
  },
];

export function ServicesSection({
  lang,
  onServiceSelect,
}: ServicesSectionProps) {
  const pick = <T,>(obj: Localized<T>) => obj[lang];
  const router = useRouter();
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch available service counts from backend
  useEffect(() => {
    const fetchServiceCounts = async () => {
      try {
        const response = await fetch('/api/services/counts');
        if (response.ok) {
          const data = await response.json();
          setServiceCounts(data);
        }
      } catch (error) {
        console.error('Error fetching service counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceCounts();
  }, []);

  const handleServiceClick = (service: Service) => {
    onServiceSelect?.(service.id);
    router.push(service.href);
  };

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            {lang === 'en' ? 'Our Services' : 'บริการของเรา'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {lang === 'en'
              ? 'Choose the service that best fits your needs. From transfers to tours, we have you covered.'
              : 'เลือกบริการที่เหมาะกับความต้องการของคุณ ตั้งแต่การรับส่งไปถึงทัวร์ท่องเที่ยว'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="group cursor-pointer"
            >
              <div className="h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-primary">
                {/* Icon Section */}
                <div
                  className={`bg-gradient-to-br ${service.color} p-6 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300`}
                >
                  {service.icon}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {pick(service.name)}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 flex-grow">
                    {pick(service.description)}
                  </p>

                  {/* Service Count Badge */}
                  {!loading && serviceCounts[service.id] !== undefined && (
                    <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 w-fit">
                      {serviceCounts[service.id]} {lang === 'en' ? 'Available' : 'พร้อมใช้งาน'}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service);
                    }}
                    className="mt-auto w-full px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors duration-200"
                  >
                    {lang === 'en' ? 'Book Now' : 'จองเลย'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-6">
            {lang === 'en'
              ? 'Ready to get started? Choose a service above or contact our support team.'
              : 'พร้อมเริ่มต้นแล้วหรือ? เลือกบริการข้างต้นหรือติดต่อทีมสนับสนุนของเรา'}
          </p>
        </div>
      </div>
    </section>
  );
}
