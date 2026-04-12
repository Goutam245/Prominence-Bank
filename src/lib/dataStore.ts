// Centralized localStorage data store with sync
import type { Customer, Account, Transaction, Beneficiary, Instrument, Deposit, Hold, SupportTicket, FeeTable, CryptoWalletAddresses, CDInterestTier, WireSettings, TransferRequest, Currency } from '@/types/banking';
import { demoCustomers, demoAccounts, demoTransactions, demoBeneficiaries, demoInstruments, demoDeposits, demoHolds, demoSupportTickets, demoFeeTable, demoCryptoAddresses, demoCDRates, demoWireSettings } from '@/data/mockData';

export interface Loan {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: Currency;
  interestRate: number;
  term: number; // months
  monthlyPayment: number;
  purpose: string;
  collateral: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
  paidAmount: number;
  nextPaymentDate: string;
  payments: LoanPayment[];
  createdAt: string;
  approvedAt?: string;
}

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  type: 'address_change' | 'account_closure' | 'extended_statement' | 'instrument_lease' | 'general';
  subject: string;
  description: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  details?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  before?: string;
  after?: string;
  timestamp: string;
  ip: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'deposit' | 'hold' | 'transfer' | 'otp' | 'instrument' | 'loan' | 'general';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface OTPRecord {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  otp: string; // btoa encoded
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'used';
  usedAt?: string;
  attempts: number;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'ssl' | 'tls';
  fromEmail: string;
  fromName: string;
}

