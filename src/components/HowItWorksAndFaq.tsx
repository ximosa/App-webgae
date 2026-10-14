import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const HowItWorksAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: '01',
      title: 'Acuerda el trabajo y el importe',
      desc: 'Consulta el catálogo informativo y confirma conmigo por WhatsApp o mediante el formulario qué necesitas y cuánto pagar.'
    },
    {
      num: '02',
      title: 'Elige cómo pagar',
      desc: 'Selecciona pago por horas o pago de importe fijo acordado. En el pago fijo, escribe la cantidad que te indiqué.'
    },
    {
      num: '03',
      title: 'Completa tus datos',
      desc: 'Indica tu nombre y correo para identificar el pago y recibir la confirmación. Puedes añadir una referencia opcional.'
    },
    {
      num: '04',
      title: 'Paga de forma segura',
      desc: 'Continúa al checkout de PayPal para completar el pago y recibir la confirmación de la operación.'
    }
  ];

  const faqs = [
    {
      q: '¿Qué formas de pago hay?',
      a: 'Hay dos modalidades: pago por horas, donde indicas las horas acordadas, y pago de importe fijo, donde escribes la cantidad que te comuniqué. Ambas continúan al checkout seguro de PayPal.'
    },
    {
      q: '¿Cómo sé qué importe debo pagar?',
      a: 'Confirma conmigo el trabajo y su importe antes de pagar. Para el pago fijo, introduce exactamente la cantidad que te indiqué; para el pago por horas, selecciona las horas acordadas.'
    },
    {
      q: '¿Puedo consultar un servicio antes de pagar?',
      a: 'Sí. Usa el botón de WhatsApp o el formulario de contacto de la ficha del servicio. El mensaje llegará con el servicio seleccionado para que puedas explicarme tu consulta.'
    },
    {
      q: '¿Qué datos tengo que completar para pagar?',
      a: 'Solo pedimos tu nombre y correo electrónico para identificar la operación y enviarte la confirmación. El concepto o referencia del pago es opcional.'
    },
    {
      q: '¿Qué hago si no recibo la confirmación?',
      a: 'Comprueba primero el correo asociado al pago. Si necesitas ayuda, contacta conmigo por WhatsApp o envía una consulta desde el formulario del catálogo.'
    }
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-800 bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Cómo Funciona */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Pago sencillo y transparente
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cómo realizar tu pago en 4 pasos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Consulta el servicio, confirma el importe y completa el pago con los datos necesarios.
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
