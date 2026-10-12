/**
 * Definiciones de tipos para el catálogo de servicios, pedidos y pagos
 */

export type ServiceCategory = 'repair' | 'speed' | 'maintenance' | 'security' | 'custom';

export type PricingType = 'fixed' | 'quote';

export type OrderStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  scope: string[];
  deliverables: string[];
  requirements: string[];
  priceInCents: number | null; // en céntimos de EUR (ej. 12900 = 129,00 €) o null si es a presupuesto
  currency: 'EUR';
  pricingType: PricingType;
  estimatedDelivery: string;
  conditions: string[];
  popular?: boolean;
  isUrgent?: boolean;
  active: boolean;
}

export interface CustomerFormData {
  customerName: string;
  customerEmail: string;
  websiteUrl: string;
  problemDescription: string;
  technicalNotes?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  newsletterOptIn?: boolean;
}

export interface OrderRecord {
  id: string; // ej. ord_abc123
  accessToken: string; // Token secreto para consultar sin enumeración
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  amountInCents: number;
  currency: 'EUR';
  customerName: string;
  customerEmail: string;
  websiteUrl: string;
  problemDescription: string;
  technicalNotes?: string;
  newsletterOptIn: boolean;
  status: OrderStatus;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPayerEmail?: string;
  createdAt: string;
  updatedAt: string;
  capturedAt?: string;
  errorMessage?: string;
}

export interface QuoteRequestData {
  customerName: string;
  customerEmail: string;
  websiteUrl?: string;
  serviceId: string;
  budgetRange?: string;
  projectDescription: string;
  timeline?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface QuoteRequestRecord {
  id: string; // ej. quote_xyz789
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  websiteUrl?: string;
  budgetRange?: string;
  projectDescription: string;
  timeline?: string;
  status: 'submitted' | 'under_review' | 'quoted' | 'approved' | 'rejected';
  assignedPriceInCents?: number;
  assignedQuoteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerConfigResponse {
  paypalClientId: string;
  paypalMode: 'sandbox' | 'live';
  currency: string;
  isSandboxEmulated: boolean;
}
