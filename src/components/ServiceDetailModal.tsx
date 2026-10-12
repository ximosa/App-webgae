import React from 'react';
import { X, CheckCircle2, Clock, ShieldCheck, ArrowRight, AlertTriangle, FileText } from 'lucide-react';
import { ServiceItem } from '../shared/types.ts';
import { formatCurrencyEUR } from '../shared/catalog.ts';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: (service: ServiceItem) => void;
  onRequestQuote: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onProceedCheckout,
  onRequestQuote
}) => {
  if (!isOpen || !service) return null;

  const isFixed = service.pricingType === 'fixed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-detail-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              {service.categoryLabel}
            </div>
            <h2 id="service-detail-title" className="text-xl font-extrabold text-white">
              {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Cerrar detalle del servicio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Price & Delivery overview */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Importe Oficial</div>
              <div className="text-2xl font-black text-white">
                {formatCurrencyEUR(service.priceInCents)}
                {isFixed && <span className="text-xs text-slate-400 font-normal ml-1">/ tarifa fija</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{service.estimatedDelivery}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-2">
              Descripción General
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {service.fullDescription}
            </p>
          </div>

          {/* Scope */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-3">
              Alcance de la Intervención
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
              {service.scope.map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-3">
              Entregables Comprometidos
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {service.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements & Security */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Requisitos que deberás facilitar tras la contratación
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-6 list-disc">
              {service.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-300/90 pt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Aviso de seguridad: nunca envíes contraseñas en formularios abiertos. Te facilitaremos un canal cifrado tras el pago.</span>
            </p>
          </div>

          {/* Conditions */}
          {service.conditions && service.conditions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                Condiciones Particulares
              </h3>
              <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
                {service.conditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Volver al catálogo
          </button>

          {isFixed ? (
            <button
              onClick={() => {
                onClose();
                onProceedCheckout(service);
              }}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Contratar ahora ({formatCurrencyEUR(service.priceInCents)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onRequestQuote(service);
              }}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <span>Solicitar Presupuesto Gratuito</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
