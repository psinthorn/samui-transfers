import Link from "next/link";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from 'next/image';
import StLogoLong from '@/public/ci/ST_Branding_V1-03.png' // Assuming you have a logo image

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-primary mt-32 dark:bg-primary pt-4 w-full">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-1 lg:py-4">
            <div className=" md:flex md:justify-between">
            <div className="hidden lg:block  md:mb-0 justify-center text-center  items-center mt-10">
                <Link href="/" className="flex justify-center text-center  items-center">
                    <Image src={StLogoLong} alt="Samui Transfers Logo" width={254} />
                    {/* <span className="self-center text-2xl  whitespace-nowrap text-white font-bold dark:text-white">SMTS</span> */}
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
                        {/* <li>
                            <Link href="https://discord.gg/4eeurUVvTy" className="hover:underline">Line Official</Link>
                        </li> */}
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
            <span className="text-sm text-white sm:text-center dark:text-gray-400">© 2023 <Link href="https://www.samui-transfers.com" className="hover:underline">samui-transfers.com™</Link>. All Rights Reserved.
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
        </div>
    </footer>
  );
}