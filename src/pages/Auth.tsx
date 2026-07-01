import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

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
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Leaf className="h-6 w-6 text-primary" /><span className="font-semibold text-lg">AgroPilot</span>
        </div>
        <Tabs defaultValue="in">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="in">Sign in</TabsTrigger>
            <TabsTrigger value="up">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button className="w-full" onClick={() => submit("in")} disabled={busy}>Sign in</Button>
          </TabsContent>
          <TabsContent value="up" className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button className="w-full" onClick={() => submit("up")} disabled={busy}>Create account</Button>
          </TabsContent>
        </Tabs>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
      </div>
    </div>
  );
}
