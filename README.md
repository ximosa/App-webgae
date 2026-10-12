# DevPro Digital – Plataforma de Contratación y Pago de Servicios Web con PayPal y Vercel

Plataforma web comercial y profesional diseñada para la contratación directa y el cobro de servicios técnicos digitales (reparaciones urgentes de sitios web, WordPress, optimización de velocidad Core Web Vitals, desinfección de malware, planes de mantenimiento y desarrollo a medida) **mediante PayPal sin necesidad de registro ni contraseñas**.

Desplegable de forma nativa en **Vercel** como aplicación Full-Stack (Frontend React 19 + API Serverless / Express).

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura Tecnológica](#-arquitectura-tecnológica)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
6. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
7. [Guía Paso a Paso: Configurar PayPal (Sandbox y Live)](#-guía-paso-a-paso-configurar-paypal-sandbox-y-live)
8. [Despliegue en Producción en Vercel](#-despliegue-en-producción-en-vercel)
9. [Configuración y Verificación del Webhook de PayPal](#-configuración-y-verificación-del-webhook-de-paypal)
10. [Flujo de Pago y Seguridad (Cero-Contraseñas & RGPD)](#-flujo-de-pago-y-seguridad-cero-contraseñas--rgpd)
11. [Endpoints de la API](#-endpoints-de-la-api)
12. [Criterios de Aceptación y Pruebas](#-criterios-de-aceptación-y-pruebas)
13. [Licencia](#-licencia)

---

## 🚀 Características Principales

- **Contratación como Invitado (Sin Registro)**: Cualquier cliente puede contratar un servicio en menos de 2 minutos sin crear cuentas, recordar contraseñas ni verificar enlaces de correo innecesarios.
- **Catálogo Autorizado en el Servidor**: Los precios en céntimos de euro (EUR), alcances y entregables se calculan y validan estrictamente en el backend. El cliente no puede manipular importes.
- **Diferenciación entre Tarifa Fija y Cotización Personalizada**:
  - *Servicios de precio cerrado*: Pago directo y verificación automática con PayPal.
  - *Servicios a medida*: Formulario de presupuesto técnico con emisión de número de expediente y respuesta en < 24h, sin cobros ficticios.
- **Integración con PayPal REST API v2**:
  - Creación de órdenes server-side (`/v2/checkout/orders`).
  - Captura autorizada y verificación criptográfica de moneda e importe exacto.
  - Webhooks oficiales con verificación de firma y conciliación **idempotente** (evita duplicidad de eventos o cobros).
- **Seguridad "Cero-Contraseñas"**: El formulario de contratación **no solicita contraseñas de WordPress ni claves de hosting**. Tras confirmar el pago, se activa un protocolo seguro cifrado para accesos temporales.
- **Seguimiento Seguro de Pedidos**: Enlace privado y token criptográfico de un solo dueño para consultar el estado del servicio sin permitir la enumeración de pedidos de terceros.
- **Conformidad Legal y RGPD**: Información adaptada al Reglamento General de Protección de Datos (RGPD) y a la normativa de desistimiento de servicios digitales ejecutados (art. 103 TRLGDCU).
- **Accesibilidad y Rendimiento**: Tipografía cuidada, compatibilidad WCAG 2.2 AA, sin animaciones intrusivas y navegación completa por teclado.

---

## 🛠️ Arquitectura Tecnológica

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Vite 8.
- **Backend / API**: Express 4 con TypeScript, listo para ejecución local unificada con `tsx` y despliegue como Serverless Function en Vercel (`/api/index.ts`).
- **Pasarela de Pago**: PayPal Checkout REST API v2 (compatible con Sandbox y Live).
- **Almacenamiento**: Capa de persistencia segura de pedidos, solicitudes de presupuesto e histórico de webhooks.

---

## 📂 Estructura del Proyecto

```text
├── api/
│   └── index.ts                 # Handler serverless para Vercel
├── server/
│   ├── paypal.ts                # Conexión oficial PayPal REST API y webhooks
│   ├── routes.ts                # Endpoints API (/checkout, /orders, /quote, /paypal)
│   └── storage.ts               # Persistencia de pedidos y eventos procesados
├── src/
│   ├── components/
│   │   ├── CatalogSection.tsx   # Catálogo con filtros y buscador
│   │   ├── CheckoutModal.tsx    # Checkout en 3 pasos con botón PayPal
│   │   ├── ConfirmationView.tsx # Pantalla de confirmación y siguientes pasos
│   │   ├── Footer.tsx           # Pie de página y enlaces legales
│   │   ├── Header.tsx           # Navegación y estado de conexión
│   │   ├── Hero.tsx             # Propuesta de valor y garantías
│   │   ├── HowItWorksAndFaq.tsx # Flujo paso a paso y preguntas frecuentes
│   │   ├── LegalModal.tsx       # Modales de Términos, RGPD y Reembolsos
│   │   ├── OrderStatusModal.tsx # Consulta de estado de pedido con token
│   │   ├── QuoteRequestModal.tsx# Solicitud de cotización para servicios a medida
│   │   └── ServiceDetailModal.tsx # Alcance, entregables y requisitos del servicio
│   ├── shared/
│   │   ├── catalog.ts           # Catálogo maestro de servicios y tarifas
│   │   └── types.ts             # Definición de tipos TypeScript
│   ├── App.tsx                  # Componente principal y gestión de rutas
│   ├── index.css                # Estilos Tailwind y tipografía base
│   └── main.tsx                 # Punto de entrada de la aplicación
├── .env.example                 # Plantilla de variables de entorno
├── index.html                   # HTML con metadatos SEO y Schema.org
├── package.json                 # Dependencias y scripts
├── server.ts                    # Servidor local Express + Vite middleware
├── tsconfig.json                # Configuración de TypeScript
└── vercel.json                  # Configuración de reescritura para Vercel
```

---

## ⚙️ Requisitos Previos

- **Node.js**: versión 18.x o 20.x LTS o superior.
- **npm** (versión 9 o superior).
- Cuenta en [PayPal Developer](https://developer.paypal.com) para obtener credenciales.
- Cuenta en [Vercel](https://vercel.com) para el despliegue en la nube.

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/devpro-digital.git
   cd devpro-digital
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Crear archivo de entorno local**:
   ```bash
   cp .env.example .env
   ```

4. **Iniciar el servidor en desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en [http://localhost:3000](http://localhost:3000). El servidor servirá tanto el cliente como los endpoints de la API (`/api/*`).

5. **Verificar compilación y tipos**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 🔑 Configuración de Variables de Entorno

Edita tu archivo `.env` local y configura las variables en Vercel:

| Variable | Descripción | Valor Local (Ejemplo) | Valor Producción |
| :--- | :--- | :--- | :--- |
| `PORT` | Puerto de escucha en desarrollo | `3000` | Asignado automáticamente |
| `APP_URL` | URL pública de la aplicación | `http://localhost:3000` | `https://tu-dominio.com` |
| `PAYPAL_MODE` | Modo de ejecución de PayPal | `sandbox` | `live` |
| `PAYPAL_CLIENT_ID` | Client ID de la app REST de PayPal | `A...` (Sandbox) | `A...` (Live) |
| `PAYPAL_CLIENT_SECRET` | Client Secret de PayPal | `E...` (Sandbox) | `E...` (Live) |
| `PAYPAL_WEBHOOK_ID` | ID del webhook registrado en PayPal | *(opcional en local)* | `9AB12345CD678901E` |
| `PAYPAL_CURRENCY` | Divisa de cobro | `EUR` | `EUR` |
| `ADMIN_NOTIFICATION_EMAIL` | Email para notificaciones | `pedidos@tudominio.com` | `pedidos@tudominio.com` |

> ⚠️ **Seguridad**: Nunca subas el archivo `.env` a GitHub. Está excluido en `.gitignore`.

---

## 💳 Guía Paso a Paso: Configurar PayPal (Sandbox y Live)

### Paso 1: Crear la Aplicación en PayPal Developer

1. Ve a [developer.paypal.com](https://developer.paypal.com) e inicia sesión con tu cuenta PayPal Business.
2. Accede a **Dashboard** > **Apps & Credentials**.
3. Selecciona la pestaña **Sandbox** (para desarrollo) o **Live** (para producción real).
4. Haz clic en **Create App**:
   - **App Name**: `DevPro Digital`
   - **App Type**: `Merchant`
5. Al crearse, copia el **Client ID** y el **Secret** a tus variables de entorno (`PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`).

### Paso 2: Cuentas de Prueba de Sandbox

1. En el menú lateral, ve a **Testing Tools** > **Sandbox Accounts**.
2. Verás dos cuentas creadas automáticamente:
   - Una cuenta **Business** (recibe los cobros).
   - Una cuenta **Personal** (úsela para simular el pago del cliente).
3. Haz clic en los tres puntos de la cuenta Personal > **View/Edit Account** para ver su email y contraseña de prueba, o generar saldo virtual.

---

## 🌐 Despliegue en Producción en Vercel

### Opción A: Despliegue desde la Interfaz de Vercel (Recomendado)

1. Sube tu código a un repositorio privado o público en GitHub.
2. Inicia sesión en [vercel.com](https://vercel.com) y haz clic en **Add New...** > **Project**.
3. Selecciona tu repositorio y pulsa **Import**.
4. Configuración del proyecto:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Despliega la sección **Environment Variables** y añade las variables de producción:
   - `PAYPAL_MODE` = `live` (o `sandbox` para pruebas iniciales en Vercel Preview)
   - `PAYPAL_CLIENT_ID` = `[Tu Client ID]`
   - `PAYPAL_CLIENT_SECRET` = `[Tu Client Secret]`
   - `PAYPAL_CURRENCY` = `EUR`
   - `APP_URL` = `https://tu-proyecto.vercel.app` (o tu dominio personalizado)
6. Haz clic en **Deploy**.

### Opción B: Despliegue con Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

---

## 🔔 Configuración y Verificación del Webhook de PayPal

El webhook permite reconciliar de forma asíncrona cualquier cambio de estado (pagos completados, rechazos o reembolsos).

1. En [developer.paypal.com](https://developer.paypal.com/dashboard/applications), entra en tu aplicación (Sandbox o Live).
2. Desplázate hacia abajo hasta la sección **Webhooks** y haz clic en **Add Webhook**.
3. En **Webhook URL**, introduce:
   ```text
   https://tu-dominio.vercel.app/api/paypal/webhook
   ```
4. En **Event types**, selecciona los eventos requeridos:
   - `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
   - `Payment capture denied` (`PAYMENT.CAPTURE.DENIED`)
   - `Payment capture refunded` (`PAYMENT.CAPTURE.REFUNDED`)
   - `Checkout order approved` (`CHECKOUT.ORDER.APPROVED`)
5. Guarda el webhook. Copia el **Webhook ID** asignado y establécelo en la variable `PAYPAL_WEBHOOK_ID` en Vercel.
6. El backend verificará criptográficamente cada petición mediante `v1/notifications/verify-webhook-signature` de PayPal y rechazará cualquier intento no firmado o manipulado.

---

## 🔒 Flujo de Pago y Seguridad (Cero-Contraseñas & RGPD)

1. **Elección y Validación**: El cliente elige un servicio con precio cerrado en el catálogo. El servidor comprueba la existencia del servicio y determina el importe oficial en EUR (nunca se confía en parámetros enviados por el navegador).
2. **Creación de Orden**: Se genera un pedido interno (`ord_...`) con estado `pending` y un token de acceso criptográfico de alta entropía. A continuación, el servidor llama a la API de PayPal para crear la orden de compra.
3. **Pago en PayPal**: El cliente autoriza la transacción mediante la ventana segura de PayPal.
4. **Captura Verificada**: El servidor ejecuta la captura con sus credenciales privadas, valida que la moneda sea `EUR` y que el importe coincida al céntimo. Solo entonces el pedido pasa a estado `captured`.
5. **Protocolo Seguro de Credenciales**: Ningún usuario introduce contraseñas en el formulario web. Tras la confirmación, se remite por correo un canal cifrado de un solo uso para que el cliente entregue accesos temporales mínimos indispensables.
6. **Cumplimiento RGPD y Consumidores**: Se solicita consentimiento expreso para el tratamiento de datos y se informa del inicio inmediato del servicio digital bajo el art. 103 de la Ley de Consumidores (TRLGDCU).

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción | Parámetros Principales |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/config` | Configuración pública para el cliente | Ninguno |
| `GET` | `/api/services` | Catálogo autorizado de servicios | Ninguno |
| `POST` | `/api/checkout/create-order` | Valida datos y genera orden en PayPal | `serviceId`, `customerName`, `customerEmail`, `problemDescription`, etc. |
| `POST` | `/api/checkout/capture-order` | Captura y verifica el pago seguro | `orderId`, `accessToken`, `paypalOrderId` |
| `GET` | `/api/orders/status` | Consulta segura de pedido con token | `?orderId=ord_...&token=...` |
| `POST` | `/api/quote-request` | Solicitud de cotización para servicios a medida | `serviceId`, `customerEmail`, `projectDescription`, etc. |
| `POST` | `/api/paypal/webhook` | Recepción y verificación criptográfica de eventos | Encabezados de firma de PayPal y cuerpo JSON |

---

## 🧪 Criterios de Aceptación y Pruebas

Antes del lanzamiento a producción se ha verificado:

- [x] Contratación de tarifa fija completada sin registro de cuenta ni contraseñas.
- [x] Los servicios de presupuesto a medida no permiten pagos directos por importes inventados.
- [x] El servidor calcula el precio real y rechaza importes modificados desde la consola de desarrollo.
- [x] Creación y captura exitosa en el entorno Sandbox de PayPal.
- [x] Las cancelaciones o cierres de ventana no marcan pedidos como pagados.
- [x] Idempotencia en capturas y webhooks (solicitudes duplicadas no generan doble cobro).
- [x] Imposibilidad de consultar pedidos ajenos adivinando identificadores secuenciales (protección por token aleatorio).
- [x] Sin credenciales sensibles ni claves secretas en el frontend o código cliente.
- [x] Navegación funcional en móviles, tablets y por teclado con contraste WCAG 2.2 AA.
- [x] Compilación (`npm run build`) y tipado (`npm run lint`) con **0 errores**.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Puedes adaptarlo y utilizarlo libremente para tu estudio, agencia o proyectos comerciales de desarrollo web.
