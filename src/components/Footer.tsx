import React from 'react';
import { ShieldCheck, Lock, CreditCard, Sparkles, MessageCircle, Mail } from 'lucide-react';
import { LegalDocType } from './LegalModal.tsx';

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
  onScrollToCatalog: () => void;
  onOpenOrderSearch: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onScrollToCatalog,
  onOpenOrderSearch
}) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      {/* Guarantees bar */}
      <div id="garantias" className="border-b border-slate-800/80 py-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Garantía Técnica de Intervención</div>
              <div className="text-[11px] text-slate-400">7 días de garantía completa sobre cada incidencia corregida.</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Pago Protegido por PayPal</div>
              <div className="text-[11px] text-slate-400">Protección del comprador y verificación cifrada punto a punto.</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Privacidad & RGPD 2016/679</div>
              <div className="text-[11px] text-slate-400">Cero contraseñas en formularios abiertos y minimización de datos.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-extrabold text-base">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span>Webgae</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Plataforma profesional para la contratación inmediata y el pago seguro de servicios de ingeniería web, WordPress, optimización de velocidad y mantenimiento continuo.
          </p>
          <div className="text-[11px] text-slate-500">
            Despliegue verificado en Vercel & Node.js
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Servicios Principales
          </div>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                Reparación Urgente WordPress
              </button>
            </li>
            <li>
              <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                Optimización Core Web Vitals
              </button>
            </li>
            <li>
              <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                Limpieza de Malware y Blindaje
              </button>
            </li>
            <li>
              <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                Planes de Mantenimiento Web
              </button>
            </li>
            <li>
              <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                Desarrollo a Medida
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div className="space-y-3">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Información Legal
          </div>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors">
                Condiciones de Contratación
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors">
                Política de Privacidad (RGPD)
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('refund')} className="hover:text-white transition-colors">
                Cancelación y Reembolsos
              </button>
            </li>
            <li>
              <button onClick={onOpenOrderSearch} className="hover:text-white transition-colors">
                Seguimiento de Pedido Privado
              </button>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Atención al Cliente
          </div>
          <p className="text-[11px] text-slate-400">
            Contacto directo para consultar servicios y confirmar importes:
          </p>
          {import.meta.env.VITE_WHATSAPP_NUMBER && <a href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>}
          {import.meta.env.VITE_CONTACT_EMAIL && <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200"><Mail className="h-4 w-4" /> {import.meta.env.VITE_CONTACT_EMAIL}</a>}
          <p className="text-[11px] text-slate-500">Escríbeme por WhatsApp para confirmar el servicio y el importe antes del pago.</p>
          <p className="text-[10px] text-slate-500">
            Lunes a Viernes de 09:00 a 19:00 CET. Intervenciones críticas prioritarias 24/7.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-[11px] text-slate-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          © {new Date().getFullYear()} Webgae. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Cumplimiento WCAG 2.2 AA</span>
          <span aria-hidden="true">·</span>
          <span>Cifrado TLS 1.3</span>
          <span aria-hidden="true">·</span>
          <span>Pasarela Oficial PayPal</span>
        </div>
      </div>
    </footer>
  );
};
