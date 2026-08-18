import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LogIn, UserPlus, Shield, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regSecondaryPhone, setRegSecondaryPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Admin
  const [adminCode, setAdminCode] = useState("");

  const { setAuth } = useAuthStore();

  // ── Frontend validation helpers ──
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    return /^\+?976?\d{8}$/.test(cleaned);
  };
  const isValidPassword = (pw: string) => {
    if (pw.length < 8) return { valid: false, msg: "Нууц үг дор хаяж 8 тэмдэгт байх ёстой" };
    if (!/[A-ZА-ЯЁӨҮ]/.test(pw)) return { valid: false, msg: "Дор хаяж 1 том үсэг оруулна уу" };
    if (!/[a-zа-яёөү]/.test(pw)) return { valid: false, msg: "Дор хаяж 1 жижиг үсэг оруулна уу" };
    if (!/\d/.test(pw)) return { valid: false, msg: "Дор хаяж 1 тоо оруулна уу" };
    return { valid: true, msg: "" };
  };

  const resetForms = () => {
    setLoginEmail(""); setLoginPassword("");
    setRegFirstName(""); setRegLastName(""); setRegEmail(""); setRegPhone("");
    setRegAddress(""); setRegSecondaryPhone(""); setRegPassword(""); setRegConfirmPassword("");
    setAdminCode("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(loginEmail)) { toast.error("Зөв имэйл хаяг оруулна уу"); return; }
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
      resetForms();
    } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend validation
    if (!isValidEmail(regEmail)) { toast.error("Зөв имэйл хаяг оруулна уу"); return; }
    if (!isValidPhone(regPhone)) { toast.error("Зөв утасны дугаар оруулна уу (жишээ: +976 77001234)"); return; }
    if (regSecondaryPhone && !isValidPhone(regSecondaryPhone)) { toast.error("2-р утасны дугаар буруу байна"); return; }
    const pwCheck = isValidPassword(regPassword);
    if (!pwCheck.valid) { toast.error(pwCheck.msg); return; }
    if (regPassword !== regConfirmPassword) { toast.error("Нууц үг хоорондоо таарахгүй байна"); return; }
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
      resetForms();
    } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode.trim()) { toast.error("Админ код оруулна уу"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setAuth(data.user, data.token);
      toast.success("Админаар нэвтэрлээ!");
      resetForms();
    } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-ZА-ЯЁӨҮ]/.test(pw)) score++;
    if (/[a-zа-яёөү]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-zА-Яа-яЁёӨөҮү0-9]/.test(pw)) score++;
    const labels = ["Муу", "Сул", "Дунд", "Сайн", "Маш сайн"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];
    return { score, label: labels[score - 1] || "Муу", color: colors[score - 1] || "bg-red-500", width: `${(score / 5) * 100}%` };
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <img src="/logo.png" alt="ХАБЭА" className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-2xl shadow-brand-500/20 object-contain" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-bold text-white mb-3">
            ХАБЭА
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-brand-300 text-lg mb-8">
            Бага дунд аж ахуйн нэгж
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4 text-brand-200/70 text-sm">
            <p>Ажлын байраны аюулгүй байдал, эрүүл мэндийн сургалт, зөвлөгөөний цогц үйлчилгээ</p>
            <div className="flex items-center justify-center gap-2 text-brand-400">
              <ArrowRight className="w-4 h-4" />
              <span>Нэвтрэх эсвэл бүртгүүлэхдээ доорх форм ашиглана уу</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel: Auth Forms ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50/80">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="ХАБЭА" className="w-16 h-16 mx-auto mb-3 rounded-xl object-contain" />
            <h1 className="text-2xl font-bold text-brand-900">ХАБЭА</h1>
            <p className="text-sm text-muted-foreground">Бага дунд аж ахуйн нэгж</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-brand-900">Нэвтрэх</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Акаунт нээж сургалтад оролцоорой</p>
            </div>

            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="login" className="text-xs sm:text-sm data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                    <LogIn className="w-4 h-4 mr-1 hidden sm:inline-block" />
                    Нэвтрэх
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-xs sm:text-sm data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                    <UserPlus className="w-4 h-4 mr-1 hidden sm:inline-block" />
                    Бүртгүүлэх
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="text-xs sm:text-sm data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                    <Shield className="w-4 h-4 mr-1 hidden sm:inline-block" />
                    Админ
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {/* ── Login ── */}
                  <TabsContent value="login">
                    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Имэйл</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="example@mail.com"
                          required
                          autoComplete="email"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-pw">Нууц үг</Label>
                        <div className="relative">
                          <Input
                            id="login-pw"
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Нууц үг оруулна уу"
                            required
                            autoComplete="current-password"
                            className="h-11 pr-10"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white h-11 font-semibold" disabled={loading}>
                        {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Нэвтрэх...</span> : "Нэвтрэх"}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  {/* ── Register ── */}
                  <TabsContent value="register">
                    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="reg-last">Овог <span className="text-red-500">*</span></Label>
                          <Input id="reg-last" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} placeholder="Овог" required className="h-11" />
                        </div>
                        <div>
                          <Label htmlFor="reg-first">Нэр <span className="text-red-500">*</span></Label>
                          <Input id="reg-first" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} placeholder="Нэр" required className="h-11" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reg-email">Имэйл <span className="text-red-500">*</span></Label>
                        <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="example@mail.com" required className="h-11" />
                        {regEmail && !isValidEmail(regEmail) && <p className="text-xs text-red-500 mt-1">Зөв имэйл хаяг оруулна уу</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="reg-phone">Утас <span className="text-red-500">*</span></Label>
                          <Input id="reg-phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+976 77001234" required className="h-11" />
                          {regPhone && !isValidPhone(regPhone) && <p className="text-xs text-red-500 mt-1">Зөв утасны дугаар оруулна уу</p>}
                        </div>
                        <div>
                          <Label htmlFor="reg-phone2">2-р утас</Label>
                          <Input id="reg-phone2" value={regSecondaryPhone} onChange={(e) => setRegSecondaryPhone(e.target.value)} placeholder="Опциональ" className="h-11" />
                          {regSecondaryPhone && !isValidPhone(regSecondaryPhone) && <p className="text-xs text-red-500 mt-1">Зөв дугаар оруулна уу</p>}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reg-address">Гэрийн хаяг</Label>
                        <Input id="reg-address" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="Хаяг" className="h-11" />
                      </div>
                      <div>
                        <Label htmlFor="reg-pw">Нууц үг <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input id="reg-pw" type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Дор хаяж 8 тэмдэгт" required className="h-11 pr-10" />
                          <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Password strength */}
                        {regPassword && (() => {
                          const strength = getPasswordStrength(regPassword);
                          return strength ? (
                            <div className="mt-1.5 space-y-1">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                              </div>
                              <p className="text-xs text-muted-foreground">Хүч: {strength.label}</p>
                            </div>
                          ) : null;
                        })()}
                        {regPassword && (() => {
                          const pwCheck = isValidPassword(regPassword);
                          return !pwCheck.valid ? <p className="text-xs text-red-500 mt-1">{pwCheck.msg}</p> : null;
                        })()}
                      </div>
                      <div>
                        <Label htmlFor="reg-pw2">Нууц үг давтах <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input id="reg-pw2" type={showConfirmPassword ? "text" : "password"} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Дахин оруулна уу" required className="h-11 pr-10" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {regConfirmPassword && regPassword !== regConfirmPassword && <p className="text-xs text-red-500 mt-1">Нууц үг хоорондоо таарахгүй байна</p>}
                      </div>
                      <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white h-11 font-semibold" disabled={loading}>
                        {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Бүртгэл...</span> : "Бүртгүүлэх"}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  {/* ── Admin Login ── */}
                  <TabsContent value="admin">
                    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="text-center mb-2">
                        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-7 h-7 text-brand-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Админ хяналтын самбар руу нэвтрэхийн тулд админ код оруулна уу
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="admin-code">Админ код</Label>
                        <Input
                          id="admin-code"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          placeholder="Админ код оруулна уу"
                          className="text-center text-lg tracking-widest font-mono h-11"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-brand-800 hover:bg-brand-900 text-white h-11 font-semibold" disabled={loading || !adminCode.trim()}>
                        {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Нэвтрэх...</span> : "Админаар нэвтрэх"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Админ кодыг зөвхөн байгууллагын админтай хуваалцана уу
                      </p>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
