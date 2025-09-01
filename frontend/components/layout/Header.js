"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Phone, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StRec from "@/public/ci/restlogopngv1/ST_Branding_V1-07.png";

const MainMenu = [
  { id: 1, title: "Home", link: "/" },
  { id: 2, title: "About Us", link: "/about-us" },
  { id: 3, title: "Why Choose Us", link: "/why-choose-us" },
  { id: 4, title: "FAQ(s)", link: "/faqs" },
  { id: 5, title: "Contact", link: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="Samui Transfers — Home">
          <Image src={StRec} alt="Samui Transfers Logo" width={40} height={40} priority />
          <span className="hidden sm:inline text-sm font-semibold tracking-wide">Samui Transfers</span>
        </Link>

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

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="https://wa.me/66991087999"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <FaWhatsapp className="h-4 w-4" />
            WhatsApp
          </Link>
          {/* <a
            href="tel:+66991087999"
            aria-label="Call us"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <Phone className="h-4 w-4" />
            (+66) 99-108-7999
          </a> */}
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
                  href="https://wa.me/66991087999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </Link>
                <a
                  href="tel:+66991087999"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-black/5 px-3 py-2 text-sm text-slate-800 hover:bg-black/10"
                >
                  <Phone className="h-4 w-4" />
                  Call us
                </a>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}