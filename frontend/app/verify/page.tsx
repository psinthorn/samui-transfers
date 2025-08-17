export default function VerifyPage() {
  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-gray-600 max-w-md">If the address exists we'll send a magic link to sign you in. You can close this tab.</p>
      <a href="/" className="text-primary underline text-sm">Return home</a>
    </main>
  )
}
