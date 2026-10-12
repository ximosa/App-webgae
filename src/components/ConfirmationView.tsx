import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Printer, Shield, ArrowRight, Clock, FileCheck, Lock } from 'lucide-react';
import { formatCurrencyEUR } from '../shared/catalog.ts';

interface ConfirmationViewProps {
  orderId: string;
  accessToken: string;
  paymentMethod?: 'paypal' | 'card';
  cardLast4?: string;
  cardBrand?: string;
  onReset: () => void;
  onOpenOrderTracking: (orderId: string, token: string) => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  orderId,
  accessToken,
  paymentMethod = 'paypal',
  cardLast4,
  cardBrand,
  onReset,
  onOpenOrderTracking
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const trackingUrl = `${window.location.origin}/?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(accessToken)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8 animate-fade-in">
      {/* Success Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            {paymentMethod === 'card'
              ? `¡Pago con Tarjeta ${cardBrand ? `(${cardBrand}${cardLast4 ? ` •••• ${cardLast4}` : ''}) ` : ''}Verificado con Éxito!`
              : '¡Pago Verificado con Éxito en PayPal!'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contratación Confirmada
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Hemos recibido y verificado tu pago correctamente. Tu orden técnica ya ha sido registrada en nuestro sistema de despacho prioritario.
          </p>
        </div>

        {/* Order Identifier Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Código de Referencia de Pedido:
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-indigo-300">
                {orderId}
              </div>
            </div>
            <button
              onClick={handleCopyId}
              className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Copiado' : 'Copiar código'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Enlace Privado de Seguimiento:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-2 text-xs font-semibold text-slate-200 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Guarda este enlace en tus marcadores para consultar el estado en cualquier momento sin contraseñas.
            </p>
          </div>
        </div>
      </div>

      {/* Protocolo de inicio del servicio (Siguientes Pasos) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Siguientes Pasos Operativos</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Recepción de Comprobante por Email</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {paymentMethod === 'card'
                  ? 'Hemos enviado a tu correo el comprobante oficial de pago con tarjeta y la confirmación detallada con el resumen del servicio contratado.'
                  : 'Hemos enviado a tu correo el recibo oficial de PayPal y la confirmación detallada con el resumen del servicio contratado.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Protocolo Seguro de Credenciales (Cero-Riesgo)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Si tu servicio requiere acceso a WordPress o al hosting, nuestro equipo te enviará un formulario cifrado de un solo uso. No compartas contraseñas por medios inseguros.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Diagnóstico e Intervención Técnica</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Un ingeniero de software especializado asume tu incidencia de forma inmediata según el tiempo de respuesta comprometido. Al finalizar, recibirás el informe técnico de entrega.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Resumen</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenOrderTracking(orderId, accessToken)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 rounded-xl transition-colors"
            >
              Ver Estado en Vivo
            </button>
            <button
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/25"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