const KEYS = {
  customers: 'prominencebank_customers',
  accounts: 'prominencebank_accounts',
  transactions: 'prominencebank_transactions',
  beneficiaries: 'prominencebank_beneficiaries',
  instruments: 'prominencebank_instruments',
  deposits: 'prominencebank_deposits',
  holds: 'prominencebank_holds',
  tickets: 'prominencebank_tickets',
  loans: 'prominencebank_loans',
  serviceRequests: 'prominencebank_service_requests',
  settings: 'prominencebank_settings',
  walletAddresses: 'prominencebank_wallet_addresses',
  wireSettings: 'prominencebank_wire_settings',
  codRates: 'prominencebank_cod_rates',
  transferRequests: 'prominencebank_transfer_requests',
  auditLog: 'prominencebank_audit_log',
  notifications: 'prominencebank_notifications',
  otpLog: 'prominencebank_otp_log',
  smtpConfig: 'prominencebank_smtp_config',
  initialized: 'prominencebank_initialized_v2',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Listeners for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function notify() {
  listeners.forEach(fn => fn());
}

// Initialize data if not present
export function initializeData(): void {
  if (localStorage.getItem(KEYS.initialized)) return;
  set(KEYS.customers, demoCustomers);
  set(KEYS.accounts, demoAccounts);
  set(KEYS.transactions, demoTransactions);
  set(KEYS.beneficiaries, demoBeneficiaries);
  set(KEYS.instruments, demoInstruments);
  set(KEYS.deposits, demoDeposits);
  set(KEYS.holds, demoHolds);
  set(KEYS.tickets, demoSupportTickets);
  set(KEYS.settings, demoFeeTable);
  set(KEYS.walletAddresses, demoCryptoAddresses);
  set(KEYS.wireSettings, demoWireSettings);
  set(KEYS.codRates, demoCDRates);
  set(KEYS.transferRequests, []);
  set(KEYS.loans, defaultLoans);
  set(KEYS.serviceRequests, []);
  set(KEYS.auditLog, defaultAuditLogs);
  set(KEYS.notifications, defaultNotifications);
  set(KEYS.otpLog, []);
  set(KEYS.smtpConfig, defaultSMTP);
  localStorage.setItem(KEYS.initialized, 'true');
}

// Generic CRUD
export const dataStore = {
  // Customers
  getCustomers: (): Customer[] => get(KEYS.customers, []),
  setCustomers: (d: Customer[]) => { set(KEYS.customers, d); notify(); },
  addCustomer: (c: Customer) => { const all = dataStore.getCustomers(); all.push(c); dataStore.setCustomers(all); },
  updateCustomer: (id: string, updates: Partial<Customer>) => {
    const all = dataStore.getCustomers().map(c => c.id === id ? { ...c, ...updates } : c);
    dataStore.setCustomers(all);
  },
  deleteCustomer: (id: string) => { dataStore.setCustomers(dataStore.getCustomers().filter(c => c.id !== id)); },

  // Accounts
  getAccounts: (): Account[] => get(KEYS.accounts, []),
  setAccounts: (d: Account[]) => { set(KEYS.accounts, d); notify(); },
  addAccount: (a: Account) => { const all = dataStore.getAccounts(); all.push(a); dataStore.setAccounts(all); },
  updateAccount: (id: string, updates: Partial<Account>) => {
    const all = dataStore.getAccounts().map(a => a.id === id ? { ...a, ...updates } : a);
    dataStore.setAccounts(all);
  },
  deleteAccount: (id: string) => { dataStore.setAccounts(dataStore.getAccounts().filter(a => a.id !== id)); },

  // Transactions
  getTransactions: (): Transaction[] => get(KEYS.transactions, []),
  setTransactions: (d: Transaction[]) => { set(KEYS.transactions, d); notify(); },
  addTransaction: (t: Transaction) => { const all = dataStore.getTransactions(); all.unshift(t); dataStore.setTransactions(all); },

  // Beneficiaries
  getBeneficiaries: (): Beneficiary[] => get(KEYS.beneficiaries, []),
  setBeneficiaries: (d: Beneficiary[]) => { set(KEYS.beneficiaries, d); notify(); },
  addBeneficiary: (b: Beneficiary) => { const all = dataStore.getBeneficiaries(); all.push(b); dataStore.setBeneficiaries(all); },
  updateBeneficiary: (id: string, updates: Partial<Beneficiary>) => {
    const all = dataStore.getBeneficiaries().map(b => b.id === id ? { ...b, ...updates } : b);
    dataStore.setBeneficiaries(all);
  },
  deleteBeneficiary: (id: string) => { dataStore.setBeneficiaries(dataStore.getBeneficiaries().filter(b => b.id !== id)); },

  // Instruments
  getInstruments: (): Instrument[] => get(KEYS.instruments, []),
  setInstruments: (d: Instrument[]) => { set(KEYS.instruments, d); notify(); },
  addInstrument: (i: Instrument) => { const all = dataStore.getInstruments(); all.push(i); dataStore.setInstruments(all); },
  updateInstrument: (id: string, updates: Partial<Instrument>) => {
    const all = dataStore.getInstruments().map(i => i.id === id ? { ...i, ...updates } : i);
    dataStore.setInstruments(all);
  },
  deleteInstrument: (id: string) => { dataStore.setInstruments(dataStore.getInstruments().filter(i => i.id !== id)); },

  // Deposits
  getDeposits: (): Deposit[] => get(KEYS.deposits, []),
  setDeposits: (d: Deposit[]) => { set(KEYS.deposits, d); notify(); },
  addDeposit: (d: Deposit) => { const all = dataStore.getDeposits(); all.push(d); dataStore.setDeposits(all); },
  updateDeposit: (id: string, updates: Partial<Deposit>) => {
    const all = dataStore.getDeposits().map(d => d.id === id ? { ...d, ...updates } : d);
    dataStore.setDeposits(all);
  },

  // Holds
  getHolds: (): Hold[] => get(KEYS.holds, []),
  setHolds: (d: Hold[]) => { set(KEYS.holds, d); notify(); },
  addHold: (h: Hold) => { const all = dataStore.getHolds(); all.push(h); dataStore.setHolds(all); },
  updateHold: (id: string, updates: Partial<Hold>) => {
    const all = dataStore.getHolds().map(h => h.id === id ? { ...h, ...updates } : h);
    dataStore.setHolds(all);
  },

  // Tickets
  getTickets: (): SupportTicket[] => get(KEYS.tickets, []),
  setTickets: (d: SupportTicket[]) => { set(KEYS.tickets, d); notify(); },
  addTicket: (t: SupportTicket) => { const all = dataStore.getTickets(); all.push(t); dataStore.setTickets(all); },
  updateTicket: (id: string, updates: Partial<SupportTicket>) => {
    const all = dataStore.getTickets().map(t => t.id === id ? { ...t, ...updates } : t);
    dataStore.setTickets(all);
  },

  // Loans
  getLoans: (): Loan[] => get(KEYS.loans, []),
  setLoans: (d: Loan[]) => { set(KEYS.loans, d); notify(); },
  addLoan: (l: Loan) => { const all = dataStore.getLoans(); all.push(l); dataStore.setLoans(all); },
  updateLoan: (id: string, updates: Partial<Loan>) => {
    const all = dataStore.getLoans().map(l => l.id === id ? { ...l, ...updates } : l);
    dataStore.setLoans(all);
  },

  // Service Requests
  getServiceRequests: (): ServiceRequest[] => get(KEYS.serviceRequests, []),
  setServiceRequests: (d: ServiceRequest[]) => { set(KEYS.serviceRequests, d); notify(); },
  addServiceRequest: (s: ServiceRequest) => { const all = dataStore.getServiceRequests(); all.push(s); dataStore.setServiceRequests(all); },
  updateServiceRequest: (id: string, updates: Partial<ServiceRequest>) => {
    const all = dataStore.getServiceRequests().map(s => s.id === id ? { ...s, ...updates } : s);
    dataStore.setServiceRequests(all);
  },

  // Transfer Requests
  getTransferRequests: (): TransferRequest[] => get(KEYS.transferRequests, []),
  setTransferRequests: (d: TransferRequest[]) => { set(KEYS.transferRequests, d); notify(); },
  addTransferRequest: (t: TransferRequest) => { const all = dataStore.getTransferRequests(); all.push(t); dataStore.setTransferRequests(all); },
  updateTransferRequest: (id: string, updates: Partial<TransferRequest>) => {
    const all = dataStore.getTransferRequests().map(t => t.id === id ? { ...t, ...updates } : t);
    dataStore.setTransferRequests(all);
  },

  // Settings
  getFeeTable: (): FeeTable => get(KEYS.settings, demoFeeTable),
  setFeeTable: (d: FeeTable) => { set(KEYS.settings, d); notify(); },
  getWalletAddresses: (): CryptoWalletAddresses => get(KEYS.walletAddresses, demoCryptoAddresses),
  setWalletAddresses: (d: CryptoWalletAddresses) => { set(KEYS.walletAddresses, d); notify(); },
  getWireSettings: (): WireSettings => get(KEYS.wireSettings, demoWireSettings),
  setWireSettings: (d: WireSettings) => { set(KEYS.wireSettings, d); notify(); },
  getCDRates: (): CDInterestTier[] => get(KEYS.codRates, []),
  setCDRates: (d: CDInterestTier[]) => { set(KEYS.codRates, d); notify(); },
  getSMTPConfig: (): SMTPConfig => get(KEYS.smtpConfig, defaultSMTP),
  setSMTPConfig: (d: SMTPConfig) => { set(KEYS.smtpConfig, d); notify(); },

  // Audit Log
  getAuditLogs: (): AuditLog[] => get(KEYS.auditLog, []),
  addAuditLog: (log: AuditLog) => { const all = dataStore.getAuditLogs(); all.unshift(log); set(KEYS.auditLog, all); },

  // Notifications
  getNotifications: (): Notification[] => get(KEYS.notifications, []),
  setNotifications: (d: Notification[]) => { set(KEYS.notifications, d); notify(); },
  addNotification: (n: Notification) => { const all = dataStore.getNotifications(); all.unshift(n); dataStore.setNotifications(all); },
  markNotificationRead: (id: string) => {
    const all = dataStore.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    dataStore.setNotifications(all);
  },
  markAllNotificationsRead: () => {
    const all = dataStore.getNotifications().map(n => ({ ...n, read: true }));
    dataStore.setNotifications(all);
  },

  // OTP Log
  getOTPLogs: (): OTPRecord[] => get(KEYS.otpLog, []),
  addOTPLog: (o: OTPRecord) => { const all = dataStore.getOTPLogs(); all.unshift(o); set(KEYS.otpLog, all); notify(); },
  updateOTPLog: (id: string, updates: Partial<OTPRecord>) => {
    const all = dataStore.getOTPLogs().map(o => o.id === id ? { ...o, ...updates } : o);
    set(KEYS.otpLog, all); notify();
  },
};

// Generate unique IDs
export function generateId(prefix = ''): string {
  const id = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${id}` : id;
}

// Add audit log helper
export function addAudit(userId: string, userName: string, action: string, module: string, entityId?: string, entityName?: string, details?: string) {
  dataStore.addAuditLog({
    id: generateId('audit'),
    userId, userName, action, module, entityId, entityName, details,
    timestamp: new Date().toISOString(),
    ip: '192.168.1.' + Math.floor(Math.random() * 255),
  });
}

// Add notification helper
export function addNotif(userId: string, type: Notification['type'], title: string, message: string) {
  dataStore.addNotification({
    id: generateId('notif'),
    userId, type, title, message,
    read: false,
    timestamp: new Date().toISOString(),
  });
}

// Default data
const defaultSMTP: SMTPConfig = {
  host: 'smtp.prominencebank.com',
  port: 587,
  username: 'noreply@prominencebank.com',
  password: '********',
  encryption: 'tls',
  fromEmail: 'noreply@prominencebank.com',
  fromName: 'Prominence Bank',
};

const defaultLoans: Loan[] = [
  {
    id: 'loan-1',
    customerId: 'cust-1',
    customerName: 'John Doe',
    amount: 25000,
    currency: 'USD',
    interestRate: 8,
    term: 24,
    monthlyPayment: 1130.24,
    purpose: 'Business Expansion',
    collateral: 'Real estate property at 123 Wall Street',
    status: 'active',
    paidAmount: 6781.44,
    nextPaymentDate: '2024-02-15',
    payments: [
      { id: 'lp-1', date: '2024-01-15', amount: 1130.24, principal: 963.57, interest: 166.67, balance: 24036.43, status: 'paid' },
      { id: 'lp-2', date: '2023-12-15', amount: 1130.24, principal: 957.15, interest: 173.09, balance: 24993.58, status: 'paid' },
      { id: 'lp-3', date: '2023-11-15', amount: 1130.24, principal: 950.78, interest: 179.46, balance: 25000, status: 'paid' },
    ],
    createdAt: '2023-09-01T00:00:00Z',
    approvedAt: '2023-09-05T00:00:00Z',
  },
];

const defaultNotifications: Notification[] = [
  { id: 'notif-1', userId: 'client-1', type: 'transfer', title: 'Transfer Completed', message: 'Your wire transfer of $15,000 has been completed.', read: false, timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'notif-2', userId: 'client-1', type: 'instrument', title: 'New Instrument Issued', message: 'A Certificate of Deposit (CD2024001) has been issued.', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'notif-3', userId: 'client-1', type: 'general', title: 'Statement Ready', message: 'Your monthly statement for January is ready to download.', read: true, timestamp: new Date(Date.now() - 10800000).toISOString() },
];

const defaultAuditLogs: AuditLog[] = [
  { id: 'audit-1', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Customers', entityId: 'cust-1', entityName: 'John Doe', details: 'Created new personal customer', timestamp: '2024-01-01T09:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-2', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Accounts', entityId: 'acc-1', entityName: 'Primary Checking', details: 'Created USD checking account', timestamp: '2024-01-01T09:05:00Z', ip: '192.168.1.100' },
  { id: 'audit-3', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Deposit', module: 'Deposits', entityId: 'dep-1', entityName: 'Cash deposit', details: 'Added $5,000 cash deposit on hold', timestamp: '2024-01-20T14:30:00Z', ip: '192.168.1.100' },
  { id: 'audit-4', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Instruments', entityId: 'inst-1', entityName: 'CD2024001', details: 'Created Certificate of Deposit', timestamp: '2024-01-01T10:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-5', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Instruments', entityId: 'inst-3', entityName: 'KTT2024001', details: 'Created KTT instrument for Jane Smith', timestamp: '2024-03-01T11:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-6', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Updated', module: 'Settings', entityName: 'Fee Table', details: 'Updated monthly fee to $25', timestamp: '2024-01-05T08:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-7', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Customers', entityId: 'cust-2', entityName: 'Jane Smith', details: 'Created business customer', timestamp: '2024-01-02T10:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-8', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Hold', module: 'Holds', entityId: 'hold-1', entityName: 'Admin Hold', details: 'Placed $50,000 admin hold on Jane Smith account', timestamp: '2024-01-15T09:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-9', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Deposit', module: 'Deposits', entityId: 'dep-2', entityName: 'Cheque deposit', details: 'Added $125,000 cheque deposit on hold', timestamp: '2024-01-19T10:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-10', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Instruments', entityId: 'inst-2', entityName: 'SBLC2024001', details: 'Created SBLC for Jane Smith', timestamp: '2024-02-15T14:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-11', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Customers', entityId: 'cust-3', entityName: 'GMG Group Ltd', details: 'Created corporate customer', timestamp: '2024-01-10T08:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-12', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Accounts', entityId: 'acc-5', entityName: 'EUR Current', details: 'Created EUR current account for GMG Group', timestamp: '2024-01-10T08:30:00Z', ip: '192.168.1.100' },
  { id: 'audit-13', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Updated', module: 'Settings', entityName: 'Wallet Addresses', details: 'Updated BTC wallet address', timestamp: '2024-01-08T16:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-14', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Created', module: 'Instruments', entityId: 'inst-5', entityName: 'KTT2024002', details: 'Created KTT for GMG Group Ltd', timestamp: '2024-01-15T11:00:00Z', ip: '192.168.1.100' },
  { id: 'audit-15', userId: 'admin-1', userName: 'Sarah Mitchell', action: 'Updated', module: 'Settings', entityName: 'Wire Settings', details: 'Updated wire transfer instructions', timestamp: '2024-01-12T13:00:00Z', ip: '192.168.1.100' },
];

// Custom hook for reactive data
import { useState as useReactState, useEffect, useCallback } from 'react';

export function useDataStore() {
  const [, setTick] = useReactState(0);
  
  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  return dataStore;
}
