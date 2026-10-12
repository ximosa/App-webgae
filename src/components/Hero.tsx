import React from 'react';
import { ShieldCheck, Zap, Lock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreCatalog: () => void;
  onOpenUrgentService: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCatalog, onOpenUrgentService }) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
      {/* Subtle ambient gradient mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Quiet text kicker - NO pill box */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <span>Servicios de Ingeniería Web & WordPress</span>
            <span aria-hidden="true">·</span>
            <span>Pago Seguro PayPal</span>
            <span aria-hidden="true">·</span>
            <span>Sin Registro</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Contrata soporte técnico web y desarrollo profesional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              en minutos
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Resuelve caídas críticas, acelera tu sitio web, limpia malware o encarga desarrollo a medida con tarifas transparentes. Sin contraseñas previas, sin suscripciones forzadas y con la protección de PayPal.
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Ver Catálogo de Servicios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenUrgentService}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>¿Web Caída? Reparación Urgente</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors space-y-2">
            <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <h3>Sin Cuenta ni Registro</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Elige el servicio, facilita la URL y tus datos de contacto, y abona mediante PayPal como invitado sin memorizar contraseñas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <h3>Diagnóstico Rápido & SLA</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intervenciones de emergencia atendidas en menos de 2 horas. Asignación inmediata de un desarrollador senior a tu caso.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors space-y-2">
            <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <h3>Seguridad Cero-Contraseñas</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nunca pedimos credenciales en el checkout. Una vez contratado, recibirás un protocolo cifrado y seguro para accesos temporales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors space-y-2">
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
              <Award className="w-4 h-4" />
              <h3>Garantía de Satisfacción</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              7 días de garantía técnica sobre cada incidencia resuelta. Si el problema es insalvable por limitaciones de hardware, reembolso íntegro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
