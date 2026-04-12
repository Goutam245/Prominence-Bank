import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  index?: number;
}

const variantStyles = {
  default: {
    iconBg: 'from-royal to-electric',
    iconShadow: 'shadow-royal/30',
  },
  success: {
    iconBg: 'from-emerald-500 to-emerald-400',
    iconShadow: 'shadow-emerald-500/30',
  },
  warning: {
    iconBg: 'from-amber-500 to-amber-400',
    iconShadow: 'shadow-amber-500/30',
  },
  danger: {
    iconBg: 'from-red-500 to-red-400',
    iconShadow: 'shadow-red-500/30',
  },
  info: {
    iconBg: 'from-blue-500 to-cyan-400',
    iconShadow: 'shadow-blue-500/30',
  },
};

export default function PremiumStatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend, 
  variant = 'default',
  index = 0,
}: PremiumStatCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <motion.div 
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 bg-white",
        "border border-border/50",
        "shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)]",
        "transition-all duration-300"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3 flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          
          <motion.p 
            className="text-3xl font-bold text-card-foreground tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            {value}
          </motion.p>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <motion.div 
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                trend.positive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </motion.div>
          )}
        </div>
        
        <motion.div 
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
            styles.iconBg,
            styles.iconShadow
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-7 h-7" />
        </motion.div>
      </div>
    </motion.div>
  );
}
