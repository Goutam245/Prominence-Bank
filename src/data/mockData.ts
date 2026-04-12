import type {
  User,
  Customer,
  Account,
  Transaction,
  Beneficiary,
  Instrument,
  Deposit,
  Hold,
  SupportTicket,
  FeeTable,
  CryptoWalletAddresses,
  CDInterestTier,
  WireSettings,
} from '@/types/banking';

// Demo Users
export const demoUsers: User[] = [
  { id: 'admin-1', email: 'admin@prominencebank.com', name: 'Sarah Mitchell', role: 'admin', profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'client-1', email: 'john.doe@example.com', name: 'John Doe', role: 'client', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', createdAt: '2024-03-15T00:00:00Z' },
  { id: 'client-2', email: 'jane.smith@example.com', name: 'Jane Smith', role: 'client', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', createdAt: '2024-05-20T00:00:00Z' },
  { id: 'client-3', email: 'gmg.group@example.com', name: 'GMG Group Ltd', role: 'client', createdAt: '2024-01-10T00:00:00Z' },
];

// Demo Customers
export const demoCustomers: Customer[] = [
  {
    id: 'cust-1', type: 'personal', name: 'John Doe', email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567', dateOfBirth: '1985-06-15',
    address: { line1: '123 Wall Street', line2: 'Suite 400', city: 'New York', state: 'NY', postalCode: '10005', country: 'United States' },
    status: 'active', riskLevel: 'low', createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'cust-2', type: 'personal', name: 'Jane Smith', email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543', companyName: 'Smith Global Ventures LLC',
    address: { line1: '456 Financial Plaza', city: 'Los Angeles', state: 'CA', postalCode: '90071', country: 'United States' },
    status: 'active', riskLevel: 'medium', createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'cust-3', type: 'business', name: 'GMG Group Ltd', email: 'gmg.group@example.com',
    phone: '+44 20 7946 0958', companyName: 'GMG Group Ltd',
    address: { line1: '10 Downing Business Park', city: 'London', state: 'Greater London', postalCode: 'EC2N 1HQ', country: 'United Kingdom' },
    status: 'active', riskLevel: 'low', createdAt: '2024-01-10T00:00:00Z',
  },
];

// Demo Accounts
export const demoAccounts: Account[] = [
  { id: 'acc-1', customerId: 'cust-1', customerName: 'John Doe', accountNumber: '9704588935', type: 'checking', title: 'USD Checking', currency: 'USD', availableBalance: 45230.50, inTransitBalance: 5000.00, heldBalance: 0, status: 'active', createdAt: '2024-03-15T00:00:00Z' },
  { id: 'acc-2', customerId: 'cust-1', customerName: 'John Doe', accountNumber: '7163249189', type: 'savings', title: 'EUR Savings', currency: 'EUR', availableBalance: 12800.00, inTransitBalance: 0, heldBalance: 0, status: 'active', createdAt: '2024-03-15T00:00:00Z' },
  { id: 'acc-3', customerId: 'cust-2', customerName: 'Jane Smith', accountNumber: '5051011138', type: 'business', title: 'USD Business', currency: 'USD', availableBalance: 128450.00, inTransitBalance: 0, heldBalance: 15000.00, status: 'active', minimumBalance: 10000, createdAt: '2024-05-20T00:00:00Z' },
  { id: 'acc-4', customerId: 'cust-3', customerName: 'GMG Group Ltd', accountNumber: '8821456723', type: 'checking', title: 'EUR Current', currency: 'EUR', availableBalance: 500000.00, inTransitBalance: 50000.00, heldBalance: 0, status: 'active', createdAt: '2024-01-10T00:00:00Z' },
  { id: 'acc-5', customerId: 'cust-3', customerName: 'GMG Group Ltd', accountNumber: '6639012847', type: 'savings', title: 'GBP Account', currency: 'GBP', availableBalance: 25000.00, inTransitBalance: 0, heldBalance: 0, status: 'active', createdAt: '2024-01-10T00:00:00Z' },
];

// Demo Transactions
export const demoTransactions: Transaction[] = [
  { id: 'txn-1', accountId: 'acc-1', type: 'credit', amount: 15000.00, currency: 'USD', description: 'Wire Transfer from ABC Corp', status: 'completed', reference: 'WT2024012001', timestamp: '2024-01-20T09:30:00Z', category: 'Wire Transfer' },
  { id: 'txn-2', accountId: 'acc-1', type: 'debit', amount: 2500.00, currency: 'USD', description: 'International Wire to UK Ltd', status: 'completed', reference: 'WT2024012002', timestamp: '2024-01-19T14:45:00Z', category: 'Wire Transfer' },
  { id: 'txn-3', accountId: 'acc-1', type: 'credit', amount: 8750.00, currency: 'USD', description: 'Deposit - ACH Transfer', status: 'completed', reference: 'ACH2024011801', timestamp: '2024-01-18T11:00:00Z', category: 'Deposit' },
  { id: 'txn-4', accountId: 'acc-1', type: 'fee', amount: 25.00, currency: 'USD', description: 'Monthly Account Fee', status: 'completed', reference: 'FEE2024010101', timestamp: '2024-01-01T00:00:00Z', category: 'Fee' },
  { id: 'txn-5', accountId: 'acc-1', type: 'credit', amount: 50000.00, currency: 'USD', description: 'Investment Returns Q4', status: 'completed', reference: 'INV2024011501', timestamp: '2024-01-15T09:00:00Z', category: 'Investment' },
  { id: 'txn-6', accountId: 'acc-2', type: 'transfer', amount: 5000.00, currency: 'EUR', description: 'Internal Transfer to USD Account', status: 'completed', reference: 'INT2024011901', timestamp: '2024-01-19T10:30:00Z', category: 'Transfer' },
  { id: 'txn-7', accountId: 'acc-1', type: 'debit', amount: 1200.00, currency: 'USD', description: 'Utility Payment - Electric Co', status: 'completed', reference: 'PAY2024011701', timestamp: '2024-01-17T08:00:00Z', category: 'Payment' },
  { id: 'txn-8', accountId: 'acc-1', type: 'credit', amount: 3500.00, currency: 'USD', description: 'Refund - Cancelled Service', status: 'completed', reference: 'REF2024011601', timestamp: '2024-01-16T16:00:00Z', category: 'Refund' },
  { id: 'txn-9', accountId: 'acc-1', type: 'interest', amount: 45.80, currency: 'USD', description: 'Monthly Interest Earned', status: 'completed', reference: 'INT2024010101', timestamp: '2024-01-01T00:00:00Z', category: 'Interest' },
  { id: 'txn-10', accountId: 'acc-1', type: 'debit', amount: 750.00, currency: 'USD', description: 'Insurance Premium', status: 'completed', reference: 'INS2024011401', timestamp: '2024-01-14T12:00:00Z', category: 'Payment' },
  { id: 'txn-11', accountId: 'acc-3', type: 'credit', amount: 75000.00, currency: 'USD', description: 'Client Payment - Project Alpha', status: 'completed', reference: 'PAY2024012001', timestamp: '2024-01-20T10:00:00Z', category: 'Payment' },
  { id: 'txn-12', accountId: 'acc-3', type: 'debit', amount: 25000.00, currency: 'USD', description: 'Vendor Payment - Global Supplies', status: 'completed', reference: 'VP2024011401', timestamp: '2024-01-14T15:30:00Z', category: 'Payment' },
  { id: 'txn-13', accountId: 'acc-3', type: 'fee', amount: 50.00, currency: 'USD', description: 'Monthly Business Account Fee', status: 'completed', reference: 'FEE2024010103', timestamp: '2024-01-01T00:00:00Z', category: 'Fee' },
  { id: 'txn-14', accountId: 'acc-3', type: 'debit', amount: 8500.00, currency: 'USD', description: 'External Wire Transfer', status: 'pending', reference: 'WT2024012003', timestamp: '2024-01-20T16:00:00Z', category: 'Wire Transfer' },
  { id: 'txn-15', accountId: 'acc-3', type: 'credit', amount: 42000.00, currency: 'USD', description: 'Wire from Partner Inc', status: 'completed', reference: 'WT2024011201', timestamp: '2024-01-12T09:30:00Z', category: 'Wire Transfer' },
  { id: 'txn-16', accountId: 'acc-4', type: 'credit', amount: 200000.00, currency: 'EUR', description: 'Capital injection from directors', status: 'completed', reference: 'CAP2024011001', timestamp: '2024-01-10T11:00:00Z', category: 'Deposit' },
  { id: 'txn-17', accountId: 'acc-4', type: 'debit', amount: 35000.00, currency: 'EUR', description: 'Supplier Payment - Munich GmbH', status: 'completed', reference: 'SUP2024011501', timestamp: '2024-01-15T14:00:00Z', category: 'Payment' },
  { id: 'txn-18', accountId: 'acc-5', type: 'credit', amount: 10000.00, currency: 'GBP', description: 'Transfer from EUR Account', status: 'completed', reference: 'INT2024011801', timestamp: '2024-01-18T10:00:00Z', category: 'Transfer' },
];

// Demo Beneficiaries
export const demoBeneficiaries: Beneficiary[] = [
  { id: 'ben-1', customerId: 'cust-1', name: 'ABC Corporation', accountNumber: '123456789', bankName: 'Chase Bank', type: 'external', routingNumber: '021000021', lastUsed: '2024-01-15T00:00:00Z', createdAt: '2024-03-20T00:00:00Z' },
  { id: 'ben-2', customerId: 'cust-1', name: 'Jane Smith', accountNumber: '5051011138', bankName: 'Prominence Bank', type: 'internal', lastUsed: '2024-01-18T00:00:00Z', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ben-3', customerId: 'cust-1', name: 'Tech Solutions Inc', accountNumber: '987654321', bankName: 'Prominence Bank', type: 'internal', createdAt: '2024-06-01T00:00:00Z' },
  { id: 'ben-4', customerId: 'cust-2', name: 'UK Trading Ltd', accountNumber: 'GB82WEST12345698765432', bankName: 'Barclays Bank', type: 'external', swiftCode: 'BARCGB22', createdAt: '2024-05-25T00:00:00Z' },
  { id: 'ben-5', customerId: 'cust-3', name: 'Munich GmbH', accountNumber: 'DE89370400440532013000', bankName: 'Deutsche Bank', type: 'external', swiftCode: 'DEUTDEFF', lastUsed: '2024-01-15T00:00:00Z', createdAt: '2024-01-12T00:00:00Z' },
];

// Demo Instruments
export const demoInstruments: Instrument[] = [
  {
    id: 'inst-1', customerId: 'cust-1', customerName: 'John Doe', type: 'CD',
    referenceNumber: 'CD2024001', amount: 50000.00, currency: 'USD',
    issueDate: '2024-01-01', maturityDate: '2025-01-01', status: 'active',
    details: { applicant: 'John Doe', applicantAddress: '123 Wall Street, New York, NY 10005', beneficiary: 'John Doe', beneficiaryAddress: '123 Wall Street, New York, NY 10005', interestRate: 4.5, term: '1 Year' },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'inst-2', customerId: 'cust-1', customerName: 'John Doe', type: 'KTT',
    referenceNumber: 'KTT2024001', amount: 250000.00, currency: 'USD',
    issueDate: '2024-02-01', maturityDate: '2024-12-31', status: 'active',
    details: { issuer: 'Prominence Bank', receiver: 'Chase Bank New York', remitter: 'John Doe', beneficiary: 'ABC Corporation' },
    messageBody: `KEY TESTED TELEX\n\nTO: CHASE BANK NEW YORK\nSWIFT: CHASUS33\nATTN: INTERNATIONAL SETTLEMENTS\n\nFROM: PROMINENCE BANK\nSWIFT: PROMUS33\n\nDATE: FEBRUARY 01, 2024\nREF: KTT2024001\n\nWE HEREBY CONFIRM AND AUTHENTICATE THE FOLLOWING:\n\nREMITTER: JOHN DOE\nBENEFICIARY: ABC CORPORATION\nAMOUNT: USD 250,000.00 (TWO HUNDRED FIFTY THOUSAND US DOLLARS)\nVALUE DATE: FEBRUARY 01, 2024\n\nTHIS KEY TESTED TELEX CONFIRMS THAT THE ABOVE REFERENCED\nFUNDS ARE ON DEPOSIT AND AVAILABLE FOR IMMEDIATE TRANSFER.\n\nTHIS INSTRUMENT IS IRREVOCABLE AND NON-TRANSFERABLE.\n\nTEST KEY: XXXXXXX\n\nAUTHORIZED SIGNATURES:\n_____________________\nPROMINENCE BANK\nINTERNATIONAL DIVISION`,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'inst-3', customerId: 'cust-2', customerName: 'Jane Smith', type: 'SBLC',
    referenceNumber: 'SBLC2024001', amount: 500000.00, currency: 'USD',
    issueDate: '2024-02-15', maturityDate: '2025-02-15', status: 'active',
    details: { receivingBank: 'HSBC London', bankSwiftCode: 'HSBCGB2L', attentionOfficer: 'James Wilson', beneficiary: 'Global Trading Corp', beneficiaryAddress: '100 Liverpool Street, London EC2M 2AT' },
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'inst-4', customerId: 'cust-2', customerName: 'Jane Smith', type: 'BG',
    referenceNumber: 'BG2024001', amount: 250000.00, currency: 'USD',
    issueDate: '2024-03-01', maturityDate: '2025-03-01', status: 'active',
    details: { receivingBank: 'Barclays Bank PLC', bankSwiftCode: 'BARCGB22', beneficiary: 'UK Construction Ltd', beneficiaryAddress: '50 Canary Wharf, London E14 5AB' },
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'inst-5', customerId: 'cust-3', customerName: 'GMG Group Ltd', type: 'KTT',
    referenceNumber: 'KTT2024002', amount: 2000000.00, currency: 'EUR',
    issueDate: '2024-01-15', maturityDate: '2025-01-15', status: 'active',
    details: { issuer: 'Prominence Bank', receiver: 'Deutsche Bank Frankfurt', remitter: 'GMG Group Ltd', beneficiary: 'European Partners GmbH' },
    messageBody: `KEY TESTED TELEX\n\nTO: DEUTSCHE BANK FRANKFURT\nSWIFT: DEUTDEFF\nATTN: INTERNATIONAL SETTLEMENTS DEPARTMENT\n\nFROM: PROMINENCE BANK\nSWIFT: PROMUS33\n\nDATE: JANUARY 15, 2024\nREF: KTT2024002\n\nWE HEREBY CONFIRM AND AUTHENTICATE THE FOLLOWING\nKEY TESTED TELEX TRANSFER:\n\nREMITTER: GMG GROUP LTD\nREMITTER ACCOUNT: 8821456723\nREMITTER BANK: PROMINENCE BANK\nREMITTER ADDRESS: 10 DOWNING BUSINESS PARK, LONDON EC2N 1HQ\n\nBENEFICIARY: EUROPEAN PARTNERS GMBH\nBENEFICIARY BANK: DEUTSCHE BANK FRANKFURT\nBENEFICIARY ADDRESS: TAUNUSANLAGE 12, 60325 FRANKFURT AM MAIN\n\nAMOUNT: EUR 2,000,000.00 (TWO MILLION EUROS)\nVALUE DATE: JANUARY 15, 2024\nMATURITY DATE: JANUARY 15, 2025\n\nPURPOSE: TRADE FINANCE - COMMODITY PURCHASE AGREEMENT\n\nTHIS KEY TESTED TELEX CONFIRMS THAT THE ABOVE REFERENCED\nFUNDS ARE ON DEPOSIT WITH PROMINENCE BANK AND ARE AVAILABLE\nFOR TRANSFER UPON MATURITY OR EARLIER AT THE DISCRETION OF\nTHE REMITTER.\n\nTHIS INSTRUMENT IS:\n- IRREVOCABLE\n- FULLY TRANSFERABLE\n- DIVISIBLE\n- BANK-TO-BANK CONFIRMED\n\nALL CHARGES ARE FOR THE ACCOUNT OF THE REMITTER.\n\nTEST KEY: XXXXXXXXXX\nCONFIRMATION CODE: GMG-KTT-2024-002-EUR\n\nAUTHORIZED OFFICER:\nSARAH MITCHELL\nVICE PRESIDENT - INTERNATIONAL BANKING\nPROMINENCE BANK\n\nCONFIRMED BY:\nCHIEF COMPLIANCE OFFICER\nPROMINENCE BANK`,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'inst-6', customerId: 'cust-3', customerName: 'GMG Group Ltd', type: 'SKR',
    referenceNumber: 'SKR2024001', amount: 5000000.00, currency: 'EUR',
    issueDate: '2024-01-20', maturityDate: '2025-01-20', status: 'active',
    details: { companyName: 'GMG Group Ltd', interestDate: '2024-07-20', interestAmount: 125000, dateOfRelease: '2025-01-20', marketValue: 5500000, restrictions: 'None', fullBankResponsibility: true },
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'inst-7', customerId: 'cust-3', customerName: 'GMG Group Ltd', type: 'POF',
    referenceNumber: 'POF2024001', amount: 500000.00, currency: 'EUR',
    issueDate: '2024-01-25', maturityDate: '2024-07-25', status: 'active',
    details: { companyName: 'GMG Group Ltd', accountHolder: 'GMG Group Ltd', accountNumber: '8821456723', accountBalance: 500000 },
    createdAt: '2024-01-25T00:00:00Z',
  },
];

// Demo Deposits
export const demoDeposits: Deposit[] = [
  { id: 'dep-1', accountId: 'acc-1', accountNumber: '9704588935', customerName: 'John Doe', type: 'cash', amount: 5000.00, currency: 'USD', date: '2024-01-20', time: '14:30', description: 'Cash deposit - branch', status: 'hold', withFee: false, createdBy: 'admin-1', createdAt: '2024-01-20T14:30:00Z' },
  { id: 'dep-2', accountId: 'acc-3', accountNumber: '5051011138', customerName: 'Jane Smith', type: 'cheque', amount: 25000.00, currency: 'USD', date: '2024-01-19', time: '10:00', description: 'Corporate cheque deposit', status: 'released', withFee: true, createdBy: 'admin-1', createdAt: '2024-01-19T10:00:00Z', releasedAt: '2024-01-20T09:00:00Z' },
  { id: 'dep-3', accountId: 'acc-4', accountNumber: '8821456723', customerName: 'GMG Group Ltd', type: 'cash', amount: 50000.00, currency: 'EUR', date: '2024-01-18', time: '11:00', description: 'Capital deposit', status: 'hold', withFee: false, createdBy: 'admin-1', createdAt: '2024-01-18T11:00:00Z' },
];

// Demo Holds
export const demoHolds: Hold[] = [
  { id: 'hold-1', accountId: 'acc-3', accountNumber: '5051011138', customerName: 'Jane Smith', type: 'admin', amount: 15000.00, currency: 'USD', description: 'Compliance review - pending documentation', status: 'active', createdBy: 'admin-1', createdAt: '2024-01-15T09:00:00Z' },
];

// Demo Support Tickets
export const demoSupportTickets: SupportTicket[] = [
  {
    id: 'ticket-1', customerId: 'cust-1', customerName: 'John Doe',
    subject: 'Wire Transfer Inquiry', status: 'open', priority: 'medium',
    messages: [
      { id: 'msg-1', sender: 'customer', senderName: 'John Doe', message: 'I would like to inquire about the status of my international wire transfer (ref: WT2024012002). It has been 3 days and the recipient has not received the funds yet.', timestamp: '2024-01-20T10:00:00Z' },
      { id: 'msg-2', sender: 'support', senderName: 'Support Team', message: 'Thank you for reaching out. We are looking into your wire transfer status. International transfers typically take 3-5 business days. We will provide an update within 24 hours.', timestamp: '2024-01-20T11:30:00Z' },
    ],
    createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T11:30:00Z',
  },
];

// Demo Settings
export const demoFeeTable: FeeTable = {
  monthlyFee: 25.00, internationalTransactionFee: 1.5, bankToBankFee: 0.5,
  bankToOtherBankFee: 1.0, chequeCancellationFee: 35.00, creditCardConversionFee: 2.5,
  loanInterestRate: 7.5, latePaymentFeePerDay: 0.05, cryptoTransferFee: 1.0,
};

export const demoCryptoAddresses: CryptoWalletAddresses = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f8Aa31',
  XLM: 'GBXRPLCMQKZPBMAXBXQW3J3IHIQVFMQJXQGGK6FHSZVWKB6FJZQKRYXK',
  BCH: 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  PAX: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
};

export const demoCDRates: CDInterestTier[] = [
  { term: '1 Year', rangeFrom: 500, rangeTo: 499999, interestRate: 3.0 },
  { term: '1 Year', rangeFrom: 500000, rangeTo: 999999, interestRate: 3.5 },
  { term: '1 Year', rangeFrom: 1000000, rangeTo: 19999999, interestRate: 4.0 },
  { term: '1 Year', rangeFrom: 20000000, rangeTo: 39999999, interestRate: 4.5 },
  { term: '1 Year', rangeFrom: 40000000, rangeTo: 999999999, interestRate: 5.0 },
  { term: '18 Months', rangeFrom: 500, rangeTo: 499999, interestRate: 3.25 },
  { term: '18 Months', rangeFrom: 500000, rangeTo: 999999, interestRate: 3.75 },
  { term: '18 Months', rangeFrom: 1000000, rangeTo: 19999999, interestRate: 4.25 },
  { term: '18 Months', rangeFrom: 20000000, rangeTo: 39999999, interestRate: 4.75 },
  { term: '18 Months', rangeFrom: 40000000, rangeTo: 999999999, interestRate: 5.25 },
  { term: '2 Years', rangeFrom: 500, rangeTo: 499999, interestRate: 3.5 },
  { term: '2 Years', rangeFrom: 500000, rangeTo: 999999, interestRate: 4.0 },
  { term: '2 Years', rangeFrom: 1000000, rangeTo: 19999999, interestRate: 4.5 },
  { term: '2 Years', rangeFrom: 20000000, rangeTo: 39999999, interestRate: 5.0 },
  { term: '2 Years', rangeFrom: 40000000, rangeTo: 999999999, interestRate: 5.5 },
  { term: '3 Years', rangeFrom: 500, rangeTo: 499999, interestRate: 4.0 },
  { term: '3 Years', rangeFrom: 500000, rangeTo: 999999, interestRate: 4.5 },
  { term: '3 Years', rangeFrom: 1000000, rangeTo: 19999999, interestRate: 5.0 },
  { term: '3 Years', rangeFrom: 20000000, rangeTo: 39999999, interestRate: 5.5 },
  { term: '3 Years', rangeFrom: 40000000, rangeTo: 999999999, interestRate: 6.0 },
];

export const demoWireSettings: WireSettings = {
  minimumBalances: { USD: 5000, EUR: 5000, GBP: 5000, CHF: 5000, CAD: 5000, AUD: 5000, JPY: 500000 },
  instructions: `<h2>Wire Transfer Instructions</h2>
<p>To fund your Prominence Bank account, please use the following wire transfer details:</p>
<h3>Domestic Wire (USD)</h3>
<table>
  <tr><td><strong>Bank Name:</strong></td><td>Prominence Bank</td></tr>
  <tr><td><strong>Routing Number:</strong></td><td>021000021</td></tr>
  <tr><td><strong>SWIFT Code:</strong></td><td>PROMUS33</td></tr>
  <tr><td><strong>Account Number:</strong></td><td>[Your Account Number]</td></tr>
  <tr><td><strong>Account Name:</strong></td><td>[Your Account Name]</td></tr>
  <tr><td><strong>Bank Address:</strong></td><td>100 Wall Street, New York, NY 10005, USA</td></tr>
</table>
<h3>International Wire</h3>
<table>
  <tr><td><strong>Bank Name:</strong></td><td>Prominence Bank</td></tr>
  <tr><td><strong>SWIFT Code:</strong></td><td>PROMUS33</td></tr>
  <tr><td><strong>Bank Address:</strong></td><td>100 Wall Street, New York, NY 10005, USA</td></tr>
  <tr><td><strong>Correspondent Bank:</strong></td><td>JPMorgan Chase Bank, N.A.</td></tr>
  <tr><td><strong>Correspondent SWIFT:</strong></td><td>CHASUS33</td></tr>
</table>
<h3>Important Notes</h3>
<ul>
  <li>Always include your account number in the reference field</li>
  <li>International wires may take 3-5 business days to process</li>
  <li>Fees may apply for incoming international wires</li>
  <li>Contact your relationship manager for large transfers over $1,000,000</li>
</ul>`,
};

// Helper functions
export function getCustomerByEmail(email: string): Customer | undefined {
  return demoCustomers.find(c => c.email === email);
}
export function getAccountsByCustomerId(customerId: string): Account[] {
  return demoAccounts.filter(a => a.customerId === customerId);
}
export function getTransactionsByAccountId(accountId: string): Transaction[] {
  return demoTransactions.filter(t => t.accountId === accountId);
}
export function getTotalBalanceByCustomerId(customerId: string): number {
  return demoAccounts.filter(a => a.customerId === customerId).reduce((sum, a) => sum + a.availableBalance, 0);
}
