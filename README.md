# DevPro Digital — Pasarela de pagos

Aplicación web para que los clientes puedan pagar servicios acordados mediante dos modalidades: pago por horas e importe fijo acordado. El catálogo de servicios funciona como referencia y canal de contacto, no como tienda ni contratación automática.

## Cómo funciona

1. El cliente confirma contigo el servicio y la cantidad a pagar.
2. Elige una de las dos modalidades disponibles.
3. Para el pago por horas, selecciona el número de horas según la tarifa que le hayas comunicado.
4. Para un importe fijo, introduce la cantidad exacta que le indicaste.
5. El servidor valida y crea la orden de PayPal; el cliente completa el pago en el checkout seguro.
6. El catálogo oficial permite consultar servicios y contactar contigo por WhatsApp.

La modalidad fija acepta importes entre 0,01 € y 1.000.000 €. La modalidad por horas usa la tarifa configurada en `src/shared/catalog.ts`. Ajusta esa tarifa antes de publicar.

## Contacto por WhatsApp

Configura `VITE_WHATSAPP_NUMBER` con tu teléfono en formato internacional, solo dígitos y sin `+`, espacios ni guiones. Por ejemplo: `34600111222`. Vite incorpora esta variable al frontend durante la compilación, así que debes volver a compilar tras cambiarla. Si no se configura, el botón de WhatsApp no tendrá un destinatario válido.

El catálogo abre un formulario de contacto asociado al servicio seleccionado. Para recibir los mensajes por correo, configura `RESEND_API_KEY` y `ADMIN_NOTIFICATION_EMAIL` en el servidor. `RESEND_FROM_EMAIL` debe ser una dirección de remitente verificada en Resend para producción; el valor de ejemplo sirve para pruebas limitadas. Las consultas incluyen el correo del cliente como dirección de respuesta.

## Requisitos

- Node.js 18 o posterior
- npm
- Cuenta PayPal Developer y aplicación REST para Sandbox/Live

## Instalación local

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` en `.env` y completa las credenciales de PayPal y la URL pública. Nunca publiques secretos ni el archivo `.env`.

- `PAYPAL_MODE`: `sandbox` para pruebas o `live` para cobros reales.
- `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`: credenciales REST de PayPal.
- `PAYPAL_WEBHOOK_ID`: identificador del webhook, si se habilita.
- `PAYPAL_CURRENCY`: moneda de cobro; por defecto EUR.
- `APP_URL`: URL pública usada para los retornos de PayPal.
- `VITE_WHATSAPP_NUMBER`: destinatario de los enlaces de contacto, formato internacional solo dígitos.

## Desarrollo y despliegue

- `npm run dev`: entorno local.
- `npm run build`: genera la aplicación de producción en `dist`.
- `npm run start`: servidor de producción.

La API Express está en `server/` y el adaptador serverless de Vercel en `api/`. Configura las variables de entorno también en el proveedor de despliegue. Prueba los pagos en Sandbox antes de activar Live.

## Estructura principal

- `src/components/Hero.tsx`: portada y acceso al contacto.
- `src/components/CatalogSection.tsx`: las dos modalidades de pago y acceso al catálogo/contacto.
- `src/components/CheckoutModal.tsx`: datos del pagador, horas o importe acordado y flujo PayPal.
- `server/routes.ts`: validación de importes y creación/captura de órdenes.
- `server/paypal.ts`: integración con PayPal.
- `src/shared/catalog.ts`: tarifas y moneda de la modalidad por horas.

## Importante

El importe fijo es el que tú comunicas al cliente antes de pagar. La aplicación permite escribirlo y el servidor limita formato y rango, pero no comprueba que coincida con un presupuesto externo. Confírmalo con el cliente antes de enviarle a esta página.
