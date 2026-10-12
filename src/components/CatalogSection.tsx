import React, { useState, useMemo } from 'react';
import { Search, Check, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../shared/types.ts';
import { formatCurrencyEUR } from '../shared/catalog.ts';

interface CatalogSectionProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem, initialHours?: number) => void;
  onViewDetails: (service: ServiceItem) => void;
  onRequestQuote: (service: ServiceItem) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  services,
  onSelectService,
  onViewDetails,
  onRequestQuote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoursByService, setHoursByService] = useState<Record<string, number>>({});

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los Servicios' },
    { id: 'hours', label: 'Pago por Horas (15 €/h)' },
    { id: 'repair', label: 'Reparaciones Urgentes' },
    { id: 'speed', label: 'Velocidad & Core Web Vitals' },
    { id: 'security', label: 'Seguridad & Malware' },
    { id: 'maintenance', label: 'Mantenimiento' },
    { id: 'custom', label: 'Proyectos a Medida' }
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.shortDescription.toLowerCase().includes(q) ||
        service.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <section id="catalogo" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Catálogo Oficial de Servicios Web
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tarifas transparentes, alcance garantizado
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl">
            Selecciona el servicio que necesitas. Los servicios de precio cerrado se contratan y pagan directamente con PayPal. Los proyectos personalizados se presupuestan sin coste.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por avería o servicio..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Borrar
            </button>
          )}
        </div>
      </div>

      {/* Interactive category buttons */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Catalog Cards Grid */}
      {filteredServices.length === 0 ? (
        <div className="mt-12 p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <p className="text-base font-medium">No se encontraron servicios que coincidan con la búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isFixed = service.pricingType === 'fixed';
            return (
              <div
                key={service.id}
                className={`flex flex-col justify-between rounded-2xl p-6 bg-slate-900/70 border transition-all hover:border-slate-700 ${
                  service.isUrgent
                    ? 'border-rose-900/50 hover:border-rose-700/80 ring-1 ring-rose-500/10'
                    : service.popular
                    ? 'border-indigo-900/50 hover:border-indigo-600/80 ring-1 ring-indigo-500/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Category text kicker - NO pill box */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                    <span>{service.categoryLabel}</span>
                    {service.isUrgent && (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold">
                        <Zap className="w-3.5 h-3.5" /> Urgencia
                      </span>
                    )}
                    {!service.isUrgent && service.popular && (
                      <span className="text-indigo-400 font-semibold">Más Demandado</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {service.name}
                  </h3>

                  {/* Short Description */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  {/* Price Box */}
                  {service.pricingType === 'hourly' ? (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-white tracking-tight">
                            {formatCurrencyEUR((hoursByService[service.id] || 1) * (service.hourlyRateInCents || 1500))}
                          </span>
                          <span className="text-xs text-indigo-300 ml-1.5 font-semibold">
                            ({hoursByService[service.id] || 1} {(hoursByService[service.id] || 1) === 1 ? 'hora' : 'horas'})
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                          15 € / hora
                        </span>
                      </div>

                      {/* Selector interactivo de horas */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold">Horas a contratar:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 5, 10].map((h) => {
                              const currH = hoursByService[service.id] || 1;
                              return (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => setHoursByService({ ...hoursByService, [service.id]: h })}
                                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors ${
                                    currH === h
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                  }`}
                                >
                                  {h}h
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                const currH = hoursByService[service.id] || 1;
                                setHoursByService({ ...hoursByService, [service.id]: Math.max(1, currH - 1) });
                              }}
                              className="px-2.5 py-1 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                              aria-label="Restar una hora"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={hoursByService[service.id] || 1}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value || '1', 10));
                                setHoursByService({ ...hoursByService, [service.id]: val });
                              }}
                              className="w-12 text-center bg-transparent text-sm font-bold text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currH = hoursByService[service.id] || 1;
                                setHoursByService({ ...hoursByService, [service.id]: currH + 1 });
                              }}
                              className="px-2.5 py-1 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                              aria-label="Añadir una hora"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right text-xs">
                            <span className="text-slate-400 text-[10px] block">Resultado:</span>
                            <span className="font-mono text-xs text-slate-200">
                              {(hoursByService[service.id] || 1)} × 15 € = <strong className="text-emerald-400 text-sm">{formatCurrencyEUR((hoursByService[service.id] || 1) * 1500)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-white tracking-tight">
                          {formatCurrencyEUR(service.priceInCents)}
                        </span>
                        {isFixed && (
                          <span className="text-xs text-slate-400 ml-1.5 font-normal">
                            / tarifa fija
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SLA / Delivery time text */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{service.estimatedDelivery}</span>
                  </div>

                  {/* Scope bullets */}
                  <ul className="mt-5 space-y-2 text-xs text-slate-300">
                    {service.scope.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5">
                  {service.pricingType === 'hourly' ? (
                    <button
                      onClick={() => onSelectService(service, hoursByService[service.id] || 1)}
                      className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <span>
                        Contratar {hoursByService[service.id] || 1} {(hoursByService[service.id] || 1) === 1 ? 'hora' : 'horas'} ({formatCurrencyEUR((hoursByService[service.id] || 1) * 1500)})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isFixed ? (
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <span>Contratar Servicio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onRequestQuote(service)}
                      className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-sky-200 hover:text-white bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/60 rounded-xl transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <span>Solicitar Presupuesto</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onViewDetails(service)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                  >
                    Ver entregables y alcance completo →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
