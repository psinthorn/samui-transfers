import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminClient from "./AdminClient"

export const runtime = "nodejs"

export default async function AdminHome() {
  const session = await auth()
  const user = session?.user as any

  if (!user) {
    redirect("/sign-in?callbackUrl=/admin")
  }
  if (user.role !== "ADMIN") {
    redirect("/Denied")
  }
  
  return (
    <div className="w-full space-y-8 md:space-y-10">
      {/* Welcome Section */}
      <AdminClient email={user?.email} role={(user as any).role} />
      
      {/* Navigation Cards Grid */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Bookings Card */}
          <Link href="/admin/bookings">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                📅
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                Manage Bookings
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                View, confirm, and manage all customer bookings and reservations
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>

          {/* Users Card */}
          <Link href="/admin/users">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                👥
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                Users
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage user accounts, permissions, and customer profiles
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>

          {/* Vehicles & Rates Card */}
          <Link href="/admin/bookings">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                🚗
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                Vehicles & Rates
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage fleet, configure pricing, and set service routes
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>

          {/* AI Agent Context Card */}
          <Link href="/admin/agent-context">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                🤖
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                AI Agent Context
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Configure AI assistant knowledge base and conversation context
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>

          {/* Content & Pages Card */}
          <Link href="/admin/documentation">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                📄
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                Content & Pages
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Edit website content, FAQs, and informational pages
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>

          {/* Documentation Card */}
          <Link href="/admin/documentation">
            <div className="group relative h-full min-h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300">
              {/* Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005B9A] to-[#003d6b] rounded-t-2xl" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                📚
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#005B9A] transition-colors">
                Documentation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access project documentation, guides, and technical references
              </p>
              
              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-[#005B9A] transition-colors">
                →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
