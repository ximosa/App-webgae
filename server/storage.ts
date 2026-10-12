import fs from 'fs';
import path from 'path';
import { OrderRecord, QuoteRequestRecord } from '../src/shared/types.ts';

interface StoreData {
  orders: Record<string, OrderRecord>;
  quotes: Record<string, QuoteRequestRecord>;
  processedWebhookEvents: Record<string, { processedAt: string; eventType: string }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders-store.json');

// Memoria caché inicial
const memoryStore: StoreData = {
  orders: {},
  quotes: {},
  processedWebhookEvents: {}
};

// Cargar datos existentes si existen
function loadFromDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryStore.orders = parsed.orders || {};
        memoryStore.quotes = parsed.quotes || {};
        memoryStore.processedWebhookEvents = parsed.processedWebhookEvents || {};
      }
    }
  } catch (error) {
    console.warn('[STORAGE] Advertencia al leer almacenamiento en disco (se usará memoria):', error);
  }
}

// Guardar de forma atómica en disco
function persistToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryStore, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.warn('[STORAGE] Advertencia al persistir en disco (entorno serverless/lectura):', error);
  }
}

// Inicializar al cargar módulo
loadFromDisk();

export const Storage = {
  saveOrder(order: OrderRecord): OrderRecord {
    order.updatedAt = new Date().toISOString();
    memoryStore.orders[order.id] = { ...order };
    persistToDisk();
    return memoryStore.orders[order.id];
  },

  getOrder(orderId: string): OrderRecord | null {
    const order = memoryStore.orders[orderId];
    return order ? { ...order } : null;
  },

  getOrderByPaypalId(paypalOrderId: string): OrderRecord | null {
    const found = Object.values(memoryStore.orders).find(
      (o) => o.paypalOrderId === paypalOrderId
    );
    return found ? { ...found } : null;
  },

  saveQuote(quote: QuoteRequestRecord): QuoteRequestRecord {
    quote.updatedAt = new Date().toISOString();
    memoryStore.quotes[quote.id] = { ...quote };
    persistToDisk();
    return memoryStore.quotes[quote.id];
  },

  getQuote(quoteId: string): QuoteRequestRecord | null {
    const q = memoryStore.quotes[quoteId];
    return q ? { ...q } : null;
  },

  isWebhookEventProcessed(eventId: string): boolean {
    return Boolean(memoryStore.processedWebhookEvents[eventId]);
  },

  markWebhookEventProcessed(eventId: string, eventType: string): void {
    memoryStore.processedWebhookEvents[eventId] = {
      processedAt: new Date().toISOString(),
      eventType
    };
    persistToDisk();
  },

  getAllOrdersCount(): number {
    return Object.keys(memoryStore.orders).length;
  }
};
