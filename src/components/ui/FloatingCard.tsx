import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  floatIntensity?: number;
}

export default function FloatingCard({ 
  children, 
  className, 
  delay = 0,
  floatIntensity = 8 
}: FloatingCardProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: [0, -floatIntensity, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: {
          duration: 4,
          delay: delay + 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }}
    >
      {children}
    </motion.div>
  );
}
