import { useState, useMemo, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, addAudit, addNotif } from '@/lib/dataStore';
import type { Loan } from '@/lib/dataStore';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreditCard, DollarSign, Search, Clock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function LoansPage() {
  const store = useDataStore();
  const { user } = useAuth();
  const loans = store.getLoans();

  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ id: string; status: string } | null>(null);

  const stats = {
    pending: loans.filter(l => l.status === 'pending').length,
    active: loans.filter(l => l.status === 'active').length,
    completed: loans.filter(l => l.status === 'completed').length,
    totalDisbursed: loans.filter(l => l.status === 'active' || l.status === 'completed').reduce((s, l) => s + l.amount, 0),
  };

  const handleStatusUpdate = useCallback(() => {
    if (!statusUpdate) return;
    dataStore.updateLoan(statusUpdate.id, { status: statusUpdate.status as Loan['status'], approvedAt: statusUpdate.status === 'approved' ? new Date().toISOString() : undefined });
    const loan = loans.find(l => l.id === statusUpdate.id);
    addAudit(user!.id, user!.name, 'Updated', 'Loans', statusUpdate.id, loan?.customerName, `Loan status → ${statusUpdate.status}`);
    if (loan) addNotif(loan.customerId, 'loan', 'Loan Status Updated', `Your loan application status has been updated to: ${statusUpdate.status}`);
    toast({ title: 'Loan Updated' });
    setStatusUpdate(null);
  }, [statusUpdate, loans, user]);

  const detailLoan = showDetail ? loans.find(l => l.id === showDetail) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Loan Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: stats.pending, color: 'border-amber-400', icon: Clock },
          { label: 'Active', count: stats.active, color: 'border-primary', icon: CreditCard },
          { label: 'Completed', count: stats.completed, color: 'border-emerald-400', icon: CheckCircle },
          { label: 'Total Disbursed', count: formatCurrency(stats.totalDisbursed), color: 'border-primary', icon: DollarSign },
        ].map(s => (
          <div key={s.label} className={cn("card-premium p-4 border-l-4", s.color)}><div className="flex items-center gap-2"><s.icon className="w-5 h-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.count}</p></div></div></div>
        ))}
      </div>

      <div className="card-premium">
        {loans.length === 0 ? <EmptyState icon={CreditCard} title="No loans" description="No loan applications" /> : (
          <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>Loan #</th><th>Customer</th><th>Amount</th><th>Rate</th><th>Term</th><th>Monthly</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{loans.map(l => (
              <tr key={l.id}><td className="font-mono">{l.id}</td><td>{l.customerName}</td><td className="font-mono">{formatCurrency(l.amount, l.currency)}</td><td>{l.interestRate}%</td><td>{l.term}mo</td>
                <td className="font-mono">{formatCurrency(l.monthlyPayment, l.currency)}</td><td><StatusBadge status={l.status} /></td>
                <td><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setShowDetail(l.id)}>View</Button>
                  {(l.status === 'pending' || l.status === 'approved') && <Button size="sm" variant="outline" onClick={() => setStatusUpdate({ id: l.id, status: '' })}>Update</Button>}</div></td></tr>
            ))}</tbody></table></div>
        )}
      </div>

      {/* Detail */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">{detailLoan && (
          <div className="space-y-4">
            <DialogHeader><DialogTitle>Loan Details — {detailLoan.id}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{detailLoan.customerName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Amount</Label><p className="font-mono text-lg font-bold">{formatCurrency(detailLoan.amount, detailLoan.currency)}</p></div>
              <div><Label className="text-xs text-muted-foreground">Interest Rate</Label><p>{detailLoan.interestRate}% APR</p></div>
              <div><Label className="text-xs text-muted-foreground">Term</Label><p>{detailLoan.term} months</p></div>
              <div><Label className="text-xs text-muted-foreground">Purpose</Label><p>{detailLoan.purpose}</p></div>
              <div><Label className="text-xs text-muted-foreground">Collateral</Label><p>{detailLoan.collateral || '—'}</p></div>
              <div><Label className="text-xs text-muted-foreground">Status</Label><StatusBadge status={detailLoan.status} /></div>
              <div><Label className="text-xs text-muted-foreground">Monthly Payment</Label><p className="font-mono">{formatCurrency(detailLoan.monthlyPayment, detailLoan.currency)}</p></div>
            </div>
            {detailLoan.status === 'active' && (
              <div><Label className="text-xs text-muted-foreground">Progress</Label><Progress value={(detailLoan.paidAmount / detailLoan.amount) * 100} className="mt-2" /><p className="text-sm text-muted-foreground mt-1">Paid: {formatCurrency(detailLoan.paidAmount)} of {formatCurrency(detailLoan.amount)}</p></div>
            )}
            {detailLoan.payments.length > 0 && (
              <div><h4 className="font-semibold mb-2">Payment History</h4>
                <table className="table-premium"><thead><tr><th>Date</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th><th>Status</th></tr></thead>
                  <tbody>{detailLoan.payments.map(p => <tr key={p.id}><td>{formatDate(p.date)}</td><td className="font-mono">{formatCurrency(p.amount)}</td><td className="font-mono">{formatCurrency(p.principal)}</td><td className="font-mono">{formatCurrency(p.interest)}</td><td className="font-mono">{formatCurrency(p.balance)}</td><td><StatusBadge status={p.status} /></td></tr>)}</tbody></table>
              </div>
            )}
          </div>
        )}</DialogContent>
      </Dialog>

      {/* Status Update */}
      <Dialog open={!!statusUpdate} onOpenChange={() => setStatusUpdate(null)}>
        <DialogContent><DialogHeader><DialogTitle>Update Loan Status</DialogTitle></DialogHeader>
          <div><Label>New Status</Label><Select value={statusUpdate?.status || ''} onValueChange={v => setStatusUpdate(p => p ? { ...p, status: v } : null)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="approved">Approved</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setStatusUpdate(null)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleStatusUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
