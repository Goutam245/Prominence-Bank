import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore } from '@/hooks/useDataStore';
import { formatCurrency, formatAccountNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Wallet, Grid3X3, List, Eye, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const currencyFlags: Record<string, string> = { USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', CHF: '🇨🇭', CAD: '🇨🇦', AUD: '🇦🇺', JPY: '🇯🇵' };

export default function AccountsPage() {
  const { customer } = useAuth();
  const store = useDataStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const accounts = store.getAccounts().filter(a => a.customerId === customer?.id);
  const totalBalance = accounts.reduce((s, a) => s + a.availableBalance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-premium p-6" style={{ background: 'linear-gradient(135deg, hsl(221, 83%, 53%) 0%, hsl(217, 91%, 60%) 100%)' }}>
        <p className="text-white/70 text-sm mb-1">Total Balance Across All Accounts</p>
        <p className="text-4xl font-bold text-white font-mono">{formatCurrency(totalBalance)}</p>
        <p className="text-white/60 text-sm mt-2">{accounts.length} Active Account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-card-foreground">Your Accounts</h1>
        <div className="flex gap-2">
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}><Grid3X3 className="w-4 h-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}><List className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Accounts */}
      <div className={cn(view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4")}>
        {accounts.map((account) => (
          <div key={account.id} className="card-premium p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currencyFlags[account.currency] || '💰'}</span>
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", "bg-primary/10 text-primary")}>{account.type}</span>
              </div>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", account.status === 'active' ? "badge-success" : "badge-warning")}>{account.status}</span>
            </div>
            
            <h3 className="font-semibold text-card-foreground text-lg">{account.title}</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">{formatAccountNumber(account.accountNumber)}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="text-xl font-bold text-emerald-500 font-mono">{formatCurrency(account.availableBalance, account.currency)}</span>
              </div>
              {account.inTransitBalance > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Transit</span>
                  <span className="text-sm font-semibold text-amber-500 font-mono badge-warning px-2 py-0.5 rounded">{formatCurrency(account.inTransitBalance, account.currency)}</span>
                </div>
              )}
              {account.heldBalance > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Held/Blocked</span>
                  <span className="text-sm font-semibold text-red-500 font-mono badge-danger px-2 py-0.5 rounded">{formatCurrency(account.heldBalance, account.currency)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Link to={`/transactions?account=${account.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full"><Eye className="w-4 h-4 mr-1" />View</Button>
              </Link>
              <Link to="/transfer" className="flex-1">
                <Button size="sm" className="w-full gradient-primary text-white"><Send className="w-4 h-4 mr-1" />Transfer</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
