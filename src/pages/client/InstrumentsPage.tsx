import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore } from '@/hooks/useDataStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { FileText, Eye, Download, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Instrument } from '@/types/banking';

const typeColors: Record<string, string> = { CD: 'bg-success/10 text-success', SBLC: 'bg-purple-500/10 text-purple-600', BG: 'badge-warning', SKR: 'badge-info', BCC: 'bg-pink-500/10 text-pink-600', POF: 'bg-teal-500/10 text-teal-600', BF: 'bg-orange-500/10 text-orange-600', KTT: 'bg-primary/10 text-primary', SWIFT: 'bg-indigo-500/10 text-indigo-600' };
const typeNames: Record<string, string> = { CD: 'Certificate of Deposit', SBLC: 'Standby Letter of Credit', BG: 'Bank Guarantee', SKR: 'Safe Keeping Receipt', BCC: 'Bank Certified Check', POF: 'Proof of Funds', BF: 'Block Funds', KTT: 'Key Tested Telex', SWIFT: 'SWIFT Instrument' };

export default function InstrumentsPage() {
  const { customer } = useAuth();
  const store = useDataStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Instrument | null>(null);

  const instruments = store.getInstruments().filter(i => i.customerId === customer?.id).filter(i => typeFilter === 'all' || i.type === typeFilter).filter(i => !search || i.referenceNumber.toLowerCase().includes(search.toLowerCase()));
  const types = [...new Set(store.getInstruments().filter(i => i.customerId === customer?.id).map(i => i.type))];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Bank Instruments</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="flex gap-2 flex-wrap"><Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('all')}>All</Button>{types.map(t => <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>{t}</Button>)}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {instruments.map(inst => (
          <div key={inst.id} className="card-premium p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-4"><span className={cn("px-3 py-1.5 rounded-lg text-sm font-bold", typeColors[inst.type])}>{inst.type}</span><span className={cn("px-2 py-1 rounded-full text-xs font-semibold capitalize", inst.status === 'active' ? "badge-success" : "badge-warning")}>{inst.status}</span></div>
            <p className="font-bold text-lg text-card-foreground font-mono">{inst.referenceNumber}</p>
            <p className="text-2xl font-bold text-primary font-mono mt-2">{formatCurrency(inst.amount, inst.currency)}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground"><p>Issued: {formatDate(inst.issueDate)}</p><p>Maturity: {formatDate(inst.maturityDate)}</p></div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setSelected(inst)}><Eye className="w-4 h-4 mr-1" />View Details</Button>
          </div>
        ))}
        {instruments.length === 0 && <div className="col-span-full card-premium p-12 text-center"><FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="font-semibold text-lg mb-2">No Instruments</h3><p className="text-muted-foreground">Your instruments will appear here when issued.</p></div>}
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-3"><span className={cn("px-3 py-1.5 rounded-lg text-sm font-bold", typeColors[selected?.type || ''])}>{selected?.type}</span><span className="font-mono">{selected?.referenceNumber}</span></DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selected && <div className="space-y-6 py-4">
              <div className="text-center p-6 rounded-xl bg-muted/30"><p className="text-sm text-muted-foreground">{typeNames[selected.type]}</p><p className="text-3xl font-bold text-primary font-mono mt-1">{formatCurrency(selected.amount, selected.currency)}</p></div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Issue Date</p><p className="font-medium">{formatDate(selected.issueDate)}</p></div>
                <div><p className="text-muted-foreground text-xs">Maturity Date</p><p className="font-medium">{formatDate(selected.maturityDate)}</p></div>
              </div>
              <div className="space-y-3"><h3 className="font-semibold border-b border-border pb-2">Details</h3>
                {Object.entries(selected.details).map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span><span className="font-medium text-right max-w-[60%]">{String(v)}</span></div>)}
              </div>
              {selected.messageBody && <div><h3 className="font-semibold border-b border-border pb-2 mb-3">Message Body</h3><pre className="bg-slate-900 text-green-400 p-6 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96 leading-relaxed">{selected.messageBody}</pre></div>}
              <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button><Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" />Download PDF</Button></div>
            </div>}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
