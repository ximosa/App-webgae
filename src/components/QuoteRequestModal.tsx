import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, AlertCircle, Mail } from 'lucide-react';
import { ServiceItem } from '../shared/types.ts';

interface ContactModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const QuoteRequestModal: React.FC<ContactModalProps> = ({ service, isOpen, onClose, onOpenLegal }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen || !service) return null;

  const close = () => {
    setName(''); setEmail(''); setMessage(''); setPrivacyAccepted(false);
    setError(''); setSent(false); onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 15) { setError('Cuéntame un poco más (mínimo 15 caracteres).'); return; }
    if (!privacyAccepted) { setError('Acepta la política de privacidad para enviar tu consulta.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, customerName: name, customerEmail: email, projectDescription: message, privacyAccepted: true })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'No se pudo enviar la consulta. Inténtalo de nuevo.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la consulta. Inténtalo de nuevo.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400"><Mail className="h-4 w-4"/> Formulario de contacto</div><h2 id="contact-title" className="mt-1 text-lg font-bold text-white">Hablemos de tu proyecto</h2></div>
          <button type="button" onClick={close} aria-label="Cerrar formulario" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5"/></button>
        </header>
        <div className="overflow-y-auto p-6">
          {sent ? <div className="space-y-4 py-5 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400"/><h3 className="text-xl font-bold text-white">Consulta enviada</h3><p className="text-sm text-slate-300">Gracias, {name}. He recibido tu mensaje sobre <strong>{service.name}</strong> y responderé a <strong>{email}</strong>.</p><button type="button" onClick={close} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-500">Cerrar</button></div> : <form onSubmit={submit} className="space-y-5">
            <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/30 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Servicio consultado</p><p className="mt-1 font-bold text-white">{service.name}</p></div>
            {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-sm text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>{error}</div>}
            <div><label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-slate-200">Tu nombre</label><input id="contact-name" required minLength={2} maxLength={150} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre y apellidos" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/></div>
            <div><label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-slate-200">Tu correo electrónico</label><input id="contact-email" required type="email" maxLength={150} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nombre@correo.com" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/><p className="mt-1.5 text-xs text-slate-400">Te responderé a esta dirección.</p></div>
            <div><label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-slate-200">¿En qué puedo ayudarte?</label><textarea id="contact-message" required minLength={15} maxLength={4000} rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Cuéntame brevemente qué necesitas o qué duda tienes…" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/></div>
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300"><input type="checkbox" required checked={privacyAccepted} onChange={e=>setPrivacyAccepted(e.target.checked)} className="mt-0.5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"/><span>He leído y acepto la <button type="button" onClick={()=>onOpenLegal('privacy')} className="font-semibold text-indigo-300 underline">Política de Privacidad</button> para gestionar esta consulta.</span></label>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin"/> Enviando…</> : <><Send className="h-4 w-4"/> Enviar consulta</>}</button>
          </form>}
        </div>
      </div>
    </div>
  );
};
