import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Send, 
  Users, 
  FileText, 
  MessageSquare, 
  Info, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  CreditCard,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/formatters';
import prominenceLogo from '@/assets/prominence-bank-logo.png';

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Accounts', href: '/accounts', icon: Wallet },
  { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { title: 'Transfer Funds', href: '/transfer', icon: Send },
  { title: 'Beneficiaries', href: '/beneficiaries', icon: Users },
  { title: 'Bank Instruments', href: '/instruments', icon: FileText },
  { title: 'Loans', href: '/loans', icon: CreditCard },
  { title: 'Services', href: '/services', icon: ClipboardList },
  { title: 'Support & Claims', href: '/support', icon: MessageSquare },
  { title: 'Funding Instructions', href: '/funding', icon: Info },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export default function ClientSidebar({ collapsed, onToggle }: ClientSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-sidebar-foreground">Prominence</h1>
              <p className="text-xs text-sidebar-foreground/60">Banking</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-premium">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "nav-item",
                    isActive && "active",
                    collapsed && "justify-center px-3"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "")} />
                  {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
