import React from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImpersonationBannerProps {
  customerName: string;
  onExit: () => void;
}

const ImpersonationBanner = React.memo(function ImpersonationBanner({ customerName, onExit }: ImpersonationBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-12 bg-destructive flex items-center justify-center gap-3 text-destructive-foreground text-sm font-medium shadow-lg">
      <Eye className="w-4 h-4" />
      <span>ADMIN VIEW MODE — Viewing as <strong>{customerName}</strong> | All actions are logged</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        className="ml-2 h-7 text-destructive-foreground hover:bg-destructive-foreground/20"
      >
        Exit Impersonation <X className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  );
});

export default ImpersonationBanner;
