import { useDataStore } from '@/hooks/useDataStore';
import { formatCurrency, formatDateTime, getInitials } from '@/utils/formatters';
import StatCard from '@/components/ui/StatCard';
import { Users, Wallet, ArrowLeftRight, Clock, TrendingUp, ArrowUpRight, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const areaChartData = [
  { name: 'Jan', balance: 2400000 }, { name: 'Feb', balance: 2100000 }, { name: 'Mar', balance: 2800000 },
  { name: 'Apr', balance: 3200000 }, { name: 'May', balance: 2900000 }, { name: 'Jun', balance: 3500000 }, { name: 'Jul', balance: 4100000 },
];
const barChartData = [
  { name: 'Wire', incoming: 125, outgoing: 98 }, { name: 'Internal', incoming: 89, outgoing: 75 },
  { name: 'Deposit', incoming: 156, outgoing: 0 }, { name: 'Fee', incoming: 0, outgoing: 45 },
];
const pieChartData = [
  { name: 'USD', value: 45, color: 'hsl(221, 83%, 53%)' }, { name: 'EUR', value: 30, color: 'hsl(160, 84%, 39%)' },
  { name: 'GBP', value: 15, color: 'hsl(38, 92%, 50%)' }, { name: 'Other', value: 10, color: 'hsl(215, 16%, 47%)' },
];

export default function AdminDashboard() {
  const store = useDataStore();
  const customers = store.getCustomers();
  const accounts = store.getAccounts();
  const transactions = store.getTransactions();
  const deposits = store.getDeposits();
  const transferRequests = store.getTransferRequests();

  const totalBalance = accounts.reduce((s, a) => s + a.availableBalance + a.inTransitBalance, 0);
  const pendingTransfers = transferRequests.filter(t => t.status === 'pending').length;
  const pendingDeposits = deposits.filter(d => d.status === 'hold').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-card-foreground">Admin Dashboard</h1><p className="text-muted-foreground mt-1">Overview of bank operations and metrics</p></div>
        <div className="flex gap-3">
          <Link to="/admin/customers"><Button className="gradient-primary text-white"><Plus className="w-4 h-4 mr-2" />New Customer</Button></Link>
          <Link to="/admin/accounts"><Button variant="outline"><Plus className="w-4 h-4 mr-2" />New Account</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={customers.length} icon={<Users className="w-6 h-6" />} trend={{ value: 8.2, positive: true }} />
        <StatCard title="Total Accounts" value={accounts.length} icon={<Wallet className="w-6 h-6" />} trend={{ value: 12.5, positive: true }} variant="success" />
        <StatCard title="Total Balance" value={formatCurrency(totalBalance)} icon={<TrendingUp className="w-6 h-6" />} trend={{ value: 15.3, positive: true }} />
        <StatCard title="Pending Transfers" value={pendingTransfers} icon={<Clock className="w-6 h-6" />} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between mb-6"><div><h3 className="text-lg font-semibold text-card-foreground">Balance Trend</h3><p className="text-sm text-muted-foreground">Last 7 months</p></div></div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaChartData}><defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" /><XAxis dataKey="name" stroke="hsl(215, 16%, 47%)" fontSize={12} /><YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => [`$${(v / 1000000).toFixed(2)}M`, 'Balance']} contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="balance" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-6">Currency Mix</h3>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">{pieChartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">{pieChartData.map(i => <div key={i.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: i.color }} /><span className="text-sm text-muted-foreground">{i.name} {i.value}%</span></div>)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-6">Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={250}><BarChart data={barChartData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" /><XAxis dataKey="name" stroke="hsl(215, 16%, 47%)" fontSize={12} /><YAxis stroke="hsl(215, 16%, 47%)" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px' }} /><Bar dataKey="incoming" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} /><Bar dataKey="outgoing" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="card-premium">
          <div className="flex items-center justify-between p-6 border-b border-border"><div><h3 className="text-lg font-semibold text-card-foreground">Recent Customers</h3></div><Link to="/admin/customers"><Button variant="ghost" size="sm" className="text-primary">View All<ArrowUpRight className="w-4 h-4 ml-1" /></Button></Link></div>
          <div className="divide-y divide-border">{customers.slice(0, 4).map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3"><Avatar className="w-10 h-10"><AvatarFallback className="bg-primary/10 text-primary">{getInitials(c.name)}</AvatarFallback></Avatar><div><p className="font-medium text-card-foreground">{c.name}</p><p className="text-sm text-muted-foreground">{c.email}</p></div></div>
              <StatusBadge status={c.status} />
            </div>
          ))}</div>
        </div>
      </div>

      {(pendingTransfers > 0 || pendingDeposits > 0) && (
        <div className="card-premium p-6 border-l-4 border-warning">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-warning" />Pending Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTransfers > 0 && <Link to="/admin/transfers" className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"><div className="flex items-center gap-3"><ArrowLeftRight className="w-5 h-5 text-amber-600" /><div><p className="font-medium">{pendingTransfers} Pending Transfers</p><p className="text-sm text-muted-foreground">Require review</p></div></div><ArrowUpRight className="w-5 h-5 text-amber-600" /></Link>}
            {pendingDeposits > 0 && <Link to="/admin/deposits" className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-amber-600" /><div><p className="font-medium">{pendingDeposits} Deposits on Hold</p><p className="text-sm text-muted-foreground">Awaiting release</p></div></div><ArrowUpRight className="w-5 h-5 text-amber-600" /></Link>}
          </div>
        </div>
      )}
    </div>
  );
}
