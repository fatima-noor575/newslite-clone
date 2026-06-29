"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type F = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });
  const router = useRouter();
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit(async v => {
          try { await api.post("/auth/login", v); router.push("/dashboard"); }
          catch (e: any) { toast.error(e?.response?.data?.detail || "Login failed"); }})}
        className="w-full max-w-sm space-y-4 border p-6 rounded">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <div><input className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div>
        <div><input className="w-full border rounded px-3 py-2 bg-transparent" type="password" placeholder="Password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div>
        <button disabled={isSubmitting} className="w-full py-2 rounded bg-agro-600 text-white">Sign in</button>
      </form>
    </main>
  );
}
