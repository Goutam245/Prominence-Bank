import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit } from '@/lib/dataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Plus, Search, Eye, Pencil, ArrowLeft, Wallet, PiggyBank, Lock, DollarSign } from 'lucide-react';
import type { Account, Currency } from '@/types/banking';

const currencyFlags: Record<string, string> = { USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', CHF: '🇨🇭', BTC: '₿', ETH: 'Ξ', XLM: '✦' };

export default function AccountsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useDataStore();
  const { user } = useAuth();
  const customers = store.getCustomers();
  const accounts = store.getAccounts();
  const transactions = store.getTransactions();
  const deposits = store.getDeposits();
  const holds = store.getHolds();
  const instruments = store.getInstruments();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Partial<Account>>({ type: 'checking', currency: 'USD', status: 'active', availableBalance: 0, inTransitBalance: 0, heldBalance: 0 });
  const detailAccount = id ? accounts.find(a => a.id === id) : null;
  const [detailTab, setDetailTab] = useState('transactions');

  const filtered = useMemo(() => accounts.filter(a => {
    if (debouncedSearch && !a.accountNumber.includes(debouncedSearch) && !a.customerName.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (currencyFilter !== 'all' && a.currency !== currencyFilter) return false;
    return true;
  }), [accounts, debouncedSearch, typeFilter, currencyFilter]);

  const handleSave = useCallback(() => {
    if (!editAccount.customerId || !editAccount.title) { toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' }); return; }
    const cust = customers.find(c => c.id === editAccount.customerId);
    if (editAccount.id) {
      dataStore.updateAccount(editAccount.id, editAccount);
      addAudit(user!.id, user!.name, 'Updated', 'Accounts', editAccount.id, editAccount.title, 'Updated account');
      toast({ title: 'Account Updated' });
    } else {
      const acc: Account = {
        ...editAccount as Account,
        id: generateId('acc'),
        customerName: cust?.name || '',
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        availableBalance: editAccount.availableBalance || 0,
        inTransitBalance: 0, heldBalance: 0,
        createdAt: new Date().toISOString(),
      };
      dataStore.addAccount(acc);
      addAudit(user!.id, user!.name, 'Created', 'Accounts', acc.id, acc.title, `Created ${acc.type} ${acc.currency} account for ${cust?.name}`);
      toast({ title: 'Account Created', description: `${acc.title} — ${acc.accountNumber}` });
    }
    setShowForm(false);
  }, [editAccount, customers, user]);

  if (detailAccount) {
    const accTxns = transactions.filter(t => t.accountId === detailAccount.id);
    const accDeposits = deposits.filter(d => d.accountId === detailAccount.id);
    const accHolds = holds.filter(h => h.accountId === detailAccount.id);
    const custInsts = instruments.filter(i => i.customerId === detailAccount.customerId);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/accounts')}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-card-foreground">{detailAccount.title}</h1>
            <p className="text-muted-foreground font-mono">{detailAccount.accountNumber} · <span className="cursor-pointer hover:underline" onClick={() => navigate(`/admin/customers/${detailAccount.customerId}`)}>{detailAccount.customerName}</span></p>
          </div>
          <StatusBadge status={detailAccount.status} />
          <StatusBadge status={detailAccount.type} />
          <Button variant="outline" onClick={() => { setEditAccount(detailAccount); setShowForm(true); }}><Pencil className="w-4 h-4 mr-2" />Edit</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Available Balance', value: detailAccount.availableBalance, color: 'text-emerald-600', icon: DollarSign, bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'In Transit', value: detailAccount.inTransitBalance, color: 'text-amber-600', icon: PiggyBank, bg: 'bg-amber-50 border-amber-200' },
            { label: 'Held Balance', value: detailAccount.heldBalance, color: 'text-red-600', icon: Lock, bg: 'bg-red-50 border-red-200' },
            { label: 'Total Balance', value: detailAccount.availableBalance + detailAccount.inTransitBalance + detailAccount.heldBalance, color: 'text-primary', icon: Wallet, bg: 'bg-primary/5 border-primary/20' },
          ].map(c => (
            <div key={c.label} className={cn("rounded-2xl border p-5", c.bg)}>
              <div className="flex items-center gap-2 mb-2"><c.icon className={cn("w-5 h-5", c.color)} /><span className="text-sm text-muted-foreground">{c.label}</span></div>
              <p className={cn("text-2xl font-bold font-mono", c.color)}>{formatCurrency(c.value, detailAccount.currency)}</p>
            </div>
          ))}
        </div>

        <Tabs value={detailTab} onValueChange={setDetailTab}>
          <TabsList><TabsTrigger value="transactions">Transactions</TabsTrigger><TabsTrigger value="deposits">Deposits</TabsTrigger><TabsTrigger value="holds">Holds</TabsTrigger><TabsTrigger value="instruments">Instruments</TabsTrigger></TabsList>
          <TabsContent value="transactions" className="mt-4">
            <div className="card-premium">
              {accTxns.length === 0 ? <EmptyState icon={Wallet} title="No Transactions" description="No transactions for this account" /> : (
                <table className="table-premium"><thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>{accTxns.map(t => (
                    <tr key={t.id}><td className="text-muted-foreground text-sm">{formatDateTime(t.timestamp)}</td><td className="font-mono text-xs">{t.reference}</td><td>{t.description}</td><td className="capitalize">{t.type}</td>
                      <td className={cn("font-mono", t.type === 'credit' || t.type === 'interest' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'credit' || t.type === 'interest' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}</td>
                      <td><StatusBadge status={t.status} /></td></tr>
                  ))}</tbody></table>
              )}
            </div>
          </TabsContent>
          <TabsContent value="deposits" className="mt-4">
            <div className="card-premium">
              {accDeposits.length === 0 ? <EmptyState icon={PiggyBank} title="No Deposits" description="No deposits for this account" /> : (
                <table className="table-premium"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{accDeposits.map(d => (
                    <tr key={d.id}><td>{formatDate(d.date)}</td><td className="capitalize">{d.type}</td><td className="font-mono">{formatCurrency(d.amount, d.currency)}</td><td><StatusBadge status={d.status} /></td>
                      <td>{d.status === 'hold' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200" onClick={() => {
                            dataStore.updateDeposit(d.id, { status: 'released', releasedAt: new Date().toISOString() });
                            dataStore.updateAccount(d.accountId, { availableBalance: detailAccount.availableBalance + d.amount, inTransitBalance: Math.max(0, detailAccount.inTransitBalance - d.amount) });
                            addAudit(user!.id, user!.name, 'Released', 'Deposits', d.id, d.description, `Released $${d.amount} deposit`);
                            toast({ title: 'Deposit Released' });
                          }}>Release</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => {
                            dataStore.updateDeposit(d.id, { status: 'rejected', rejectionReason: 'Rejected by admin' });
                            dataStore.updateAccount(d.accountId, { inTransitBalance: Math.max(0, detailAccount.inTransitBalance - d.amount) });
                            addAudit(user!.id, user!.name, 'Rejected', 'Deposits', d.id, d.description, `Rejected deposit`);
                            toast({ title: 'Deposit Rejected', variant: 'destructive' });
                          }}>Reject</Button>
                        </div>
                      )}</td></tr>
                  ))}</tbody></table>
              )}
            </div>
          </TabsContent>
          <TabsContent value="holds" className="mt-4">
            <div className="card-premium">
              {accHolds.length === 0 ? <EmptyState icon={Lock} title="No Holds" description="No holds on this account" /> : (
                <table className="table-premium"><thead><tr><th>Type</th><th>Amount</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{accHolds.map(h => (
                    <tr key={h.id}><td className="capitalize">{h.type}</td><td className="font-mono">{formatCurrency(h.amount, h.currency)}</td><td className="max-w-xs truncate">{h.description}</td><td>{formatDate(h.createdAt)}</td><td><StatusBadge status={h.status} /></td>
                      <td>{h.status === 'active' && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => {
                        dataStore.updateHold(h.id, { status: 'released', releasedAt: new Date().toISOString() });
                        dataStore.updateAccount(h.accountId, { availableBalance: detailAccount.availableBalance + h.amount, heldBalance: Math.max(0, detailAccount.heldBalance - h.amount) });
                        addAudit(user!.id, user!.name, 'Released', 'Holds', h.id, 'Admin Hold', `Released $${h.amount} hold`);
                        toast({ title: 'Hold Released' });
                      }}>Release</Button>}</td></tr>
                  ))}</tbody></table>
              )}
            </div>
          </TabsContent>
          <TabsContent value="instruments" className="mt-4">
            <div className="card-premium">
              {custInsts.length === 0 ? <EmptyState icon={Wallet} title="No Instruments" description="No instruments for this customer" /> : (
                <table className="table-premium"><thead><tr><th>Type</th><th>Reference</th><th>Amount</th><th>Issue</th><th>Maturity</th><th>Status</th></tr></thead>
                  <tbody>{custInsts.map(i => (
                    <tr key={i.id}><td><StatusBadge status={i.type} /></td><td className="font-mono">{i.referenceNumber}</td><td className="font-mono">{formatCurrency(i.amount, i.currency)}</td><td>{formatDate(i.issueDate)}</td><td>{formatDate(i.maturityDate)}</td><td><StatusBadge status={i.status} /></td></tr>
                  ))}</tbody></table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-card-foreground">Accounts</h1><p className="text-muted-foreground">{accounts.length} total accounts</p></div>
        <Button className="gradient-primary text-white" onClick={() => { setEditAccount({ type: 'checking', currency: 'USD', status: 'active', availableBalance: 0, inTransitBalance: 0, heldBalance: 0 }); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Create Account</Button>
      </div>
      <div className="card-premium">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by account # or customer..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="checking">Checking</SelectItem><SelectItem value="savings">Savings</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="custody">Custody</SelectItem></SelectContent></Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Currencies</SelectItem><SelectItem value="USD">🇺🇸 USD</SelectItem><SelectItem value="EUR">🇪🇺 EUR</SelectItem><SelectItem value="GBP">🇬🇧 GBP</SelectItem><SelectItem value="CHF">🇨🇭 CHF</SelectItem></SelectContent></Select>
        </div>
        {filtered.length === 0 ? <EmptyState icon={Wallet} title="No accounts found" description="Try adjusting filters" /> : (
          <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>Account #</th><th>Customer</th><th>Type</th><th>Currency</th><th>Available</th><th>In Transit</th><th>Held</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(a => (
              <tr key={a.id}><td className="font-mono">{a.accountNumber}</td><td>{a.customerName}</td><td className="capitalize">{a.type}</td><td>{currencyFlags[a.currency] || ''} {a.currency}</td>
                <td className="font-mono text-emerald-600">{formatCurrency(a.availableBalance, a.currency)}</td>
                <td className="font-mono text-amber-600">{formatCurrency(a.inTransitBalance, a.currency)}</td>
                <td className="font-mono text-red-600">{formatCurrency(a.heldBalance, a.currency)}</td>
                <td><StatusBadge status={a.status} /></td>
                <td><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => navigate(`/admin/accounts/${a.id}`)}><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setEditAccount(a); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button></div></td>
              </tr>
            ))}</tbody></table></div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editAccount.id ? 'Edit Account' : 'Create Account'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer *</Label><Select value={editAccount.customerId || ''} onValueChange={v => setEditAccount(p => ({ ...p, customerId: v }))}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Account Type</Label><Select value={editAccount.type || 'checking'} onValueChange={v => setEditAccount(p => ({ ...p, type: v as Account['type'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checking">Checking</SelectItem><SelectItem value="savings">Savings</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="custody">Custody</SelectItem></SelectContent></Select></div>
              <div><Label>Currency</Label><Select value={editAccount.currency || 'USD'} onValueChange={v => setEditAccount(p => ({ ...p, currency: v as Currency }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">🇺🇸 USD</SelectItem><SelectItem value="EUR">🇪🇺 EUR</SelectItem><SelectItem value="GBP">🇬🇧 GBP</SelectItem><SelectItem value="CHF">🇨🇭 CHF</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Account Title *</Label><Input value={editAccount.title || ''} onChange={e => setEditAccount(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Primary Checking" /></div>
            {!editAccount.id && <div><Label>Opening Balance</Label><Input type="number" value={editAccount.availableBalance || 0} onChange={e => setEditAccount(p => ({ ...p, availableBalance: parseFloat(e.target.value) || 0 }))} /></div>}
            <div><Label>Wire Min Balance Override</Label><Input type="number" value={editAccount.minimumBalance || ''} onChange={e => setEditAccount(p => ({ ...p, minimumBalance: parseFloat(e.target.value) || undefined }))} placeholder="Leave empty for global default" /><p className="text-xs text-muted-foreground mt-1">Overrides global minimum for this account</p></div>
            <div><Label>Status</Label><Select value={editAccount.status || 'active'} onValueChange={v => setEditAccount(p => ({ ...p, status: v as Account['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleSave}>{editAccount.id ? 'Save' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
