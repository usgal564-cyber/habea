"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regSecondaryPhone, setRegSecondaryPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setAuth(data.user, data.token);
      toast.success("Амжилттай нэвтэрлээ!");
      onOpenChange(false);
    } catch { toast.error("Алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) { toast.error("Нууц үг таарахгүй байна"); return; }
    if (regPassword.length < 6) { toast.error("Нууц үг дор хаяж 6 тэмдэгт байх ёстой"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName, lastName: regLastName, email: regEmail, phone: regPhone,
          address: regAddress || undefined, secondaryPhone: regSecondaryPhone || undefined, password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setAuth(data.user, data.token);
      toast.success("Амжилттай бүртгэгдлээ!");
      onOpenChange(false);
    } catch { toast.error("Алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-brand-900 font-bold text-xl">
            {isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login"><LogIn className="w-4 h-4 mr-2" />Нэвтрэх</TabsTrigger>
            <TabsTrigger value="register"><UserPlus className="w-4 h-4 mr-2" />Бүртгүүлэх</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Имэйл</Label>
                <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
              <div>
                <Label>Нууц үг</Label>
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading}>
                {loading ? "Нэвтрэх..." : "Нэвтрэх"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Овог</Label><Input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required /></div>
                <div><Label>Нэр</Label><Input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required /></div>
              </div>
              <div><Label>Имэйл</Label><Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Утасны дугаар</Label><Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required /></div>
                <div><Label>2-р утас</Label><Input value={regSecondaryPhone} onChange={(e) => setRegSecondaryPhone(e.target.value)} /></div>
              </div>
              <div><Label>Гэрийн хаяг</Label><Input value={regAddress} onChange={(e) => setRegAddress(e.target.value)} /></div>
              <div><Label>Нууц үг</Label><Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required /></div>
              <div><Label>Нууц үг давтах</Label><Input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required /></div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading}>
                {loading ? "Бүртгэл..." : "Бүртгүүлэх"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
