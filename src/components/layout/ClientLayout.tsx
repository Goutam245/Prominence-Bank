import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import TopNavbar from './TopNavbar';
import { cn } from '@/lib/utils';

export default function ClientLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <ClientSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <TopNavbar showMenuButton />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
