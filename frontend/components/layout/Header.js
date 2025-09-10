"use client";
<<<<<<< HEAD
=======

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Phone, Facebook, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
>>>>>>> main
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StRec from "@/public/ci/restlogopngv1/ST_Branding_V1-07.png";

<<<<<<< HEAD
import { Facebook, Menu, Phone, LogIn, LogOut, Shield } from 'lucide-react'
import { Badge } from '../ui/badge'
import Link from 'next/link'
// import Image from 'next/image'
import { FaWhatsapp } from 'react-icons/fa'
import { useRole } from '@/components/utilities/useRole'
import { signIn, signOut } from 'next-auth/react'
=======
const MainMenu = [
  { id: 1, title: "Home", link: "/" },
  { id: 2, title: "About Us", link: "/about-us" },
  { id: 3, title: "Why Choose Us", link: "/why-choose-us" },
  { id: 4, title: "FAQ(s)", link: "/faqs" },
  { id: 5, title: "Contact", link: "/contact" },
];
>>>>>>> main

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Public info from env
  const publicInfo = {
    whatsapp: (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, ""),
    aiChatUrl: process.env.NEXT_PUBLIC_AI_CHAT_URL || "/#chat",
  };
  const whatsappHref = `https://wa.me/${publicInfo.whatsapp}`;
  const isExternal = (url) => /^https?:\/\//.test(url);

<<<<<<< HEAD

const Header = () => {
  const { role, status, session } = useRole()
  const MainMenu = [
    // {
    //   id: 1,
    //   title: 'Home',
    //   link: '/',
    // },
    {
      id: 2,
      title: 'About Us',
      link: '/about-us',
    },
    {
      id: 3,
      title: 'Why Choose Us',
      link: '/why-choose-us',
    },
    {
      id: 4,
      title: 'FAQ(s)',
      link: '/faqs',
    },
    {
      id: 5,
      title: 'Contact',
      link: '/contact',
    }
  ]
=======
>>>>>>> main
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="Samui Transfers — Home">
          <Image src={StRec} alt="Samui Transfers Logo" width={40} height={40} priority />
          <span className="hidden sm:inline text-sm font-semibold tracking-wide">Samui Transfers</span>
        </Link>

<<<<<<< HEAD
        {/* desktop navbar  */}
        <div className='hidden md:flex md:gap-8 md:items-center'>
            {/* <p className='text-3xl font-bold text-orange-500'> */}
              <Link href="/">
                {/* <Image src={RosLogo} alt='Ros Logo' width={100}/> */}
                <strong className='text-2xl text-white font-bold'>SMTS</strong>
              </Link>
            {/* </p> */}
            {MainMenu.map((item) => (
              <div key={item.id} className='flex gap-4 items-center text-md text-white'>
              <Link href={item.link} >{item.title}</Link>
            </div>
            ))
          }
          {role === 'ADMIN' && (
            <div className='flex gap-4 items-center text-md text-white'>
              <Link href='/Admin'>Admin</Link>
            </div>
          )}
        </div>    
          
        {/* mobile navbar */}
        <div className='flex md:hidden gap-5'>
            {/* <p className='text-3xl font-bold text-orange-500'>
              <a href="/">rRSs</a>
            </p> */}
            
            <DropdownMenu className="">
              <DropdownMenuTrigger><Menu size='32' color='#fff' /></DropdownMenuTrigger>
              <DropdownMenuContent className='w-300'>
                <DropdownMenuLabel>
                  <Link href="/" >Home</Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MainMenu.map((item) => (
                  <DropdownMenuItem key={item.id}>
                    <Link href={item.link} >{item.title}</Link>
                  </DropdownMenuItem>
                ))
                } 
              </DropdownMenuContent>
            </DropdownMenu>
=======
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {MainMenu.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              aria-current={isActive(item.link) ? "page" : undefined}
              className={`text-sm transition-colors ${
                isActive(item.link) ? "font-semibold text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
>>>>>>> main

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Book now (primary) */}
          <Link
            href="/"
            aria-label="Book now"
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-white/90"
          >
            Book now
          </Link>

          {/* AI Chat (links to in-app page) */}
          {/* <Link
            href="/aichat"
            aria-label="AI Chat"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          >
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </Link> */}

          {/* WhatsApp */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <FaWhatsapp className="h-4 w-4" />
            WhatsApp
          </a>

          {/* Facebook */}
          <Link
            href="https://www.facebook.com/profile.php?id=61578880422159"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex items-center rounded-md p-2 hover:bg-white/10"
          >
            <Facebook className="h-5 w-5" />
          </Link>
        </div>

<<<<<<< HEAD
        <div className='hidden lg:flex items-center gap-3'>
          <div className='flex gap-0 text-slate-700 items-center'>
            <Phone size='20' color='#fff' className='gap-0'/><span className='text-xs pr-2 text-white'>(+66)99-108-7999 </span>
            <FaWhatsapp size='20' color='#fff' className='gap-0'/><span className='text-xs pr-2 text-white'>(+66)99-108-7999</span>
            <Link href="https://www.facebook.com/profile.php?id=61578880422159" target='_blank' className='gap-0 pr-2 text-white'>
              <Facebook size='20' color='#fff' />
            </Link>
          </div>
          {status === 'loading' && <span className='text-white text-xs'>...</span>}
          {status !== 'loading' && !session && (
            <button onClick={() => signIn(undefined, { callbackUrl: '/' })} className='flex items-center gap-1 text-xs text-white border border-white/30 hover:bg-white/10 px-2 py-1 rounded'>
              <LogIn size={14}/> Sign In
            </button>
          )}
          {session && (
            <>
              {role === 'ADMIN' && <Shield size={16} className='text-white' />}
              <span className='text-white text-xs'>{session.user?.email}</span>
              <button onClick={() => signOut({ callbackUrl: '/' })} className='flex items-center gap-1 text-xs text-white border border-white/30 hover:bg-white/10 px-2 py-1 rounded'>
                <LogOut size={14}/> Sign Out
              </button>
            </>
          )}
        </div>            
    </div>
  )
}
=======
        {/* Mobile menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Open menu" className="rounded p-2 hover:bg-white/10">
              <Menu size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MainMenu.map((item) => (
                <DropdownMenuItem key={item.id} asChild>
                  <Link
                    href={item.link}
                    className={`w-full ${isActive(item.link) ? "font-semibold text-primary" : ""}`}
                  >
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 flex flex-col gap-2">
                <Link
                  href="/booking"
                  aria-label="Book now"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Book now
                </Link>
>>>>>>> main

                {/* <Link
                  href="/aichat"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-white/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Chat
                </Link> */}

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>

                {/* Removed Call us on mobile */}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}