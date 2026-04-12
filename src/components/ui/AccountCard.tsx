import { Account, currencySymbols } from '@/types/banking';
import { formatCurrency, formatAccountNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AccountCardProps {
  account: Account;
  className?: string;
}

const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  JPY: '🇯🇵',
};

export default function AccountCard({ account, className }: AccountCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  
  const totalBalance = account.availableBalance + account.inTransitBalance + account.heldBalance;
  
  // Simple sparkline data (mock for visual effect)
  const sparklineData = [40, 55, 45, 60, 50, 70, 65];

  return (
    <div className={cn(
      "balance-card group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-lg",
      className
    )}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currencyFlags[account.currency]}</span>
              <span className="text-sm font-medium text-white/60 uppercase">{account.type}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{account.title}</h3>
            <p className="text-sm text-white/60 font-mono mt-0.5">
              {formatAccountNumber(account.accountNumber)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={(e) => {
              e.preventDefault();
              setShowBalance(!showBalance);
            }}
          >
            {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </Button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-white/60 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-white font-mono">
            {showBalance 
              ? formatCurrency(account.availableBalance, account.currency)
              : '••••••••'
            }
          </p>
        </div>

        {/* Additional Balances */}
        <div className="flex gap-4 mb-6">
          {account.inTransitBalance > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <div>
                <p className="text-xs text-white/50">In Transit</p>
                <p className="text-sm font-semibold text-warning font-mono">
                  {showBalance 
                    ? formatCurrency(account.inTransitBalance, account.currency)
                    : '••••'
                  }
                </p>
              </div>
            </div>
          )}
          {account.heldBalance > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <div>
                <p className="text-xs text-white/50">On Hold</p>
                <p className="text-sm font-semibold text-destructive font-mono">
                  {showBalance 
                    ? formatCurrency(account.heldBalance, account.currency)
                    : '••••'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex items-end gap-1 h-8 mb-4">
          {sparklineData.map((value, i) => (
            <div 
              key={i}
              className="flex-1 bg-white/20 rounded-t transition-all group-hover:bg-white/30"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-success text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+2.5% this week</span>
          </div>
          <Link 
            to={`/accounts/${account.id}`}
            className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
          >
            View Details
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
