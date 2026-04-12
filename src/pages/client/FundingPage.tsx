import { useDataStore } from '@/hooks/useDataStore';
import { Copy, Check, Printer, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function FundingPage() {
  const store = useDataStore();
  const wireSettings = store.getWireSettings();
  const wallets = store.getWalletAddresses();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); toast.success('Copied'); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-card-foreground">Funding Instructions</h1><Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button></div>
      <div className="card-premium p-6"><h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Wire Transfer Instructions</h2><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: wireSettings.instructions }} /></div>
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6"><h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" />Important Notes</h3><ul className="text-sm text-amber-700 space-y-2 list-disc list-inside"><li>Always include your account number in the reference</li><li>International wires may take 3-5 business days</li><li>Contact your relationship manager for large transfers</li></ul></div>
      <div className="card-premium p-6"><h2 className="text-lg font-semibold text-card-foreground mb-4">Cryptocurrency Deposit Addresses</h2><div className="space-y-4">{Object.entries(wallets).map(([coin, addr]) => (<div key={coin} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"><div><p className="font-semibold text-card-foreground">{coin}</p><p className="text-sm text-muted-foreground font-mono break-all">{addr}</p></div><button onClick={() => copy(addr, coin)} className="p-1 rounded hover:bg-muted">{copied === coin ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}</button></div>))}</div></div>
    </div>
  );
}
