import { useState, useMemo } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, addAudit } from '@/lib/dataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
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
import { ArrowLeftRight, Search, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TransactionsPage() {
  const location = useLocation();
  const isTransfers = location.pathname.includes('/transfers');
  const store = useDataStore();
  const { user } = useAuth();

  const transactions = store.getTransactions();
  const transferRequests = store.getTransferRequests();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Transfer request status update
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  if (isTransfers) {
    const filtered = useMemo(() => transferRequests.filter(t => {
      if (debouncedSearch && !t.beneficiaryName?.toLowerCase().includes(debouncedSearch.toLowerCase()) && !t.id.includes(debouncedSearch)) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    }), [transferRequests, debouncedSearch, statusFilter]);

    const stats = {
      pending: transferRequests.filter(t => t.status === 'pending').length,
      processing: transferRequests.filter(t => t.status === 'processing').length,
      completed: transferRequests.filter(t => t.status === 'completed').length,
      rejected: transferRequests.filter(t => t.status === 'rejected').length,
    };

    const handleStatusUpdate = () => {
      if (!updateId || !newStatus) return;
      if ((newStatus === 'rejected') && !statusReason) { toast({ title: 'Provide reason', variant: 'destructive' }); return; }
      dataStore.updateTransferRequest(updateId, { status: newStatus as any, processedAt: new Date().toISOString(), notes: statusReason || undefined });
      const tr = transferRequests.find(t => t.id === updateId);
      if (tr && newStatus === 'completed') {
        const acc = store.getAccounts().find(a => a.id === tr.fromAccountId);
        if (acc) {
          dataStore.addTransaction({ id: `txn-${Date.now()}`, accountId: tr.fromAccountId, type: 'debit', amount: tr.amount + tr.fee, currency: tr.currency, description: `Wire to ${tr.beneficiaryName}`, status: 'completed', reference: tr.id, timestamp: new Date().toISOString() });
        }
      }
      addAudit(user!.id, user!.name, 'Updated', 'Transfers', updateId, tr?.beneficiaryName, `Status → ${newStatus}${statusReason ? ': ' + statusReason : ''}`);
      toast({ title: 'Transfer Updated' });
      setUpdateId(null); setNewStatus(''); setStatusReason('');
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-card-foreground">Transfer Requests</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: stats.pending, color: 'border-amber-400', icon: Clock, textColor: 'text-amber-600' },
            { label: 'Processing', count: stats.processing, color: 'border-primary', icon: Send, textColor: 'text-primary' },
            { label: 'Completed', count: stats.completed, color: 'border-emerald-400', icon: CheckCircle, textColor: 'text-emerald-600' },
            { label: 'Rejected', count: stats.rejected, color: 'border-red-400', icon: XCircle, textColor: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className={cn("card-premium p-4 border-l-4", s.color)}><div className="flex items-center gap-2"><s.icon className={cn("w-5 h-5", s.textColor)} /><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.count}</p></div></div></div>
          ))}
        </div>
        <div className="card-premium">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
          </div>
          {filtered.length === 0 ? <EmptyState icon={Send} title="No transfer requests" description="No transfers match your filters" /> : (
            <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>Request #</th><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Fee</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(t => (
                <tr key={t.id}><td className="font-mono text-xs">{t.id}</td><td className="capitalize">{t.type}</td><td className="font-mono">{t.fromAccountNumber}</td><td>{t.beneficiaryName || t.toAccountNumber}</td>
                  <td className="font-mono font-medium">{formatCurrency(t.amount, t.currency)}</td><td className="font-mono">{formatCurrency(t.fee, t.currency)}</td><td className="text-sm">{formatDateTime(t.requestedAt)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.status !== 'completed' && t.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => { setUpdateId(t.id); setNewStatus(''); setStatusReason(''); }}>Update</Button>}</td>
                </tr>
              ))}</tbody></table></div>
          )}
        </div>

        <Dialog open={!!updateId} onOpenChange={() => setUpdateId(null)}>
          <DialogContent><DialogHeader><DialogTitle>Update Transfer Status</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>New Status</Label><Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="processing">Processing</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
              {(newStatus === 'rejected') && <div><Label>Reason *</Label><Textarea value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Reason..." /></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpdateId(null)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleStatusUpdate}>Update Status</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Regular transactions view
  const filtered = useMemo(() => transactions.filter(t => {
    if (debouncedSearch && !t.reference.toLowerCase().includes(debouncedSearch.toLowerCase()) && !t.description.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  }), [transactions, debouncedSearch, statusFilter, typeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">All Transactions</h1>
      <div className="card-premium">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="credit">Credit</SelectItem><SelectItem value="debit">Debit</SelectItem><SelectItem value="transfer">Transfer</SelectItem><SelectItem value="fee">Fee</SelectItem><SelectItem value="interest">Interest</SelectItem></SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
        </div>
        {filtered.length === 0 ? <EmptyState icon={ArrowLeftRight} title="No transactions" description="No transactions match your filters" /> : (
          <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>Reference</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{filtered.map(t => (
              <tr key={t.id}><td className="font-mono text-xs">{t.reference}</td><td>{t.description}</td><td className="capitalize">{t.type}</td>
                <td className={cn("font-mono font-medium", t.type === 'credit' || t.type === 'interest' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'credit' || t.type === 'interest' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}</td>
                <td><StatusBadge status={t.status} /></td><td className="text-sm text-muted-foreground">{formatDateTime(t.timestamp)}</td></tr>
            ))}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
