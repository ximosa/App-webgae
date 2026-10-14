import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { CatalogSection } from './components/CatalogSection.tsx';
import { ServiceDetailModal } from './components/ServiceDetailModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ConfirmationView } from './components/ConfirmationView.tsx';
import { OrderStatusModal } from './components/OrderStatusModal.tsx';
import { QuoteRequestModal } from './components/QuoteRequestModal.tsx';
import { LegalModal, LegalDocType } from './components/LegalModal.tsx';
import { HowItWorksAndFaq } from './components/HowItWorksAndFaq.tsx';
import { Footer } from './components/Footer.tsx';
import { ServiceItem, ServerConfigResponse } from './shared/types.ts';
import { SERVICES_CATALOG } from './shared/catalog.ts';

export default function App() {
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_CATALOG);
  const [serverConfig, setServerConfig] = useState<ServerConfigResponse | null>(null);

  // Estados de modales y vistas
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [orderSearchParams, setOrderSearchParams] = useState<{ orderId: string; token: string }>({
    orderId: '',
    token: ''
  });

  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; docType: LegalDocType }>({
    isOpen: false,
    docType: 'terms'
  });

  // Pantalla de confirmación tras pago exitoso
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    accessToken: string;
    paymentMethod?: 'paypal' | 'card';
    cardLast4?: string;
    cardBrand?: string;
  } | null>(null);

  // Mensaje de cancelación de PayPal si se detecta en URL
  const [paypalCanceledNotice, setPaypalCanceledNotice] = useState<boolean>(false);

  // Cargar configuración de servidor y verificar parámetros de URL
  useEffect(() => {
    // 1. Obtener configuración pública de PayPal
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServerConfig(data);
      })
      .catch((err) => console.warn('Configuración cargada con valores por defecto', err));

    // 2. Comprobar catálogo del servidor
    fetch('/api/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      })
      .catch(() => {});

    // 3. Comprobar parámetros en la URL (ej. ?order=ord_...&token=... o ?canceled=true)
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    const tokenParam = urlParams.get('token');
    const canceledParam = urlParams.get('canceled');

    if (orderParam && tokenParam) {
      setOrderSearchParams({ orderId: orderParam, token: tokenParam });
      setIsOrderStatusModalOpen(true);
    } else if (canceledParam === 'true') {
      setPaypalCanceledNotice(true);
    }
  }, []);

  const [selectedHours, setSelectedHours] = useState<number>(1);

  const handleSelectServiceForCheckout = (service: ServiceItem, initialHours?: number) => {
    setSelectedService(service);
    setSelectedHours(initialHours || 1);
    setIsCheckoutModalOpen(true);
  };

  const handleViewServiceDetails = (service: ServiceItem) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const handleRequestQuote = (service: ServiceItem) => {
    setSelectedService(service);
    setIsQuoteModalOpen(true);
  };

  const handleOpenUrgentRepair = () => {
    const urgentService = services.find((s) => s.id === 'wp-urgency-repair') || services[0];
    handleSelectServiceForCheckout(urgentService);
  };

  const handlePaymentSuccess = (orderData: {
    orderId: string;
    accessToken: string;
    paymentMethod?: 'paypal' | 'card';
    cardLast4?: string;
    cardBrand?: string;
  }) => {
    setIsCheckoutModalOpen(false);
    setConfirmedOrder(orderData);
    // Desplazar suavemente arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLegal = (type: LegalDocType) => {
    setLegalModalState({ isOpen: true, docType: type });
  };

  const scrollToCatalog = () => {
    if (confirmedOrder) {
      setConfirmedOrder(null);
    }
    const catEl = document.getElementById('catalogo');
    if (catEl) {
      catEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSpecificOrderTracking = (orderId: string, token: string) => {
    setOrderSearchParams({ orderId, token });
    setIsOrderStatusModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        serverConfig={serverConfig}
        onOpenOrderSearch={() => {
          setOrderSearchParams({ orderId: '', token: '' });
          setIsOrderStatusModalOpen(true);
        }}
        onScrollToCatalog={scrollToCatalog}
        onOpenLegal={handleOpenLegal}
      />

      {/* Notificación de cancelación de PayPal si procede */}
      {paypalCanceledNotice && (
        <div className="bg-amber-950/70 border-b border-amber-900 px-4 py-3 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <span>Has cancelado la operación en PayPal. No se ha realizado ningún cobro en tu cuenta. Puedes volver a intentarlo cuando lo desees.</span>
          <button
            onClick={() => setPaypalCanceledNotice(false)}
            className="text-white underline font-semibold ml-2 hover:text-amber-100"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {confirmedOrder ? (
          /* Vista de Confirmación de Pedido tras pago exitoso */
          <ConfirmationView
            orderId={confirmedOrder.orderId}
            accessToken={confirmedOrder.accessToken}
            paymentMethod={confirmedOrder.paymentMethod}
            cardLast4={confirmedOrder.cardLast4}
            cardBrand={confirmedOrder.cardBrand}
            onReset={() => setConfirmedOrder(null)}
            onOpenOrderTracking={handleOpenSpecificOrderTracking}
          />
        ) : (
          /* Vista Principal: Hero, Catálogo, Pasos, FAQs */
          <>
            <Hero
              onExploreCatalog={scrollToCatalog}
              onOpenUrgentService={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
            />

            <CatalogSection
              services={services}
              onSelectService={handleSelectServiceForCheckout}
              onViewDetails={handleViewServiceDetails}
              onRequestQuote={handleRequestQuote}
            />

            <HowItWorksAndFaq />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={handleOpenLegal}
        onScrollToCatalog={scrollToCatalog}
        onOpenOrderSearch={() => {
          setOrderSearchParams({ orderId: '', token: '' });
          setIsOrderStatusModalOpen(true);
        }}
      />

      {/* Modal de Detalle de Servicio */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onProceedCheckout={handleSelectServiceForCheckout}
        onRequestQuote={handleRequestQuote}
      />

      {/* Modal de Contratación y Pago PayPal Sin Registro */}
      <CheckoutModal
        service={selectedService}
        initialHours={selectedHours}
        isOpen={isCheckoutModalOpen}
        serverConfig={serverConfig}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenLegal={handleOpenLegal}
      />

      {/* Modal de Solicitud de Presupuesto (Servicios Personalizados) */}
      <QuoteRequestModal
        service={selectedService}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onOpenLegal={handleOpenLegal}
      />

      {/* Modal de Consulta y Seguimiento de Pedido */}
      <OrderStatusModal
        isOpen={isOrderStatusModalOpen}
        initialOrderId={orderSearchParams.orderId}
        initialToken={orderSearchParams.token}
        onClose={() => setIsOrderStatusModalOpen(false)}
      />

      {/* Modal Legal (Términos, Privacidad, Reembolsos, Contacto) */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        docType={legalModalState.docType}
        onClose={() => setLegalModalState({ ...legalModalState, isOpen: false })}
      />
    </div>
  );
}
