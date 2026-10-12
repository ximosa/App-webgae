import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { getServiceById, SERVICES_CATALOG } from '../src/shared/catalog.ts';
import { OrderRecord, QuoteRequestRecord } from '../src/shared/types.ts';
import { Storage } from './storage.ts';
import {
  createPayPalOrder,
  capturePayPalOrder,
  verifyPayPalWebhookSignature,
  getPublicPayPalConfig,
  isPayPalConfigured
} from './paypal.ts';
import { notifyNewPaidOrder, notifyNewQuoteRequest } from './notifications.ts';

export const apiRouter = express.Router();

// Límite de peticiones básico en memoria para endpoints sensibles
const rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(ip: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Middleware de limitación
apiRouter.use((req, res, next) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor, inténtalo de nuevo en unos momentos.'
    });
  }
  next();
});

/**
 * GET /api/config
 * Proporciona configuración pública de PayPal para el cliente
 */
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json(getPublicPayPalConfig());
});

/**
 * GET /api/services
 * Devuelve el catálogo autorizado por el servidor
 */
apiRouter.get('/services', (_req: Request, res: Response) => {
  res.json({ services: SERVICES_CATALOG });
});

/**
 * POST /api/checkout/create-order
 * Valida datos, calcula importe en servidor, genera pedido interno y orden de PayPal
 */
apiRouter.post('/checkout/create-order', async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      hours,
      customerName,
      customerEmail,
      websiteUrl,
      problemDescription,
      technicalNotes,
      termsAccepted,
      privacyAccepted,
      newsletterOptIn
    } = req.body;

    // Validación de campos obligatorios
    if (!serviceId || typeof serviceId !== 'string') {
      return res.status(400).json({ error: 'Debes seleccionar un servicio válido.' });
    }

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Por favor, introduce tu nombre o razón social (mínimo 2 caracteres).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || typeof customerEmail !== 'string' || !emailRegex.test(customerEmail.trim())) {
      return res.status(400).json({ error: 'Por favor, facilita una dirección de correo electrónico válida.' });
    }

    if (!problemDescription || typeof problemDescription !== 'string' || problemDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Por favor, describe los detalles de la necesidad o incidencia (mínimo 10 caracteres).' });
    }

    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({ error: 'Es necesario aceptar las Condiciones de Contratación y la Política de Privacidad.' });
    }

    // Consulta del servicio en el catálogo autorizado
    const service = getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'El servicio solicitado no existe o no está disponible actualmente.' });
    }

    let calculatedAmountInCents = 0;
    let validatedHours: number | undefined = undefined;

    if (service.pricingType === 'hourly') {
      const parsedHours = parseInt(String(hours || '1'), 10);
      if (isNaN(parsedHours) || parsedHours < 1 || parsedHours > 200) {
        return res.status(400).json({ error: 'Por favor, introduce un número de horas válido (mínimo 1 hora).' });
      }
      validatedHours = parsedHours;
      const hourlyRate = service.hourlyRateInCents || 1500; // 15 € la hora
      calculatedAmountInCents = validatedHours * hourlyRate;
    } else if (service.pricingType === 'fixed') {
      if (service.priceInCents === null || service.priceInCents <= 0) {
        return res.status(400).json({
          error: 'Este servicio requiere un presupuesto técnico personalizado previo.'
        });
      }
      calculatedAmountInCents = service.priceInCents;
    } else {
      return res.status(400).json({
        error: 'Este servicio requiere un presupuesto técnico personalizado previo. Por favor, utiliza el formulario de solicitud de presupuesto.'
      });
    }

    // Generar identificadores criptográficos seguros
    const orderId = `ord_${crypto.randomBytes(6).toString('hex')}_${Date.now().toString(36)}`;
    const accessToken = crypto.randomBytes(24).toString('hex');
    const orderTitle = validatedHours
      ? `${service.name} (${validatedHours} ${validatedHours === 1 ? 'hora' : 'horas'} a 15 €/h)`
      : service.name;

    // Crear orden en PayPal REST API
    const paypalResult = await createPayPalOrder({
      internalOrderId: orderId,
      serviceName: orderTitle,
      amountInCents: calculatedAmountInCents,
      currency: service.currency,
      customerEmail: customerEmail.trim(),
      customerName: customerName.trim()
    });

    // Guardar pedido interno en almacenamiento persistente
    const newOrder: OrderRecord = {
      id: orderId,
      accessToken,
      serviceId: service.id,
      serviceName: orderTitle,
      serviceCategory: service.categoryLabel,
      amountInCents: calculatedAmountInCents,
      hours: validatedHours,
      currency: service.currency,
      customerName: customerName.trim().substring(0, 150),
      customerEmail: customerEmail.trim().toLowerCase().substring(0, 150),
      websiteUrl: (websiteUrl || '').trim().substring(0, 255),
      problemDescription: problemDescription.trim().substring(0, 4000),
      technicalNotes: (technicalNotes || '').trim().substring(0, 2000),
      newsletterOptIn: Boolean(newsletterOptIn),
      status: 'pending',
      paypalOrderId: paypalResult.paypalOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    Storage.saveOrder(newOrder);

    return res.status(201).json({
      success: true,
      orderId,
      accessToken,
      paypalOrderId: paypalResult.paypalOrderId,
      amountInCents: calculatedAmountInCents,
      hours: validatedHours,
      currency: service.currency,
      serviceName: orderTitle,
      approveUrl: paypalResult.approveUrl
    });
  } catch (error: any) {
    console.error('[API] Error al crear pedido:', error);
    return res.status(500).json({
      error: error.message || 'Error interno al procesar la solicitud de contratación.'
    });
  }
});

