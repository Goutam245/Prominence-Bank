import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateId, dataStore } from '@/lib/dataStore';

interface OTPModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  email: string;
  purpose?: string;
}

export default function OTPModal({ open, onClose, onVerify, email, purpose = 'Login' }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 min
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpRecordId = useRef<string>('');

  const maskedEmail = email.replace(/(.{1,2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c);

  const generateNewOtp = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setExpiryCountdown(300);
    setAttempts(0);
    setVerified(false);

    // Log OTP
    const recordId = generateId('otp');
    otpRecordId.current = recordId;
    dataStore.addOTPLog({
      id: recordId,
      customerId: '',
      customerEmail: email,
      customerName: email.split('@')[0],
      otp: btoa(code),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      status: 'active',
      attempts: 0,
    });

    return code;
  }, [email]);

  useEffect(() => {
    if (open) {
      generateNewOtp();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open, generateNewOtp]);

  // Expiry countdown
  useEffect(() => {
    if (!open || verified || locked) return;
    const timer = setInterval(() => {
      setExpiryCountdown(prev => {
        if (prev <= 1) {
          setError('OTP has expired. Please request a new one.');
          if (otpRecordId.current) {
            dataStore.updateOTPLog(otpRecordId.current, { status: 'expired' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open, verified, locked]);

  // Lock countdown
  useEffect(() => {
    if (!locked) return;
    const timer = setInterval(() => {
      setLockCountdown(prev => {
        if (prev <= 1) {
          setLocked(false);
          setAttempts(0);
          setError('');
          generateNewOtp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [locked, generateNewOtp]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (locked || verified) return;
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      verifyOtp(pasted);
    }
  };

  const verifyOtp = (code: string) => {
    if (expiryCountdown <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    if (code === generatedOtp) {
      setVerified(true);
      setError('');
      if (otpRecordId.current) {
        dataStore.updateOTPLog(otpRecordId.current, { status: 'used', usedAt: new Date().toISOString() });
      }
      setTimeout(() => onVerify(), 1000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (otpRecordId.current) {
        dataStore.updateOTPLog(otpRecordId.current, { attempts: newAttempts });
      }
      if (newAttempts >= 3) {
        setLocked(true);
        setLockCountdown(900); // 15 minutes
        setError('Account locked for 15 minutes due to too many failed attempts.');
      } else {
        setError(`Invalid OTP. ${3 - newAttempts} attempt(s) remaining.`);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    generateNewOtp();
    setResendCooldown(60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => !verified && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" />
            OTP Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Purpose */}
          <p className="text-sm text-muted-foreground text-center">
            {purpose === 'Login' ? 'An OTP has been sent to' : `OTP required for: ${purpose}`}
            <br />
            <span className="font-semibold text-card-foreground">{maskedEmail}</span>
          </p>

          {/* Demo OTP Display */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs font-semibold text-primary mb-1">DEMO MODE: Your OTP is</p>
            <p className="text-2xl font-bold font-mono text-primary tracking-widest">{generatedOtp}</p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={locked || verified}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all",
                  verified && "border-success bg-success/5 text-success",
                  error && !verified && "border-destructive",
                  !error && !verified && "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
            ))}
          </div>

          {/* Timer */}
          {!verified && !locked && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={cn(
                "font-mono",
                expiryCountdown < 60 ? "text-destructive" : "text-muted-foreground"
              )}>
                Expires in {formatTime(expiryCountdown)}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Lock countdown */}
          {locked && (
            <div className="text-center text-sm text-muted-foreground">
              Try again in <span className="font-mono font-bold text-destructive">{formatTime(lockCountdown)}</span>
            </div>
          )}

          {/* Success */}
          {verified && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-sm font-semibold text-success">OTP Verified Successfully!</p>
            </div>
          )}

          {/* Resend */}
          {!verified && !locked && (
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                  resendCooldown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:text-primary/80"
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={verified}>
              Cancel
            </Button>
            <Button 
              onClick={() => verifyOtp(otp.join(''))} 
              className="flex-1 gradient-primary text-white"
              disabled={otp.some(d => !d) || locked || verified}
            >
              Verify OTP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
