import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit, addNotif } from '@/lib/dataStore';
import { useDebounce } from '@/hooks/useDebounce';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Pencil, Trash2, FileText, Copy } from 'lucide-react';
import type { Instrument, InstrumentType, Currency } from '@/types/banking';

const typeLabels: Record<string, string> = {
  cd: 'Certificate of Deposit', sblc: 'Standby Letter of Credit', bg: 'Bank Guarantee',
  skr: 'Safe Keeping Receipt', bcc: 'Bank Certified Check', pof: 'Proof of Funds',
  bf: 'Block Funds', ktt: 'Key Tested Telex', swift: 'SWIFT Instruments',
};

export default function ProductsPage() {
  const { type } = useParams<{ type: string }>();
  const store = useDataStore();
  const { user } = useAuth();
  const instruments = store.getInstruments();
  const customers = store.getCustomers();
  const cdRates = store.getCDRates();

  const instType = type?.toUpperCase() as InstrumentType;
  const typeLabel = type ? typeLabels[type] || 'Banking Products' : 'Banking Products';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState('basic');

  const emptyInst: Partial<Instrument> = { type: instType, currency: 'USD', status: 'active', details: {}, messageBody: '' };
  const [form, setForm] = useState<Partial<Instrument>>(emptyInst);

  const filtered = useMemo(() => instruments.filter(i => {
    if (instType && i.type !== instType) return false;
    if (debouncedSearch && !i.referenceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) && !i.customerName.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (customerFilter !== 'all' && i.customerId !== customerFilter) return false;
    return true;
  }), [instruments, instType, debouncedSearch, customerFilter]);

  const updateDetail = (key: string, value: unknown) => setForm(p => ({ ...p, details: { ...p.details as Record<string, unknown>, [key]: value } }));

  const handleSave = useCallback(() => {
    if (!form.customerId || !form.referenceNumber || !form.amount) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    const cust = customers.find(c => c.id === form.customerId);
    const isEdit = !!form.id;

    if (isEdit) {
      dataStore.updateInstrument(form.id!, form);
      addAudit(user!.id, user!.name, 'Updated', 'Instruments', form.id, form.referenceNumber, `Updated ${instType} instrument`);
    } else {
      const inst: Instrument = {
        ...form as Instrument,
        id: generateId('inst'),
        customerName: cust?.name || '',
        createdAt: new Date().toISOString(),
      };
      dataStore.addInstrument(inst);
      addAudit(user!.id, user!.name, 'Created', 'Instruments', inst.id, inst.referenceNumber, `Created ${instType} for ${cust?.name}`);
      addNotif(form.customerId!, 'instrument', 'New Instrument Issued', `A ${instType} (${form.referenceNumber}) has been issued to your account.`);
    }
    toast({ title: `✓ ${instType} ${isEdit ? 'updated' : 'saved'} and published to ${cust?.name}'s portal` });
    setShowForm(false);
    setForm(emptyInst);
  }, [form, customers, instType, user]);

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    const inst = instruments.find(i => i.id === deleteId);
    dataStore.deleteInstrument(deleteId);
    addAudit(user!.id, user!.name, 'Deleted', 'Instruments', deleteId, inst?.referenceNumber, `Deleted ${instType}`);
    toast({ title: 'Instrument Deleted', variant: 'destructive' });
    setDeleteId(null);
  }, [deleteId, instruments, instType, user]);

  const detailInst = showDetail ? instruments.find(i => i.id === showDetail) : null;

  const renderFormFields = () => {
    const d = (form.details || {}) as Record<string, any>;
    switch (instType) {
      case 'CD': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Term *</Label><Select value={d.term || ''} onValueChange={v => updateDetail('term', v)}><SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger><SelectContent><SelectItem value="1 Year">1 Year</SelectItem><SelectItem value="18 Months">18 Months</SelectItem><SelectItem value="2 Years">2 Years</SelectItem><SelectItem value="3 Years">3 Years</SelectItem></SelectContent></Select></div>
        <div><Label>Interest Rate (%)</Label><Input type="number" step="0.01" value={d.interestRate || ''} onChange={e => updateDetail('interestRate', parseFloat(e.target.value))} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Applicant</Label><Input value={d.applicant || ''} onChange={e => updateDetail('applicant', e.target.value)} /></div><div><Label>Beneficiary</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div></div>
        <div><Label>Applicant Address</Label><Input value={d.applicantAddress || ''} onChange={e => updateDetail('applicantAddress', e.target.value)} /></div>
        <div><Label>Beneficiary Address</Label><Input value={d.beneficiaryAddress || ''} onChange={e => updateDetail('beneficiaryAddress', e.target.value)} /></div>
        <div><Label>Monthly Yield Credit To</Label><Input value={d.monthlyYieldCreditTo || ''} onChange={e => updateDetail('monthlyYieldCreditTo', e.target.value)} /></div>
      </>);
      case 'SBLC': case 'BG': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Receiving Bank *</Label><Input value={d.receivingBank || ''} onChange={e => updateDetail('receivingBank', e.target.value)} /></div><div><Label>SWIFT Code *</Label><Input value={d.bankSwiftCode || ''} onChange={e => updateDetail('bankSwiftCode', e.target.value)} /></div></div>
        <div><Label>Attention Officer</Label><Input value={d.attentionOfficer || ''} onChange={e => updateDetail('attentionOfficer', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Beneficiary *</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div><div><Label>Address *</Label><Input value={d.beneficiaryAddress || ''} onChange={e => updateDetail('beneficiaryAddress', e.target.value)} /></div></div>
      </>);
      case 'SKR': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Company Name *</Label><Input value={d.companyName || ''} onChange={e => updateDetail('companyName', e.target.value)} /></div><div><Label>Market Value *</Label><Input type="number" value={d.marketValue || ''} onChange={e => updateDetail('marketValue', parseFloat(e.target.value))} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Interest Date</Label><Input type="date" value={d.interestDate || ''} onChange={e => updateDetail('interestDate', e.target.value)} /></div><div><Label>Interest Amount</Label><Input type="number" value={d.interestAmount || ''} onChange={e => updateDetail('interestAmount', parseFloat(e.target.value))} /></div></div>
        <div><Label>Restrictions</Label><Input value={d.restrictions || ''} onChange={e => updateDetail('restrictions', e.target.value)} /></div>
        <div className="flex gap-4"><Label>Full Bank Responsibility *</Label><div className="flex gap-2"><Button size="sm" variant={d.fullBankResponsibility === true ? 'default' : 'outline'} onClick={() => updateDetail('fullBankResponsibility', true)}>Yes</Button><Button size="sm" variant={d.fullBankResponsibility === false ? 'default' : 'outline'} onClick={() => updateDetail('fullBankResponsibility', false)}>No</Button></div></div>
        <div><Label>Security Description *</Label><Textarea className="font-mono min-h-[120px]" value={d.securityDescription || ''} onChange={e => updateDetail('securityDescription', e.target.value)} /></div>
      </>);
      case 'BCC': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Draft Number *</Label><Input value={d.draftNumber || form.referenceNumber || ''} onChange={e => updateDetail('draftNumber', e.target.value)} /></div><div><Label>Beneficiary *</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div></div>
        <div><Label>Amount in Words</Label><Input value={d.amountInWords || ''} onChange={e => updateDetail('amountInWords', e.target.value)} /></div>
      </>);
      case 'POF': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Certificate Number *</Label><Input value={d.certificateNumber || form.referenceNumber || ''} onChange={e => updateDetail('certificateNumber', e.target.value)} /></div><div><Label>Account Holder *</Label><Input value={d.accountHolder || ''} onChange={e => updateDetail('accountHolder', e.target.value)} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Account Number *</Label><Input value={d.accountNumber || ''} onChange={e => updateDetail('accountNumber', e.target.value)} /></div><div><Label>Account Balance *</Label><Input type="number" value={d.accountBalance || ''} onChange={e => updateDetail('accountBalance', parseFloat(e.target.value))} /></div></div>
      </>);
      case 'BF': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Applicant</Label><Input value={d.applicant || ''} onChange={e => updateDetail('applicant', e.target.value)} /></div><div><Label>Beneficiary</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div></div>
        <div><Label>Applicant Address</Label><Input value={d.applicantAddress || ''} onChange={e => updateDetail('applicantAddress', e.target.value)} /></div>
        <div><Label>Beneficiary Address</Label><Input value={d.beneficiaryAddress || ''} onChange={e => updateDetail('beneficiaryAddress', e.target.value)} /></div>
      </>);
      case 'KTT': return (
        <Tabs value={formTab} onValueChange={setFormTab}>
          <TabsList className="w-full"><TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger><TabsTrigger value="receiver" className="flex-1">Receiver</TabsTrigger><TabsTrigger value="remitter" className="flex-1">Remitter</TabsTrigger><TabsTrigger value="message" className="flex-1">Message</TabsTrigger></TabsList>
          <TabsContent value="basic" className="space-y-3 mt-3">
            <div><Label>Offering Bank</Label><Input value={d.issuer || ''} onChange={e => updateDetail('issuer', e.target.value)} /></div>
          </TabsContent>
          <TabsContent value="receiver" className="space-y-3 mt-3">
            <div><Label>Receiving Bank *</Label><Input value={d.receiver || ''} onChange={e => updateDetail('receiver', e.target.value)} /></div>
            <div><Label>Attention Officer</Label><Input value={d.attentionOfficer || ''} onChange={e => updateDetail('attentionOfficer', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Beneficiary *</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div><div><Label>Telex Code *</Label><Input value={d.telexCode || ''} onChange={e => updateDetail('telexCode', e.target.value)} /></div></div>
            <div><Label>Address *</Label><Input value={d.beneficiaryAddress || ''} onChange={e => updateDetail('beneficiaryAddress', e.target.value)} /></div>
          </TabsContent>
          <TabsContent value="remitter" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-4"><div><Label>Account Name *</Label><Input value={d.remitter || ''} onChange={e => updateDetail('remitter', e.target.value)} /></div><div><Label>Account Number *</Label><Input value={d.remitterAccountNumber || ''} onChange={e => updateDetail('remitterAccountNumber', e.target.value)} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Bank Name *</Label><Input value={d.remitterBankName || ''} onChange={e => updateDetail('remitterBankName', e.target.value)} /></div><div><Label>Bank Address</Label><Input value={d.remitterBankAddress || ''} onChange={e => updateDetail('remitterBankAddress', e.target.value)} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Telex Code</Label><Input value={d.remitterTelexCode || ''} onChange={e => updateDetail('remitterTelexCode', e.target.value)} /></div><div><Label>Bank Officer</Label><Input value={d.remitterBankOfficer || ''} onChange={e => updateDetail('remitterBankOfficer', e.target.value)} /></div></div>
          </TabsContent>
          <TabsContent value="message" className="space-y-3 mt-3">
            <div><Label>Full KTT Message Body *</Label><Textarea className="font-mono min-h-[200px] bg-slate-900 text-white p-4 rounded-xl" value={form.messageBody || ''} onChange={e => setForm(p => ({ ...p, messageBody: e.target.value }))} placeholder="Enter full KTT message wording here..." /></div>
          </TabsContent>
        </Tabs>
      );
      case 'SWIFT': return (<>
        <div className="grid grid-cols-2 gap-4"><div><Label>Receiving Bank *</Label><Input value={d.receivingBank || ''} onChange={e => updateDetail('receivingBank', e.target.value)} /></div><div><Label>SWIFT Code *</Label><Input value={d.bankSwiftCode || ''} onChange={e => updateDetail('bankSwiftCode', e.target.value)} /></div></div>
        <div><Label>Attention Officer</Label><Input value={d.attentionOfficer || ''} onChange={e => updateDetail('attentionOfficer', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Beneficiary *</Label><Input value={d.beneficiary || ''} onChange={e => updateDetail('beneficiary', e.target.value)} /></div><div><Label>Address *</Label><Input value={d.beneficiaryAddress || ''} onChange={e => updateDetail('beneficiaryAddress', e.target.value)} /></div></div>
      </>);
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-card-foreground">{typeLabel}</h1><p className="text-muted-foreground">{filtered.length} instruments</p></div>
        <Button className="gradient-primary text-white" onClick={() => { setForm({ ...emptyInst, type: instType }); setFormTab('basic'); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add New</Button>
      </div>

      <div className="card-premium">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by reference or customer..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={customerFilter} onValueChange={setCustomerFilter}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Customers</SelectItem>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        {filtered.length === 0 ? <EmptyState icon={FileText} title={`No ${typeLabel}`} description="No instruments found" /> : (
          <div className="overflow-x-auto"><table className="table-premium"><thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Issue Date</th><th>Maturity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(i => (
              <tr key={i.id}><td className="font-mono">{i.referenceNumber}</td><td>{i.customerName}</td><td className="font-mono">{formatCurrency(i.amount, i.currency)}</td><td>{formatDate(i.issueDate)}</td><td>{formatDate(i.maturityDate)}</td><td><StatusBadge status={i.status} /></td>
                <td><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setShowDetail(i.id)}><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setForm(i); setFormTab('basic'); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></td></tr>
            ))}</tbody></table></div>
        )}
      </div>

      {/* Add/Edit */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? 'Edit' : 'Add'} {typeLabel}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer *</Label><Select value={form.customerId || ''} onValueChange={v => setForm(p => ({ ...p, customerId: v }))}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Reference Number *</Label><Input value={form.referenceNumber || ''} onChange={e => setForm(p => ({ ...p, referenceNumber: e.target.value }))} /></div>
              <div><Label>Amount *</Label><Input type="number" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Currency *</Label><Select value={form.currency || 'USD'} onValueChange={v => setForm(p => ({ ...p, currency: v as Currency }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CHF">CHF</SelectItem></SelectContent></Select></div>
              <div><Label>Issue Date *</Label><Input type="date" value={form.issueDate || ''} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} /></div>
              <div><Label>Maturity Date *</Label><Input type="date" value={form.maturityDate || ''} onChange={e => setForm(p => ({ ...p, maturityDate: e.target.value }))} /></div>
            </div>
            {renderFormFields()}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleSave}>{form.id ? 'Save & Publish' : 'Create & Publish'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          {detailInst && (
            <ScrollArea className="max-h-[75vh]">
              <DialogHeader><DialogTitle>{detailInst.type} — {detailInst.referenceNumber}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{detailInst.customerName}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Amount</Label><p className="font-mono text-lg font-bold">{formatCurrency(detailInst.amount, detailInst.currency)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Issue Date</Label><p>{formatDate(detailInst.issueDate)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Maturity Date</Label><p>{formatDate(detailInst.maturityDate)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Status</Label><StatusBadge status={detailInst.status} /></div>
                </div>
                {Object.entries(detailInst.details || {}).map(([k, v]) => (
                  <div key={k}><Label className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</Label><p className="font-medium">{String(v)}</p></div>
                ))}
                {detailInst.messageBody && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2"><Label className="text-xs text-muted-foreground">Message Body</Label>
                      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(detailInst.messageBody!); toast({ title: 'Copied!' }); }}><Copy className="w-3 h-3 mr-1" />Copy</Button>
                    </div>
                    <pre className="bg-slate-900 text-white p-4 rounded-xl font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[300px]">{detailInst.messageBody}</pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Instrument</AlertDialogTitle><AlertDialogDescription>This will permanently delete this instrument. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
