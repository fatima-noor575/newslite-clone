"use client";
import { useState } from "react"; import { api } from "@/lib/api"; import { toast } from "sonner";
export default function Forgot() {
  const [email, setEmail] = useState("");
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={async e=>{e.preventDefault(); await api.post("/auth/forgot-password",{email}); toast.success("If the email exists, a reset link was sent.");}}
        className="w-full max-w-sm space-y-4 border p-6 rounded">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <input className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="w-full py-2 rounded bg-agro-600 text-white">Send link</button>
      </form>
    </main>
  );
}
