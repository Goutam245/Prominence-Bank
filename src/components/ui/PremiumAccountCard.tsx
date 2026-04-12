import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Account } from '@/types/banking';
import { formatCurrency, maskAccountNumber } from '@/utils/formatters';
import { Copy, Check, MoreHorizontal, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { Link } from 'react-router-dom';

interface PremiumAccountCardProps {
  account: Account;
  index?: number;
}

// Generate mock sparkline data
const generateSparklineData = () => {
  const points = [];
  let value = 50;
  for (let i = 0; i < 7; i++) {
    value = Math.max(20, Math.min(80, value + (Math.random() - 0.5) * 20));
    points.push(value);
  }
  return points;
};

export default function PremiumAccountCard({ account, index = 0 }: PremiumAccountCardProps) {
  const [copied, setCopied] = useState(false);
  const sparklineData = generateSparklineData();
  const trend = sparklineData[sparklineData.length - 1] > sparklineData[0];
  
  const handleCopy = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    CHF: '🇨🇭',
  };

  // Create SVG path from sparkline data
  const sparklinePath = sparklineData
    .map((value, i) => {
      const x = (i / (sparklineData.length - 1)) * 100;
      const y = 100 - value;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 h-[280px]",
        "bg-white border-2 border-transparent",
        "shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)]",
        "hover:shadow-[0_20px_50px_-15px_rgba(30,64,175,0.25)]",
        "hover:border-primary/20",
        "transition-all duration-500"
      )}>
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
          }}
        />

        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              <span className="text-lg">{currencyFlags[account.currency] || '🏦'}</span>
              <span className="text-sm font-semibold text-primary">{account.currency} {account.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                account.status === 'active' ? "bg-success" : "bg-warning"
              )}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Account Number */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono text-base text-muted-foreground tracking-wider">
            {maskAccountNumber(account.accountNumber)}
          </span>
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1 font-medium">Available Balance</p>
          <motion.p 
            className="text-4xl font-bold text-card-foreground tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            {formatCurrency(account.availableBalance, account.currency)}
          </motion.p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3 mb-4">
          {account.inTransitBalance > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
              <TrendingUp className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-semibold text-warning">
                {formatCurrency(account.inTransitBalance, account.currency)} in transit
              </span>
            </div>
          )}
          {account.heldBalance > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
              <span className="text-xs font-semibold text-destructive">
                {formatCurrency(account.heldBalance, account.currency)} held
              </span>
            </div>
          )}
        </div>

        {/* Sparkline Chart */}
        <div className="absolute bottom-6 left-6 right-6 h-12">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sparkline-gradient-${account.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={trend ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={trend ? '#10B981' : '#EF4444'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`${sparklinePath} L 100 100 L 0 100 Z`}
              fill={`url(#sparkline-gradient-${account.id})`}
            />
            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={trend ? '#10B981' : '#EF4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute right-0 bottom-0 flex items-center gap-1">
            {trend ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span className={cn("text-xs font-medium", trend ? "text-success" : "text-destructive")}>
              {trend ? '+' : '-'}{Math.abs(Math.round((sparklineData[6] - sparklineData[0]) / sparklineData[0] * 100))}%
            </span>
          </div>
        </div>

        {/* View Details Button (shows on hover) */}
        <motion.div
          className="absolute inset-x-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <Link to="/accounts">
            <Button className="w-full gradient-primary text-white rounded-xl h-12">
              View Details
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
