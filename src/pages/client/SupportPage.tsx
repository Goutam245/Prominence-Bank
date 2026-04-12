import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore, generateId } from '@/hooks/useDataStore';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { SupportTicket } from '@/types/banking';

export default function SupportPage() {
  const { user, customer } = useAuth();
  const store = useDataStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const tickets = store.getTickets().filter(t => t.customerId === customer?.id);
  const statusColors: Record<string, string> = { open: 'badge-info', in_progress: 'badge-warning', resolved: 'badge-success', closed: 'bg-muted text-muted-foreground' };

  const handleCreate = () => {
    if (!subject || !description) { toast.error('Fill all fields'); return; }
    const ticket: SupportTicket = { id: generateId('ticket'), customerId: customer?.id || '', customerName: user?.name || '', subject, status: 'open', priority: 'medium', messages: [{ id: generateId('msg'), sender: 'customer', senderName: user?.name || '', message: description, timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.addTicket(ticket);
    toast.success('Ticket created'); setShowCreate(false); setSubject(''); setDescription('');
  };

  const handleReply = () => {
    if (!replyText || !selected) return;
    const updated = { ...selected, messages: [...selected.messages, { id: generateId('msg'), sender: 'customer' as const, senderName: user?.name || '', message: replyText, timestamp: new Date().toISOString() }], updatedAt: new Date().toISOString() };
    store.updateTicket(selected.id, updated);
    setSelected(updated); setReplyText(''); toast.success('Reply sent');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-card-foreground">Support & Claims</h1><Button className="gradient-primary text-white" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />New Ticket</Button></div>
      <div className="space-y-4">
        {tickets.map(t => (
          <div key={t.id} className="card-premium p-5 cursor-pointer hover:-translate-y-0.5 transition-all" onClick={() => setSelected(t)}>
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-card-foreground">{t.subject}</h3><span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", statusColors[t.status])}>{t.status.replace('_', ' ')}</span></div>
            <p className="text-sm text-muted-foreground line-clamp-1">{t.messages[t.messages.length - 1]?.message}</p>
            <p className="text-xs text-muted-foreground mt-2">#{t.id} • {formatDate(t.createdAt)}</p>
          </div>
        ))}
        {tickets.length === 0 && <div className="card-premium p-12 text-center"><MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">No tickets yet</p><Button className="gradient-primary text-white" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />Create Ticket</Button></div>}
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}><DialogContent><DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Input placeholder="Subject *" value={subject} onChange={e => setSubject(e.target.value)} /><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="account">Account Issue</SelectItem><SelectItem value="transfer">Transfer Issue</SelectItem><SelectItem value="general">General</SelectItem></SelectContent></Select><Textarea placeholder="Describe your issue..." value={description} onChange={e => setDescription(e.target.value)} rows={5} /><Button className="w-full gradient-primary text-white" onClick={handleCreate}>Submit</Button></div></DialogContent></Dialog>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]"><DialogHeader><DialogTitle>{selected?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selected?.messages.map(m => (
              <div key={m.id} className={cn("flex", m.sender === 'customer' ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl p-4", m.sender === 'customer' ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}><p className="text-sm">{m.message}</p><p className={cn("text-xs mt-2 opacity-70")}>{m.senderName} • {formatDate(m.timestamp)}</p></div>
              </div>
            ))}
          </div>
          {selected?.status !== 'closed' && <div className="flex gap-2"><Textarea placeholder="Reply..." value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1" rows={2} /><Button className="gradient-primary text-white self-end" onClick={handleReply} disabled={!replyText}><Send className="w-4 h-4" /></Button></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
