import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, MapPin, User, Settings, ArrowRight, Clock, MapPinCheck, AlertCircle } from "lucide-react"
import LocalizedRecentEmpty from "./LocalizedRecentEmpty"

export const runtime = "nodejs"

export default async function DashboardHome() {
  const session = await auth()

  console.log('[Dashboard] Session:', {
    exists: !!session,
    user: session?.user ? { email: session.user.email, role: (session.user as any).role } : null
  })

  // Redirect unauthenticated users to sign-in
  if (!session?.user) {
    console.log('[Dashboard] No session found, redirecting to sign-in')
    redirect("/sign-in?callbackUrl=/dashboard")
  }

  const quickActions = [
    {
      icon: BookOpen,
      title: "New Booking",
      description: "Book a new transfer",
      href: "/booking",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MapPin,
      title: "My Bookings",
      description: "View your transfers",
      href: "/dashboard/bookings",
      color: "from-green-500 to-green-600",
    },
    {
      icon: User,
      title: "Profile",
      description: "Edit your info",
      href: "/dashboard/profile",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage preferences",
      href: "/dashboard/settings",
      color: "from-slate-500 to-slate-600",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 sm:px-8 sm:py-10 shadow-lg">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0]}! 👋
          </h2>
          <p className="text-blue-100 text-lg">
            Manage your transfers and bookings with ease
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-blue-500 opacity-10 rounded-full"></div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <div className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Your Journey</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Bookings</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">0</p>
              </div>
              <BookOpen className="h-12 w-12 text-emerald-300" />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Distance</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">0 km</p>
              </div>
              <MapPinCheck className="h-12 w-12 text-blue-300" />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Spent</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">฿0</p>
              </div>
              <Clock className="h-12 w-12 text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900">Recent Bookings</h3>
          <Link href="/dashboard/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {/* Empty State */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 p-3 bg-slate-200 rounded-full">
              <AlertCircle className="h-6 w-6 text-slate-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">No bookings yet</h4>
            <p className="text-slate-600 mb-4">Start your journey with Samui Transfers today</p>
            <Link href="/booking" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <BookOpen className="h-4 w-4" />
              Book Your First Transfer
            </Link>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Need Help?</h4>
        <p className="text-blue-800 mb-4">
          Have questions about our services or need assistance? Contact our support team or check out our FAQ section.
        </p>
        <div className="flex gap-3">
          <Link href="/faqs" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View FAQs
          </Link>
          <Link href="/contact" className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
