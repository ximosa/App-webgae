import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { ServiceItem } from '../shared/types.ts';

interface QuoteRequestModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  service,
  isOpen,
  onClose,
  onOpenLegal
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    websiteUrl: '',
    budgetRange: '1.500 € - 3.000 €',
    timeline: 'En las próximas 2 a 4 semanas',
    projectDescription: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<{ quoteId: string; message: string } | null>(null);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.projectDescription.trim()) {
      setError('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('Debes aceptar las condiciones y confirmar la lectura de la política de privacidad.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          websiteUrl: formData.websiteUrl,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          projectDescription: formData.projectDescription,
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar la solicitud de presupuesto.');
      }

      setQuoteSuccess({
        quoteId: data.quoteId,
        message: data.message
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo registrar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setQuoteSuccess(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Solicitud de Presupuesto Personalizado
            </div>
            <h2 id="quote-modal-title" className="text-base sm:text-lg font-bold text-white">
              {service.name}
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Cerrar presupuesto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {quoteSuccess ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Solicitud de Presupuesto Recibida
              </h3>
              <p className="text-xs text-slate-300">
                {quoteSuccess.message}
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300">
                Referencia de Expediente: {quoteSuccess.quoteId}
              </div>
              <p className="text-[11px] text-slate-400">
                Un ingeniero senior analizará tus requerimientos técnicos y te enviará la propuesta detallada a <strong>{formData.customerEmail}</strong>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  Entendido y Volver
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 text-xs text-sky-200">
                Este servicio requiere especificación previa. Analizaremos tu proyecto y te remitiremos un presupuesto formal cerrado sin compromiso.
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre y Apellidos o Empresa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ej. Roberto Sánchez (Studio Web)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico de Contacto <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="roberto@ejemplo.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL del Sitio Web o Referencias (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://tudominio.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Rango Presupuestario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rango de Inversión Estimado
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="500 € - 1.500 €">500 € - 1.500 €</option>
                    <option value="1.500 € - 3.000 €">1.500 € - 3.000 €</option>
                    <option value="3.000 € - 6.000 €">3.000 € - 6.000 €</option>
                    <option value="Más de 6.000 €">Más de 6.000 €</option>
                    <option value="A definir con consultoría">A definir con asesoramiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plazo Deseado
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Inmediato (< 2 semanas)">Inmediato (&lt; 2 semanas)</option>
                    <option value="En las próximas 2 a 4 semanas">2 a 4 semanas</option>
                    <option value="1 a 2 meses">1 a 2 meses</option>
                    <option value="Sin fecha fija / Flexible">Sin fecha fija / Flexible</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción Detallada del Proyecto <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Detalla qué funcionalidades necesitas, integraciones de API, tecnologías deseadas o problemas a resolver..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    Acepto las{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="text-sky-400 underline font-semibold"
                    >
                      Condiciones de Contratación
                    </button>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    He leído la{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('privacy')}
                      className="text-sky-400 underline font-semibold"
                    >
                      Política de Privacidad
                    </button>{' '}
                    y autorizo el tratamiento de mis datos para la emisión del presupuesto.
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{loading ? 'Enviando...' : 'Solicitar Presupuesto Gratuito'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
