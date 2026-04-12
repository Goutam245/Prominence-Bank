import { useState, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addNotif } from '@/lib/dataStore';
import type { Loan, LoanPayment } from '@/lib/dataStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreditCard, Plus, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ClientLoansPage() {
  const store = useDataStore();
  const { user } = useAuth();
  const customers = store.getCustomers();
  const customer = customers.find(c => c.email === user?.email);
  const loans = store.getLoans().filter(l => l.customerId === customer?.id);

  const [showApply, setShowApply] = useState(false);
  const [showSchedule, setShowSchedule] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', purpose: '', term: '12', collateral: '' });

  const handleApply = useCallback(() => {
    if (!form.amount || !form.purpose) { toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' }); return; }
    const amount = parseFloat(form.amount);
    const term = parseInt(form.term);
    const rate = store.getFeeTable().loanInterestRate;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

    const loan: Loan = {
      id: generateId('loan'), customerId: customer!.id, customerName: customer!.name,
      amount, currency: 'USD', interestRate: rate, term, monthlyPayment,
      purpose: form.purpose, collateral: form.collateral, status: 'pending',
      paidAmount: 0, nextPaymentDate: '', payments: [], createdAt: new Date().toISOString(),
    };
    dataStore.addLoan(loan);
    toast({ title: 'Loan Application Submitted', description: `Reference: ${loan.id}` });
    setShowApply(false);
    setForm({ amount: '', purpose: '', term: '12', collateral: '' });
  }, [form, customer, store]);

  const scheduleLoan = showSchedule ? loans.find(l => l.id === showSchedule) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-card-foreground">My Loans</h1><p className="text-muted-foreground">{loans.length} loans</p></div>
        <Button className="gradient-primary text-white" onClick={() => setShowApply(true)}><Plus className="w-4 h-4 mr-2" />Apply for Loan</Button>
      </div>

      {loans.length === 0 ? (
        <div className="card-premium"><EmptyState icon={CreditCard} title="No Loans" description="Apply for your first loan" actionLabel="Apply Now" onAction={() => setShowApply(true)} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loans.map(l => (
            <div key={l.id} className="card-premium p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><CreditCard className="w-6 h-6 text-primary" /></div>
                  <div>
                    <p className="font-semibold text-lg">{l.purpose}</p>
                    <p className="text-sm text-muted-foreground">{l.id} · {l.interestRate}% APR · {l.term} months</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="text-2xl font-bold font-mono">{formatCurrency(l.amount, l.currency)}</p><p className="text-sm text-muted-foreground">Monthly: {formatCurrency(l.monthlyPayment, l.currency)}</p></div>
                  <StatusBadge status={l.status} />
                </div>
              </div>
              {l.status === 'active' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1"><span>Paid: {formatCurrency(l.paidAmount)}</span><span>Remaining: {formatCurrency(l.amount - l.paidAmount)}</span></div>
                  <Progress value={(l.paidAmount / l.amount) * 100} className="h-2" />
                  <div className="flex justify-between mt-3">
                    <p className="text-sm text-muted-foreground">Next payment: {l.nextPaymentDate ? formatDate(l.nextPaymentDate) : '—'}</p>
                    <Button size="sm" variant="outline" onClick={() => setShowSchedule(l.id)}>View Schedule</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent><DialogHeader><DialogTitle>Apply for Loan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Loan Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="font-mono text-xl h-14" /></div>
            <div><Label>Purpose *</Label><Select value={form.purpose} onValueChange={v => setForm(p => ({ ...p, purpose: v }))}><SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger><SelectContent><SelectItem value="Business Expansion">Business Expansion</SelectItem><SelectItem value="Working Capital">Working Capital</SelectItem><SelectItem value="Equipment Purchase">Equipment Purchase</SelectItem><SelectItem value="Real Estate">Real Estate</SelectItem><SelectItem value="Personal">Personal</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            <div><Label>Term</Label><Select value={form.term} onValueChange={v => setForm(p => ({ ...p, term: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="6">6 months</SelectItem><SelectItem value="12">12 months</SelectItem><SelectItem value="24">24 months</SelectItem><SelectItem value="36">36 months</SelectItem></SelectContent></Select></div>
            <div><Label>Collateral Description</Label><Textarea value={form.collateral} onChange={e => setForm(p => ({ ...p, collateral: e.target.value }))} placeholder="Describe collateral if any..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleApply}>Submit Application</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule */}
      <Dialog open={!!showSchedule} onOpenChange={() => setShowSchedule(null)}>
        <DialogContent className="max-w-lg">{scheduleLoan && (
          <div className="space-y-4">
            <DialogHeader><DialogTitle>Amortization Schedule</DialogTitle></DialogHeader>
            {scheduleLoan.payments.length === 0 ? <p className="text-muted-foreground text-center py-8">No payment history yet</p> : (
              <table className="table-premium"><thead><tr><th>Date</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
                <tbody>{scheduleLoan.payments.map(p => <tr key={p.id}><td>{formatDate(p.date)}</td><td className="font-mono">{formatCurrency(p.amount)}</td><td className="font-mono">{formatCurrency(p.principal)}</td><td className="font-mono">{formatCurrency(p.interest)}</td><td className="font-mono">{formatCurrency(p.balance)}</td></tr>)}</tbody></table>
            )}
          </div>
        )}</DialogContent>
      </Dialog>
    </div>
  );
}
