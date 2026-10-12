import React from 'react';
import { Shield, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { ServerConfigResponse } from '../shared/types.ts';

interface HeaderProps {
  serverConfig: ServerConfigResponse | null;
  onOpenOrderSearch: () => void;
  onScrollToCatalog: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'refund' | 'contact') => void;
}

export const Header: React.FC<HeaderProps> = ({
  serverConfig,
  onOpenOrderSearch,
  onScrollToCatalog,
  onOpenLegal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2.5 text-slate-100 hover:text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                DevPro <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Digital</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide uppercase font-medium">Servicios Web Profesionales</span>
            </div>
          </a>
        </div>

        {/* Navigation - Clean unboxed text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300" aria-label="Navegación principal">
          <button
            onClick={onScrollToCatalog}
            className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            Catálogo
          </button>
          <a
            href="#garantias"
            className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            Garantías
          </a>
          <a
            href="#faq"
            className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            Preguntas Frecuentes
          </a>
          <button
            onClick={() => onOpenLegal('contact')}
            className="text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
          >
            Contacto
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Order lookup button */}
          <button
            onClick={onOpenOrderSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Consultar estado de un pedido existente"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Consultar Pedido</span>
            <span className="sm:hidden">Buscar</span>
          </button>

          {/* Direct CTA */}
          <button
            onClick={onScrollToCatalog}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Contratar Servicio
          </button>
        </div>
      </div>

      {/* Reassurance banner for sandbox / live status */}
      {serverConfig?.isSandboxEmulated && (
        <div className="bg-amber-950/40 border-t border-amber-900/40 text-[11px] text-amber-300 px-4 py-1 text-center flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Modo Sandbox PayPal Activo (entorno seguro de pruebas y demostración). Puedes contratar y testear sin cargos reales.</span>
        </div>
      )}
    </header>
  );
};
