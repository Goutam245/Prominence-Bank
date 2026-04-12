import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit, addNotif } from '@/lib/dataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Pencil, Monitor, Trash2, Users,
  ArrowLeft, Shield, UserCheck, AlertTriangle
} from 'lucide-react';
import type { Customer, Account } from '@/types/banking';

const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Switzerland', 'Australia', 'Japan', 'Singapore', 'Hong Kong', 'United Arab Emirates', 'Brazil', 'India', 'China', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Italy', 'Spain', 'Portugal', 'Ireland', 'Belgium', 'Austria', 'New Zealand', 'South Africa', 'Mexico', 'Argentina', 'Chile'];
const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Real Estate', 'Energy', 'Retail', 'Transportation', 'Consulting', 'Legal', 'Education', 'Media', 'Agriculture', 'Mining', 'Other'];

const emptyCustomer: Partial<Customer> = {
  type: 'personal', name: '', email: '', phone: '', status: 'active', riskLevel: 'low',
  address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United States' },
};

export default function CustomersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useDataStore();
  const { user } = useAuth();

  const customers = store.getCustomers();
  const accounts = store.getAccounts();
  const instruments = store.getInstruments();
  const transactions = store.getTransactions();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Partial<Customer>>(emptyCustomer);
  const [formTab, setFormTab] = useState('basic');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Detail view
  const detailCustomer = id ? customers.find(c => c.id === id) : null;
  const [detailTab, setDetailTab] = useState('profile');

  const filtered = useMemo(() => {
    return customers.filter(c => {
      if (debouncedSearch && !c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) && !c.email.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      return true;
    });
  }, [customers, debouncedSearch, statusFilter, typeFilter]);

  const handleSave = useCallback(() => {
    if (!editCustomer.name || !editCustomer.email || !editCustomer.phone) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const isEdit = !!editCustomer.id;
    if (isEdit) {
      dataStore.updateCustomer(editCustomer.id!, editCustomer);
      addAudit(user!.id, user!.name, 'Updated', 'Customers', editCustomer.id, editCustomer.name, `Updated customer ${editCustomer.name}`);
      toast({ title: 'Customer Updated', description: `${editCustomer.name} has been updated.` });
    } else {
      const newCustomer: Customer = {
        ...emptyCustomer as Customer,
        ...editCustomer as Customer,
        id: generateId('cust'),
        createdAt: new Date().toISOString(),
      };
      dataStore.addCustomer(newCustomer);
      addAudit(user!.id, user!.name, 'Created', 'Customers', newCustomer.id, newCustomer.name, `Created ${newCustomer.type} customer`);
      toast({ title: 'Customer Created', description: `${newCustomer.name} has been added.` });
    }
    setShowForm(false);
    setEditCustomer(emptyCustomer);
  }, [editCustomer, user]);

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    const c = customers.find(x => x.id === deleteId);
    dataStore.deleteCustomer(deleteId);
    addAudit(user!.id, user!.name, 'Deleted', 'Customers', deleteId, c?.name, `Permanently deleted customer`);
    toast({ title: 'Customer Deleted', description: `${c?.name} has been removed.`, variant: 'destructive' });
    setDeleteId(null);
  }, [deleteId, customers, user]);

  const handleToggleStatus = useCallback((c: Customer) => {
    const newStatus = c.status === 'active' ? 'suspended' : 'active';
    dataStore.updateCustomer(c.id, { status: newStatus });
    addAudit(user!.id, user!.name, newStatus === 'suspended' ? 'Suspended' : 'Activated', 'Customers', c.id, c.name, `Status changed to ${newStatus}`);
    toast({ title: `Customer ${newStatus === 'suspended' ? 'Suspended' : 'Activated'}`, description: `${c.name} is now ${newStatus}.` });
  }, [user]);

  const handleImpersonate = useCallback((c: Customer) => {
    sessionStorage.setItem('impersonating', JSON.stringify({ customerId: c.id, customerName: c.name, adminId: user!.id }));
    addAudit(user!.id, user!.name, 'Impersonation', 'Customers', c.id, c.name, `Entered impersonation mode`);
    navigate('/dashboard');
  }, [user, navigate]);

  const custAccounts = useMemo(() => detailCustomer ? accounts.filter(a => a.customerId === detailCustomer.id) : [], [detailCustomer, accounts]);
  const custInstruments = useMemo(() => detailCustomer ? instruments.filter(i => i.customerId === detailCustomer.id) : [], [detailCustomer, instruments]);
  const custTransactions = useMemo(() => {
    if (!detailCustomer) return [];
    const accIds = custAccounts.map(a => a.id);
    return transactions.filter(t => accIds.includes(t.accountId));
  }, [detailCustomer, custAccounts, transactions]);

  // Detail view
  if (detailCustomer) {
    const totalBalance = custAccounts.reduce((s, a) => s + a.availableBalance + a.inTransitBalance, 0);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12"><AvatarFallback className={cn("text-white font-semibold", detailCustomer.type === 'business' ? 'bg-purple-600' : 'bg-primary')}>{getInitials(detailCustomer.name)}</AvatarFallback></Avatar>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">{detailCustomer.name}</h1>
                <p className="text-muted-foreground">{detailCustomer.email} · {detailCustomer.type}</p>
              </div>
            </div>
          </div>
          <StatusBadge status={detailCustomer.status} />
          <Button variant="outline" onClick={() => { setEditCustomer(detailCustomer); setShowForm(true); }}><Pencil className="w-4 h-4 mr-2" />Edit</Button>
          <Button variant="outline" onClick={() => handleImpersonate(detailCustomer)}><Monitor className="w-4 h-4 mr-2" />View as Client</Button>
        </div>

        <Tabs value={detailTab} onValueChange={setDetailTab}>
          <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="accounts">Accounts ({custAccounts.length})</TabsTrigger><TabsTrigger value="instruments">Instruments ({custInstruments.length})</TabsTrigger><TabsTrigger value="activity">Activity ({custTransactions.length})</TabsTrigger></TabsList>
          <TabsContent value="profile" className="card-premium p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label className="text-xs text-muted-foreground">Full Name</Label><p className="font-medium">{detailCustomer.name}</p></div>
              <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{detailCustomer.email}</p></div>
              <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{detailCustomer.phone}</p></div>
              <div><Label className="text-xs text-muted-foreground">Type</Label><p className="font-medium capitalize">{detailCustomer.type}</p></div>
              {detailCustomer.dateOfBirth && <div><Label className="text-xs text-muted-foreground">Date of Birth</Label><p className="font-medium">{formatDate(detailCustomer.dateOfBirth)}</p></div>}
              {detailCustomer.companyName && <div><Label className="text-xs text-muted-foreground">Company</Label><p className="font-medium">{detailCustomer.companyName}</p></div>}
              <div><Label className="text-xs text-muted-foreground">Risk Level</Label><p className="font-medium capitalize">{detailCustomer.riskLevel}</p></div>
              <div><Label className="text-xs text-muted-foreground">Member Since</Label><p className="font-medium">{formatDate(detailCustomer.createdAt)}</p></div>
              <div className="md:col-span-2"><Label className="text-xs text-muted-foreground">Address</Label><p className="font-medium">{[detailCustomer.address.line1, detailCustomer.address.line2, detailCustomer.address.city, detailCustomer.address.state, detailCustomer.address.postalCode, detailCustomer.address.country].filter(Boolean).join(', ')}</p></div>
              <div><Label className="text-xs text-muted-foreground">Total Balance</Label><p className="font-mono font-bold text-lg">{formatCurrency(totalBalance)}</p></div>
            </div>
          </TabsContent>
          <TabsContent value="accounts" className="mt-4">
            <div className="card-premium">
              <table className="table-premium"><thead><tr><th>Account #</th><th>Type</th><th>Currency</th><th>Available</th><th>In Transit</th><th>Held</th><th>Status</th></tr></thead>
                <tbody>{custAccounts.map(a => (
                  <tr key={a.id} className="cursor-pointer" onClick={() => navigate(`/admin/accounts/${a.id}`)}>
                    <td className="font-mono">{a.accountNumber}</td><td className="capitalize">{a.type}</td><td>{a.currency}</td>
                    <td className="font-mono text-emerald-600">{formatCurrency(a.availableBalance, a.currency)}</td>
                    <td className="font-mono text-amber-600">{formatCurrency(a.inTransitBalance, a.currency)}</td>
                    <td className="font-mono text-red-600">{formatCurrency(a.heldBalance, a.currency)}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="instruments" className="mt-4">
            <div className="card-premium">
              {custInstruments.length === 0 ? <EmptyState icon={Shield} title="No Instruments" description="No banking instruments for this customer" /> : (
                <table className="table-premium"><thead><tr><th>Type</th><th>Reference</th><th>Amount</th><th>Issue Date</th><th>Maturity</th><th>Status</th></tr></thead>
                  <tbody>{custInstruments.map(i => (
                    <tr key={i.id}><td><StatusBadge status={i.type} /></td><td className="font-mono">{i.referenceNumber}</td><td className="font-mono">{formatCurrency(i.amount, i.currency)}</td><td>{formatDate(i.issueDate)}</td><td>{formatDate(i.maturityDate)}</td><td><StatusBadge status={i.status} /></td></tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </TabsContent>
          <TabsContent value="activity" className="mt-4">
            <div className="card-premium">
              {custTransactions.length === 0 ? <EmptyState icon={Users} title="No Activity" description="No transactions recorded" /> : (
                <table className="table-premium"><thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>{custTransactions.slice(0, 20).map(t => (
                    <tr key={t.id}><td className="text-muted-foreground">{formatDate(t.timestamp)}</td><td className="font-mono text-xs">{t.reference}</td><td>{t.description}</td><td className="capitalize">{t.type}</td>
                      <td className={cn("font-mono", t.type === 'credit' || t.type === 'interest' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'credit' || t.type === 'interest' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}</td>
                      <td><StatusBadge status={t.status} /></td></tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Customers</h1>
          <p className="text-muted-foreground">{customers.length} total customers</p>
        </div>
        <Button className="gradient-primary text-white" onClick={() => { setEditCustomer(emptyCustomer); setFormTab('basic'); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Customer</Button>
      </div>

      <div className="card-premium">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="frozen">Frozen</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="personal">Personal</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent></Select>
        </div>

        {filtered.length === 0 ? <EmptyState icon={Users} title="No customers found" description="Try adjusting your filters" /> : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead><tr><th>#</th><th>Customer</th><th>Email</th><th>Type</th><th>Accounts</th><th>Total Balance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c, idx) => {
                  const custAccs = accounts.filter(a => a.customerId === c.id);
                  const bal = custAccs.reduce((s, a) => s + a.availableBalance, 0);
                  return (
                    <tr key={c.id}>
                      <td className="text-muted-foreground">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9"><AvatarFallback className={cn("text-white text-xs font-semibold", c.type === 'business' ? 'bg-purple-600' : 'bg-primary')}>{getInitials(c.name)}</AvatarFallback></Avatar>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{c.email}</td>
                      <td className="capitalize">{c.type}</td>
                      <td>{custAccs.length}</td>
                      <td className="font-mono font-medium">{formatCurrency(bal)}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title="View" onClick={() => navigate(`/admin/customers/${c.id}`)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditCustomer(c); setFormTab('basic'); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" title="View as Client" onClick={() => handleImpersonate(c)}><Monitor className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" title={c.status === 'active' ? 'Suspend' : 'Activate'} onClick={() => handleToggleStatus(c)}>
                            {c.status === 'active' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteId(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editCustomer.id ? 'Edit Customer' : 'Create Customer'}</DialogTitle></DialogHeader>
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="w-full"><TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger><TabsTrigger value="address" className="flex-1">Address</TabsTrigger><TabsTrigger value="status" className="flex-1">Status</TabsTrigger></TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="flex gap-4">
                <Button variant={editCustomer.type === 'personal' ? 'default' : 'outline'} className="flex-1" onClick={() => setEditCustomer(p => ({ ...p, type: 'personal' }))}> Personal</Button>
                <Button variant={editCustomer.type === 'business' ? 'default' : 'outline'} className="flex-1" onClick={() => setEditCustomer(p => ({ ...p, type: 'business' }))}> Business</Button>
              </div>
              {editCustomer.type === 'personal' ? (
                <>
                  <div><Label>Full Name *</Label><Input value={editCustomer.name || ''} onChange={e => setEditCustomer(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email *</Label><Input type="email" value={editCustomer.email || ''} onChange={e => setEditCustomer(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><Label>Phone *</Label><Input value={editCustomer.phone || ''} onChange={e => setEditCustomer(p => ({ ...p, phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Date of Birth</Label><Input type="date" value={editCustomer.dateOfBirth || ''} onChange={e => setEditCustomer(p => ({ ...p, dateOfBirth: e.target.value }))} /></div>
                    <div><Label>Nationality</Label><Select value={(editCustomer as any).nationality || ''} onValueChange={v => setEditCustomer(p => ({ ...p, nationality: v } as any))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                </>
              ) : (
                <>
                  <div><Label>Company Name *</Label><Input value={editCustomer.companyName || editCustomer.name || ''} onChange={e => setEditCustomer(p => ({ ...p, companyName: e.target.value, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Company Email *</Label><Input type="email" value={editCustomer.email || ''} onChange={e => setEditCustomer(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><Label>Phone *</Label><Input value={editCustomer.phone || ''} onChange={e => setEditCustomer(p => ({ ...p, phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Industry</Label><Select value={(editCustomer as any).industry || ''} onValueChange={v => setEditCustomer(p => ({ ...p, industry: v } as any))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Registration Number</Label><Input value={(editCustomer as any).registrationNumber || ''} onChange={e => setEditCustomer(p => ({ ...p, registrationNumber: e.target.value } as any))} /></div>
                  </div>
                  <div><Label>Directors / Signatories</Label><Textarea value={(editCustomer as any).directors || ''} onChange={e => setEditCustomer(p => ({ ...p, directors: e.target.value } as any))} /></div>
                </>
              )}
              <div><Label>Internal Notes</Label><Textarea value={editCustomer.notes || ''} onChange={e => setEditCustomer(p => ({ ...p, notes: e.target.value }))} /></div>
            </TabsContent>
            <TabsContent value="address" className="space-y-4 mt-4">
              <div><Label>Address Line 1 *</Label><Input value={editCustomer.address?.line1 || ''} onChange={e => setEditCustomer(p => ({ ...p, address: { ...p.address!, line1: e.target.value } }))} /></div>
              <div><Label>Address Line 2</Label><Input value={editCustomer.address?.line2 || ''} onChange={e => setEditCustomer(p => ({ ...p, address: { ...p.address!, line2: e.target.value } }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City *</Label><Input value={editCustomer.address?.city || ''} onChange={e => setEditCustomer(p => ({ ...p, address: { ...p.address!, city: e.target.value } }))} /></div>
                <div><Label>State / Province</Label><Input value={editCustomer.address?.state || ''} onChange={e => setEditCustomer(p => ({ ...p, address: { ...p.address!, state: e.target.value } }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Postal Code</Label><Input value={editCustomer.address?.postalCode || ''} onChange={e => setEditCustomer(p => ({ ...p, address: { ...p.address!, postalCode: e.target.value } }))} /></div>
                <div><Label>Country</Label><Select value={editCustomer.address?.country || 'United States'} onValueChange={v => setEditCustomer(p => ({ ...p, address: { ...p.address!, country: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </TabsContent>
            <TabsContent value="status" className="space-y-4 mt-4">
              <div><Label>Account Status</Label><Select value={editCustomer.status || 'active'} onValueChange={v => setEditCustomer(p => ({ ...p, status: v as Customer['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="frozen">Frozen</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
              <div><Label>Risk Level</Label><Select value={editCustomer.riskLevel || 'low'} onValueChange={v => setEditCustomer(p => ({ ...p, riskLevel: v as Customer['riskLevel'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="gradient-primary text-white" onClick={handleSave}>{editCustomer.id ? 'Save Changes' : 'Create Customer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete {customers.find(c => c.id === deleteId)?.name} and all associated data. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
