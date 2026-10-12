import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Shield, Zap, Lock, CreditCard } from 'lucide-react';

export const HowItWorksAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: '01',
      title: 'Elige tu servicio',
      desc: 'Consulta nuestro catálogo con tarifas cerradas en EUR o solicita presupuesto gratuito si tu proyecto es a medida.'
    },
    {
      num: '02',
      title: 'Datos de contacto (Sin Registro)',
      desc: 'Rellena tu email y describe brevemente la avería o necesidad. No necesitas crear contraseñas ni perfiles.'
    },
    {
      num: '03',
      title: 'Pago verificado con PayPal',
      desc: 'Autoriza el pago de forma segura a través de PayPal. El importe se calcula y valida estrictamente en el servidor.'
    },
    {
      num: '04',
      title: 'Intervención técnica inmediata',
      desc: 'Asignamos a un ingeniero senior a tu caso. Compartirás accesos técnicos por canal cifrado seguro tras la confirmación.'
    }
  ];

  const faqs = [
    {
      q: '¿Por qué no necesito registrarme ni crear una cuenta para contratar?',
      a: 'Creemos que cuando tienes una urgencia técnica o necesitas contratar un servicio web profesional, los procesos de registro, verificación de email y contraseñas añaden fricción innecesaria. Puedes contratar como invitado con tu correo electrónico y recibirás una referencia única con token criptográfico para consultar el estado en cualquier momento.'
    },
    {
      q: '¿Cómo facilito los accesos a mi web sin poner en riesgo mis contraseñas?',
      a: 'Nunca solicitamos contraseñas ni claves API en el formulario abierto de contratación. Tras verificar el pago en PayPal, generamos un enlace seguro de un solo uso cifrado de extremo a extremo para que nos proporciones un usuario temporal de WordPress o del panel de hosting, el cual recomendamos borrar una vez terminada la intervención.'
    },
    {
      q: '¿Qué ocurre si el problema de mi web no tiene solución técnica?',
      a: 'Si tras el diagnóstico inicial determinamos que el sitio no puede recuperarse por una avería insalvable del servidor o pérdida previa total de datos sin copia de seguridad, te entregamos un informe técnico detallado y procedemos al reembolso del 100% del importe cobrado a través de PayPal.'
    },
    {
      q: '¿Emitís factura legal española / europea deducible?',
      a: 'Sí, absolutamente. Tras la confirmación del pago en PayPal, emitimos factura fiscal completa con desglose de IVA para autónomos y empresas de España y la Unión Europea (VIES).'
    },
    {
      q: '¿Cuál es el tiempo de respuesta para reparaciones urgentes?',
      a: 'Los servicios marcados con carácter de Urgencia tienen un tiempo de diagnóstico y primera intervención técnica garantizado inferior a 2 horas laborables desde la recepción de la orden y la verificación de accesos.'
    }
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-800 bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Cómo Funciona */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Flujo Transparente y Sin Fricción
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cómo contratar tu servicio en 4 pasos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Diseñado para resolver incidencias y poner en marcha tus proyectos con máxima rapidez.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
                <span className="font-mono text-xs font-black text-indigo-400">
                  {st.num}
                </span>
                <h3 className="text-base font-bold text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-3xl mx-auto space-y-6 scroll-mt-24">
          <div className="text-center space-y-2">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Respuestas Claras
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-slate-200">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
