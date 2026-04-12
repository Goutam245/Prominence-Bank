import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2, Building2, Shield, TrendingUp, Globe, ChevronDown, Copy, Check, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import FloatingCard from '@/components/ui/FloatingCard';
import GlowButton from '@/components/ui/GlowButton';
import PremiumInput from '@/components/ui/PremiumInput';
import OTPModal from '@/components/OTPModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, completeOtpLogin, pendingUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showRegisterMessage, setShowRegisterMessage] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    
    setIsSubmitting(true);
    const result = await login(email, password);
    
    if (result.success) {
      if (result.needsOtp) {
        setOtpEmail(email);
        setShowOtpModal(true);
      } else {
        toast.success('Welcome back!');
        navigate('/admin');
      }
    } else {
      toast.error(result.error || 'Login failed');
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    if (result.success) {
      setOtpEmail('john.doe@example.com');
      setShowOtpModal(true);
    } else {
      toast.error(result.error || 'Google sign-in failed');
    }
    setIsSubmitting(false);
  };

  const handleOtpVerified = () => {
    completeOtpLogin();
    setShowOtpModal(false);
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex bg-navy">
      {/* Left Side - Branding & Hero */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <AnimatedBackground />
        <motion.div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full" variants={containerVariants} initial="hidden" animate="visible">
          {/* Logo */}
          <motion.div className="flex items-center gap-4" variants={itemVariants}>
            <div className="relative">
              <motion.div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20" whileHover={{ scale: 1.05 }} animate={{ boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prominence Bank</h1>
              <p className="text-base text-white/60">Enterprise Banking Solutions</p>
            </div>
          </motion.div>

          {/* Center Content */}
          <motion.div className="max-w-2xl" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl xl:text-6xl font-light leading-tight mb-2">Your Financial Future,</h2>
              <motion.h2 className="text-6xl xl:text-7xl font-bold mb-8" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
                Secured
              </motion.h2>
            </motion.div>
            <motion.p className="text-xl text-white/70 leading-relaxed mb-10 max-w-xl" variants={itemVariants}>
              Experience premium banking with cutting-edge security, seamless transactions, and world-class service designed for high-net-worth individuals and enterprises.
            </motion.p>
            <motion.div className="flex flex-wrap gap-4" variants={containerVariants}>
              {[
                { icon: Shield, text: 'Bank-Grade Security', color: 'text-emerald-400' },
                { icon: Globe, text: 'Global Transfers', color: 'text-electric-light' },
                { icon: TrendingUp, text: 'Investment Products', color: 'text-accent' },
              ].map((feature) => (
                <motion.div key={feature.text} className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Credit Card */}
          <FloatingCard className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:block" delay={1} floatIntensity={12}>
            <motion.div className="w-80 h-48 rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }} whileHover={{ rotateY: 10, rotateX: -5 }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-2xl transform translate-x-10 -translate-y-10" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Sparkles className="w-8 h-8 text-white/80" />
                  <div className="text-right"><p className="text-xs text-white/60">Premium</p><p className="text-sm font-semibold text-white">Platinum</p></div>
                </div>
                <div>
                  <p className="text-lg tracking-widest font-mono text-white/90 mb-2">•••• •••• •••• 4567</p>
                  <div className="flex justify-between items-end">
                    <div><p className="text-xs text-white/50">Card Holder</p><p className="text-sm font-medium text-white">JOHN DOE</p></div>
                    <div className="text-right"><p className="text-xs text-white/50">Expires</p><p className="text-sm font-medium text-white">12/28</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </FloatingCard>

          {/* Bottom Stats */}
          <motion.div className="grid grid-cols-3 gap-8" variants={containerVariants}>
            {[
              { value: '$12B+', label: 'Assets Under Management' },
              { value: '50K+', label: 'Global Clients' },
              { value: '99.99%', label: 'Uptime Guaranteed' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.05 }} className="group cursor-default">
                <AnimatedCounter value={stat.value} className="text-4xl xl:text-5xl font-bold text-white group-hover:text-electric-light transition-colors" />
                <p className="text-sm text-white/50 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          {/* Mobile Logo */}
          <motion.div className="lg:hidden flex items-center justify-center gap-3 mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-royal to-electric flex items-center justify-center shadow-lg shadow-royal/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy">Prominence Bank</span>
          </motion.div>

          {/* Login Card */}
          <motion.div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-4xl font-bold text-card-foreground mb-3">Welcome Back</h2>
              <p className="text-muted-foreground text-lg">Access your Prominence Bank account</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlowButton variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-semibold text-card-foreground">Continue with Google</span>
                  </>
                )}
              </GlowButton>
            </motion.div>

            <motion.div className="relative my-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-muted-foreground font-medium">OR</span></div>
            </motion.div>

            <motion.form onSubmit={handleLogin} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <PremiumInput type="email" placeholder="Email address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
              <PremiumInput type={showPassword ? 'text' : 'password'} placeholder="Password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting}
                rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                </div>
                <a href="#" className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors">Forgot Password?</a>
              </div>
              <GlowButton type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>Sign In</GlowButton>
            </motion.form>

            <motion.div className="text-center mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => setShowRegisterMessage(true)} className="text-primary font-semibold hover:underline">Sign Up</button>
              </p>
            </motion.div>

            {/* Register message */}
            <AnimatePresence>
              {showRegisterMessage && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-sm text-card-foreground">To open an account with Prominence Bank, please visit <strong>prominencebank.com</strong> or contact our team.</p>
                    <button onClick={() => setShowRegisterMessage(false)} className="mt-2 text-xs text-primary hover:underline">Dismiss</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo Credentials */}
            <motion.div className="mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <button type="button" onClick={() => setShowDemoCredentials(!showDemoCredentials)} className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Demo Credentials</span>
                <motion.div animate={{ rotate: showDemoCredentials ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
              </button>
              <AnimatePresence>
                {showDemoCredentials && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 space-y-2">
                      {[
                        { label: 'Admin', email: 'admin@prominencebank.com', password: 'Admin@123' },
                        { label: 'Client 1', email: 'john.doe@example.com', password: 'Client@123' },
                        { label: 'Client 2', email: 'jane.smith@example.com', password: 'Client@456' },
                        { label: 'Client 3', email: 'gmg.group@example.com', password: 'Client@789' },
                      ].map((cred) => (
                        <div key={cred.label} className="flex items-center justify-between p-3 rounded-lg bg-white border border-border/50">
                          <div>
                            <p className="text-xs font-semibold text-primary mb-0.5">{cred.label}</p>
                            <p className="text-xs text-muted-foreground font-mono">{cred.email} / {cred.password}</p>
                          </div>
                          <button type="button" onClick={() => { setEmail(cred.email); setPassword(cred.password); handleCopy(cred.email, cred.label); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                            {copiedField === cred.label ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.p className="text-center mt-6 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            By signing in, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>

      {/* OTP Modal */}
      <OTPModal open={showOtpModal} onClose={() => setShowOtpModal(false)} onVerify={handleOtpVerified} email={otpEmail} purpose="Login" />
    </div>
  );
}
