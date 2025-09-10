import { auth, signOut } from '@/components/utilities/auth'

export default async function AdminPage() {
  const session = await auth()
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(session, null, 2)}</pre>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
        <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Sign out</button>
      </form>
    </main>
  )
}
