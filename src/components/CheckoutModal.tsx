import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ExternalLink, CreditCard } from 'lucide-react';
import { ServiceItem, CustomerFormData, ServerConfigResponse } from '../shared/types.ts';
import { formatCurrencyEUR } from '../shared/catalog.ts';

interface CheckoutModalProps {
  service: ServiceItem | null;
  initialHours?: number;
  isOpen: boolean;
  serverConfig: ServerConfigResponse | null;
  onClose: () => void;
  onPaymentSuccess: (orderData: {
    orderId: string;
    accessToken: string;
    paymentMethod?: 'paypal' | 'card';
    cardLast4?: string;
    cardBrand?: string;
  }) => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  service,
  initialHours = 1,
  isOpen,
  serverConfig,
  onClose,
  onPaymentSuccess,
  onOpenLegal
}) => {
  const [step, setStep] = useState<'form' | 'summary' | 'payment'>('form');
  const [hours, setHours] = useState<number>(initialHours || 1);
  const [formData, setFormData] = useState<CustomerFormData>({
    customerName: '',
    customerEmail: '',
    websiteUrl: '',
    problemDescription: '',
    technicalNotes: '',
    termsAccepted: false,
    privacyAccepted: false,
    newsletterOptIn: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [cardData, setCardData] = useState({
    number: '',
    holderName: '',
    expiry: '',
    cvc: ''
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  const isHourly = service?.pricingType === 'hourly';
  const effectivePriceInCents = isHourly
    ? hours * (service?.hourlyRateInCents || 1500)
    : (service?.priceInCents || 0);

  // Reiniciar estado al abrir para un nuevo servicio
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setPaymentError(null);
      setIsSubmitting(false);
      setIsCapturing(false);
      setShowCardForm(false);
      setSelectedPaymentMethod('paypal');
      setHours(initialHours || 1);
      setCardData({
        number: '',
        holderName: '',
        expiry: '',
        cvc: ''
      });
      setCardErrors({});
    }
  }, [isOpen, service?.id, initialHours]);

  if (!isOpen || !service) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      errors.customerName = 'Introduce tu nombre completo o razón social.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim() || !emailRegex.test(formData.customerEmail.trim())) {
      errors.customerEmail = 'Introduce una dirección de correo válida.';
    }

    if (formData.websiteUrl && !formData.websiteUrl.includes('.')) {
      errors.websiteUrl = 'Introduce una URL o dominio válido (ej. tudominio.com).';
    }

    if (!formData.problemDescription.trim() || formData.problemDescription.trim().length < 10) {
      errors.problemDescription = 'Describe brevemente la avería o requerimiento (mínimo 10 caracteres).';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Debes aceptar las Condiciones Generales de Contratación.';
    }

    if (!formData.privacyAccepted) {
      errors.privacyAccepted = 'Debes confirmar que has leído la Política de Privacidad.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('summary');
    }
  };

  // Crear pedido en el servidor y obtener ID de PayPal
  const handleInitiateOrder = async () => {
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          hours: isHourly ? hours : undefined,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          websiteUrl: formData.websiteUrl,
          problemDescription: formData.problemDescription,
          technicalNotes: formData.technicalNotes,
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted,
          newsletterOptIn: formData.newsletterOptIn
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al generar la orden en el servidor.');
      }

      setOrderId(data.orderId);
      setAccessToken(data.accessToken);
      setPaypalOrderId(data.paypalOrderId);
      setStep('payment');
    } catch (err: any) {
      console.error('Error al crear orden:', err);
      setPaymentError(err.message || 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ayudantes de validación y formateo de tarjeta de crédito
  const getCardBrand = (num: string): { name: string; brand: 'visa' | 'mastercard' | 'amex' | 'generic' } => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', brand: 'visa' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', brand: 'mastercard' };
    if (/^3[47]/.test(clean)) return { name: 'American Express', brand: 'amex' };
    return { name: 'Tarjeta', brand: 'generic' };
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: val });
    if (cardErrors.number) {
      setCardErrors({ ...cardErrors, number: '' });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: val });
    if (cardErrors.expiry) {
      setCardErrors({ ...cardErrors, expiry: '' });
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, cvc: val });
    if (cardErrors.cvc) {
      setCardErrors({ ...cardErrors, cvc: '' });
    }
  };

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanNumber = cardData.number.replace(/\s/g, '');

    if (!cleanNumber || cleanNumber.length < 15 || cleanNumber.length > 16) {
      errors.number = 'Introduce un número de tarjeta válido (16 dígitos).';
    }

    if (!cardData.holderName.trim() || cardData.holderName.trim().length < 3) {
      errors.holderName = 'Introduce el nombre del titular de la tarjeta.';
    }

    const expiryMatch = cardData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
    if (!expiryMatch) {
      errors.expiry = 'Fecha inválida (formato MM/AA).';
    } else {
      const month = parseInt(expiryMatch[1], 10);
      const year = parseInt(`20${expiryMatch[2]}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'La tarjeta está caducada.';
      }
    }

    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.cvc = 'Código CVC/CVV inválido (3-4 dígitos).';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Capturar orden autorizada (vía PayPal o Tarjeta de crédito)
  const handleCapturePayment = async (
    orderIdToCapture: string,
    token: string,
    pOrderId: string,
    options?: { paymentMethod?: 'paypal' | 'card'; cardLast4?: string; cardBrand?: string }
  ) => {
    setIsCapturing(true);
    setPaymentError(null);

    const method = options?.paymentMethod || 'paypal';
    setSelectedPaymentMethod(method);

    try {
      const response = await fetch('/api/checkout/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdToCapture,
          accessToken: token,
          paypalOrderId: pOrderId,
          paymentMethod: method,
          cardLast4: options?.cardLast4,
          cardBrand: options?.cardBrand
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al verificar la confirmación del pago.');
      }

      // Notificar éxito al componente padre
      onPaymentSuccess({
        orderId: orderIdToCapture,
        accessToken: token,
        paymentMethod: method,
        cardLast4: options?.cardLast4,
        cardBrand: options?.cardBrand
      });
    } catch (err: any) {
      console.error('Error en captura:', err);
      setPaymentError(
        err.message ||
        'Error durante la confirmación del pago. No se ha producido ningún duplicado. Puedes reintentar la comprobación o consultar el estado.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;
    if (orderId && accessToken && paypalOrderId) {
      const brandInfo = getCardBrand(cardData.number);
      const cleanNumber = cardData.number.replace(/\s/g, '');
      handleCapturePayment(orderId, accessToken, paypalOrderId, {
        paymentMethod: 'card',
        cardLast4: cleanNumber.slice(-4),
        cardBrand: brandInfo.name
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="checkout-title" className="text-base sm:text-lg font-bold text-white">
                Contratación de Servicio sin Registro
              </h2>
              <div className="text-xs text-slate-400">
                Paso {step === 'form' ? '1 de 3: Datos' : step === 'summary' ? '2 de 3: Resumen' : '3 de 3: Pago Seguro'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Cerrar contratación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Service Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">{service.categoryLabel}</div>
              <div className="text-sm font-bold text-white">{service.name}</div>
              {isHourly && (
                <div className="text-xs text-indigo-300 font-semibold mt-0.5">
                  {hours} {hours === 1 ? 'hora contratada' : 'horas contratadas'} (15 € / hora)
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-extrabold text-indigo-400">
                {formatCurrencyEUR(effectivePriceInCents)}
              </div>
              <div className="text-[10px] text-slate-400">IVA incluido</div>
            </div>
          </div>

          {/* PASO 1: Formulario sin registro */}
          {step === 'form' && (
            <form onSubmit={handleProceedToSummary} className="space-y-4">
              {/* Selector interactivo de horas si el servicio es por horas */}
              {isHourly && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-200">
                      Número de Horas a Contratar (Tarifa: 15,00 € / hora)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5, 10, 20].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHours(h)}
                          className={`px-2 py-0.5 text-xs font-bold rounded-lg border transition-all ${
                            hours === h
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHours(Math.max(1, hours - 1))}
                        className="px-3.5 py-1.5 text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Restar una hora"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={hours}
                        onChange={(e) => setHours(Math.max(1, parseInt(e.target.value || '1', 10)))}
                        className="w-16 text-center bg-transparent text-sm font-bold text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setHours(hours + 1)}
                        className="px-3.5 py-1.5 text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Añadir una hora"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-300">
                        {hours} × 15 € = <span className="text-base text-emerald-400 font-extrabold">{formatCurrencyEUR(effectivePriceInCents)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Total calculado con IVA incluido</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security advice regarding passwords */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Aviso de Privacidad y Seguridad:</strong> No solicitamos contraseñas ni claves de acceso en este formulario. Tras verificar el pago, te facilitaremos un canal cifrado seguro para compartir los accesos temporales necesarios.
                </p>
              </div>

              {/* Nombre / Empresa */}
              <div>
                <label htmlFor="customerName" className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre y Apellidos o Razón Social <span className="text-rose-400">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ej. Carmen Rodríguez o Empresa Digital S.L."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {formErrors.customerName && (
                  <p className="mt-1 text-xs text-rose-400">{formErrors.customerName}</p>
                )}
              </div>

              {/* Correo electrónico */}
              <div>
                <label htmlFor="customerEmail" className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico para Comunicaciones y Facturación <span className="text-rose-400">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="ejemplo@tudominio.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Te enviaremos a este email la confirmación de la orden, el enlace privado de seguimiento y los informes del servicio.
                </p>
                {formErrors.customerEmail && (
                  <p className="mt-1 text-xs text-rose-400">{formErrors.customerEmail}</p>
                )}
              </div>

              {/* URL del sitio web */}
              <div>
                <label htmlFor="websiteUrl" className="block text-xs font-semibold text-slate-300 mb-1">
                  URL del Sitio Web o Dominio
                </label>
                <input
                  id="websiteUrl"
                  type="text"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://mitiendaonline.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {formErrors.websiteUrl && (
                  <p className="mt-1 text-xs text-rose-400">{formErrors.websiteUrl}</p>
                )}
              </div>

              {/* Descripción del problema */}
              <div>
                <label htmlFor="problemDescription" className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción del Problema o Necesidad <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="problemDescription"
                  rows={3}
                  required
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  placeholder="Ej. El sitio muestra un error 500 tras actualizar el plugin WooCommerce esta mañana..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
                {formErrors.problemDescription && (
                  <p className="mt-1 text-xs text-rose-400">{formErrors.problemDescription}</p>
                )}
              </div>

              {/* Información técnica adicional */}
              <div>
                <label htmlFor="technicalNotes" className="block text-xs font-semibold text-slate-300 mb-1">
                  Información Técnica Adicional (Opcional)
                </label>
                <input
                  id="technicalNotes"
                  type="text"
                  value={formData.technicalNotes}
                  onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                  placeholder="Ej. Proveedor de hosting: SiteGround, Versión PHP 8.1, Tema Astra"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Legal checkboxes */}
              <div className="pt-2 space-y-2 border-t border-slate-800/80">
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    He leído y acepto las{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
                    >
                      Condiciones Generales de Contratación
                    </button>{' '}
                    y las condiciones específicas del servicio.
                  </span>
                </label>
                {formErrors.termsAccepted && (
                  <p className="text-xs text-rose-400 pl-6">{formErrors.termsAccepted}</p>
                )}

                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Confirmo que he leído la{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('privacy')}
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
                    >
                      Política de Privacidad
                    </button>{' '}
                    conforme al RGPD para la gestión de este pedido.
                  </span>
                </label>
                {formErrors.privacyAccepted && (
                  <p className="text-xs text-rose-400 pl-6">{formErrors.privacyAccepted}</p>
                )}

                <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.newsletterOptIn}
                    onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    (Opcional) Deseo recibir recomendaciones sobre seguridad y optimización web por correo.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <span>Continuar al Resumen del Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Resumen del Pedido */}
          {step === 'summary' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Resumen de Contratación
                </div>

                <div className="flex justify-between items-start text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-300">Servicio contratado:</span>
                  <span className="font-semibold text-white text-right">{service.name}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-300">Plazo estimado de entrega:</span>
                  <span className="font-medium text-slate-200">{service.estimatedDelivery}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-300">Cliente:</span>
                  <span className="font-medium text-slate-200">{formData.customerName}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                  <span className="text-slate-300">Email de contacto:</span>
                  <span className="font-mono text-xs text-indigo-300">{formData.customerEmail}</span>
                </div>

                {formData.websiteUrl && (
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                    <span className="text-slate-300">Sitio web:</span>
                    <span className="font-mono text-xs text-slate-300">{formData.websiteUrl}</span>
                  </div>
                )}

                {isHourly && (
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                    <span className="text-slate-300">Horas de desarrollo / soporte:</span>
                    <span className="font-semibold text-emerald-400">{hours} {hours === 1 ? 'hora' : 'horas'} (a 15,00 € / hora)</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base pt-2 font-bold">
                  <span className="text-white">Importe total a pagar:</span>
                  <span className="text-xl text-indigo-400">
                    {formatCurrencyEUR(effectivePriceInCents)}
                  </span>
                </div>
              </div>

              {/* Error si falló la creación */}
              {paymentError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar datos</span>
                </button>

                <button
                  type="button"
                  onClick={handleInitiateOrder}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Iniciando pasarela de pago...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceder al Pago Seguro (PayPal o Tarjeta)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Pasarela de Pago (PayPal o Tarjeta) */}
          {step === 'payment' && (
            <div className="space-y-5 text-center">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Orden Lista para Pago Seguro
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Referencia interna: <span className="font-mono text-indigo-300 font-bold">{orderId}</span>
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Importe total a pagar: <strong className="text-white font-bold">{formatCurrencyEUR(effectivePriceInCents)}</strong>{isHourly ? ` (${hours} ${hours === 1 ? 'hora' : 'horas'} a 15 €/h)` : ''}. Selecciona tu método preferido:
                </p>
              </div>

              {/* Mensajes de error o recuperación */}
              {paymentError && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-900/60 text-xs text-rose-300 text-left space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Incidencia durante el procesamiento</span>
                  </div>
                  <p>{paymentError}</p>
                  <p className="text-[11px] text-slate-400">
                    Tu referencia de pedido se conserva para evitar duplicidades de cargo. Puedes reintentar la captura o verificar el estado.
                  </p>
                </div>
              )}

              {/* Métodos de Pago: PayPal y Tarjeta debajo */}
              <div className="pt-1 space-y-3">
                {isCapturing ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    <div className="text-sm font-semibold text-white">
                      {selectedPaymentMethod === 'card'
                        ? 'Verificando y Procesando Pago Seguro con Tarjeta...'
                        : 'Verificando y Capturando Pago en PayPal...'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Por favor, no cierres esta ventana mientras el servidor valida la transacción.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Botón 1: PayPal */}
                    <button
                      type="button"
                      onClick={() => {
                        if (orderId && accessToken && paypalOrderId) {
                          setSelectedPaymentMethod('paypal');
                          handleCapturePayment(orderId, accessToken, paypalOrderId, { paymentMethod: 'paypal' });
                        }
                      }}
                      className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base bg-[#ffc439] hover:bg-[#f4b628] text-[#003087] transition-all shadow-lg flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <span className="font-black italic text-lg tracking-tight">PayPal</span>
                      <span>— Pagar {formatCurrencyEUR(effectivePriceInCents)}</span>
                    </button>

                    {/* Separador visual */}
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                      </div>
                      <div className="relative px-3 bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        o pagar con tarjeta
                      </div>
                    </div>

                    {/* Botón 2: Tarjeta de Débito o Crédito (debajo de PayPal) */}
                    {!showCardForm ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCardForm(true);
                          if (!cardData.holderName && formData.customerName) {
                            setCardData((prev) => ({ ...prev, holderName: formData.customerName }));
                          }
                        }}
                        className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-750 hover:border-slate-600 border border-slate-700 text-white transition-all shadow-md flex items-center justify-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <CreditCard className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span>Tarjeta de débito o crédito</span>
                        <div className="flex items-center gap-1.5 ml-2 text-[10px] font-black tracking-wider opacity-90">
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60">VISA</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60">MC</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60">AMEX</span>
                        </div>
                      </button>
                    ) : (
                      /* Formulario Desplegable de Pago con Tarjeta */
                      <form onSubmit={handleCardSubmit} className="text-left p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                              Datos de la Tarjeta
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors ${
                              getCardBrand(cardData.number).brand === 'visa' ? 'bg-blue-900/60 text-blue-200 border-blue-500' : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>VISA</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors ${
                              getCardBrand(cardData.number).brand === 'mastercard' ? 'bg-rose-900/60 text-rose-200 border-rose-500' : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>MC</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors ${
                              getCardBrand(cardData.number).brand === 'amex' ? 'bg-amber-900/60 text-amber-200 border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>AMEX</span>
                          </div>
                        </div>

                        {/* Número de Tarjeta */}
                        <div>
                          <label htmlFor="cardNumber" className="block text-xs font-semibold text-slate-300 mb-1">
                            Número de Tarjeta <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="cardNumber"
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="4532 •••• •••• 1234"
                              value={cardData.number}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                              <CreditCard className="w-4 h-4" />
                            </div>
                          </div>
                          {cardErrors.number && (
                            <p className="mt-1 text-xs text-rose-400">{cardErrors.number}</p>
                          )}
                        </div>

                        {/* Titular de la Tarjeta */}
                        <div>
                          <label htmlFor="cardHolder" className="block text-xs font-semibold text-slate-300 mb-1">
                            Nombre del Titular <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id="cardHolder"
                            type="text"
                            autoComplete="cc-name"
                            placeholder="Nombre como figura en la tarjeta"
                            value={cardData.holderName}
                            onChange={(e) => {
                              setCardData({ ...cardData, holderName: e.target.value });
                              if (cardErrors.holderName) setCardErrors({ ...cardErrors, holderName: '' });
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          {cardErrors.holderName && (
                            <p className="mt-1 text-xs text-rose-400">{cardErrors.holderName}</p>
                          )}
                        </div>

                        {/* Fila Caducidad y CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-xs font-semibold text-slate-300 mb-1">
                              Caducidad <span className="text-rose-400">*</span>
                            </label>
                            <input
                              id="cardExpiry"
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              placeholder="MM/AA"
                              value={cardData.expiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            {cardErrors.expiry && (
                              <p className="mt-1 text-xs text-rose-400">{cardErrors.expiry}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cardCvc" className="block text-xs font-semibold text-slate-300 mb-1">
                              CVC / CVV <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="cardCvc"
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                placeholder="•••"
                                value={cardData.cvc}
                                onChange={handleCvcChange}
                                maxLength={4}
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-9"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            {cardErrors.cvc && (
                              <p className="mt-1 text-xs text-rose-400">{cardErrors.cvc}</p>
                            )}
                          </div>
                        </div>

                        {/* Botón Pagar con Tarjeta */}
                        <div className="pt-2 space-y-2">
                          <button
                            type="submit"
                            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Pagar {formatCurrencyEUR(effectivePriceInCents)} con Tarjeta</span>
                          </button>

                          <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Cifrado bancario seguro SSL
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowCardForm(false)}
                              className="text-slate-400 hover:text-slate-200 underline"
                            >
                              Ocultar formulario
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Transacciones protegidas con cifrado SSL de 256 bits y cumplimiento PCI DSS. Sin almacenamiento de datos bancarios en nuestros servidores.
                    </div>
                  </div>
                )}
              </div>

              {/* Botón para volver o cancelar */}
              {!isCapturing && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('summary')}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Volver al resumen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
