import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore, generateId, addNotif } from '@/hooks/useDataStore';
import { formatDate, getInitials } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Users, Plus, Send, Trash2, Search, Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import OTPModal from '@/components/OTPModal';
import type { Beneficiary } from '@/types/banking';

export default function BeneficiariesPage() {
  const { user, customer } = useAuth();
  const store = useDataStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [pendingBen, setPendingBen] = useState<Partial<Beneficiary> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'internal' | 'external'>('internal');
  const [formName, setFormName] = useState('');
  const [formAccount, setFormAccount] = useState('');
  const [formBank, setFormBank] = useState('');
  const [formSwift, setFormSwift] = useState('');

  const beneficiaries = store.getBeneficiaries().filter(b => b.customerId === customer?.id);
  const internal = beneficiaries.filter(b => b.type === 'internal').filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));
  const external = beneficiaries.filter(b => b.type === 'external').filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddSubmit = () => {
    if (!formName || !formAccount) { toast.error('Please fill required fields'); return; }
    setPendingBen({ name: formName, accountNumber: formAccount, type: formType, bankName: formType === 'internal' ? 'Prominence Bank' : formBank, swiftCode: formType === 'external' ? formSwift : undefined });
    setShowAdd(false);
    setShowOtp(true);
  };

  const completeBenAdd = () => {
    if (!pendingBen) return;
    store.addBeneficiary({ id: generateId('ben'), customerId: customer?.id || '', ...pendingBen as Beneficiary, createdAt: new Date().toISOString() });
    addNotif(user?.id || '', 'general', 'Beneficiary Added', `${pendingBen.name} added.`);
    toast.success('Beneficiary added');
    setShowOtp(false); setPendingBen(null);
    setFormName(''); setFormAccount(''); setFormBank(''); setFormSwift('');
  };

  const BenCard = ({ ben }: { ben: Beneficiary }) => (
    <div className="card-premium p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">{getInitials(ben.name)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-card-foreground truncate">{ben.name}</p>
          <p className="text-sm text-muted-foreground font-mono truncate">{ben.accountNumber}</p>
          <p className="text-xs text-muted-foreground">{ben.bankName}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => window.location.href = '/transfer'}><Send className="w-3 h-3 mr-1" />Transfer</Button>
        <Button size="sm" variant="outline" onClick={() => setDeleteId(ben.id)}><Trash2 className="w-3 h-3" /></Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-card-foreground">Beneficiaries</h1>
        <Button className="gradient-primary text-white" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" />Add Beneficiary</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      <Tabs defaultValue="internal">
        <TabsList><TabsTrigger value="internal"><Building2 className="w-4 h-4 mr-1" />Internal ({internal.length})</TabsTrigger><TabsTrigger value="external"><Globe className="w-4 h-4 mr-1" />External ({external.length})</TabsTrigger></TabsList>
        <TabsContent value="internal" className="mt-4"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{internal.map(b => <BenCard key={b.id} ben={b} />)}{internal.length === 0 && <div className="col-span-full card-premium p-12 text-center text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No internal beneficiaries</p></div>}</div></TabsContent>
        <TabsContent value="external" className="mt-4"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{external.map(b => <BenCard key={b.id} ben={b} />)}{external.length === 0 && <div className="col-span-full card-premium p-12 text-center text-muted-foreground"><Globe className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No external beneficiaries</p></div>}</div></TabsContent>
      </Tabs>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add New Beneficiary</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2"><Button variant={formType === 'internal' ? 'default' : 'outline'} className="flex-1" onClick={() => setFormType('internal')}>Internal</Button><Button variant={formType === 'external' ? 'default' : 'outline'} className="flex-1" onClick={() => setFormType('external')}>External</Button></div>
            <Input placeholder="Full Name *" value={formName} onChange={e => setFormName(e.target.value)} />
            <Input placeholder="Account Number *" value={formAccount} onChange={e => setFormAccount(e.target.value)} />
            {formType === 'external' && <><Input placeholder="Bank Name *" value={formBank} onChange={e => setFormBank(e.target.value)} /><Input placeholder="SWIFT Code" value={formSwift} onChange={e => setFormSwift(e.target.value)} /></>}
            <p className="text-xs text-muted-foreground">OTP verification required</p>
            <Button className="w-full gradient-primary text-white" onClick={handleAddSubmit}>Continue to OTP</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Remove Beneficiary?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">This cannot be undone.</p><div className="flex gap-3 mt-4"><Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={() => { if(deleteId) { store.deleteBeneficiary(deleteId); toast.success('Removed'); setDeleteId(null); } }}>Remove</Button></div></DialogContent>
      </Dialog>
      <OTPModal open={showOtp} onClose={() => setShowOtp(false)} onVerify={completeBenAdd} email={user?.email || ''} purpose="Adding New Beneficiary" />
    </div>
  );
}
