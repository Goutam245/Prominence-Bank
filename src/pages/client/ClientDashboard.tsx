import { useAuth } from '@/contexts/AuthContext';
import { useDataStore } from '@/hooks/useDataStore';
import { formatCurrency, formatDateTime, getTimeGreeting, formatAccountNumber } from '@/utils/formatters';
import PremiumAccountCard from '@/components/ui/PremiumAccountCard';
import PremiumStatCard from '@/components/ui/PremiumStatCard';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, FileText, Send, Users, TrendingUp, Clock, Bell, Download, BarChart3, Calendar, ChevronRight, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ClientDashboard() {
  const { user, customer } = useAuth();
  const store = useDataStore();
  
  const accounts = store.getAccounts().filter(a => a.customerName === user?.name || a.customerId === customer?.id);
  const totalAvailableBalance = accounts.reduce((sum, a) => sum + a.availableBalance, 0);
  const totalInTransit = accounts.reduce((sum, a) => sum + a.inTransitBalance, 0);
  const totalHeld = accounts.reduce((sum, a) => sum + a.heldBalance, 0);
  
  const allTransactions = store.getTransactions();
  const recentTransactions = allTransactions.filter(t => accounts.some(a => a.id === t.accountId)).slice(0, 5);
  const instruments = store.getInstruments().filter(i => i.customerId === customer?.id);
  const beneficiaries = store.getBeneficiaries().filter(b => b.customerId === customer?.id);
  const pendingTransfers = store.getTransferRequests().filter(t => accounts.some(a => a.id === t.fromAccountId) && t.status === 'pending');
  const monthlyTransfers = allTransactions.filter(t => accounts.some(a => a.id === t.accountId) && t.type === 'transfer').length;

  const quickActions = [
    { title: 'Transfer', subtitle: 'Send money', icon: Send, href: '/transfer', gradient: 'from-blue-600 to-blue-400' },
    { title: 'Beneficiary', subtitle: 'Add new', icon: Users, href: '/beneficiaries', gradient: 'from-emerald-600 to-emerald-400' },
    { title: 'Statement', subtitle: 'Download', icon: Download, href: '/transactions', gradient: 'from-amber-500 to-orange-400' },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome Hero Banner */}
      <motion.div className="relative overflow-hidden rounded-3xl p-8 lg:p-10" style={{ background: 'linear-gradient(135deg, hsl(217, 58%, 9%) 0%, hsl(221, 83%, 40%) 50%, hsl(217, 91%, 60%) 100%)' }} variants={itemVariants}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-white/70">{getTimeGreeting()}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/70 text-lg max-w-md">Here's an overview of your financial portfolio</p>
            <div className="flex items-center gap-2 mt-4 text-white/60">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <motion.div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300" whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", action.gradient)}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{action.title}</p>
                    <p className="text-xs text-white/60">{action.subtitle}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumStatCard title="Total Balance" value={formatCurrency(totalAvailableBalance)} icon={Wallet} trend={{ value: 12.5, positive: true }} index={0} />
        <PremiumStatCard title="In Transit" value={formatCurrency(totalInTransit)} icon={TrendingUp} variant="warning" index={1} />
        <PremiumStatCard title="Monthly Transfers" value={monthlyTransfers} subtitle={`${pendingTransfers.length} pending`} icon={BarChart3} variant="success" index={2} />
        <PremiumStatCard title="Active Instruments" value={instruments.filter(i => i.status === 'active').length} subtitle="CD, SBLC, KTT" icon={FileText} variant="info" index={3} />
      </div>

      {/* Account Cards */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Your Accounts</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your finances across multiple accounts</p>
          </div>
          <Link to="/accounts"><Button variant="ghost" size="sm" className="text-primary gap-1">View All<ChevronRight className="w-4 h-4" /></Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((account, index) => (
            <PremiumAccountCard key={account.id} account={account} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div className="xl:col-span-2 card-premium overflow-hidden" variants={itemVariants}>
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div><h2 className="text-lg font-bold text-card-foreground">Recent Activity</h2><p className="text-sm text-muted-foreground">Your latest transactions</p></div>
            <Link to="/transactions"><Button variant="ghost" size="sm" className="text-primary gap-1">View All<ChevronRight className="w-4 h-4" /></Button></Link>
          </div>
          <div className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", transaction.type === 'credit' || transaction.type === 'interest' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                    {transaction.type === 'credit' || transaction.type === 'interest' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(transaction.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold font-mono text-lg", transaction.type === 'credit' || transaction.type === 'interest' ? "text-emerald-500" : "text-card-foreground")}>
                    {transaction.type === 'credit' || transaction.type === 'interest' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize", transaction.status === 'completed' && "badge-success", transaction.status === 'pending' && "badge-warning", transaction.status === 'rejected' && "badge-danger")}>{transaction.status}</span>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-12 text-center text-muted-foreground"><Clock className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No recent transactions</p></div>
            )}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Quick Transfer */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"><Send className="w-5 h-5 text-white" /></div>
              <div><h3 className="font-bold text-card-foreground">Quick Transfer</h3><p className="text-xs text-muted-foreground">Send money instantly</p></div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Recipients</p>
              <div className="flex gap-3">
                {beneficiaries.slice(0, 4).map((ben) => (
                  <div key={ben.id} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center font-semibold text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary transition-colors">{ben.name.charAt(0)}</div>
                    <span className="text-xs text-muted-foreground truncate max-w-[60px]">{ben.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/transfer"><Button className="w-full gradient-primary text-white rounded-xl h-12"><Send className="w-4 h-4 mr-2" />New Transfer</Button></Link>
          </div>

          {/* Instruments Preview */}
          {instruments.length > 0 && (
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-card-foreground">Bank Instruments ({instruments.length})</h3>
                <Link to="/instruments"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
              </div>
              <div className="space-y-3">
                {instruments.slice(0, 3).map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={cn("px-2 py-1 rounded-md text-xs font-bold", inst.type === 'KTT' ? "bg-primary/10 text-primary" : inst.type === 'CD' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>{inst.type}</span>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{inst.referenceNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(inst.amount, inst.currency)}</p>
                      </div>
                    </div>
                    <Link to="/instruments"><Eye className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" /></Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
