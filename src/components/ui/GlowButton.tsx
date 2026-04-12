import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'lg' | 'icon';
  isLoading?: boolean;
  glowColor?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'default',
    isLoading,
    glowColor = 'rgba(59, 130, 246, 0.5)',
    children,
    disabled,
    type = 'button',
    onClick,
  }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-royal to-electric text-white shadow-lg shadow-royal/30 hover:shadow-xl hover:shadow-royal/40",
      secondary: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30",
      outline: "bg-white border-2 border-border text-card-foreground hover:border-primary hover:shadow-lg",
    };
    
    const sizes = {
      default: "h-14 px-8 text-base gap-2",
      lg: "h-16 px-10 text-lg gap-3",
      icon: "h-14 w-14",
    };
    
    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
          }}
        />
        
        {/* Shine Effect */}
        <div
          className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            children
          )}
        </span>
      </motion.button>
    );
  }
);

GlowButton.displayName = 'GlowButton';

export default GlowButton;
