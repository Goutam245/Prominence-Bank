import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PremiumInputProps {
  icon?: LucideIcon;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, icon: Icon, rightIcon, label, error, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };
    
    return (
      <div className="relative">
        {/* Floating Label */}
        {label && (
          <motion.label
            className={cn(
              "absolute left-14 text-muted-foreground pointer-events-none transition-all duration-200 z-10",
              (isFocused || hasValue) 
                ? "top-2 text-xs font-medium text-primary" 
                : "top-1/2 -translate-y-1/2 text-base"
            )}
            animate={{
              y: (isFocused || hasValue) ? 0 : '-50%',
              scale: (isFocused || hasValue) ? 0.85 : 1,
            }}
          >
            {label}
          </motion.label>
        )}
        
        {/* Icon Container */}
        {Icon && (
          <div className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-16 bg-white rounded-2xl border-2 transition-all duration-300",
            "text-card-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none",
            Icon ? "pl-14 pr-5" : "px-5",
            rightIcon && "pr-14",
            label && (isFocused || hasValue) ? "pt-6 pb-2" : "py-4",
            error 
              ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
              : "border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={handleChange}
          placeholder={props.placeholder}
          value={props.value}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
        
        {/* Focus Glow */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)',
                filter: 'blur(8px)',
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive mt-2 ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

export default PremiumInput;
