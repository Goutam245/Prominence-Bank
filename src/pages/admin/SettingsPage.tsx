import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/hooks/useDataStore';
import { dataStore, generateId, addAudit } from '@/lib/dataStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Save, Copy, Key, AlertTriangle, Trash2, Plus, Send, Eye, EyeOff } from 'lucide-react';
import type { CDInterestTier, Currency } from '@/types/banking';
import type { OTPRecord, SMTPConfig } from '@/lib/dataStore';

export default function SettingsPage() {
  const { section } = useParams<{ section: string }>();
  const store = useDataStore();
  const { user } = useAuth();
  const customers = store.getCustomers();

  const [activeTab, setActiveTab] = useState(section || 'fees');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Settings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap"><TabsTrigger value="fees">Fee Table</TabsTrigger><TabsTrigger value="wallets">Wallet Addresses</TabsTrigger><TabsTrigger value="cd-rates">CD Interest Rates</TabsTrigger><TabsTrigger value="wire">Wire Settings</TabsTrigger><TabsTrigger value="otp">Generate OTP</TabsTrigger><TabsTrigger value="smtp">SMTP Config</TabsTrigger></TabsList>

        <TabsContent value="fees"><FeeTableTab /></TabsContent>
        <TabsContent value="wallets"><WalletTab /></TabsContent>
        <TabsContent value="cd-rates"><CDRatesTab /></TabsContent>
        <TabsContent value="wire"><WireTab /></TabsContent>
        <TabsContent value="otp"><OTPTab /></TabsContent>
        <TabsContent value="smtp"><SMTPTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function FeeTableTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const [fees, setFees] = useState(store.getFeeTable());
  const handleSave = () => {
    dataStore.setFeeTable(fees);
    addAudit(user!.id, user!.name, 'Updated', 'Settings', undefined, 'Fee Table', 'Updated fee table');
    toast({ title: 'Fee Table Saved' });
  };
  const fields = [
    { key: 'monthlyFee', label: 'Monthly Fee', suffix: '$' },
    { key: 'internationalTransactionFee', label: 'International Transfer Fee', suffix: '%' },
    { key: 'bankToBankFee', label: 'Bank to Bank Fee', suffix: '%' },
    { key: 'bankToOtherBankFee', label: 'Bank to Other Bank Fee', suffix: '%' },
    { key: 'chequeCancellationFee', label: 'Cheque Cancellation Fee', suffix: '$' },
    { key: 'creditCardConversionFee', label: 'Credit Card Conversion Fee', suffix: '%' },
    { key: 'loanInterestRate', label: 'Loan Interest Rate', suffix: '%' },
    { key: 'latePaymentFeePerDay', label: 'Late Payment Fee per Day', suffix: '%' },
    { key: 'cryptoTransferFee', label: 'Crypto Transfer Fee', suffix: '%' },
  ];
  return (
    <div className="card-premium p-6 mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}><Label>{f.label} ({f.suffix})</Label><Input type="number" step="0.01" value={(fees as any)[f.key]} onChange={e => setFees(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} /></div>
        ))}
      </div>
      <Button className="gradient-primary text-white" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Fee Table</Button>
    </div>
  );
}

function WalletTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const [wallets, setWallets] = useState(store.getWalletAddresses());
  const [active, setActive] = useState<Record<string, boolean>>({ BTC: true, ETH: true, XLM: true, BCH: true, PAX: true });
  const coins = [
    { key: 'BTC', label: 'Bitcoin', icon: '₿' },
    { key: 'ETH', label: 'Ethereum', icon: 'Ξ' },
    { key: 'XLM', label: 'Stellar', icon: '✦' },
    { key: 'BCH', label: 'Bitcoin Cash', icon: '₿' },
    { key: 'PAX', label: 'USD Pax', icon: '$' },
  ];
  const handleSave = () => {
    dataStore.setWalletAddresses(wallets);
    addAudit(user!.id, user!.name, 'Updated', 'Settings', undefined, 'Wallet Addresses', 'Updated crypto wallet addresses');
    toast({ title: 'Wallet Addresses Saved' });
  };
  return (
    <div className="card-premium p-6 mt-4 space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /><p className="text-sm text-amber-800">These addresses are shown to clients for deposits. Double-check before saving. Changes take effect immediately.</p></div>
      {coins.map(c => (
        <div key={c.key} className="flex items-center gap-4">
          <span className="text-2xl w-8">{c.icon}</span>
          <div className="flex-1"><Label>{c.label} ({c.key})</Label><Input className="font-mono text-sm" value={(wallets as any)[c.key]} onChange={e => setWallets(p => ({ ...p, [c.key]: e.target.value }))} /></div>
          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText((wallets as any)[c.key]); toast({ title: 'Copied!' }); }}><Copy className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2"><Switch checked={active[c.key]} onCheckedChange={v => setActive(p => ({ ...p, [c.key]: v }))} /><span className="text-xs">{active[c.key] ? 'Active' : 'Inactive'}</span></div>
        </div>
      ))}
      <Button className="gradient-primary text-white" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Addresses</Button>
    </div>
  );
}

function CDRatesTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const [rates, setRates] = useState(store.getCDRates());
  const [termTab, setTermTab] = useState<string>('1 Year');
  const termRates = rates.filter(r => r.term === termTab);
  const handleAdd = () => {
    setRates(p => [...p, { term: termTab as CDInterestTier['term'], rangeFrom: 0, rangeTo: 0, interestRate: 0 }]);
  };
  const handleUpdate = (idx: number, field: string, value: number) => {
    const globalIdx = rates.findIndex((r, i) => {
      let count = 0;
      for (let j = 0; j <= i; j++) { if (rates[j].term === termTab) count++; }
      return count === idx + 1 && r.term === termTab;
    });
    if (globalIdx >= 0) { const nr = [...rates]; (nr[globalIdx] as any)[field] = value; setRates(nr); }
  };
  const handleDelete = (idx: number) => {
    let count = 0;
    const nr = rates.filter((r, i) => { if (r.term === termTab) { count++; return count !== idx + 1; } return true; });
    setRates(nr);
  };
  const handleSave = () => {
    dataStore.setCDRates(rates);
    addAudit(user!.id, user!.name, 'Updated', 'Settings', undefined, 'CD Interest Rates', `Updated ${termTab} rates`);
    toast({ title: 'CD Rates Saved' });
  };
  return (
    <div className="card-premium p-6 mt-4 space-y-4">
      <Tabs value={termTab} onValueChange={setTermTab}>
        <TabsList><TabsTrigger value="1 Year">1 Year</TabsTrigger><TabsTrigger value="18 Months">18 Months</TabsTrigger><TabsTrigger value="2 Years">2 Years</TabsTrigger><TabsTrigger value="3 Years">3 Years</TabsTrigger></TabsList>
      </Tabs>
      <table className="table-premium"><thead><tr><th>#</th><th>Range From ($)</th><th>Range To ($)</th><th>Interest Rate (APY %)</th><th>Actions</th></tr></thead>
        <tbody>{termRates.map((r, i) => (
          <tr key={i}><td>{i + 1}</td>
            <td><Input type="number" className="w-32" value={r.rangeFrom} onChange={e => handleUpdate(i, 'rangeFrom', parseFloat(e.target.value) || 0)} /></td>
            <td><Input type="number" className="w-32" value={r.rangeTo} onChange={e => handleUpdate(i, 'rangeTo', parseFloat(e.target.value) || 0)} /></td>
            <td><Input type="number" step="0.01" className="w-24" value={r.interestRate} onChange={e => handleUpdate(i, 'interestRate', parseFloat(e.target.value) || 0)} /></td>
            <td><Button variant="ghost" size="icon" onClick={() => handleDelete(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td></tr>
        ))}</tbody>
      </table>
      <div className="flex gap-3"><Button variant="outline" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Tier</Button><Button className="gradient-primary text-white" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Rates</Button></div>
    </div>
  );
}

function WireTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const [settings, setSettings] = useState(store.getWireSettings());
  const [showPreview, setShowPreview] = useState(false);
  const handleSave = () => {
    dataStore.setWireSettings(settings);
    addAudit(user!.id, user!.name, 'Updated', 'Settings', undefined, 'Wire Settings', 'Updated wire transfer settings');
    toast({ title: 'Wire Settings Saved' });
  };
  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF'];
  return (
    <div className="card-premium p-6 mt-4 space-y-6">
      <div><h3 className="font-semibold mb-4">Minimum Balance by Currency</h3>
        <table className="table-premium"><thead><tr><th>Currency</th><th>Minimum Balance</th></tr></thead>
          <tbody>{currencies.map(c => (
            <tr key={c}><td>{c}</td><td><Input type="number" className="w-40" value={settings.minimumBalances[c] || 0} onChange={e => setSettings(p => ({ ...p, minimumBalances: { ...p.minimumBalances, [c]: parseFloat(e.target.value) || 0 } }))} /></td></tr>
          ))}</tbody></table>
      </div>
      <div><h3 className="font-semibold mb-4">Wire Instructions HTML</h3>
        <Textarea className="font-mono min-h-[200px]" value={settings.instructions} onChange={e => setSettings(p => ({ ...p, instructions: e.target.value }))} />
        <p className="text-xs text-muted-foreground mt-1">This content is permanently displayed in client portal Funding Instructions page</p>
        {showPreview && <div className="mt-4 p-4 border rounded-xl" dangerouslySetInnerHTML={{ __html: settings.instructions }} />}
        <div className="flex gap-3 mt-4"><Button variant="outline" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}{showPreview ? 'Hide' : 'Show'} Preview</Button></div>
      </div>
      <Button className="gradient-primary text-white" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Wire Settings</Button>
    </div>
  );
}

function OTPTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const customers = store.getCustomers();
  const otpLogs = store.getOTPLogs();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  const handleGenerate = () => {
    if (!selectedCustomer) { toast({ title: 'Select a customer', variant: 'destructive' }); return; }
    const cust = customers.find(c => c.id === selectedCustomer);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    const record: OTPRecord = {
      id: generateId('otp'), customerId: selectedCustomer, customerEmail: cust?.email || '', customerName: cust?.name || '',
      otp: btoa(otp), createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString(),
      status: 'active', attempts: 0,
    };
    dataStore.addOTPLog(record);
    addAudit(user!.id, user!.name, 'Generated', 'OTP', record.id, cust?.name, `Generated OTP for ${cust?.email}`);
    toast({ title: 'OTP Generated' });
  };

  const filteredLogs = customerFilter === 'all' ? otpLogs : otpLogs.filter(o => o.customerId === customerFilter);

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-premium p-6 space-y-4">
        <h3 className="font-semibold text-lg">Generate New OTP</h3>
        <div><Label>Customer</Label><Select value={selectedCustomer} onValueChange={setSelectedCustomer}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>)}</SelectContent></Select></div>
        <Button className="gradient-primary text-white w-full h-12" onClick={handleGenerate}><Key className="w-5 h-5 mr-2" />Generate OTP</Button>
        {generatedOTP && (
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Generated OTP</p>
            <p className="text-5xl font-mono font-bold tracking-[8px] text-primary">{generatedOTP}</p>
            <p className="text-sm text-muted-foreground mt-2">Valid for 10 minutes</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(generatedOTP); toast({ title: 'Copied!' }); }}><Copy className="w-3 h-3 mr-1" />Copy OTP</Button>
          </div>
        )}
      </div>
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-lg">OTP History</h3>
          <Select value={customerFilter} onValueChange={setCustomerFilter}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Customers</SelectItem>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="table-premium"><thead><tr><th>Customer</th><th>Email</th><th>Created</th><th>Status</th></tr></thead>
            <tbody>{filteredLogs.slice(0, 20).map(o => (
              <tr key={o.id}><td>{o.customerName}</td><td className="text-sm text-muted-foreground">{o.customerEmail}</td><td className="text-sm">{formatDateTime(o.createdAt)}</td>
                <td><StatusBadge status={new Date(o.expiresAt) < new Date() ? 'expired' : o.status} /></td></tr>
            ))}</tbody></table>
        </div>
      </div>
    </div>
  );
}

function SMTPTab() {
  const store = useDataStore();
  const { user } = useAuth();
  const [config, setConfig] = useState(store.getSMTPConfig());
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const handleSave = () => {
    dataStore.setSMTPConfig(config);
    addAudit(user!.id, user!.name, 'Updated', 'Settings', undefined, 'SMTP Config', 'Updated SMTP configuration');
    toast({ title: 'SMTP Configuration Saved' });
  };
  const handleTest = () => {
    if (!testEmail) { toast({ title: 'Enter recipient email', variant: 'destructive' }); return; }
    setTimeout(() => { setTestResult('success'); toast({ title: '✓ Test email sent (simulated)' }); }, 1000);
  };
  return (
    <div className="card-premium p-6 mt-4 space-y-4">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl"><p className="text-sm text-muted-foreground">For demo purposes, emails are simulated. Production requires real SMTP server configuration.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>SMTP Host</Label><Input value={config.host} onChange={e => setConfig(p => ({ ...p, host: e.target.value }))} /></div>
        <div><Label>Port</Label><Input type="number" value={config.port} onChange={e => setConfig(p => ({ ...p, port: parseInt(e.target.value) || 0 }))} /></div>
        <div><Label>Username</Label><Input value={config.username} onChange={e => setConfig(p => ({ ...p, username: e.target.value }))} /></div>
        <div><Label>Password</Label><Input type="password" value={config.password} onChange={e => setConfig(p => ({ ...p, password: e.target.value }))} /></div>
        <div><Label>Encryption</Label><Select value={config.encryption} onValueChange={v => setConfig(p => ({ ...p, encryption: v as SMTPConfig['encryption'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="ssl">SSL</SelectItem><SelectItem value="tls">TLS</SelectItem></SelectContent></Select></div>
        <div><Label>From Email</Label><Input value={config.fromEmail} onChange={e => setConfig(p => ({ ...p, fromEmail: e.target.value }))} /></div>
        <div><Label>From Name</Label><Input value={config.fromName} onChange={e => setConfig(p => ({ ...p, fromName: e.target.value }))} /></div>
      </div>
      <Button className="gradient-primary text-white" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Configuration</Button>
      <div className="border-t pt-4 mt-4 space-y-3">
        <h4 className="font-semibold">Send Test Email</h4>
        <div className="flex gap-3"><Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="recipient@example.com" className="flex-1" /><Button variant="outline" onClick={handleTest}><Send className="w-4 h-4 mr-2" />Send Test</Button></div>
        {testResult === 'success' && <p className="text-sm text-emerald-600">✓ Test email sent successfully (simulated)</p>}
        {testResult === 'error' && <p className="text-sm text-red-600">✗ Connection failed</p>}
      </div>
    </div>
  );
}
