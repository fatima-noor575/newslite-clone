import Link from "next/link";
export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold text-agro-600">AgroPilot AI</h1>
      <p className="mt-4 max-w-2xl text-lg opacity-80">
        Your AI-powered digital farm manager. Disease detection, smart irrigation,
        weather intelligence, profit analytics and more — in English, Urdu, and Punjabi.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/auth/register" className="px-6 py-3 rounded bg-agro-600 text-white">Get started</Link>
        <Link href="/auth/login" className="px-6 py-3 rounded border">Sign in</Link>
      </div>
    </main>
  );
}
