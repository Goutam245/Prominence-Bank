import { useState, useMemo, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit, addNotif } from '@/lib/dataStore';
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
import { Lock, Plus, Shield, DollarSign } from 'lucide-react';
import type { Hold } from '@/types/banking';

export default function HoldsPage() {
  const store = useDataStore();
  const { user } = useAuth();
  const holds = store.getHolds();
  const deposits = store.getDeposits();
  const accounts = store.getAccounts();
  const customers = store.getCustomers();

  const [tab, setTab] = useState('deposit');
  const [showAddHold, setShowAddHold] = useState(false);
  const [form, setForm] = useState({ customerId: '', accountId: '', amount: '', description: '' });
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [releaseReason, setReleaseReason] = useState('');

  const depositHolds = deposits.filter(d => d.status === 'hold');
  const adminHolds = holds.filter(h => h.type === 'admin');
  const activeAdminHolds = adminHolds.filter(h => h.status === 'active');
  const custAccounts = useMemo(() => accounts.filter(a => a.customerId === form.customerId), [accounts, form.customerId]);
  const selectedAcc = accounts.find(a => a.id === form.accountId);

  const handleAddHold = useCallback(() => {
    const acc = accounts.find(a => a.id === form.accountId);
    if (!acc || !form.amount || !form.description || form.description.length < 10) {
      toast({ title: 'Error', description: 'Fill all fields. Description min 10 chars.', variant: 'destructive' }); return;
    }
    const amount = parseFloat(form.amount);
    if (amount > acc.availableBalance) { toast({ title: 'Error', description: 'Amount exceeds available balance', variant: 'destructive' }); return; }

    const hold: Hold = {
      id: generateId('hold'), accountId: acc.id, accountNumber: acc.accountNumber,
      customerName: acc.customerName, type: 'admin', amount, currency: acc.currency,
      description: form.description, status: 'active', createdBy: user!.id, createdAt: new Date().toISOString(),
    };
    dataStore.addHold(hold);
    dataStore.updateAccount(acc.id, { availableBalance: acc.availableBalance - amount, heldBalance: acc.heldBalance + amount });
    addAudit(user!.id, user!.name, 'Hold', 'Holds', hold.id, 'Admin Hold', `Placed ${formatCurrency(amount, acc.currency)} hold — ${form.description}`);
    addNotif(acc.customerId, 'hold', 'Hold Placed', `An admin hold of ${formatCurrency(amount, acc.currency)} has been placed on your account.`);
    toast({ title: 'Hold Placed', description: `${formatCurrency(amount, acc.currency)} held on ${acc.accountNumber}` });
    setShowAddHold(false);
    setForm({ customerId: '', accountId: '', amount: '', description: '' });
  }, [form, accounts, user]);

  const handleRelease = useCallback(() => {
    if (!releaseId || !releaseReason) { toast({ title: 'Error', description: 'Provide release reason', variant: 'destructive' }); return; }
    const hold = holds.find(h => h.id === releaseId);
    if (!hold) return;
    const acc = accounts.find(a => a.id === hold.accountId);
    if (!acc) return;
    dataStore.updateHold(releaseId, { status: 'released', releasedAt: new Date().toISOString() });
    dataStore.updateAccount(acc.id, { availableBalance: acc.availableBalance + hold.amount, heldBalance: Math.max(0, acc.heldBalance - hold.amount) });
    addAudit(user!.id, user!.name, 'Released', 'Holds', releaseId, 'Admin Hold', `Released ${formatCurrency(hold.amount, hold.currency)} — ${releaseReason}`);
    addNotif(acc.customerId, 'hold', 'Hold Released', `A hold of ${formatCurrency(hold.amount, hold.currency)} has been released.`);
    toast({ title: 'Hold Released' });
    setReleaseId(null); setReleaseReason('');
  }, [releaseId, releaseReason, holds, accounts, user]);

  const handleReleaseDeposit = useCallback((depId: string) => {
    const dep = deposits.find(d => d.id === depId);
    if (!dep) return;
    const acc = accounts.find(a => a.id === dep.accountId);
    if (!acc) return;
    dataStore.updateDeposit(depId, { status: 'released', releasedAt: new Date().toISOString() });
    dataStore.updateAccount(acc.id, { availableBalance: acc.availableBalance + dep.amount, inTransitBalance: Math.max(0, acc.inTransitBalance - dep.amount) });
    addAudit(user!.id, user!.name, 'Released', 'Deposits', depId, dep.description, `Released ${formatCurrency(dep.amount, dep.currency)}`);
    toast({ title: 'Deposit Released' });
  }, [deposits, accounts, user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-card-foreground">Holds Management</h1><p className="text-muted-foreground">Manage deposit and admin holds</p></div>
        <Button className="gradient-primary text-white" onClick={() => setShowAddHold(true)}><Plus className="w-4 h-4 mr-2" />Add Admin Hold</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-premium p-5 border-l-4 border-amber-400"><div className="flex items-center gap-3"><Lock className="w-8 h-8 text-amber-500" /><div><p className="text-sm text-muted-foreground">Active Admin Holds</p><p className="text-2xl font-bold font-mono">{activeAdminHolds.length}</p><p className="text-sm text-amber-600 font-mono">{formatCurrency(activeAdminHolds.reduce((s, h) => s + h.amount, 0))}</p></div></div></div>
        <div className="card-premium p-5 border-l-4 border-primary"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Deposit Holds</p><p className="text-2xl font-bold font-mono">{depositHolds.length}</p><p className="text-sm text-primary font-mono">{formatCurrency(depositHolds.reduce((s, d) => s + d.amount, 0))}</p></div></div></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="deposit">Deposit Holds ({depositHolds.length})</TabsTrigger><TabsTrigger value="admin">Admin Holds ({adminHolds.length})</TabsTrigger></TabsList>

        <TabsContent value="deposit" className="mt-4">
          <div className="card-premium">
            {depositHolds.length === 0 ? <EmptyState icon={Lock} title="No deposit holds" description="All deposits have been processed" /> : (
              <table className="table-premium"><thead><tr><th>Customer</th><th>Account</th><th>Type</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>{depositHolds.map(d => (
                  <tr key={d.id}><td>{d.customerName}</td><td className="font-mono">{d.accountNumber}</td><td className="capitalize">{d.type}</td><td className="font-mono font-medium">{formatCurrency(d.amount, d.currency)}</td><td>{formatDate(d.date)}</td>
                    <td><div className="flex gap-2"><Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200" onClick={() => handleReleaseDeposit(d.id)}>Release</Button></div></td></tr>
                ))}</tbody></table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-4">
          <div className="card-premium">
            {adminHolds.length === 0 ? <EmptyState icon={Shield} title="No admin holds" description="No manual holds placed" /> : (
              <table className="table-premium"><thead><tr><th>Customer</th><th>Account</th><th>Amount</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{adminHolds.map(h => (
                  <tr key={h.id}><td>{h.customerName}</td><td className="font-mono">{h.accountNumber}</td><td className="font-mono font-medium">{formatCurrency(h.amount, h.currency)}</td><td className="max-w-xs truncate">{h.description}</td><td>{formatDate(h.createdAt)}</td><td><StatusBadge status={h.status} /></td>
                    <td>{h.status === 'active' && <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200" onClick={() => setReleaseId(h.id)}>Release</Button>}</td></tr>
                ))}</tbody></table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Hold Modal */}
      <Dialog open={showAddHold} onOpenChange={setShowAddHold}>
        <DialogContent><DialogHeader><DialogTitle>Add Admin Hold</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer *</Label><Select value={form.customerId} onValueChange={v => setForm(p => ({ ...p, customerId: v, accountId: '' }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Account *</Label><Select value={form.accountId} onValueChange={v => setForm(p => ({ ...p, accountId: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{custAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.title} — {formatCurrency(a.availableBalance, a.currency)} available</SelectItem>)}</SelectContent></Select></div>
            {selectedAcc && <p className="text-sm text-muted-foreground">Available: <span className="font-mono font-medium text-emerald-600">{formatCurrency(selectedAcc.availableBalance, selectedAcc.currency)}</span></p>}
            <div><Label>Hold Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="font-mono" /></div>
            <div><Label>Reason / Description * (min 10 chars)</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Reason for placing hold..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddHold(false)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleAddHold}>Place Hold</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Modal */}
      <Dialog open={!!releaseId} onOpenChange={() => setReleaseId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Release Hold</DialogTitle></DialogHeader>
          {releaseId && holds.find(h => h.id === releaseId) && (
            <div className="space-y-4">
              <p>Release <strong className="font-mono">{formatCurrency(holds.find(h => h.id === releaseId)!.amount, holds.find(h => h.id === releaseId)!.currency)}</strong> back to available balance?</p>
              <div><Label>Release Reason *</Label><Textarea value={releaseReason} onChange={e => setReleaseReason(e.target.value)} placeholder="Reason for releasing..." /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setReleaseId(null)}>Cancel</Button><Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleRelease}>Release Hold</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
