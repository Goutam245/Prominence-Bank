import { useState, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId } from '@/lib/dataStore';
import type { ServiceRequest } from '@/lib/dataStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { FileText, MapPin, XCircle, Calendar, Shield, HelpCircle, Plus, Upload } from 'lucide-react';

const serviceTypes = [
  { type: 'address_change', label: 'Address/Contact Change', icon: MapPin, description: 'Update your personal or business address' },
  { type: 'account_closure', label: 'Account Closure Request', icon: XCircle, description: 'Request to close an account' },
  { type: 'extended_statement', label: 'Extended Statement', icon: Calendar, description: 'Request extended account statement' },
  { type: 'instrument_lease', label: 'Instrument Lease', icon: Shield, description: 'Request instrument lease (SBLC/BG/KTT)' },
  { type: 'general', label: 'General Request', icon: HelpCircle, description: 'Any other service request' },
  { type: 'document_upload', label: 'Document Upload', icon: Upload, description: 'Upload documents for verification' },
];

export default function ClientServicesPage() {
  const store = useDataStore();
  const { user } = useAuth();
  const customers = store.getCustomers();
  const customer = customers.find(c => c.email === user?.email);
  const requests = store.getServiceRequests().filter(r => r.customerId === customer?.id);

  const [showForm, setShowForm] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [details, setDetails] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(() => {
    if (!showForm || !form.subject || !form.description) { toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' }); return; }
    const sr: ServiceRequest = {
      id: generateId('sr'), customerId: customer!.id, customerName: customer!.name,
      type: showForm as ServiceRequest['type'], subject: form.subject, description: form.description,
      status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      details: Object.keys(details).length > 0 ? details : undefined,
    };
    dataStore.addServiceRequest(sr);
    toast({ title: 'Request Submitted', description: `Reference: ${sr.id}` });
    setShowForm(null);
    setForm({ subject: '', description: '' });
    setDetails({});
  }, [showForm, form, details, customer]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-card-foreground">Services & Requests</h1><p className="text-muted-foreground">Submit service requests to the bank</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceTypes.map(st => (
          <div key={st.type} className="card-premium p-6 cursor-pointer hover:-translate-y-1 transition-all" onClick={() => { setShowForm(st.type); setForm({ subject: st.label, description: '' }); }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><st.icon className="w-6 h-6 text-primary" /></div>
            <h3 className="font-semibold mb-1">{st.label}</h3>
            <p className="text-sm text-muted-foreground">{st.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <div className="card-premium"><EmptyState icon={FileText} title="No requests" description="Submit your first service request above" /></div>
        ) : (
          <div className="card-premium">
            <table className="table-premium"><thead><tr><th>Ref</th><th>Type</th><th>Subject</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>{requests.map(r => (
                <tr key={r.id}><td className="font-mono text-xs">{r.id}</td><td className="capitalize">{r.type.replace(/_/g, ' ')}</td><td>{r.subject}</td><td><StatusBadge status={r.status} /></td><td>{formatDate(r.createdAt)}</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </div>

      <Dialog open={!!showForm} onOpenChange={() => setShowForm(null)}>
        <DialogContent><DialogHeader><DialogTitle>{serviceTypes.find(s => s.type === showForm)?.label || 'Service Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            {showForm === 'instrument_lease' && (
              <>
                <div><Label>Instrument Type</Label><Select value={details.instrumentType || ''} onValueChange={v => setDetails(p => ({ ...p, instrumentType: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="SBLC">SBLC</SelectItem><SelectItem value="BG">Bank Guarantee</SelectItem><SelectItem value="KTT">KTT</SelectItem><SelectItem value="Bank Draft">Bank Draft</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Amount Needed</Label><Input value={details.amount || ''} onChange={e => setDetails(p => ({ ...p, amount: e.target.value }))} /></div>
                  <div><Label>Duration</Label><Input value={details.duration || ''} onChange={e => setDetails(p => ({ ...p, duration: e.target.value }))} placeholder="e.g., 12 months" /></div>
                </div>
              </>
            )}
            <div><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your request in detail..." className="min-h-[120px]" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(null)}>Cancel</Button><Button className="gradient-primary text-white" onClick={handleSubmit}>Submit Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
