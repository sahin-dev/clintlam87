import { Invoice, Payment } from '../types';

export const invoices: Invoice[] = [
{
  id: 'INV-1024',
  orderId: 'PO-1018',
  projectId: 'pr-1031',
  supplierId: 'sp-1',
  amount: 31240,
  paid: 0,
  status: 'Pending',
  receivedAt: 'Aug 19, 2026',
  dueDate: 'Aug 30, 2026',
  matched: true
},
{
  id: 'INV-1019',
  orderId: 'PO-1009',
  projectId: 'pr-1042',
  supplierId: 'sp-3',
  amount: 68900,
  paid: 30000,
  status: 'Partially Paid',
  receivedAt: 'Aug 12, 2026',
  dueDate: 'Aug 26, 2026',
  matched: true
},
{
  id: 'INV-1007',
  orderId: 'PO-0996',
  projectId: 'pr-1031',
  supplierId: 'sp-2',
  amount: 24680,
  paid: 24680,
  status: 'Paid',
  receivedAt: 'Jul 31, 2026',
  dueDate: 'Aug 15, 2026',
  matched: true
},
{
  id: 'INV-0994',
  orderId: 'PO-0981',
  projectId: 'pr-1024',
  supplierId: 'sp-2',
  amount: 11420,
  paid: 0,
  status: 'Overdue',
  receivedAt: 'Jul 14, 2026',
  dueDate: 'Aug 13, 2026',
  matched: false
}];


export function invoiceById(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}

export const payments: Payment[] = [
{
  id: 'PAY-2041',
  invoiceId: 'INV-1019',
  projectId: 'pr-1042',
  supplierId: 'sp-3',
  amount: 30000,
  method: 'ACH transfer',
  status: 'Paid',
  date: 'Aug 14, 2026',
  reference: 'ACH ····4192'
},
{
  id: 'PAY-2038',
  invoiceId: 'INV-1007',
  projectId: 'pr-1031',
  supplierId: 'sp-2',
  amount: 24680,
  method: 'ACH transfer',
  status: 'Paid',
  date: 'Aug 8, 2026',
  reference: 'ACH ····4192'
},
{
  id: 'PAY-2044',
  invoiceId: 'INV-1024',
  projectId: 'pr-1031',
  supplierId: 'sp-1',
  amount: 31240,
  method: 'ACH transfer',
  status: 'Processing',
  date: 'Aug 20, 2026',
  reference: 'ACH ····4192'
},
{
  id: 'PAY-2031',
  invoiceId: 'INV-0994',
  projectId: 'pr-1024',
  supplierId: 'sp-2',
  amount: 11420,
  method: 'Corporate card',
  status: 'Failed',
  date: 'Aug 13, 2026',
  reference: 'Card ····7781'
}];