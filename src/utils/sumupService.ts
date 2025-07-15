import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// SumUp API configuration
const SUMUP_API_URL = 'https://api.sumup.com/v0.1';

// Types for SumUp API
interface SumUpPaymentLinkRequest {
  checkout_reference: string;
  amount: number;
  currency: string;
  merchant_code: string;
  description: string;
  return_url: string;
  pay_to_email?: string;
  customer_id?: string;
  customer_email?: string;
}

interface SumUpInvoiceRequest {
  merchant_code: string;
  customer: {
    name: string;
    email: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    }
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  currency: string;
  due_date?: string;
  notes?: string;
  reference?: string;
}

interface SumUpPaymentLinkResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  checkout_reference: string;
  payment_link: string;
}

interface SumUpInvoiceResponse {
  id: string;
  status: string;
  invoice_url: string;
  reference: string;
}

// Create a payment link
export async function createPaymentLink(
  amount: number,
  description: string,
  merchantCode: string,
  apiKey: string,
  customerEmail?: string,
  orderId?: string
): Promise<SumUpPaymentLinkResponse> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, you would make an actual API call to SumUp
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if we have valid credentials
    if (!merchantCode || merchantCode === 'demo_merchant_code' || !apiKey || apiKey === 'demo_api_key') {
      console.warn('Using demo SumUp credentials. In production, use real credentials.');
    }
    
    const checkoutReference = orderId || uuidv4();
    
    // Create a simulated response
    const response: SumUpPaymentLinkResponse = {
      id: uuidv4(),
      status: 'PENDING',
      amount: amount,
      currency: 'GBP',
      checkout_reference: checkoutReference,
      payment_link: `https://pay.sumup.com/b/${checkoutReference}`
    };
    
    console.log('Created SumUp payment link:', response);
    
    return response;
  } catch (error) {
    console.error('Error creating SumUp payment link:', error);
    throw new Error('Failed to create payment link. Please check your SumUp credentials and try again.');
  }
}

// Generate an invoice
export async function generateInvoice(
  customerName: string,
  customerEmail: string,
  items: Array<{name: string, quantity: number, price: number}>,
  total: number,
  merchantCode: string,
  apiKey: string,
  address?: {
    street: string,
    city: string,
    state: string,
    zipCode: string
  },
  notes?: string,
  orderId?: string
): Promise<SumUpInvoiceResponse> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, you would make an actual API call to SumUp
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Check if we have valid credentials
    if (!merchantCode || merchantCode === 'demo_merchant_code' || !apiKey || apiKey === 'demo_api_key') {
      console.warn('Using demo SumUp credentials. In production, use real credentials.');
    }
    
    const invoiceReference = orderId || uuidv4();
    
    // Create a simulated response
    const response: SumUpInvoiceResponse = {
      id: uuidv4(),
      status: 'SENT',
      invoice_url: `https://invoice.sumup.com/${invoiceReference}`,
      reference: invoiceReference
    };
    
    console.log('Generated SumUp invoice:', response);
    
    return response;
  } catch (error) {
    console.error('Error generating SumUp invoice:', error);
    throw new Error('Failed to generate invoice. Please check your SumUp credentials and try again.');
  }
}

// Verify payment status
export async function verifyPaymentStatus(
  paymentId: string,
  merchantCode: string,
  apiKey: string
): Promise<{status: string}> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, you would make an actual API call to SumUp
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if we have valid credentials
    if (!merchantCode || merchantCode === 'demo_merchant_code' || !apiKey || apiKey === 'demo_api_key') {
      console.warn('Using demo SumUp credentials. In production, use real credentials.');
    }
    
    // For demo purposes, we'll randomly return a payment status
    // In production, this would be the actual status from SumUp
    const statuses = ['PENDING', 'PAID', 'FAILED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return { status: randomStatus };
  } catch (error) {
    console.error('Error verifying SumUp payment status:', error);
    throw new Error('Failed to verify payment status. Please check your SumUp credentials and try again.');
  }
}