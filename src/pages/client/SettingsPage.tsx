import { useAuth } from '@/contexts/AuthContext';
import { Settings, User, Shield, Bell } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, customer } = useAuth();
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-card-foreground">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList><TabsTrigger value="profile"><User className="w-4 h-4 mr-1" />Profile</TabsTrigger><TabsTrigger value="security"><Shield className="w-4 h-4 mr-1" />Security</TabsTrigger><TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" />Notifications</TabsTrigger></TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="card-premium p-6 space-y-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto">{user?.name?.charAt(0)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-muted-foreground">Full Name</label><Input value={user?.name || ''} disabled /></div>
              <div><label className="text-sm text-muted-foreground">Email</label><Input value={user?.email || ''} disabled /></div>
              <div><label className="text-sm text-muted-foreground">Phone</label><Input value={customer?.phone || ''} disabled /></div>
              <div><label className="text-sm text-muted-foreground">Account Type</label><Input value={customer?.type || ''} disabled className="capitalize" /></div>
            </div>
            <p className="text-xs text-muted-foreground">To update your profile, please submit a service request.</p>
          </div>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <div className="card-premium p-6 space-y-4">
            <h3 className="font-semibold">Change Password</h3>
            <Input type="password" placeholder="Current Password" /><Input type="password" placeholder="New Password" /><Input type="password" placeholder="Confirm New Password" />
            <Button className="gradient-primary text-white" onClick={() => toast.success('Password updated (demo)')}>Update Password</Button>
            <div className="mt-6 p-4 rounded-xl bg-muted/30"><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground mt-1">OTP verification is active for your account for login, beneficiary addition, and external transfers.</p></div>
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <div className="card-premium p-6"><p className="text-muted-foreground">Notification preferences coming soon.</p></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
