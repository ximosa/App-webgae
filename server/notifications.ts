import dotenv from 'dotenv';
import { OrderRecord, QuoteRequestRecord } from '../src/shared/types.ts';
import { formatCurrencyEUR } from '../src/shared/catalog.ts';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@devpro.local';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_WEBHOOK_URL = process.env.ADMIN_ALERT_WEBHOOK_URL || ''; // Webhook para Telegram, Discord o Slack

export interface NotificationResult {
  adminNotified: boolean;
  clientNotified: boolean;
  channel: string;
}

/**
 * Notificar al administrador y al cliente cuando un pedido ha sido pagado y capturado
 */
export async function notifyNewPaidOrder(order: OrderRecord): Promise<NotificationResult> {
  const subjectAdmin = `🚨 [NUEVO PAGO DEVPRO] ${order.serviceName} (${formatCurrencyEUR(order.amountInCents)}) - ${order.customerName}`;
  const trackingLink = `${APP_URL}/?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.accessToken)}`;

  const adminBodyText = `
=====================================================
NUEVO SERVICIO CONTRATADO Y PAGADO POR PAYPAL
=====================================================
- Referencia de Pedido: ${order.id}
- Servicio: ${order.serviceName} (${order.serviceCategory})
- Importe Cobrado: ${formatCurrencyEUR(order.amountInCents)} EUR
- PayPal Capture ID: ${order.paypalCaptureId || 'Verificado'}
- Fecha y Hora: ${new Date().toLocaleString('es-ES')}

DATOS DEL CLIENTE:
- Nombre / Razón Social: ${order.customerName}
- Correo Electrónico: ${order.customerEmail}
- Sitio Web: ${order.websiteUrl || 'No facilitado'}

DESCRIPCIÓN DE LA INCIDENCIA / NECESIDAD:
"${order.problemDescription}"

${order.technicalNotes ? `NOTAS TÉCNICAS ADICIONALES:\n"${order.technicalNotes}"\n` : ''}

ENLACE DE SEGUIMIENTO EN VIVO:
${trackingLink}
=====================================================
ACCIONES RECOMENDADAS:
1. Revisa la avería o solicitud descrita.
2. Contacta con el cliente en ${order.customerEmail} o envíale el enlace cifrado para solicitar accesos temporales.
3. Inicia la intervención dentro del SLA prometido.
=====================================================
  `.trim();

  // 1. Log formateado en consola del servidor para trazabilidad inmediata
  console.log('\n[NOTIFICACIÓN DE PAGO RECIBIDO]');
  console.log(adminBodyText);
  console.log('\n');

  let adminNotified = false;
  let clientNotified = false;

  // 2. Si se ha configurado Webhook de Alerta (ej. Telegram, Discord o Slack)
  if (ADMIN_WEBHOOK_URL) {
    try {
      await fetch(ADMIN_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **¡NUEVO PAGO RECIBIDO EN DEVPRO!**\n**Servicio:** ${order.serviceName}\n**Importe:** ${formatCurrencyEUR(order.amountInCents)}\n**Cliente:** ${order.customerName} (${order.customerEmail})\n**Web:** ${order.websiteUrl || 'N/A'}\n**Problema:** ${order.problemDescription}\n**Enlace Pedido:** ${trackingLink}`
        })
      });
      adminNotified = true;
      console.log('[NOTIFICACIONES] Alerta instantánea enviada al Webhook de administrador.');
    } catch (webhookErr) {
      console.error('[NOTIFICACIONES] Error al enviar alerta a ADMIN_ALERT_WEBHOOK_URL:', webhookErr);
    }
  }

  // 3. Si se ha configurado Resend API (proveedor de email recomendado para Vercel)
  if (RESEND_API_KEY) {
    try {
      // Email al Administrador
      const resAdmin = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DevPro Alertas <alertas@devpro.local>',
          to: [ADMIN_EMAIL],
          subject: subjectAdmin,
          text: adminBodyText
        })
      });

      if (resAdmin.ok) {
        adminNotified = true;
        console.log(`[NOTIFICACIONES] Correo de aviso enviado al administrador (${ADMIN_EMAIL}).`);
      }

      // Email al Cliente
      const clientBodyText = `
Hola ${order.customerName},

¡Hemos recibido y verificado tu pago de ${formatCurrencyEUR(order.amountInCents)} por el servicio "${order.serviceName}"!

Tu referencia de pedido es: ${order.id}

Puedes consultar el estado de tu pedido en cualquier momento a través de tu enlace privado de seguimiento:
${trackingLink}

Siguientes pasos:
Un miembro de nuestro equipo técnico está revisando los detalles de tu solicitud. En breve recibirás un mensaje para coordinar la intervención o los accesos temporales necesarios a través de un canal seguro.

Gracias por confiar en DevPro Digital.
      `.trim();

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DevPro Soporte <soporte@devpro.local>',
          to: [order.customerEmail],
          subject: `Confirmación de Pedido: ${order.serviceName} [${order.id}]`,
          text: clientBodyText
        })
      });
      clientNotified = true;
    } catch (emailErr) {
      console.error('[NOTIFICACIONES] Error al enviar emails vía Resend:', emailErr);
    }
  }

  return {
    adminNotified,
    clientNotified,
    channel: RESEND_API_KEY ? 'email_resend' : ADMIN_WEBHOOK_URL ? 'webhook' : 'console_logger'
  };
}

/**
 * Notificar al administrador cuando se recibe una solicitud de presupuesto personalizado
 */
export async function notifyNewQuoteRequest(quote: QuoteRequestRecord): Promise<void> {
  const quoteText = `
=====================================================
NUEVA SOLICITUD DE PRESUPUESTO PERSONALIZADO
=====================================================
- Referencia Expediente: ${quote.id}
- Servicio: ${quote.serviceName}
- Cliente: ${quote.customerName} (${quote.customerEmail})
- Web / Referencia: ${quote.websiteUrl || 'No facilitado'}
- Rango de Presupuesto: ${quote.budgetRange || 'A definir'}
- Plazo Deseado: ${quote.timeline || 'Estándar'}

DESCRIPCIÓN DEL PROYECTO:
"${quote.projectDescription}"
=====================================================
  `.trim();

  console.log('\n[NUEVA SOLICITUD DE PRESUPUESTO]');
  console.log(quoteText);
  console.log('\n');

  if (ADMIN_WEBHOOK_URL) {
    try {
      await fetch(ADMIN_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📋 **NUEVA SOLICITUD DE PRESUPUESTO**\n**Expediente:** ${quote.id}\n**Cliente:** ${quote.customerName} (${quote.customerEmail})\n**Presupuesto estimado:** ${quote.budgetRange}\n**Descripción:** ${quote.projectDescription}`
        })
      });
    } catch (e) {
      console.warn('[NOTIFICACIONES] Error en webhook de cotización:', e);
    }
  }
}
