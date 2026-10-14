import dotenv from 'dotenv';
dotenv.config();

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || 'EUR';

const BASE_URL =
  PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Caché del token de acceso
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export const isPayPalConfigured = Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

/**
 * Obtener Access Token de PayPal OAuth 2.0
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured) {
    throw new Error('Las credenciales de PayPal (PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET) no están configuradas en el entorno.');
  }

  // Comprobar token en caché si aún es válido (con margen de 60 segundos)
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Transferred': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PAYPAL] Error al obtener Access Token:', response.status, errorText);
    throw new Error(`Error de autenticación con PayPal (${response.status}): no se pudo generar token de acceso.`);
  }

  const data = await response.json();
  const expiresInMs = (data.expires_in || 3600) * 1000;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs
  };

  return data.access_token;
}

export interface CreateOrderParams {
  internalOrderId: string;
  serviceName: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResult {
  paypalOrderId: string;
  status: string;
  approveUrl?: string;
}

/**
 * Crear orden en la API REST de PayPal v2/checkout/orders
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResult> {
  const amountStr = (params.amountInCents / 100).toFixed(2);

  // Si no hay credenciales configuradas en el archivo .env, proveer simulación de Sandbox certificada
  if (!isPayPalConfigured) {
    console.log('[PAYPAL SANDBOX SIMULADOR] Generando orden de prueba local segura sin credenciales en vivo');
    const simulatedId = `SANDBOX-ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      paypalOrderId: simulatedId,
      status: 'CREATED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedId}`
    };
  }

  const token = await getPayPalAccessToken();

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.internalOrderId,
        custom_id: params.internalOrderId,
        description: params.serviceName.substring(0, 127),
        amount: {
          currency_code: params.currency,
          value: amountStr
        }
      }
    ],
    application_context: {
      brand_name: 'Webgae',
      locale: 'es-ES',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: params.returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/checkout/confirmacion`,
      cancel_url: params.cancelUrl || `${process.env.APP_URL || 'http://localhost:3000'}/checkout/cancelado`
    }
  };

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[PAYPAL] Error al crear orden v2:', response.status, errorBody);
    throw new Error(`Error en API de PayPal al crear la orden (${response.status})`);
  }

  const data = await response.json();
  const approveLink = data.links?.find((link: { rel: string; href: string }) => link.rel === 'approve');

  return {
    paypalOrderId: data.id,
    status: data.status,
    approveUrl: approveLink?.href
  };
}

export interface CaptureResult {
  success: boolean;
  captureId: string;
  status: string;
  capturedAmountInCents: number;
  currency: string;
  payerEmail?: string;
  raw?: unknown;
}

/**
 * Capturar orden autorizada en PayPal v2/checkout/orders/{id}/capture
 */
export async function capturePayPalOrder(paypalOrderId: string, expectedAmountInCents: number, expectedCurrency: string): Promise<CaptureResult> {
  // Manejo de entorno simulado de pruebas si no hay credenciales
  if (!isPayPalConfigured) {
    console.log('[PAYPAL SANDBOX SIMULADOR] Capturando orden simulada:', paypalOrderId);
    if (!paypalOrderId.startsWith('SANDBOX-ORDER-')) {
      throw new Error('Identificador de orden inválido para el entorno de pruebas.');
    }
    return {
      success: true,
      captureId: `SIM-CAP-${Date.now()}`,
      status: 'COMPLETED',
      capturedAmountInCents: expectedAmountInCents,
      currency: expectedCurrency,
      payerEmail: 'sandbox-customer@webgae.com'
    };
  }

  const token = await getPayPalAccessToken();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PAYPAL] Error al capturar orden:', response.status, errorText);
    throw new Error(`PayPal denegó la captura de la orden (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const captureUnit = data.purchase_units?.[0]?.payments?.captures?.[0];

  if (!captureUnit || captureUnit.status !== 'COMPLETED') {
    throw new Error(`La captura de PayPal no se completó satisfactoriamente. Estado recibido: ${captureUnit?.status || data.status}`);
  }

  const capturedVal = parseFloat(captureUnit.amount?.value || '0');
  const capturedCents = Math.round(capturedVal * 100);
  const capturedCurrency = captureUnit.amount?.currency_code || '';

  // Validación estricta del servidor: comprobar que el importe coincide exactamente
  if (capturedCurrency !== expectedCurrency) {
    throw new Error(`Discrepancia de divisa en PayPal: se esperaba ${expectedCurrency} y se recibió ${capturedCurrency}`);
  }

  if (capturedCents !== expectedAmountInCents) {
    throw new Error(`Discrepancia de importe en PayPal: se esperaba ${expectedAmountInCents} céntimos y se recibió ${capturedCents} céntimos`);
  }

  return {
    success: true,
    captureId: captureUnit.id,
    status: captureUnit.status,
    capturedAmountInCents: capturedCents,
    currency: capturedCurrency,
    payerEmail: data.payer?.email_address,
    raw: data
  };
}

/**
 * Verificación criptográfica de Webhook oficial de PayPal
 */
export async function verifyPayPalWebhookSignature(params: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  rawBody: string;
}): Promise<boolean> {
  if (!isPayPalConfigured || !PAYPAL_WEBHOOK_ID) {
    // Si no está configurado el webhook ID en desarrollo, advertir pero permitir simulación controlada
    console.warn('[PAYPAL WEBHOOK] PAYPAL_WEBHOOK_ID no configurado; no se puede verificar firma criptográfica.');
    return !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
  }

  try {
    const token = await getPayPalAccessToken();

    const verificationPayload = {
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(params.rawBody)
    };

    const response = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationPayload)
    });

    if (!response.ok) {
      console.error('[PAYPAL WEBHOOK] Fallo HTTP en endpoint de verificación:', response.status);
      return false;
    }

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('[PAYPAL WEBHOOK] Excepción al verificar firma:', err);
    return false;
  }
}

export function getPublicPayPalConfig() {
  return {
    paypalClientId: PAYPAL_CLIENT_ID || 'test_client_id_sandbox',
    paypalMode: (PAYPAL_MODE === 'live' ? 'live' : 'sandbox') as 'live' | 'sandbox',
    currency: PAYPAL_CURRENCY,
    isSandboxEmulated: !isPayPalConfigured
  };
}
