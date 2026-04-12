import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export default function AnimatedCounter({ value, className, duration = 2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  useEffect(() => {
    if (!isInView) return;
    
    // Extract number and suffix (like $ or +)
    const numMatch = value.match(/[\d,.]+/);
    const prefix = value.match(/^[^\d]*/)?.[0] || '';
    const suffix = value.match(/[^\d]*$/)?.[0] || '';
    
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetNum = parseFloat(numMatch[0].replace(/,/g, ''));
    const hasDecimal = numMatch[0].includes('.');
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function (ease out quad)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = targetNum * easeProgress;
      
      let formatted: string;
      if (hasDecimal) {
        formatted = currentNum.toFixed(2);
      } else if (targetNum >= 1000) {
        formatted = Math.floor(currentNum).toLocaleString();
      } else {
        formatted = Math.floor(currentNum).toString();
      }
      
      setDisplayValue(`${prefix}${formatted}${suffix}`);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);
  
  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {displayValue}
    </motion.span>
  );
}
