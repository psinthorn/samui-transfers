"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

/**
 * SessionClientProvider
 * Mirrors session state into short-lived, same-site cookies so Edge middleware
 * can make quick auth/role decisions without importing server auth.
 * - isAuthed: "1" when authenticated, removed otherwise
 * - role: "USER" | "ADMIN" when available, removed on logout/unknown
 */
export default function SessionClientProvider() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (status === "loading") return

		// If user is signed in
		if (status === "authenticated" && session?.user) {
			// Define pages that don't need redirect
			const publicPages = [
				"/sign-in",
				"/sign-up",
				"/forgot-password",
				"/reset-password",
				"/verify-email",
			]

			// If on a public page, redirect based on role
			if (typeof pathname === "string" && publicPages.includes(pathname)) {
				const userRole = (session.user as any).role || "USER"

				if (userRole === "ADMIN") {
					router.push("/admin")
				} else {
					router.push("/dashboard")
				}
			}
		}
	}, [session, status, pathname, router])

	return null
}

