import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore } from '@/hooks/useDataStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClientTransactionsPage() {
  const { customer } = useAuth();
  const store = useDataStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const accounts = store.getAccounts().filter(a => a.customerId === customer?.id);
  const accountIds = accounts.map(a => a.id);

  const transactions = useMemo(() => {
    let txns = store.getTransactions().filter(t => accountIds.includes(t.accountId));
    if (search) txns = txns.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') txns = txns.filter(t => t.type === typeFilter);
    if (statusFilter !== 'all') txns = txns.filter(t => t.status === statusFilter);
    return txns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [store, accountIds, search, typeFilter, statusFilter]);

  const exportCSV = () => {
    const csv = ['Date,Reference,Description,Type,Amount,Currency,Status', ...transactions.map(t =>
      `${t.timestamp},${t.reference},${t.description},${t.type},${t.amount},${t.currency},${t.status}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-card-foreground">Transactions</h1><p className="text-sm text-muted-foreground">{transactions.length} transactions</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4 mr-1" />Filters</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by description or reference..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      {showFilters && (
        <div className="card-premium p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem><SelectItem value="credit">Credit</SelectItem><SelectItem value="debit">Debit</SelectItem><SelectItem value="transfer">Transfer</SelectItem><SelectItem value="fee">Fee</SelectItem><SelectItem value="interest">Interest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="card-premium overflow-hidden">
        <div className="divide-y divide-border">
          {transactions.map((t) => {
            const isCredit = t.type === 'credit' || t.type === 'interest';
            const isExpanded = expandedTx === t.id;
            const account = accounts.find(a => a.id === t.accountId);
            return (
              <div key={t.id}>
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedTx(isExpanded ? null : t.id)}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isCredit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>{isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}</div>
                    <div>
                      <p className="font-medium text-card-foreground text-sm">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.timestamp)} • {t.reference}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={cn("font-bold font-mono", isCredit ? "text-success" : "text-card-foreground")}>{isCredit ? '+' : '-'}{formatCurrency(t.amount, t.currency)}</p>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", t.status === 'completed' && "badge-success", t.status === 'pending' && "badge-warning", t.status === 'rejected' && "badge-danger")}>{t.status}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4"><div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-muted-foreground">ID</p><p className="font-mono">{t.id}</p></div>
                    <div><p className="text-xs text-muted-foreground">Account</p><p>{account?.title}</p></div>
                    <div><p className="text-xs text-muted-foreground">Category</p><p className="capitalize">{t.category || t.type}</p></div>
                    <div><p className="text-xs text-muted-foreground">Currency</p><p>{t.currency}</p></div>
                  </div></div>
                )}
              </div>
            );
          })}
          {transactions.length === 0 && <div className="p-12 text-center text-muted-foreground">No transactions found.</div>}
        </div>
      </div>
    </div>
  );
}
