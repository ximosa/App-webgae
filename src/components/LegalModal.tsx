import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Mail } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'refund' | 'contact';

interface LegalModalProps {
  isOpen: boolean;
  docType: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, docType, onClose }) => {
  if (!isOpen) return null;

  const contentMap: Record<LegalDocType, { title: string; icon: React.ReactNode; body: React.ReactNode }> = {
    terms: {
      title: 'Condiciones Generales de Contratación',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>1. Objeto y Ámbito de Aplicación:</strong> Las presentes condiciones regulan la contratación de servicios técnicos de desarrollo web, mantenimiento, optimización y reparación ofrecidos por <em>DevPro Digital</em> a clientes profesionales, empresas y particulares sin necesidad de registro previo.
          </p>
          <p>
            <strong>2. Procedimiento de Contratación:</strong> El cliente selecciona el servicio deseado en el catálogo oficial, cumplimenta los datos identificativos y técnicos requeridos y formaliza el pago a través de la pasarela segura PayPal. Tras la verificación del pago en el servidor, se emitirá una confirmación con la referencia única de pedido.
          </p>
          <p>
            <strong>3. Precios y Forma de Pago:</strong> Los importes mostrados en el catálogo oficial para servicios de precio cerrado están expresados en Euros (€) e incluyen los impuestos aplicables correspondientes. El pago se efectúa íntegramente mediante PayPal antes de la ejecución técnica.
          </p>
          <p>
            <strong>4. Requisitos y Entrega de Accesos:</strong> Para la ejecución de tareas de reparación, optimización o mantenimiento, el cliente facilitará los accesos temporales imprescindibles mediante un canal cifrado seguro independiente. DevPro Digital nunca solicitará contraseñas a través del formulario de compra inicial.
          </p>
          <p>
            <strong>5. Derecho de Desistimiento:</strong> De conformidad con el artículo 103, apartados a) y m) del Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios (TRLGDCU), el derecho de desistimiento no será aplicable una vez que la prestación del servicio haya comenzado o haya sido completamente ejecutada con el consentimiento previo y expreso del cliente.
          </p>
          <p>
            <strong>6. Garantía de Intervención:</strong> Las reparaciones técnicas cuentan con una garantía de 7 días naturales sobre la misma avería solucionada, siempre que no se hayan introducido modificaciones posteriores por terceros.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Política de Privacidad y Protección de Datos (RGPD)',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>Responsable del Tratamiento:</strong> DevPro Digital Servicios Tecnológicos.
          </p>
          <p>
            <strong>Finalidad del Tratamiento:</strong> Los datos de contacto (nombre, correo electrónico, URL y notas técnicas) facilitados voluntariamente por el cliente en el formulario de contratación sin registro se utilizan exclusivamente para la gestión y ejecución del servicio solicitado, la facturación correspondiente y las comunicaciones operativas relativas al pedido.
          </p>
          <p>
            <strong>Base Jurídica:</strong> La ejecución del contrato de prestación de servicios y el consentimiento explícito del interesado al remitir la solicitud.
          </p>
          <p>
            <strong>Minimización de Datos:</strong> No se solicitan ni almacenan datos bancarios directos; todas las transacciones son gestionadas de extremo a extremo por PayPal bajo sus estrictos protocolos PCI-DSS.
          </p>
          <p>
            <strong>Conservación:</strong> Los datos se conservarán durante el tiempo estrictamente necesario para la ejecución del servicio y el cumplimiento de las obligaciones legales y fiscales aplicables.
          </p>
          <p>
            <strong>Derechos del Usuario:</strong> El interesado puede ejercer sus derechos de acceso, rectificación, supresión, limitación y oposición dirigiéndose a nuestro canal de soporte en cualquier momento.
          </p>
        </div>
      )
    },
    refund: {
      title: 'Política de Cancelación y Reembolsos',
      icon: <RefreshCw className="w-5 h-5 text-amber-400" />,
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>Cancelación antes de iniciar la intervención:</strong> Si has contratado un servicio y solicitas la cancelación antes de que el equipo técnico haya iniciado el diagnóstico o los trabajos, se procederá al reembolso íntegro a través de PayPal en un plazo máximo de 48 horas laborables.
          </p>
          <p>
            <strong>Imposibilidad técnica imputable al servidor:</strong> Si tras el diagnóstico inicial se comprueba que el sitio web no puede ser restaurado debido a fallos de hardware insalvables del hosting ajenos a nuestro control o pérdida total previa sin copias de seguridad, se emitirá un informe técnico detallado y se reembolsará el 100% de la tarifa cobrada.
          </p>
          <p>
            <strong>Servicios ya ejecutados:</strong> Debido a la naturaleza de los servicios digitales y la dedicación horaria especializada, no se admiten devoluciones una vez concluido y verificado el trabajo conforme a los entregables comprometidos.
          </p>
        </div>
      )
    },
    contact: {
      title: 'Contacto y Soporte Técnico',
      icon: <Mail className="w-5 h-5 text-cyan-400" />,
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            ¿Tienes alguna duda antes de contratar o necesitas seguimiento sobre un pedido en curso? Nuestro equipo técnico está a tu disposición.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-sm">soporte@devpro.local</span>
            </div>
            <p className="text-xs text-slate-400">
              Horario de atención: Lunes a Viernes de 09:00 a 19:00 CET. Intervenciones de emergencia 24/7 para pedidos marcados como urgentes.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Tiempo medio de respuesta para consultas de preventa: menos de 2 horas laborables.
          </p>
        </div>
      )
    }
  };

  const current = contentMap[docType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            {current.icon}
            <h2 id="legal-modal-title" className="text-lg font-bold text-slate-100">
              {current.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto space-y-4">
          {current.body}
        </div>

        {/* Pie con botón de cierre */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
