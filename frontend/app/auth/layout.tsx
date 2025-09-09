import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starter - Next Auth v5 for your Next.js App",
  description: "An authentication solution for Next.js applications built with Next Auth v5 by F2 Labs.",
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center h-full  bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-700 to-gray-100 px-6">
      {children}
    </div>
  )
}

export default AuthLayout