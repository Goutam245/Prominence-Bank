import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, PiggyBank, Lock,
  FileText, Settings, ChevronLeft, ChevronRight, LogOut, Building2,
  ChevronDown, BarChart3, Shield, CreditCard, Key, Landmark, Receipt,
  FileCheck, FileLock, Send, Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/formatters';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import prominenceLogo from '@/assets/prominence-bank-logo.png';

interface AdminSidebarProps { collapsed: boolean; onToggle: () => void; }
interface NavSection { title: string; icon: React.ElementType; items: { title: string; href: string; icon: React.ElementType }[]; }

const navSections: NavSection[] = [
  { title: 'Overview', icon: LayoutDashboard, items: [{ title: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  { title: 'Customer Management', icon: Users, items: [{ title: 'All Customers', href: '/admin/customers', icon: Users }] },
  { title: 'Account Management', icon: Wallet, items: [{ title: 'All Accounts', href: '/admin/accounts', icon: Wallet }] },
  { title: 'Transactions', icon: ArrowLeftRight, items: [
    { title: 'All Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
    { title: 'Transfer Requests', href: '/admin/transfers', icon: Send },
    { title: 'Deposits', href: '/admin/deposits', icon: PiggyBank },
    { title: 'Holds Management', href: '/admin/holds', icon: Lock },
  ]},
  { title: 'Banking Products', icon: Landmark, items: [
    { title: 'Certificate of Deposit', href: '/admin/products/cd', icon: Receipt },
    { title: 'SBLC', href: '/admin/products/sblc', icon: FileCheck },
    { title: 'Bank Guarantees', href: '/admin/products/bg', icon: Shield },
    { title: 'Safe Keeping Receipt', href: '/admin/products/skr', icon: FileLock },
    { title: 'Bank Certified Checks', href: '/admin/products/bcc', icon: CreditCard },
    { title: 'Proof of Funds', href: '/admin/products/pof', icon: FileText },
    { title: 'Block Funds', href: '/admin/products/bf', icon: Lock },
    { title: 'Key Tested Telex', href: '/admin/products/ktt', icon: Key },
    { title: 'SWIFT Instruments', href: '/admin/products/swift', icon: Globe },
  ]},
  { title: 'Loans', icon: CreditCard, items: [{ title: 'Loan Management', href: '/admin/loans', icon: CreditCard }] },
  { title: 'Settings', icon: Settings, items: [
    { title: 'Fee Table', href: '/admin/settings/fees', icon: Receipt },
    { title: 'Wallet Addresses', href: '/admin/settings/wallets', icon: Wallet },
    { title: 'CD Interest Rates', href: '/admin/settings/cd-rates', icon: BarChart3 },
    { title: 'Wire Settings', href: '/admin/settings/wire', icon: Send },
    { title: 'Generate OTP', href: '/admin/settings/otp', icon: Key },
    { title: 'SMTP Config', href: '/admin/settings/smtp', icon: Settings },
  ]},
  { title: 'Reports', icon: BarChart3, items: [
    { title: 'Financial Reports', href: '/admin/reports/financial', icon: BarChart3 },
    { title: 'Audit Logs', href: '/admin/reports/audit', icon: FileText },
  ]},
];

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(['Overview']);
  const toggleSection = (title: string) => setOpenSections(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  const isItemActive = (href: string) => location.pathname === href;
  const isSectionActive = (section: NavSection) => section.items.some(item => location.pathname === item.href || location.pathname.startsWith(item.href + '/'));

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col border-r border-sidebar-border", collapsed ? "w-20" : "w-72")}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <img src={prominenceLogo} alt="Prominence Bank" className="w-10 h-10 rounded-xl object-contain shrink-0" />
          {!collapsed && <div className="animate-fade-in"><h1 className="text-lg font-bold text-sidebar-foreground">Admin Portal</h1><p className="text-xs text-sidebar-foreground/60">Prominence Bank</p></div>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-premium">
        {collapsed ? (
          <ul className="space-y-1">{navSections.map(section => {
            const Icon = section.icon; const isActive = isSectionActive(section);
            return <li key={section.title}><Link to={section.items[0].href} className={cn("nav-item justify-center px-3", isActive && "active")} title={section.title}><Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "")} /></Link></li>;
          })}</ul>
        ) : (
          <div className="space-y-2">{navSections.map(section => {
            const SectionIcon = section.icon; const isOpen = openSections.includes(section.title); const isActive = isSectionActive(section);
            return (
              <Collapsible key={section.title} open={isOpen || isActive} onOpenChange={() => toggleSection(section.title)}>
                <CollapsibleTrigger className="w-full"><div className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors", isActive && "text-sidebar-foreground bg-sidebar-accent/50")}><div className="flex items-center gap-3"><SectionIcon className="w-5 h-5" /><span className="text-sm font-medium">{section.title}</span></div><ChevronDown className={cn("w-4 h-4 transition-transform", (isOpen || isActive) && "rotate-180")} /></div></CollapsibleTrigger>
                <CollapsibleContent><ul className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">{section.items.map(item => {
                  const ItemIcon = item.icon; const itemActive = isItemActive(item.href);
                  return <li key={item.href}><Link to={item.href} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors", itemActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground")}><ItemIcon className="w-4 h-4" /><span>{item.title}</span></Link></li>;
                })}</ul></CollapsibleContent>
              </Collapsible>
            );
          })}</div>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <Avatar className="w-10 h-10"><AvatarImage src={user?.profilePicture} /><AvatarFallback className="bg-amber-500 text-white text-sm">{user?.name ? getInitials(user.name) : 'A'}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p><p className="text-xs text-sidebar-foreground/60 truncate">Administrator</p></div>
            <Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout} title="Logout"><LogOut className="w-4 h-4" /></Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="w-full h-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout} title="Logout"><LogOut className="w-5 h-5" /></Button>
        )}
      </div>

      <button onClick={onToggle} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors shadow-sm">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
