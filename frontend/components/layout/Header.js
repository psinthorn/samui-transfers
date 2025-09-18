"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { pick } from "@/data/i18n/core";
import { navText } from "@/data/content/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import StRec from "@/public/ci/restlogopngv1/ST_Branding_V1-07.png";

const MENU = {
  en: [
    { id: 1, title: "Home", link: "/" },
    { id: 2, title: "About Us", link: "/about-us" },
    { id: 3, title: "Why Choose Us", link: "/why-choose-us" },
    { id: 4, title: "FAQ(s)", link: "/faqs" },
    { id: 5, title: "Contact", link: "/contact" },
  ],
  th: [
    { id: 1, title: "หน้าแรก", link: "/" },
    { id: 2, title: "เกี่ยวกับเรา", link: "/about-us" },
    { id: 3, title: "ทำไมต้องเลือกเรา", link: "/why-choose-us" },
    { id: 4, title: "คำถามที่พบบ่อย", link: "/faqs" },
    { id: 5, title: "ติดต่อเรา", link: "/contact" },
  ],
};

const LABELS = {
  en: {
    aiChat: "AI Chat",
    brand: "Samui Transfers",
    langShort: { en: "EN", th: "TH" },
  },
  th: {
    aiChat: "แชท AI",
    brand: "สมุยทรานส์เฟอร์",
    langShort: { en: "EN", th: "TH" },
  },
};

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const { lang, toggle } = useLanguage();
  const labels = LABELS[lang];
  const MainMenu = MENU[lang];
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const email = session?.user?.email || "";
  const displayName = session?.user?.name || email;
  const photo = session?.user?.image || null;
  const initials = (displayName || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Public info from env
  const publicInfo = {
    whatsapp: (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, ""),
    aiChatUrl: process.env.NEXT_PUBLIC_AI_CHAT_URL || "/#chat",
  };
  const whatsappHref = `https://wa.me/${publicInfo.whatsapp}`;
  // const isExternal = (url) => /^https?:\/\//.test(url);

  // Reflect auth state to lightweight cookies readable by Edge middleware
  useEffect(() => {
    try {
      if (status === "authenticated") {
        document.cookie = `isAuthed=1; path=/; max-age=3600; samesite=lax`;
        if (role) {
          document.cookie = `role=${role}; path=/; max-age=3600; samesite=lax`;
        }
      } else {
        // expire cookies quickly when logged out
        document.cookie = `isAuthed=; path=/; max-age=0; samesite=lax`;
        document.cookie = `role=; path=/; max-age=0; samesite=lax`;
      }
    } catch {}
  }, [status, role]);

  return (
  <header className="sticky top-0 z-40 text-white bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="Samui Transfers — Home">
          <Image src={StRec} alt="Samui Transfers Logo" width={40} height={40} priority />
          <span className="hidden sm:inline text-sm font-semibold tracking-wide">{labels.brand}</span>
        </Link>

        {/* Desktop nav (short, centered set) */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {MainMenu.filter((m) => ["/", "/why-choose-us", "/faqs", "/contact"].includes(m.link)).map((item) => (
            <Link
              key={item.id}
              href={item.link}
              aria-current={isActive(item.link) ? "page" : undefined}
              className={`relative text-sm text-white/85 hover:text-white transition-colors ${
                isActive(item.link) ? "after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-white" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Actions (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggle}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs bg-white/10 hover:bg-white/15"
            aria-label="Toggle language"
          >
            {labels.langShort.en}/{labels.langShort.th}
          </button>

          {/* WhatsApp compact */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600"
          >
            <FaWhatsapp className="h-4 w-4" />
          </a>

          {/* Book now (primary) */}
          <Link
            href="/booking"
            aria-label="Book now"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/95"
          >
            {pick(lang, navText.bookNow)}
          </Link>

          {/* User menu */}
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {photo ? (
                  <Image src={photo} alt={displayName || "User"} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-xs font-semibold">
                    {initials}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-slate-500">{pick(lang, navText.signedInAs)}</DropdownMenuLabel>
                <div className="px-3 py-1 text-sm text-slate-700 truncate">{displayName}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{pick(lang, navText.dashboard)}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">{pick(lang, navText.profile)}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">{pick(lang, navText.settings)}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{pick(lang, navText.admin)}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left">
                    {pick(lang, navText.signOut)}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/sign-in"
              className={`text-sm text-white/85 hover:text-white px-2 ${isActive("/sign-in") ? "font-semibold" : ""}`}
            >
              {pick(lang, navText.signIn)}
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Open menu" className="rounded p-2 hover:bg-white/10">
              <Menu size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{pick(lang, navText.menu)}</DropdownMenuLabel>
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
              {/* Signed-in details */}
              {isAuthed && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-slate-500">{pick(lang, navText.signedInAs)}</DropdownMenuLabel>
                  <div className="px-3 py-1 text-sm text-slate-700 truncate">{displayName}</div>
                </>
              )}
              {/* Auth-aware mobile items */}
              {isAuthed ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className={`w-full ${isActive("/dashboard") ? "font-semibold text-primary" : ""}`}>
                      {pick(lang, navText.dashboard)}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className={`w-full ${isActive("/dashboard/profile") ? "font-semibold text-primary" : ""}`}>
                      {pick(lang, navText.profile)}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className={`w-full ${isActive("/dashboard/settings") ? "font-semibold text-primary" : ""}`}>
                      {pick(lang, navText.settings)}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className={`w-full ${isActive("/admin") ? "font-semibold text-primary" : ""}`}>
                        {pick(lang, navText.admin)}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left">
                      {pick(lang, navText.signOut)}
                    </button>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in" className={`w-full ${isActive("/sign-in") ? "font-semibold text-primary" : ""}`}>
                      {pick(lang, navText.signIn)}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 flex flex-col gap-2">
                <Link
                  href="/booking"
                  aria-label="Book now"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  {pick(lang, navText.bookNow)}
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  {pick(lang, navText.whatsApp)}
                </a>
                <button
                  onClick={toggle}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-white/90"
                >
                  {labels.langShort.en}/{labels.langShort.th}
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-px w-full bg-white/10" />
    </header>
  );
}