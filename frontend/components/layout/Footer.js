import Link from "next/link";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from 'next/image';
import StLogoLong from '@/public/ci/ST_Branding_V1-03.png' // Assuming you have a logo image

export default function Footer() {
  const year = new Date().getFullYear();

  // Public company info (use NEXT_PUBLIC_ so it's available client-side)
  const managed = {
    name: process.env.MANAGED_BY_NAME || "Samui Transfers Management",
    website: process.env.MANAGED_BY_WEBSITE || "https://www.f2.co.th",
    email: process.env.MANAGED_BY_EMAIL || "info@f2.co.th",
    phone: process.env.MANAGED_BY_PHONE || "+66 64 027 0528",
    reg: process.env.MANAGED_BY_TAX_ID || "",
  };

  const dev = {
    name: process.env.MANAGED_BY_NAME || "Samui Transfers Management",
    website: process.env.MANAGED_BY_WEBSITE || "https://www.f2.co.th",
    email: process.env.MANAGED_BY_EMAIL || "info@f2.co.th",
    phone: process.env.MANAGED_BY_PHONE || "+66 64 027 0528",
    reg: process.env.MANAGED_BY_TAX_ID || "",
  };

  return (
    <footer className="relative bg-primary dark:bg-primary pt-32 w-full">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-1 lg:py-4">
        <div className=" md:flex md:justify-between">
          <div className="hidden lg:block  md:mb-0 justify-center text-center  items-center mt-10">
            <Link href="/" className="flex justify-center text-center  items-center">
              <Image src={StLogoLong} alt="Samui Transfers Logo" width={254} />
            </Link>
            <p className='text-white hover:text-gray-200 dark:hover:text-gray-200 text-sm'>A Local Transfer Service</p>
            <p className='text-white hover:text-gray-200 dark:hover:text-gray-200 text-sm'>Koh Samui, Thailand</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-4">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-primary uppercase dark:text-white">Resources</h2>
              <ul className="text-white dark:text-gray-400 font-medium gap-4">
                <li className="mb-4">
                  <Link href="/about-us" className="hover:underline">About Us</Link>
                </li>
                <li className="mb-4">
                  <Link href="/why-choose-us" className="hover:underline">Why Choose Us</Link>
                </li>
                <li className="mb-4">
                  <Link href="/faqs" className="hover:underline">{`Faq(s)`}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/contact" className="hover:underline">Contact Us</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-primary uppercase dark:text-white">Follow us</h2>
              <ul className="text-white dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="https://www.facebook.com/profile.php?id=61578880422159" className="hover:underline ">Facebook</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-primary uppercase dark:text-white">Legal</h2>
              <ul className="text-white dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/" className="hover:underline">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/" className="hover:underline">Terms &amp; Conditions</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-white sm:text-center dark:text-gray-400">
            © {year} <Link href="https://www.samui-transfers.com" className="hover:underline">samui-transfers.com™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <Link href="https://www.facebook.com/profile.php?id=61578880422159" className="text-white hover:text-gray-900 dark:hover:text-white" target='_blank'>
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd"/>
              </svg>
              <span className="sr-only">Facebook page</span>
            </Link>
          </div>
        </div>

        {/* Managed by / Developed by */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
          <p>
            Managed by{" "}
            {managed.website ? (
              <Link href={managed.website} target="_blank" className="underline underline-offset-2 hover:text-white">
                {managed.name}
              </Link>
            ) : (
              managed.name
            )}
            {managed.reg ? <span className="ml-1">• TAX ID: {managed.reg}</span> : null}
            {managed.phone ? <span className="ml-1">• Tel: {managed.phone}</span> : null}
            {managed.email ? (
              <>
                {" "}&bull;{" "}
                <Link href={`mailto:${managed.email}`} className="underline underline-offset-2 hover:text-white">
                  {managed.email}
                </Link>
              </>
            ) : null}
          </p>

          <p className="sm:text-right">
            Developed by{" "}
            {dev.website ? (
              <Link href={dev.website} target="_blank" className="underline underline-offset-2 hover:text-white">
                {dev.name}
              </Link>
            ) : (
              dev.name
            )}
            {dev.email ? (
              <>
                {" "}&bull;{" "}
                <Link href={`mailto:${dev.email}`} className="underline underline-offset-2 hover:text-white">
                  {dev.email}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}