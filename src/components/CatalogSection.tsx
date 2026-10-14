import React from 'react';
import { Clock3, Euro, MessageCircle, ClipboardList } from 'lucide-react';
import { ServiceItem } from '../shared/types.ts';

interface Props { services: ServiceItem[]; onSelectService: (service: ServiceItem, initialHours?: number) => void; onViewDetails: (service: ServiceItem) => void; onRequestQuote: (service: ServiceItem) => void; }
export const CatalogSection: React.FC<Props> = ({ services, onSelectService, onRequestQuote }) => {
  const hourly = services.find(s => s.pricingType === 'hourly' && s.active);
  const fixed = services.find(s => s.pricingType === 'fixed' && s.active) || hourly;
  const whatsapp = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  return <>
    <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 text-center"><p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Pasarela de pagos</p><h2 className="mt-2 text-3xl font-extrabold text-white">Elige cómo quieres pagar</h2><p className="mt-3 text-slate-400">Solo hay dos modalidades. El pago por horas usa la tarifa acordada; para el pago de importe fijo, introduce la cantidad que te he indicado.</p></div>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-7"><Clock3 className="h-8 w-8 text-indigo-400"/><h3 className="mt-4 text-xl font-bold text-white">Pago por horas</h3><p className="mt-2 text-sm text-slate-400">Selecciona las horas contratadas. El total se calcula con la tarifa por hora acordada.</p><button disabled={!hourly} onClick={()=>hourly&&onSelectService(hourly)} className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-500 disabled:opacity-50">Pagar por horas</button></article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-7"><Euro className="h-8 w-8 text-emerald-400"/><h3 className="mt-4 text-xl font-bold text-white">Pago de importe acordado</h3><p className="mt-2 text-sm text-slate-400">Escribe el importe exacto que te he comunicado antes de continuar al pago seguro.</p><button disabled={!fixed} onClick={()=>fixed&&onSelectService(fixed)} className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-50">Introducir importe</button></article>
      </div>
    </section>
    <section id="contacto" className="border-y border-slate-800 bg-slate-900/50 px-4 py-14">
      <div className="mx-auto max-w-6xl text-center"><p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Catálogo Oficial de Servicios Web</p><h2 className="mt-2 text-2xl font-bold text-white">Consulta los servicios y ponte en contacto</h2><p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">El catálogo es informativo. Confirma conmigo el trabajo y el importe por WhatsApp antes de realizar el pago.</p>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">{services.filter(s => s.active).map(s=><article key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5"><h3 className="font-bold text-white">{s.name}</h3><p className="mt-2 text-sm text-slate-400">{s.shortDescription}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{whatsapp && <a className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, quiero consultar: ${s.name}`)}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4"/> Consultar por WhatsApp</a>}<button type="button" onClick={() => onRequestQuote(s)} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200"><ClipboardList className="h-4 w-4"/> Escribir por correo</button></div></article>)}</div>
      </div>
    </section>
  </>;
};
