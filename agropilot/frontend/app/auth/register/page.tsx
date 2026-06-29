"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
  language: z.enum(["en","ur","pn"]).default("en"),
});
type F = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<F>({ resolver: zodResolver(schema) });
  const router = useRouter();
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit(async v => {
          try { await api.post("/auth/register", v); toast.success("Account created"); router.push("/auth/login"); }
          catch (e:any) { toast.error(e?.response?.data?.detail || "Registration failed"); }})}
        className="w-full max-w-sm space-y-4 border p-6 rounded">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <input className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Name" {...register("name")} />
        <input className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Email" {...register("email")} />
        <input className="w-full border rounded px-3 py-2 bg-transparent" type="password" placeholder="Password (≥8 chars)" {...register("password")} />
        <select className="w-full border rounded px-3 py-2 bg-transparent" {...register("language")}>
          <option value="en">English</option><option value="ur">اردو</option><option value="pn">ਪੰਜਾਬੀ</option>
        </select>
        <button disabled={isSubmitting} className="w-full py-2 rounded bg-agro-600 text-white">Create account</button>
      </form>
    </main>
  );
}
