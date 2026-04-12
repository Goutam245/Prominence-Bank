// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  profilePicture?: string;
  createdAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  type: 'personal' | 'business';
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  companyName?: string;
  address: Address;
  status: 'active' | 'suspended' | 'frozen' | 'closed';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  notes?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Account Types
export interface Account {
  id: string;
  customerId: string;
  customerName: string;
  accountNumber: string;
  type: 'savings' | 'checking' | 'investment' | 'custody' | 'business';
  title: string;
  currency: Currency;
  availableBalance: number;
  inTransitBalance: number;
  heldBalance: number;
  status: 'active' | 'suspended' | 'closed';
  minimumBalance?: number;
  createdAt: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'JPY';

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

// Transaction Types
export interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit' | 'transfer' | 'fee' | 'interest';
  amount: number;
  currency: Currency;
  description: string;
  status: 'completed' | 'pending' | 'rejected' | 'processing';
  reference: string;
  timestamp: string;
  category?: string;
}

// Beneficiary Types
export interface Beneficiary {
  id: string;
  customerId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  type: 'internal' | 'external';
  swiftCode?: string;
  routingNumber?: string;
  lastUsed?: string;
  createdAt: string;
}

// Banking Instrument Types
export type InstrumentType = 'CD' | 'SBLC' | 'BG' | 'SKR' | 'BCC' | 'POF' | 'BF' | 'KTT' | 'SWIFT';

export interface Instrument {
  id: string;
  customerId: string;
  customerName: string;
  type: InstrumentType;
  referenceNumber: string;
  amount: number;
  currency: Currency;
  issueDate: string;
  maturityDate: string;
  status: 'active' | 'matured' | 'cancelled' | 'pending';
  details: Record<string, unknown>;
  messageBody?: string;
  createdAt: string;
}

// Certificate of Deposit
export interface CertificateOfDeposit extends Instrument {
  type: 'CD';
  details: {
    applicant: string;
    applicantAddress: string;
    beneficiary: string;
    beneficiaryAddress: string;
    interestRate: number;
    term: '1 Year' | '18 Months' | '2 Years' | '3 Years';
    monthlyYieldCreditTo?: string;
  };
}

// SBLC
export interface SBLC extends Instrument {
  type: 'SBLC';
  details: {
    receivingBank: string;
    bankSwiftCode: string;
    attentionOfficer?: string;
    beneficiary: string;
    beneficiaryAddress: string;
  };
}

// Bank Guarantee
export interface BankGuarantee extends Instrument {
  type: 'BG';
  details: {
    receivingBank: string;
    bankSwiftCode: string;
    attentionOfficer?: string;
    beneficiary: string;
    beneficiaryAddress: string;
  };
}

// Safe Keeping Receipt
export interface SafeKeepingReceipt extends Instrument {
  type: 'SKR';
  details: {
    companyName: string;
    interestDate?: string;
    interestAmount?: number;
    dateOfRelease?: string;
    marketValue: number;
    restrictions?: string;
    fullBankResponsibility: boolean;
  };
}

// KTT Instrument
export interface KTTInstrument extends Instrument {
  type: 'KTT';
  details: {
    issuer: string;
    receiver: string;
    remitter: string;
    beneficiary: string;
  };
  messageBody: string;
}

// Deposit Types
export interface Deposit {
  id: string;
  accountId: string;
  accountNumber: string;
  customerName: string;
  type: 'cash' | 'cheque';
  amount: number;
  currency: Currency;
  date: string;
  time: string;
  description: string;
  status: 'hold' | 'released' | 'rejected';
  withFee: boolean;
  createdBy: string;
  createdAt: string;
  releasedAt?: string;
  rejectionReason?: string;
}

// Hold Types
export interface Hold {
  id: string;
  accountId: string;
  accountNumber: string;
  customerName: string;
  type: 'deposit' | 'admin';
  amount: number;
  currency: Currency;
  description: string;
  status: 'active' | 'released';
  createdBy: string;
  createdAt: string;
  releasedAt?: string;
}

// Transfer Request Types
export interface TransferRequest {
  id: string;
  fromAccountId: string;
  fromAccountNumber: string;
  toAccountId?: string;
  toAccountNumber?: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  amount: number;
  currency: Currency;
  type: 'internal' | 'external' | 'wire';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  fee: number;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

// Support Ticket Types
export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'support';
  senderName: string;
  message: string;
  attachments?: string[];
  timestamp: string;
}

// Settings Types
export interface FeeTable {
  monthlyFee: number;
  internationalTransactionFee: number;
  bankToBankFee: number;
  bankToOtherBankFee: number;
  chequeCancellationFee: number;
  creditCardConversionFee: number;
  loanInterestRate: number;
  latePaymentFeePerDay: number;
  cryptoTransferFee: number;
}

export interface CryptoWalletAddresses {
  BTC: string;
  ETH: string;
  XLM: string;
  BCH: string;
  PAX: string;
}

export interface CDInterestTier {
  term: '1 Year' | '18 Months' | '2 Years' | '3 Years';
  rangeFrom: number;
  rangeTo: number;
  interestRate: number;
}

export interface WireSettings {
  minimumBalances: Record<Currency, number>;
  instructions: string;
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

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
