import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, AlertTriangle, RefreshCw, Lock, ExternalLink } from 'lucide-react';
import { formatCurrencyEUR } from '../shared/catalog.ts';

interface OrderStatusModalProps {
  isOpen: boolean;
  initialOrderId?: string;
  initialToken?: string;
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  initialOrderId = '',
  initialToken = '',
  onClose
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);

  useEffect(() => {
    if (initialOrderId && initialToken) {
      setOrderId(initialOrderId);
      setToken(initialToken);
      fetchStatus(initialOrderId, initialToken);
    }
  }, [initialOrderId, initialToken, isOpen]);

  if (!isOpen) return null;

  const fetchStatus = async (idToFetch: string, tokenToFetch: string) => {
    if (!idToFetch.trim() || !tokenToFetch.trim()) {
      setError('Por favor, introduce el código de pedido y el token de acceso.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const response = await fetch(
        `/api/orders/status?orderId=${encodeURIComponent(idToFetch.trim())}&token=${encodeURIComponent(tokenToFetch.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se encontró ningún pedido con las credenciales indicadas.');
      }

      setOrderData(data);
    } catch (err: any) {
      setError(err.message || 'Error al consultar el estado del pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(orderId, token);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-status-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-indigo-400" />
            <h2 id="order-status-title" className="text-base sm:text-lg font-bold text-white">
              Consulta Segura de Pedido
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Cerrar consulta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Query Form */}
          <form onSubmit={handleSearch} className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <label htmlFor="searchOrderId" className="block text-xs font-semibold text-slate-300 mb-1">
                Código de Pedido
              </label>
              <input
                id="searchOrderId"
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ord_..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="searchToken" className="block text-xs font-semibold text-slate-300 mb-1">
                Token Secreto de Acceso
              </label>
              <input
                id="searchToken"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token de 48 caracteres recibido al contratar"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Protección contra accesos no autorizados: solo tú puedes ver los detalles de tu contratación.
              </p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Consultando...' : 'Comprobar Estado'}</span>
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Card */}
          {orderData && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Estado del Pedido</span>
                  <div className="mt-1 flex items-center gap-2">
                    {orderData.status === 'captured' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Pagado & En Intervención
                      </span>
                    ) : orderData.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Clock className="w-4 h-4" /> Pendiente de Pago en PayPal
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 capitalize">
                        {orderData.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Importe Oficial</div>
                  <div className="text-base font-extrabold text-white">
                    {formatCurrencyEUR(orderData.amountInCents)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Servicio:</span>
                  <span className="font-semibold text-slate-200">{orderData.serviceName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="text-slate-200">{orderData.customerName}</span>
                </div>
                {orderData.websiteUrl && (
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Sitio Web:</span>
                    <span className="font-mono text-slate-300">{orderData.websiteUrl}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Fecha de Registro:</span>
                  <span className="text-slate-300">{new Date(orderData.createdAt).toLocaleString('es-ES')}</span>
                </div>
                {orderData.capturedAt && (
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Confirmación Pago:</span>
                    <span className="text-slate-300">{new Date(orderData.capturedAt).toLocaleString('es-ES')}</span>
                  </div>
                )}
              </div>

              {orderData.problemDescription && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Descripción aportada:
                  </span>
                  <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    {orderData.problemDescription}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
