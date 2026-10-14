import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { ServiceItem } from '../shared/types.ts';

interface HeroProps { onExploreCatalog: () => void; onOpenUrgentService: () => void; }
export const Hero: React.FC<HeroProps> = ({ onExploreCatalog, onOpenUrgentService }) => (
  <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 md:py-24">
    <div className="mx-auto max-w-5xl px-4 text-center">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Webgae · Pagos seguros</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Paga tus servicios web <span className="text-indigo-400">fácilmente</span></h1>
      <p className="mx-auto mt-6 max-w-2xl text-slate-300">Escoge el pago por horas o abona el importe que hemos acordado contigo. ¿Tienes dudas? Contacta conmigo por WhatsApp antes de pagar.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={onExploreCatalog} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-500">Ver formas de pago <ArrowRight className="h-4 w-4" /></button>
        <a href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero consultar un servicio web.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/50 px-6 py-3 font-bold text-emerald-200 hover:bg-emerald-900"><MessageCircle className="h-4 w-4" /> Escribir por WhatsApp</a>
      </div>
      <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
        {[['Pago por horas','Elige cuántas horas necesitas.'],['Importe acordado','Introduce la cantidad que te indiqué.'],['Pago protegido','Checkout seguro procesado por PayPal.']].map(([title,desc])=><div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><ShieldCheck className="mb-3 h-5 w-5 text-indigo-400"/><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{desc}</p></div>)}
      </div>
    </div>
  </section>
);
