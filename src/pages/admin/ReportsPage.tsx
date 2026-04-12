import { useState, useMemo } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, Download, Search, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

export default function ReportsPage() {
  const location = useLocation();
  const isAudit = location.pathname.includes('/audit');
  const store = useDataStore();

  const [reportTab, setReportTab] = useState('customers');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const customers = store.getCustomers();
  const accounts = store.getAccounts();
  const transactions = store.getTransactions();
  const instruments = store.getInstruments();
  const auditLogs = store.getAuditLogs();

  if (isAudit) {
    const filtered = useMemo(() => auditLogs.filter(l => {
      if (debouncedSearch && !l.userName.toLowerCase().includes(debouncedSearch.toLowerCase()) && !l.entityName?.toLowerCase().includes(debouncedSearch.toLowerCase()) && !l.action.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (moduleFilter !== 'all' && l.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      return true;
    }), [auditLogs, debouncedSearch, moduleFilter, actionFilter]);

    const modules = [...new Set(auditLogs.map(l => l.module))];
    const actions = [...new Set(auditLogs.map(l => l.action))];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-card-foreground">Audit Logs</h1><p className="text-muted-foreground">{auditLogs.length} entries · Immutable and cannot be edited or deleted</p></div>
          <Button variant="outline" onClick={() => exportCSV(filtered.map(l => ({ Timestamp: l.timestamp, User: l.userName, Action: l.action, Module: l.module, Entity: l.entityName || '', Details: l.details || '', IP: l.ip })), 'audit_log.csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
        <div className="card-premium">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search logs..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Modules</SelectItem>{modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
            <Select value={actionFilter} onValueChange={setActionFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Actions</SelectItem>{actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
          </div>
          {filtered.length === 0 ? <EmptyState icon={Shield} title="No audit logs" description="No logs match filters" /> : (
            <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>#</th><th>Timestamp</th><th>Admin</th><th>Action</th><th>Module</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead>
              <tbody>{filtered.slice(0, 50).map((l, i) => (
                <tr key={l.id}><td className="text-muted-foreground">{i + 1}</td><td className="text-sm whitespace-nowrap">{formatDateTime(l.timestamp)}</td><td className="font-medium">{l.userName}</td>
                  <td><StatusBadge status={l.action.toLowerCase()} /></td><td>{l.module}</td><td>{l.entityName || '—'}</td><td className="max-w-xs truncate text-sm text-muted-foreground">{l.details || '—'}</td><td className="font-mono text-xs">{l.ip}</td></tr>
              ))}</tbody></table></div>
          )}
        </div>
      </div>
    );
  }

  // Reports view
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Reports</h1>
      <Tabs value={reportTab} onValueChange={setReportTab}>
        <TabsList><TabsTrigger value="customers">Customers</TabsTrigger><TabsTrigger value="accounts">Accounts</TabsTrigger><TabsTrigger value="transactions">Transactions</TabsTrigger><TabsTrigger value="instruments">Instruments</TabsTrigger></TabsList>

        <TabsContent value="customers" className="mt-4">
          <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => exportCSV(customers.map(c => ({ Name: c.name, Email: c.email, Type: c.type, Status: c.status, Risk: c.riskLevel, Created: c.createdAt })), 'customers_report.csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button></div>
          <div className="card-premium"><table className="table-premium"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Risk</th><th>Created</th></tr></thead>
            <tbody>{customers.map(c => <tr key={c.id}><td className="font-medium">{c.name}</td><td>{c.email}</td><td className="capitalize">{c.type}</td><td><StatusBadge status={c.status} /></td><td className="capitalize">{c.riskLevel}</td><td>{formatDate(c.createdAt)}</td></tr>)}</tbody></table></div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => exportCSV(accounts.map(a => ({ Account: a.accountNumber, Customer: a.customerName, Type: a.type, Currency: a.currency, Available: a.availableBalance, InTransit: a.inTransitBalance, Held: a.heldBalance, Status: a.status })), 'accounts_report.csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button></div>
          <div className="card-premium">
            <div className="p-4 border-b border-border bg-muted/30"><p className="text-sm font-medium">Total Available: <span className="font-mono text-emerald-600">{formatCurrency(accounts.reduce((s, a) => s + a.availableBalance, 0))}</span> | In Transit: <span className="font-mono text-amber-600">{formatCurrency(accounts.reduce((s, a) => s + a.inTransitBalance, 0))}</span> | Held: <span className="font-mono text-red-600">{formatCurrency(accounts.reduce((s, a) => s + a.heldBalance, 0))}</span></p></div>
            <table className="table-premium"><thead><tr><th>Account</th><th>Customer</th><th>Type</th><th>Currency</th><th>Available</th><th>In Transit</th><th>Held</th><th>Status</th></tr></thead>
              <tbody>{accounts.map(a => <tr key={a.id}><td className="font-mono">{a.accountNumber}</td><td>{a.customerName}</td><td className="capitalize">{a.type}</td><td>{a.currency}</td><td className="font-mono text-emerald-600">{formatCurrency(a.availableBalance, a.currency)}</td><td className="font-mono text-amber-600">{formatCurrency(a.inTransitBalance, a.currency)}</td><td className="font-mono text-red-600">{formatCurrency(a.heldBalance, a.currency)}</td><td><StatusBadge status={a.status} /></td></tr>)}</tbody></table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => exportCSV(transactions.map(t => ({ Reference: t.reference, Description: t.description, Type: t.type, Amount: t.amount, Currency: t.currency, Status: t.status, Date: t.timestamp })), 'transactions_report.csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button></div>
          <div className="card-premium">
            <div className="p-4 border-b border-border bg-muted/30"><p className="text-sm font-medium">Total: {transactions.length} transactions | Credits: <span className="font-mono text-emerald-600">{formatCurrency(transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0))}</span> | Debits: <span className="font-mono text-red-600">{formatCurrency(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0))}</span></p></div>
            <table className="table-premium"><thead><tr><th>Ref</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{transactions.slice(0, 50).map(t => <tr key={t.id}><td className="font-mono text-xs">{t.reference}</td><td>{t.description}</td><td className="capitalize">{t.type}</td><td className={cn("font-mono", t.type === 'credit' || t.type === 'interest' ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(t.amount, t.currency)}</td><td><StatusBadge status={t.status} /></td><td className="text-sm">{formatDateTime(t.timestamp)}</td></tr>)}</tbody></table>
          </div>
        </TabsContent>

        <TabsContent value="instruments" className="mt-4">
          <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => exportCSV(instruments.map(i => ({ Type: i.type, Reference: i.referenceNumber, Customer: i.customerName, Amount: i.amount, Currency: i.currency, IssueDate: i.issueDate, Maturity: i.maturityDate, Status: i.status })), 'instruments_report.csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button></div>
          <div className="card-premium"><table className="table-premium"><thead><tr><th>Type</th><th>Reference</th><th>Customer</th><th>Amount</th><th>Issue</th><th>Maturity</th><th>Status</th></tr></thead>
            <tbody>{instruments.map(i => <tr key={i.id}><td><StatusBadge status={i.type} /></td><td className="font-mono">{i.referenceNumber}</td><td>{i.customerName}</td><td className="font-mono">{formatCurrency(i.amount, i.currency)}</td><td>{formatDate(i.issueDate)}</td><td>{formatDate(i.maturityDate)}</td><td><StatusBadge status={i.status} /></td></tr>)}</tbody></table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
