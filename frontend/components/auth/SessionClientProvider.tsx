"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

/**
 * SessionClientProvider
 * Mirrors session state into short-lived, same-site cookies so Edge middleware
 * can make quick auth/role decisions without importing server auth.
 * - isAuthed: "1" when authenticated, removed otherwise
 * - role: "USER" | "ADMIN" when available, removed on logout/unknown
 */
export default function SessionClientProvider() {
	const { status, data } = useSession()
	const role = (data?.user as any)?.role as "USER" | "ADMIN" | undefined

	useEffect(() => {
		try {
			if (status === "authenticated") {
				document.cookie = `isAuthed=1; path=/; max-age=3600; samesite=lax`
				if (role) {
					document.cookie = `role=${role}; path=/; max-age=3600; samesite=lax`
				}
			} else {
				// expire cookies when not authenticated
				document.cookie = `isAuthed=; path=/; max-age=0; samesite=lax`
				document.cookie = `role=; path=/; max-age=0; samesite=lax`
			}
		} catch {
			// no-op in non-browser or restricted contexts
		}
	}, [status, role])

	return null
}

