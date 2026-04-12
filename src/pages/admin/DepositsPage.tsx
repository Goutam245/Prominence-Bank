import { useState, useMemo, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit, addNotif } from '@/lib/dataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Plus, PiggyBank, Search, DollarSign, CheckCircle, Clock } from 'lucide-react';
import type { Deposit, Currency } from '@/types/banking';

export default function DepositsPage() {
  const store = useDataStore();
  const { user } = useAuth();
  const deposits = store.getDeposits();
  const accounts = store.getAccounts();
  const customers = store.getCustomers();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState<string | null>(null);

  const [form, setForm] = useState({ customerId: '', accountId: '', type: 'cash' as 'cash' | 'cheque', amount: '', description: '', withFee: false, status: 'hold' as 'hold' | 'released' });

  const holdDeposits = deposits.filter(d => d.status === 'hold');
  const releasedDeposits = deposits.filter(d => d.status === 'released');
  const todayDeposits = deposits.filter(d => d.date === new Date().toISOString().split('T')[0]);

  const filtered = useMemo(() => deposits.filter(d => {
    if (debouncedSearch && !d.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) && !d.accountNumber.includes(debouncedSearch)) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  }), [deposits, debouncedSearch, statusFilter]);

  const custAccounts = useMemo(() => accounts.filter(a => a.customerId === form.customerId), [accounts, form.customerId]);

  const handleAddDeposit = useCallback(() => {
    const acc = accounts.find(a => a.id === form.accountId);
    if (!acc || !form.amount) { toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return; }
    const amount = parseFloat(form.amount);
    const feeTable = store.getFeeTable();
    const fee = form.withFee ? amount * (feeTable.bankToBankFee / 100) : 0;
    const netAmount = amount - fee;

    const deposit: Deposit = {
      id: generateId('dep'), accountId: form.accountId, accountNumber: acc.accountNumber,
      customerName: acc.customerName, type: form.type, amount: netAmount, currency: acc.currency,
      date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5),
      description: form.description || `${form.type} deposit`, status: form.status,
      withFee: form.withFee, createdBy: user!.id, createdAt: new Date().toISOString(),
    };
    dataStore.addDeposit(deposit);

    if (form.status === 'hold') {
      dataStore.updateAccount(acc.id, { inTransitBalance: acc.inTransitBalance + netAmount });
    } else {
      dataStore.updateAccount(acc.id, { availableBalance: acc.availableBalance + netAmount });
    }

    if (fee > 0) {
      dataStore.addTransaction({ id: generateId('txn'), accountId: acc.id, type: 'fee', amount: fee, currency: acc.currency, description: `Deposit fee`, status: 'completed', reference: `FEE-${deposit.id}`, timestamp: new Date().toISOString() });
    }
    dataStore.addTransaction({ id: generateId('txn'), accountId: acc.id, type: 'credit', amount: netAmount, currency: acc.currency, description: deposit.description, status: form.status === 'hold' ? 'pending' : 'completed', reference: deposit.id, timestamp: new Date().toISOString() });

    addAudit(user!.id, user!.name, 'Deposit', 'Deposits', deposit.id, deposit.description, `Added $${netAmount} ${form.type} deposit ${form.status === 'hold' ? 'on hold' : 'released'}`);
    addNotif(acc.customerId, 'deposit', 'Deposit Received', `A ${form.type} deposit of ${formatCurrency(netAmount, acc.currency)} has been ${form.status === 'hold' ? 'placed on hold' : 'credited'}.`);
    toast({ title: 'Deposit Added', description: `${formatCurrency(netAmount, acc.currency)} ${form.status}` });
    setShowForm(false);
    setForm({ customerId: '', accountId: '', type: 'cash', amount: '', description: '', withFee: false, status: 'hold' });
  }, [form, accounts, store, user]);

  const handleRelease = useCallback((depId: string) => {
    const dep = deposits.find(d => d.id === depId);
    if (!dep) return;
    const acc = accounts.find(a => a.id === dep.accountId);
    if (!acc) return;
    dataStore.updateDeposit(depId, { status: 'released', releasedAt: new Date().toISOString() });
    dataStore.updateAccount(acc.id, { availableBalance: acc.availableBalance + dep.amount, inTransitBalance: Math.max(0, acc.inTransitBalance - dep.amount) });
    addAudit(user!.id, user!.name, 'Released', 'Deposits', depId, dep.description, `Released ${formatCurrency(dep.amount, dep.currency)} to available balance`);
    addNotif(acc.customerId, 'deposit', 'Deposit Released', `Your deposit of ${formatCurrency(dep.amount, dep.currency)} is now available.`);
    toast({ title: 'Deposit Released', description: `${formatCurrency(dep.amount, dep.currency)} moved to available balance` });
    setShowDetail(null);
  }, [deposits, accounts, user]);

  const handleReject = useCallback(() => {
    if (!showReject || !rejectReason) { toast({ title: 'Error', description: 'Please provide rejection reason', variant: 'destructive' }); return; }
    const dep = deposits.find(d => d.id === showReject);
    if (!dep) return;
    const acc = accounts.find(a => a.id === dep.accountId);
    if (!acc) return;
    dataStore.updateDeposit(showReject, { status: 'rejected', rejectionReason: rejectReason });
    dataStore.updateAccount(acc.id, { inTransitBalance: Math.max(0, acc.inTransitBalance - dep.amount) });
    addAudit(user!.id, user!.name, 'Rejected', 'Deposits', showReject, dep.description, `Rejected deposit: ${rejectReason}`);
    toast({ title: 'Deposit Rejected', variant: 'destructive' });
    setShowReject(null); setRejectReason(''); setShowDetail(null);
  }, [showReject, rejectReason, deposits, accounts, user]);

  const detailDep = showDetail ? deposits.find(d => d.id === showDetail) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-card-foreground">Deposits</h1><p className="text-muted-foreground">{deposits.length} total deposits</p></div>
        <Button className="gradient-primary text-white" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Deposit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium p-5 border-l-4 border-amber-400"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-amber-500" /><div><p className="text-sm text-muted-foreground">On Hold</p><p className="text-2xl font-bold font-mono">{holdDeposits.length}</p><p className="text-sm text-amber-600 font-mono">{formatCurrency(holdDeposits.reduce((s, d) => s + d.amount, 0))}</p></div></div></div>
        <div className="card-premium p-5 border-l-4 border-emerald-400"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-emerald-500" /><div><p className="text-sm text-muted-foreground">Released</p><p className="text-2xl font-bold font-mono">{releasedDeposits.length}</p><p className="text-sm text-emerald-600 font-mono">{formatCurrency(releasedDeposits.reduce((s, d) => s + d.amount, 0))}</p></div></div></div>
        <div className="card-premium p-5 border-l-4 border-primary"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Today</p><p className="text-2xl font-bold font-mono">{todayDeposits.length}</p><p className="text-sm text-primary font-mono">{formatCurrency(todayDeposits.reduce((s, d) => s + d.amount, 0))}</p></div></div></div>
      </div>

      <div className="card-premium">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="hold">On Hold</SelectItem><SelectItem value="released">Released</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
        </div>
        {filtered.length === 0 ? <EmptyState icon={PiggyBank} title="No deposits" description="No deposits match your filters" /> : (
          <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>TX ID</th><th>Date</th><th>Customer</th><th>Account</th><th>Type</th><th>Amount</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(d => (
              <tr key={d.id} className="cursor-pointer" onClick={() => setShowDetail(d.id)}>
                <td className="font-mono text-xs">{d.id}</td><td>{formatDate(d.date)}</td><td>{d.customerName}</td><td className="font-mono">{d.accountNumber}</td>
                <td className="capitalize"><StatusBadge status={d.type} /></td>
                <td className="font-mono font-medium">{formatCurrency(d.amount, d.currency)}</td>
                <td>{d.withFee ? 'Yes' : 'No'}</td>
                <td><StatusBadge status={d.status} /></td>
                <td onClick={e => e.stopPropagation()}>
                  {d.status === 'hold' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleRelease(d.id)}>Release</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowReject(d.id)}>Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}</tbody></table></div>
        )}
      </div>

      {/* Add Deposit Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Deposit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer *</Label><Select value={form.customerId} onValueChange={v => setForm(p => ({ ...p, customerId: v, accountId: '' }))}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Account *</Label><Select value={form.accountId} onValueChange={v => setForm(p => ({ ...p, accountId: v }))}><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{custAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.title} — {a.accountNumber} ({formatCurrency(a.availableBalance, a.currency)})</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Deposit Type</Label>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant={form.type === 'cash' ? 'default' : 'outline'} onClick={() => setForm(p => ({ ...p, type: 'cash' }))}>Cash</Button>
                  <Button size="sm" variant={form.type === 'cheque' ? 'default' : 'outline'} onClick={() => setForm(p => ({ ...p, type: 'cheque' }))}>Cheque</Button>
                </div>
              </div>
              <div><Label>Status</Label>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant={form.status === 'hold' ? 'default' : 'outline'} className={form.status === 'hold' ? 'bg-amber-500 hover:bg-amber-600' : ''} onClick={() => setForm(p => ({ ...p, status: 'hold' }))}>Hold</Button>
                  <Button size="sm" variant={form.status === 'released' ? 'default' : 'outline'} className={form.status === 'released' ? 'bg-emerald-500 hover:bg-emerald-600' : ''} onClick={() => setForm(p => ({ ...p, status: 'released' }))}>Released</Button>
                </div>
              </div>
            </div>
            <div><Label>Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="text-2xl font-mono h-14" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Deposit reference..." /></div>
            <div className="flex items-center gap-3"><Switch checked={form.withFee} onCheckedChange={v => setForm(p => ({ ...p, withFee: v }))} /><Label>Apply deposit fee</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleAddDeposit}>Add Deposit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!showReject} onOpenChange={() => setShowReject(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reject Deposit</DialogTitle></DialogHeader>
          <div><Label>Rejection Reason *</Label><Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." className="mt-2" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowReject(null)}>Cancel</Button><Button variant="destructive" onClick={handleReject}>Reject Deposit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>{detailDep && (
          <div className="space-y-4">
            <DialogHeader><DialogTitle>Deposit Details — {detailDep.id}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{detailDep.customerName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Account</Label><p className="font-mono">{detailDep.accountNumber}</p></div>
              <div><Label className="text-xs text-muted-foreground">Type</Label><p className="capitalize">{detailDep.type}</p></div>
              <div><Label className="text-xs text-muted-foreground">Amount</Label><p className="font-mono text-lg font-bold">{formatCurrency(detailDep.amount, detailDep.currency)}</p></div>
              <div><Label className="text-xs text-muted-foreground">Date</Label><p>{formatDateTime(detailDep.createdAt)}</p></div>
              <div><Label className="text-xs text-muted-foreground">Status</Label><StatusBadge status={detailDep.status} /></div>
              {detailDep.releasedAt && <div><Label className="text-xs text-muted-foreground">Released At</Label><p>{formatDateTime(detailDep.releasedAt)}</p></div>}
              {detailDep.rejectionReason && <div className="col-span-2"><Label className="text-xs text-muted-foreground">Rejection Reason</Label><p className="text-red-600">{detailDep.rejectionReason}</p></div>}
            </div>
            {detailDep.status === 'hold' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleRelease(detailDep.id)}>Release to Available</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { setShowDetail(null); setShowReject(detailDep.id); }}>Reject</Button>
              </div>
            )}
          </div>
        )}</DialogContent>
      </Dialog>
    </div>
  );
}