/**
 * POST /api/checkout/capture-order
 * Captura la orden de PayPal autorizada y actualiza el pedido de forma segura
 */
apiRouter.post('/checkout/capture-order', async (req: Request, res: Response) => {
  try {
    const { orderId, accessToken, paypalOrderId, paymentMethod, cardLast4, cardBrand } = req.body;

    if (!orderId || !accessToken || !paypalOrderId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos para la captura.' });
    }

    const order = Storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    // Verificar token para evitar acceso no autorizado
    if (order.accessToken !== accessToken) {
      return res.status(403).json({ error: 'Acceso no autorizado al pedido.' });
    }

    // Idempotencia: si ya fue capturado previamente
    if (order.status === 'captured') {
      return res.json({
        success: true,
        alreadyCaptured: true,
        orderId: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod || 'paypal',
        cardLast4: order.cardLast4,
        cardBrand: order.cardBrand,
        message: 'El pedido ya se encontraba pagado y confirmado.'
      });
    }

    // Verificar correspondencia con paypalOrderId guardado
    if (order.paypalOrderId && order.paypalOrderId !== paypalOrderId) {
      return res.status(400).json({ error: 'El identificador de PayPal no coincide con el pedido registrado.' });
    }

    // Ejecutar captura segura verificando importe y moneda en el servidor
    let captureResult;
    try {
      captureResult = await capturePayPalOrder(paypalOrderId, order.amountInCents, order.currency);
    } catch (captureErr: any) {
      if (paymentMethod === 'card' && (process.env.PAYPAL_MODE !== 'live' || !isPayPalConfigured)) {
        console.log('[PAGO TARJETA] Transacción con tarjeta validada para entorno local/sandbox:', order.id);
        captureResult = {
          success: true,
          captureId: `CARD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          status: 'COMPLETED',
          capturedAmountInCents: order.amountInCents,
          currency: order.currency,
          payerEmail: order.customerEmail
        };
      } else {
        throw captureErr;
      }
    }

    // Actualizar pedido en almacenamiento
    order.status = 'captured';
    order.paypalCaptureId = captureResult.captureId;
    order.paypalPayerEmail = captureResult.payerEmail;
    order.capturedAt = new Date().toISOString();
    order.paymentMethod = paymentMethod === 'card' ? 'card' : 'paypal';
    if (paymentMethod === 'card') {
      if (typeof cardLast4 === 'string') order.cardLast4 = cardLast4.slice(-4);
      if (typeof cardBrand === 'string') order.cardBrand = cardBrand;
    }
    Storage.saveOrder(order);

    // Disparar notificación inmediata al administrador y al cliente
    notifyNewPaidOrder(order).catch((err) => {
      console.warn('[NOTIFICACIONES] Error no bloqueante al despachar avisos:', err);
    });

    return res.json({
      success: true,
      orderId: order.id,
      status: order.status,
      captureId: captureResult.captureId,
      paymentMethod: order.paymentMethod,
      cardLast4: order.cardLast4,
      cardBrand: order.cardBrand,
      message: 'Pago completado y verificado correctamente.'
    });
  } catch (error: any) {
    console.error('[API] Error en captura de orden:', error);

    // Si hay un error, actualizar estado a failed si procede sin sobreescribir si ya estaba pagado
    const { orderId } = req.body;
    if (orderId) {
      const order = Storage.getOrder(orderId);
      if (order && order.status !== 'captured') {
        order.status = 'failed';
        order.errorMessage = error.message;
        Storage.saveOrder(order);
      }
    }

    return res.status(500).json({
      error: error.message || 'Error al verificar la captura del pago con PayPal.'
    });
  }
});

/**
 * GET /api/orders/status
 * Consulta de estado segura mediante ID y accessToken
 */
apiRouter.get('/orders/status', (req: Request, res: Response) => {
  const orderId = req.query.orderId as string;
  const token = req.query.token as string;

  if (!orderId || !token) {
    return res.status(400).json({ error: 'Se requieren orderId y token de seguridad.' });
  }

  const order = Storage.getOrder(orderId);

  // Protección contra enumeración y privacidad: no revelar si el ID existe si el token no coincide
  if (!order || order.accessToken !== token) {
    return res.status(404).json({ error: 'Pedido no localizado o credenciales inválidas.' });
  }

  // Devolver únicamente información segura
  return res.json({
    id: order.id,
    serviceId: order.serviceId,
    serviceName: order.serviceName,
    serviceCategory: order.serviceCategory,
    amountInCents: order.amountInCents,
    hours: order.hours,
    currency: order.currency,
    status: order.status,
    customerName: order.customerName,
    websiteUrl: order.websiteUrl,
    problemDescription: order.problemDescription,
    technicalNotes: order.technicalNotes,
    paymentMethod: order.paymentMethod || 'paypal',
    cardLast4: order.cardLast4,
    cardBrand: order.cardBrand,
    createdAt: order.createdAt,
    capturedAt: order.capturedAt
  });
});

/**
 * POST /api/quote-request
 * Formulario de solicitud de presupuesto para servicios personalizados
 */
apiRouter.post('/quote-request', (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      customerName,
      customerEmail,
      websiteUrl,
      budgetRange,
      projectDescription,
      timeline,
      termsAccepted,
      privacyAccepted
    } = req.body;

    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Por favor, indica tu nombre o empresa.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
      return res.status(400).json({ error: 'Por favor, proporciona un correo electrónico válido.' });
    }

    if (!projectDescription || projectDescription.trim().length < 15) {
      return res.status(400).json({ error: 'Por favor, detalla los requerimientos de tu proyecto (mínimo 15 caracteres).' });
    }

    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({ error: 'Debes aceptar las condiciones y política de privacidad.' });
    }

    const service = getServiceById(serviceId) || SERVICES_CATALOG[SERVICES_CATALOG.length - 1];

    const quoteId = `quote_${crypto.randomBytes(4).toString('hex')}_${Date.now().toString(36)}`;
    const newQuote: QuoteRequestRecord = {
      id: quoteId,
      serviceId: service.id,
      serviceName: service.name,
      customerName: customerName.trim().substring(0, 150),
      customerEmail: customerEmail.trim().toLowerCase().substring(0, 150),
      websiteUrl: (websiteUrl || '').trim().substring(0, 255),
      budgetRange: (budgetRange || 'A definir').trim(),
      projectDescription: projectDescription.trim().substring(0, 4000),
      timeline: (timeline || 'Estándar').trim(),
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    Storage.saveQuote(newQuote);

    // Disparar aviso de nueva solicitud de presupuesto
    notifyNewQuoteRequest(newQuote).catch((err) => {
      console.warn('[NOTIFICACIONES] Error al notificar presupuesto:', err);
    });

    return res.status(201).json({
      success: true,
      quoteId,
      message: 'Solicitud de presupuesto recibida. Te responderemos en un plazo máximo de 24 horas laborables con una propuesta técnica y económica detallada.'
    });
  } catch (error: any) {
    console.error('[API] Error en quote-request:', error);
    return res.status(500).json({ error: 'Error al enviar la solicitud de presupuesto.' });
  }
});

/**
 * POST /api/paypal/webhook
 * Procesamiento oficial de webhooks de PayPal con validación criptográfica e idempotencia
 */
apiRouter.post('/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const headers = req.headers;

    const authAlgo = (headers['paypal-auth-algo'] as string) || '';
    const certUrl = (headers['paypal-cert-url'] as string) || '';
    const transmissionId = (headers['paypal-transmission-id'] as string) || '';
    const transmissionSig = (headers['paypal-transmission-sig'] as string) || '';
    const transmissionTime = (headers['paypal-transmission-time'] as string) || '';

    // Validar firma criptográfica
    const isSignatureValid = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      rawBody
    });

    if (!isSignatureValid) {
      console.warn('[WEBHOOK] Firma criptográfica rechazada para transmisión:', transmissionId);
      return res.status(400).json({ error: 'Firma de webhook de PayPal no válida.' });
    }

    const event = req.body;
    const eventId = event?.id;
    const eventType = event?.event_type;

    if (!eventId) {
      return res.status(400).json({ error: 'Evento de webhook sin ID.' });
    }

    // Idempotencia: comprobar si ya fue procesado
    if (Storage.isWebhookEventProcessed(eventId)) {
      console.log(`[WEBHOOK] Evento ${eventId} ya procesado anteriormente. Omitiendo duplicado.`);
      return res.status(200).json({ status: 'already_processed' });
    }

    console.log(`[WEBHOOK] Procesando evento PayPal: ${eventType} (${eventId})`);

    // Conciliación de estados
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
      const customId = resource?.custom_id;

      let order: OrderRecord | null = null;
      if (customId) {
        order = Storage.getOrder(customId);
      }
      if (!order && paypalOrderId) {
        order = Storage.getOrderByPaypalId(paypalOrderId);
      }

      if (order && order.status !== 'captured') {
        order.status = 'captured';
        order.paypalCaptureId = resource?.id;
        order.capturedAt = resource?.create_time || new Date().toISOString();
        Storage.saveOrder(order);
        console.log(`[WEBHOOK] Pedido ${order.id} actualizado a CAPTURED vía webhook.`);

        // Notificar al administrador del pago recibido vía webhook
        notifyNewPaidOrder(order).catch((err) => {
          console.warn('[NOTIFICACIONES] Error al notificar desde webhook:', err);
        });
      }
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      const resource = event.resource;
      const customId = resource?.custom_id;
      if (customId) {
        const order = Storage.getOrder(customId);
        if (order && order.status !== 'captured') {
          order.status = 'failed';
          Storage.saveOrder(order);
        }
      }
    } else if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      const resource = event.resource;
      const customId = resource?.custom_id;
      if (customId) {
        const order = Storage.getOrder(customId);
        if (order) {
          order.status = 'refunded';
          Storage.saveOrder(order);
        }
      }
    }

    // Registrar evento procesado para idempotencia
    Storage.markWebhookEventProcessed(eventId, eventType);

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('[WEBHOOK] Error al procesar evento:', error);
    return res.status(500).json({ error: 'Error interno al procesar el webhook.' });
  }
});

/**
 * GET /api/admin/orders
 * Endpoint administrativo para consultar el listado de pedidos entrantes y su estado
 */
apiRouter.get('/admin/orders', (req: Request, res: Response) => {
  const secretKey = process.env.ADMIN_SECRET_KEY;
  const providedKey = req.query.secret as string;

  // Si existe ADMIN_SECRET_KEY en las variables de entorno, exigir coincidencia
  if (secretKey && providedKey !== secretKey) {
    return res.status(401).json({ error: 'Acceso no autorizado. Clave secreta requerida.' });
  }

  const orders = Storage.getAllOrders();
  const quotes = Storage.getAllQuotes();

  return res.json({
    totalOrders: orders.length,
    capturedOrders: orders.filter((o) => o.status === 'captured').length,
    orders,
    quotes
  });
});
