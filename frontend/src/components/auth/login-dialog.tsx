import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LogIn, UserPlus, Shield } from "lucide-react";
import { apiFetch } from "@/lib/api"; // <-- API fetch helper import хийв

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState("login");
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

  const [adminCode, setAdminCode] = useState("");

  const { setAuth } = useAuthStore();

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setRegFirstName("");
    setRegLastName("");
    setRegEmail("");
    setRegPhone("");
    setRegAddress("");
    setRegSecondaryPhone("");
    setRegPassword("");
    setRegConfirmPassword("");
    setAdminCode("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!data || data.error) {
        toast.error(data?.error || "Нэвтрэхэд алдаа гарлаа");
        return;
      }

      // Нэвтрэх эсвэл бүртгүүлэх үед:
setAuth(data.user || null, data.token);
      toast.success("Амжилттай нэвтэрлээ!");
      resetForms();
      onOpenChange(false);
    } catch {
      toast.error("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast.error("Нууц үг таарахгүй байна");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Нууц үг дор хаяж 6 тэмдэгт байх ёстой");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone,
          address: regAddress || undefined,
          secondaryPhone: regSecondaryPhone || undefined,
          password: regPassword,
        }),
      });

      if (!data || data.error) {
        toast.error(data?.error || "Бүртгүүлэхэд алдаа гарлаа");
        return;
      }

      setAuth(data.user, data.token);
      toast.success("Амжилттай бүртгэгдлээ!");
      resetForms();
      onOpenChange(false);
    } catch {
      toast.error("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode.trim()) {
      toast.error("Админ код оруулна уу");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ code: adminCode.trim() }),
      });

      if (!data || data.error) {
        toast.error(data?.error || "Админ код буруу байна");
        return;
      }

      setAuth(data.user, data.token);
      toast.success("Админаар нэвтэрлээ!");
      resetForms();
      onOpenChange(false);
    } catch {
      toast.error("Сүлжээний алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-brand-900 font-bold text-xl">
            Нэвтрэх
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="login" className="text-xs sm:text-sm">
              <LogIn className="w-4 h-4 mr-1 hidden sm:inline-block" />
              Нэвтрэх
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs sm:text-sm">
              <UserPlus className="w-4 h-4 mr-1 hidden sm:inline-block" />
              Бүртгүүлэх
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1 hidden sm:inline-block" />
              Админ
            </TabsTrigger>
          </TabsList>

          {/* User Login */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Имэйл</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <Label>Нууц үг</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                disabled={loading}
              >
                {loading ? "Нэвтрэх..." : "Нэвтрэх"}
              </Button>
            </form>
          </TabsContent>

          {/* Register */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Овог *</Label>
                  <Input
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Овог"
                    required
                  />
                </div>
                <div>
                  <Label>Нэр *</Label>
                  <Input
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Нэр"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Имэйл *</Label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Утасны дугаар *</Label>
                  <Input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+976 XXXX XXXX"
                    required
                  />
                </div>
                <div>
                  <Label>2-р утас</Label>
                  <Input
                    value={regSecondaryPhone}
                    onChange={(e) => setRegSecondaryPhone(e.target.value)}
                    placeholder="Холбогдох 2-р утас"
                  />
                </div>
              </div>
              <div>
                <Label>Гэрийн хаяг</Label>
                <Input
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Хаяг"
                />
              </div>
              <div>
                <Label>Нууц үг *</Label>
                <Input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Дор хаяж 6 тэмдэгт"
                  required
                />
              </div>
              <div>
                <Label>Нууц үг давтах *</Label>
                <Input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Дахин оруулна уу"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                disabled={loading}
              >
                {loading ? "Бүртгэл..." : "Бүртгүүлэх"}
              </Button>
            </form>
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-brand-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Админ хяналтын самбар руу нэвтрэхийн тулд админ код оруулна уу
                </p>
              </div>
              <div>
                <Label>Админ код</Label>
                <Input
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Админ код оруулна уу"
                  className="text-center text-lg tracking-widest font-mono"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-800 hover:bg-brand-900 text-white"
                disabled={loading || !adminCode.trim()}
              >
                {loading ? "Нэвтрэх..." : "Админаар нэвтрэх"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Админ кодыг зөвхөн байгууллагын админтай хуваалцана уу
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}