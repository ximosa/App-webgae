import { ServiceItem } from './types.ts';

/**
 * Catálogo maestro autorizado de servicios profesionales.
 * Utilizado por el servidor para calcular y validar importes reales,
 * y por el cliente para mostrar alcance, entregables y condiciones.
 */
export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'wp-urgency-repair',
    name: 'Reparación Urgente de Sitio Web / WordPress',
    category: 'repair',
    categoryLabel: 'Reparación y Soporte Crítico',
    shortDescription: 'Solución inmediata a caídas, pantallas blancas, errores 500, bucles de redirección o fallos tras actualización.',
    fullDescription: 'Servicio técnico prioritario orientado a restaurar la operatividad de tu sitio web en el menor tiempo posible. Diagnosticamos la causa raíz del problema (errores fatales de PHP, conflictos entre plugins, base de datos corrupta o fallos de servidor) y aplicamos la corrección técnica garantizada.',
    scope: [
      'Diagnóstico inicial de logs del servidor y depuración en modo debug',
      'Corrección de errores críticos 500, pantalla blanca de la muerte (WSOD) y bucles de redirección',
      'Resolución de incompatibilidades de plugins, temas o versiones de PHP',
      'Reparación de tablas y conexiones corruptas en bases de datos MySQL/MariaDB',
      'Copia de seguridad preventiva antes de cualquier intervención técnica'
    ],
    deliverables: [
      'Sitio web 100% operativo y accesible para usuarios y buscadores',
      'Informe técnico detallado con la causa raíz identificada',
      'Recomendaciones de prevención para evitar que el fallo se repita',
      'Garantía de intervención de 7 días naturales sobre la misma incidencia'
    ],
    requirements: [
      'Acceso temporal al panel de control del hosting (cPanel, Plesk, Cloudways, etc.) o FTP/SSH',
      'Acceso de administrador a WordPress (si el panel de administración aún está accesible)',
      'URL exacta del sitio web y descripción de los síntomas observados'
    ],
    priceInCents: 12900, // 129,00 €
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Diagnóstico e inicio en menos de 2 horas (mismo día laborable)',
    conditions: [
      'Tarifa aplicable a una única instalación web / dominio.',
      'Si el fallo requiere rehacer el sitio por pérdida total de datos sin copia disponible en el hosting, se emitirá una propuesta específica previa consulta.',
      'No incluye desarrollo de nuevas funcionalidades ajenas a la resolución de la avería.'
    ],
    isUrgent: true,
    popular: true,
    active: true
  },
  {
    id: 'wp-speed-optimization',
    name: 'Optimización de Velocidad & Core Web Vitals',
    category: 'speed',
    categoryLabel: 'Rendimiento y SEO Técnico',
    shortDescription: 'Acelera el tiempo de carga por debajo de 1,5 segundos y supera las métricas oficiales LCP, INP y CLS de Google.',
    fullDescription: 'Auditoría e implementación profunda de mejoras de rendimiento técnico en tu sitio web. Optimizamos la entrega de assets críticos, configuramos sistemas avanzados de caché, depuramos hojas de estilo y scripts innecesarios, y garantizamos una experiencia de navegación fluida tanto en dispositivos móviles como en ordenadores.',
    scope: [
      'Configuración avanzada de caché a nivel de servidor y aplicación (Redis/Memcached/Varnish)',
      'Optimización, conversión a WebP/AVIF y compresión de todo el catálogo de imágenes',
      'Minificación y aplazamiento de CSS y JavaScript no críticos para acelerar el renderizado',
      'Optimización de fuentes locales, DNS prefetching y preconexiones de recursos externos',
      'Limpieza y optimización de consultas lentas en la base de datos'
    ],
    deliverables: [
      'Mejora medible en puntuación PageSpeed Insights (móvil y escritorio)',
      'Tiempo de carga interactiva reducido a menos de 1,5 segundos',
      'Informe comparativo antes vs. después de la intervención con métricas reales',
      'Guía breve de buenas prácticas para mantener la velocidad al subir nuevos contenidos'
    ],
    requirements: [
      'Acceso temporal de administrador a WordPress o CMS',
      'Acceso al panel de hosting para configurar módulos de compresión y caché de servidor si procede',
      'URL del sitio web a optimizar'
    ],
    priceInCents: 18900, // 189,00 €
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Entrega completa en 48 - 72 horas laborables',
    conditions: [
      'Tarifa fija para sitios web corporativos, blogs o tiendas online de hasta 100 productos.',
      'La mejora depende de la infraestructura del proveedor de hosting contratado (se señalará si el servidor impone limitaciones de hardware insalvables).'
    ],
    popular: true,
    active: true
  },
  {
    id: 'wp-malware-cleanup',
    name: 'Limpieza de Malware, Desinfección y Blindaje',
    category: 'security',
    categoryLabel: 'Seguridad y Ciberprotección',
    shortDescription: 'Eliminación completa de virus, código malicioso, puertas traseras (backdoors) y retirada de advertencias de seguridad en Google.',
    fullDescription: 'Intervención exhaustiva de desinfección y fortificación para sitios web hackeados. Eliminamos scripts inyectados, desinfectamos la base de datos, cerramos las vulnerabilidades explotadas e intermediamos para retirar las alertas de sitio peligroso en Google Search Console y navegadores.',
    scope: [
      'Escaneo forense profundo de archivos de sistema, temas, plugins y base de datos',
      'Eliminación de código PHP malicioso, redirects no deseados y spam SEO inyectado',
      'Reemplazo de archivos centrales corruptos por versiones oficiales y verificadas',
      'Cierre de brechas de seguridad, configuración de cortafuegos (WAF) y endurecimiento de cabeceras HTTP',
      'Solicitud de reconsideración en Google Safe Browsing y eliminación de alertas rojas'
    ],
    deliverables: [
      'Sitio web completamente desinfectado y verificado con escáneres profesionales',
      'Configuración de seguridad activa con bloqueo de ataques por fuerza bruta',
      'Informe forense explicando el vector de ataque detectado',
      'Garantía de re-infección de 30 días naturales'
    ],
    requirements: [
      'Acceso al hosting (cPanel, SSH o FTP imprescindible) y credenciales de WordPress',
      'Acceso a Google Search Console si se requiere acelerar la retirada del aviso de seguridad'
    ],
    priceInCents: 24900, // 249,00 €
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Desinfección en 24 horas laborables',
    conditions: [
      'Incluye una instalación de WordPress/CMS.',
      'Obligatorio el cambio de todas las contraseñas de usuarios, base de datos y hosting una vez completado el saneamiento.'
    ],
    active: true
  },
  {
    id: 'wp-monthly-maintenance',
    name: 'Plan de Mantenimiento Web y Soporte Preventivo',
    category: 'maintenance',
    categoryLabel: 'Mantenimiento y Soporte Continuo',
    shortDescription: 'Tranquilidad total para tu negocio: actualizaciones seguras con entorno de pruebas, copias en la nube y soporte técnico.',
    fullDescription: 'Cuidado continuo y preventivo de tu sitio web para prevenir averías, mantener la compatibilidad y proteger la inversión. Monitorizamos la disponibilidad las 24 horas, realizamos copias externas y resolvemos dudas y ajustes técnicos mensuales.',
    scope: [
      'Actualizaciones semanales de WordPress Core, plugins y temas con verificación previa en staging',
      'Copias de seguridad automáticas diarias almacenadas en servidor externo seguro',
      'Monitorización de actividad y disponibilidad 24/7 con alerta inmediata en caso de caída',
      'Escaneos automáticos periódicos contra malware y vulnerabilidades',
      'Hasta 2 horas mensuales de soporte técnico o pequeños ajustes incluidos'
    ],
    deliverables: [
      'Informe mensual de estado, actualizaciones aplicadas y rendimiento',
      'Canal de soporte prioritario directo por email con respuesta < 4h',
      'Garantía de restauración inmediata ante cualquier contingencia',
      'Factura mensual deducible'
    ],
    requirements: [
      'Acceso de administrador a la web y panel de alojamiento',
      'Aceptación de las condiciones de mantenimiento preventivo'
    ],
    priceInCents: 8900, // 89,00 € (primer mes contratado)
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Activación en 24 horas tras confirmación de accesos',
    conditions: [
      'Sin permanencia obligatoria: se puede cancelar en cualquier momento avisando con 5 días de antelación al siguiente ciclo.',
      'Las horas de soporte no son acumulables entre meses consecutivos.'
    ],
    active: true
  },
  {
    id: 'web-audit-consulting',
    name: 'Auditoría Técnica Integral & Consultoría Web',
    category: 'custom',
    categoryLabel: 'Consultoría y Análisis',
    shortDescription: 'Evaluación técnica rigurosa de tu sitio web: arquitectura, seguridad, SEO técnico, UX y recomendaciones accionables.',
    fullDescription: 'Análisis detallado de más de 40 puntos críticos que determinan el éxito de tu web. Descubre cuellos de botella técnicos, errores ocultos de rastreo, problemas de accesibilidad y debilidades de conversión antes de invertir en tráfico o rediseños costosos.',
    scope: [
      'Auditoría de arquitectura web, enlazado interno y rendimiento de servidor',
      'Revisión de indexabilidad, etiquetas canónicas y datos estructurados Schema.org',
      'Inspección de accesibilidad (cumplimiento WCAG 2.2 AA) y usabilidad móvil',
      'Chequeo de seguridad perimetral, certificados SSL y encabezados HTTP',
      'Sesión de consultoría privada de 45 minutos para resolver dudas y priorizar tareas'
    ],
    deliverables: [
      'Documento de auditoría técnica en PDF (15-25 páginas) con semáforo de prioridades',
      'Checklist accionable listo para que lo implemente tu equipo o nosotros',
      'Grabación de la sesión de consultoría técnica explicativa'
    ],
    requirements: [
      'URL pública del sitio web',
      'Acceso de lectura a Google Search Console / Analytics (opcional pero muy recomendado)'
    ],
    priceInCents: 14900, // 149,00 €
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Informe y sesión en 3 a 5 días laborables',
    conditions: [
      'El importe de la auditoría se deduce íntegramente si contratas la implementación técnica de las mejoras con nosotros en los siguientes 30 días.'
    ],
    active: true
  },
  {
    id: 'custom-landing-page',
    name: 'Desarrollo de Landing Page de Alta Conversión',
    category: 'custom',
    categoryLabel: 'Desarrollo a Medida',
    shortDescription: 'Página de aterrizaje ultrarrápida, responsive y orientada a captar clientes y ventas con formulario y analítica integrada.',
    fullDescription: 'Diseñamos y programamos una landing page profesional adaptada a tu propuesta de valor. Desarrollada con estándares modernos para máxima velocidad, optimizada para conversión en dispositivos móviles e integrada con tu CRM, email o pasarela de pagos.',
    scope: [
      'Diseño visual personalizado responsive (desktop, tablet y móvil) adaptado a tu marca',
      'Estructura de copywriting orientada a resolver objeciones y generar contactos',
      'Formulario de contacto interactivo con validación y protección antispam',
      'Integración con herramientas analíticas (Google Analytics 4 / Tag Manager / Meta Pixel)',
      'Optimización técnica de velocidad para obtener puntuación A en rendimiento'
    ],
    deliverables: [
      'Landing page completa publicada en tu dominio o lista para desplegar en Vercel/Hosting',
      'Configuración de dominio y certificados SSL seguros',
      'Manual breve de edición de contenidos',
      'Soporte técnico post-lanzamiento durante 15 días'
    ],
    requirements: [
      'Logotipo, manual de identidad corporativa o colores de referencia',
      'Información básica sobre el producto o servicio a ofertar',
      'Dominio y hosting o cuenta de Vercel/Cloudflare'
    ],
    priceInCents: 49000, // 490,00 €
    currency: 'EUR',
    pricingType: 'fixed',
    estimatedDelivery: 'Entrega de primera versión en 5 a 7 días laborables',
    conditions: [
      'Incluye hasta 2 rondas de revisiones y ajustes sobre la propuesta inicial.',
      'Contenidos textuales especializados y fotografías de stock premium corren a cargo del cliente salvo cotización complementaria.'
    ],
    popular: true,
    active: true
  },
  {
    id: 'custom-web-development',
    name: 'Desarrollo Web a Medida, Migraciones & Aplicaciones Web',
    category: 'custom',
    categoryLabel: 'Proyectos a Medida',
    shortDescription: 'Desarrollo de software a medida, integraciones de API personalizadas, plataformas SaaS o migraciones de gran envergadura.',
    fullDescription: 'Proyectos tecnológicos complejos que requieren un análisis técnico previo, arquitectura dedicada y un presupuesto exacto antes de iniciar. Cuéntanos los requerimientos de tu proyecto y prepararemos un presupuesto cerrado sin compromiso en 24 horas.',
    scope: [
      'Toma de requerimientos técnicos y definición de arquitectura de software',
      'Desarrollo frontend moderno (React, Next.js, Astro o WordPress Headless) y APIs backend',
      'Migraciones de plataformas con preservación total de SEO, URLs y bases de datos',
      'Integración con APIs de terceros, pasarelas de pago o sistemas de gestión empresarial (ERP/CRM)'
    ],
    deliverables: [
      'Presupuesto desglosado por fases con plazos y precios garantizados',
      'Documento de especificación funcional y técnica',
      'Código fuente documentado bajo repositorio Git con despliegue continuo en Vercel'
    ],
    requirements: [
      'Descripción detallada del alcance, objetivos del negocio y referencias funcionales',
      'Plazo deseado de lanzamiento y rango presupuestario estimado'
    ],
    priceInCents: null, // A presupuesto
    currency: 'EUR',
    pricingType: 'quote',
    estimatedDelivery: 'Presupuesto formal en menos de 24 horas laborables',
    conditions: [
      'Solicitud de presupuesto 100% gratuita y sin compromiso.',
      'El pago de este tipo de servicio solo se habilita una vez acordada la cotización formal con número de expediente.'
    ],
    active: true
  }
];

/**
 * Obtener un servicio por ID de forma segura desde la fuente autorizada
 */
export function getServiceById(id: string): ServiceItem | undefined {
  return SERVICES_CATALOG.find((s) => s.id === id && s.active);
}

/**
 * Formatear precio en céntimos a euros en formato localizado (ej. 12900 -> 129,00 €)
 */
export function formatCurrencyEUR(amountInCents: number | null): string {
  if (amountInCents === null || amountInCents === undefined) {
    return 'Presupuesto a medida';
  }
  const euros = amountInCents / 100;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: euros % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(euros);
}
