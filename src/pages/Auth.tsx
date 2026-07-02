import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Leaf, ArrowLeft } from "lucide-react";

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    const { error } = mode === "in" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "up") toast.success("Check your email to confirm — or sign in.");
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-hero">
      {/* Left panel — brand */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <Link to="/" className="relative inline-flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="relative">
          <div className="h-12 w-12 rounded-xl bg-gradient-gold grid place-items-center shadow-glow">
            <Leaf className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight tracking-tight max-w-md">
            Welcome to the field of the future.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            AI-powered diagnostics, live weather, and clear profit numbers — for every acre you manage.
          </p>
        </div>
        <div className="relative text-xs text-primary-foreground/60">© {new Date().getFullYear()} AgroPilot</div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-elev-lg">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">AgroPilot</span>
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Or create one to get started.</p>

          <Tabs defaultValue="in" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full mb-5">
              <TabsTrigger value="in">Sign in</TabsTrigger>
              <TabsTrigger value="up">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="space-y-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full bg-gradient-primary shadow-elev-md" onClick={() => submit("in")} disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </TabsContent>
            <TabsContent value="up" className="space-y-4">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full bg-gradient-primary shadow-elev-md" onClick={() => submit("up")} disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
        </div>
      </div>
    </div>
  );
}
