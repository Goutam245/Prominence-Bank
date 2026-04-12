import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore, generateId, addAudit, addNotif } from '@/hooks/useDataStore';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Users, Globe, ChevronRight, Check, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import OTPModal from '@/components/OTPModal';
import type { TransferRequest } from '@/types/banking';

type TransferType = 'internal' | 'to_customer' | 'external';

export default function TransferPage() {
  const { user, customer } = useAuth();
  const store = useDataStore();
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState<TransferType | null>(null);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [toBeneficiaryId, setToBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const accounts = store.getAccounts().filter(a => a.customerId === customer?.id && a.status === 'active');
  const beneficiaries = store.getBeneficiaries().filter(b => b.customerId === customer?.id);
  const feeTable = store.getFeeTable();
  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const fee = transferType === 'external' ? (parseFloat(amount) || 0) * (feeTable.bankToOtherBankFee / 100) : transferType === 'to_customer' ? (parseFloat(amount) || 0) * (feeTable.bankToBankFee / 100) : 0;
  const totalDeduction = (parseFloat(amount) || 0) + fee;

  const types = [
    { id: 'internal' as const, title: 'Between My Accounts', desc: 'Instant transfer, no fees', icon: ArrowLeftRight, badge: '' },
    { id: 'to_customer' as const, title: 'To Prominence Customer', desc: 'Within bank, minimal fee', icon: Users, badge: '' },
    { id: 'external' as const, title: 'External Wire / Withdrawal', desc: 'To other bank, OTP required', icon: Globe, badge: 'OTP Required' },
  ];

  const executeTransfer = () => {
    const ref = `TRF${Date.now().toString(36).toUpperCase()}`;
    setRefNumber(ref);

    if (transferType === 'external') {
      // Create transfer request for admin approval
      const req: TransferRequest = {
        id: generateId('tr'), fromAccountId, fromAccountNumber: fromAccount?.accountNumber || '',
        beneficiaryId: toBeneficiaryId, beneficiaryName: beneficiaries.find(b => b.id === toBeneficiaryId)?.name,
        amount: parseFloat(amount), currency: fromAccount?.currency || 'USD', type: 'wire',
        status: 'pending', fee, notes, requestedAt: new Date().toISOString(),
      };
      store.addTransferRequest(req);
      addNotif(user?.id || '', 'transfer', 'Transfer Submitted', `External wire of ${formatCurrency(parseFloat(amount))} submitted for approval.`);
    } else {
      // Instant transfer
      const amtNum = parseFloat(amount);
      store.updateAccount(fromAccountId, { availableBalance: (fromAccount?.availableBalance || 0) - totalDeduction });
      
      if (transferType === 'internal') {
        const toAcc = accounts.find(a => a.id === toAccountId);
        if (toAcc) store.updateAccount(toAccountId, { availableBalance: toAcc.availableBalance + amtNum });
      }

      // Add transaction records
      store.addTransaction({ id: generateId('txn'), accountId: fromAccountId, type: 'debit', amount: totalDeduction, currency: fromAccount?.currency || 'USD', description: `Transfer to ${transferType === 'internal' ? accounts.find(a => a.id === toAccountId)?.title : beneficiaries.find(b => b.id === toBeneficiaryId)?.name}`, status: 'completed', reference: ref, timestamp: new Date().toISOString(), category: 'Transfer' });
      if (fee > 0) {
        store.addTransaction({ id: generateId('txn'), accountId: fromAccountId, type: 'fee', amount: fee, currency: fromAccount?.currency || 'USD', description: 'Transfer fee', status: 'completed', reference: ref + '-FEE', timestamp: new Date().toISOString(), category: 'Fee' });
      }
      addNotif(user?.id || '', 'transfer', 'Transfer Completed', `Transfer of ${formatCurrency(amtNum)} completed successfully.`);
    }
    setSuccess(true);
  };

  const handleConfirm = () => {
    if (!fromAccount || totalDeduction > fromAccount.availableBalance) {
      toast.error('Insufficient balance'); return;
    }
    if (transferType === 'external') {
      setShowOtp(true);
    } else {
      executeTransfer();
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto animate-check-bounce">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-card-foreground">{transferType === 'external' ? 'Transfer Submitted!' : 'Transfer Successful!'}</h2>
        <p className="text-muted-foreground">{transferType === 'external' ? 'Your transfer is pending admin approval.' : 'The funds have been transferred instantly.'}</p>
        <div className="card-premium p-6 text-left space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono font-bold">{refNumber}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">{formatCurrency(parseFloat(amount), fromAccount?.currency)}</span></div>
          {fee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span>{formatCurrency(fee, fromAccount?.currency)}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", transferType === 'external' ? "badge-warning" : "badge-success")}>{transferType === 'external' ? 'Pending' : 'Completed'}</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setStep(1); setSuccess(false); setTransferType(null); setAmount(''); }}>New Transfer</Button>
          <Button className="gradient-primary text-white" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Transfer Funds</h1>
      
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= s ? "gradient-primary text-white" : "bg-muted text-muted-foreground")}>{s}</div>
            {s < 4 && <div className={cn("flex-1 h-1 rounded", step > s ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Transfer Type</h2>
          {types.map(t => (
            <div key={t.id} onClick={() => { setTransferType(t.id); setStep(2); }} className={cn("card-premium p-6 cursor-pointer flex items-center gap-4 hover:-translate-y-1 transition-all", transferType === t.id && "ring-2 ring-primary")}>
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center"><t.icon className="w-7 h-7 text-white" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              {t.badge && <span className="px-2 py-1 rounded-full text-xs font-bold badge-warning">{t.badge}</span>}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Accounts */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Accounts</h2>
          <div>
            <label className="text-sm font-medium text-card-foreground mb-2 block">From Account</label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title} - {formatCurrency(a.availableBalance, a.currency)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {transferType === 'internal' && (
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">To Account</label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== fromAccountId).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title} - {a.currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(transferType === 'to_customer' || transferType === 'external') && (
            <div>
              <label className="text-sm font-medium text-card-foreground mb-2 block">Beneficiary</label>
              <Select value={toBeneficiaryId} onValueChange={setToBeneficiaryId}>
                <SelectTrigger><SelectValue placeholder="Select beneficiary" /></SelectTrigger>
                <SelectContent>
                  {beneficiaries.filter(b => transferType === 'external' ? b.type === 'external' : b.type === 'internal').map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name} - {b.bankName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button className="gradient-primary text-white" disabled={!fromAccountId || (transferType === 'internal' ? !toAccountId : !toBeneficiaryId)} onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3: Amount */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Enter Amount</h2>
          <div className="card-premium p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Amount ({fromAccount?.currency})</p>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="text-center text-3xl font-bold font-mono h-16 border-2" />
            {fromAccount && <p className="text-sm text-muted-foreground mt-2">Available: {formatCurrency(fromAccount.availableBalance, fromAccount.currency)}</p>}
            {totalDeduction > (fromAccount?.availableBalance || 0) && (
              <div className="flex items-center gap-2 mt-3 text-destructive text-sm"><AlertTriangle className="w-4 h-4" />Insufficient balance</div>
            )}
          </div>
          {fee > 0 && (
            <div className="card-premium p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Transfer Amount</span><span className="font-mono">{formatCurrency(parseFloat(amount) || 0, fromAccount?.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fee ({transferType === 'external' ? feeTable.bankToOtherBankFee : feeTable.bankToBankFee}%)</span><span className="font-mono">{formatCurrency(fee, fromAccount?.currency)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold"><span>Total Deduction</span><span className="font-mono">{formatCurrency(totalDeduction, fromAccount?.currency)}</span></div>
            </div>
          )}
          <Textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button className="gradient-primary text-white" disabled={!amount || parseFloat(amount) <= 0} onClick={() => setStep(4)}>Review</Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Review & Confirm</h2>
          <div className="card-premium p-6 space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="font-medium">{fromAccount?.title}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">To</span><span className="font-medium">{transferType === 'internal' ? accounts.find(a => a.id === toAccountId)?.title : beneficiaries.find(b => b.id === toBeneficiaryId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg font-mono">{formatCurrency(parseFloat(amount), fromAccount?.currency)}</span></div>
            {fee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="font-mono">{formatCurrency(fee, fromAccount?.currency)}</span></div>}
            <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold">Total Deduction</span><span className="font-bold text-lg font-mono">{formatCurrency(totalDeduction, fromAccount?.currency)}</span></div>
            {transferType === 'external' && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">This external transfer requires OTP verification and admin approval.</div>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button className="gradient-primary text-white flex-1" onClick={handleConfirm}><Send className="w-4 h-4 mr-2" />Confirm Transfer</Button>
          </div>
        </div>
      )}

      <OTPModal open={showOtp} onClose={() => setShowOtp(false)} onVerify={() => { setShowOtp(false); executeTransfer(); }} email={user?.email || ''} purpose="External Wire Transfer" />
    </div>
  );
}
