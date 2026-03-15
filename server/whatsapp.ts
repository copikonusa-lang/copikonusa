/**
 * WhatsApp Cloud API Integration for CopikonUSA
 * 
 * Handles:
 * - Incoming message webhook from WhatsApp Cloud API
 * - Automated responses for common queries (order status, product info, FAQs)
 * - Order status lookups by order number
 * - Human handoff for complex queries
 * 
 * Setup required:
 * 1. Create Meta Business App at https://developers.facebook.com
 * 2. Add WhatsApp product to the app
 * 3. Get WHATSAPP_TOKEN (permanent system user token)
 * 4. Get WHATSAPP_PHONE_ID (phone number ID from Meta dashboard)
 * 5. Set WHATSAPP_VERIFY_TOKEN (any secret string for webhook verification)
 * 6. Configure webhook URL: https://copikonusa.com/api/whatsapp/webhook
 */

import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { PgStorage } from "./pg-storage";
import type { Order } from "@shared/schema";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "copikonusa_verify_2026";
const WHATSAPP_API = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;

// ─── MESSAGE SENDING ──────────────────────────────────────────────────────────

async function sendWhatsAppMessage(to: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log("[WhatsApp] Not configured, skipping message to", to);
    return;
  }
  try {
    const response = await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    const data = await response.json();
    console.log("[WhatsApp] Sent message to", to, "response:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
  }
}

async function sendWhatsAppInteractiveButtons(to: string, bodyText: string, buttons: Array<{ id: string; title: string }>) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return;
  try {
    await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.map(b => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      }),
    });
  } catch (error) {
    console.error("[WhatsApp] Error sending interactive:", error);
  }
}

async function sendWhatsAppList(to: string, bodyText: string, buttonText: string, sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return;
  try {
    await fetch(WHATSAPP_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: bodyText },
          action: {
            button: buttonText,
            sections,
          },
        },
      }),
    });
  } catch (error) {
    console.error("[WhatsApp] Error sending list:", error);
  }
}

// ─── BOT LOGIC ───────────────────────────────────────────────────────────────

const STATUS_LABELS_ES: Record<string, string> = {
  pending_payment: "⏳ Pendiente de Pago",
  payment_verified: "✅ Pago Verificado",
  processing: "⚙️ En Procesamiento",
  purchased: "🛒 Comprado en USA",
  shipped_to_warehouse: "📦 Enviado al Almacén",
  in_warehouse: "🏭 En Almacén USA",
  shipped_international: "✈️ En Camino a Venezuela",
  in_customs: "🏛️ En Aduana",
  ready_for_pickup: "🎉 Listo para Retirar",
  delivered: "✅ Entregado",
  cancelled: "❌ Cancelado",
};

// Detect intent from user message
function detectIntent(message: string): string {
  const lower = message.toLowerCase().trim();
  
  // Greetings
  if (/^(hola|hi|hello|hey|buenas|buenos?\s*d[ií]as?|buenas\s*tardes?|buenas\s*noches?|que tal|saludos)/i.test(lower)) return "greeting";
  
  // Order status
  if (/pedido|orden|estado|tracking|rastreo|seguimiento|mi\s*compra|COP-\d+/i.test(lower)) return "order_status";
  
  // Pricing / how it works
  if (/precio|costo|cuanto|cu[aá]nto|cobran|cuesta|vale|tarifa|envio|env[ií]o/i.test(lower)) return "pricing";
  
  // Payment methods
  if (/pago|pagar|bol[ií]vares|transferencia|zelle|paypal|binance|cripto|usdt|m[eé]todo/i.test(lower)) return "payment";
  
  // Shipping / delivery
  if (/envio|env[ií]o|entrega|llega|tarda|tiempo|d[ií]as|demora|cu[aá]nto\s*tarda|rápido|shipping/i.test(lower)) return "shipping";
  
  // Branches / pickup
  if (/sucursal|retirar|retiro|oficina|direcci[oó]n|d[oó]nde|ubicaci[oó]n/i.test(lower)) return "branches";
  
  // Products / catalog
  if (/producto|busco|buscar|tienen|cat[aá]logo|quiero|necesito|disponible|hay/i.test(lower)) return "products";
  
  // Help / support
  if (/ayuda|help|soporte|problema|queja|reclamaci[oó]n|devoluci[oó]n|reembolso/i.test(lower)) return "support";
  
  // Thank you
  if (/gracias|thanks|ok|perfecto|listo|entendido|genial|excelente/i.test(lower)) return "thanks";

  // Menu request
  if (/menu|men[uú]|opciones|opci[oó]n/i.test(lower)) return "menu";

  return "unknown";
}

// Extract order number from message
function extractOrderNumber(message: string): string | null {
  const match = message.match(/COP-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

async function handleMessage(from: string, message: string, senderName: string) {
  const intent = detectIntent(message);
  console.log(`[WhatsApp Bot] From: ${from}, Intent: ${intent}, Message: "${message.substring(0, 100)}"`);

  switch (intent) {
    case "greeting": {
      await sendWhatsAppInteractiveButtons(
        from,
        `¡Hola${senderName ? ` ${senderName}` : ""}! 👋 Bienvenido a *CopikonUSA* 🇺🇸🇻🇪\n\nSomos tu tienda de productos americanos con envío incluido y pago en bolívares.\n\n¿En qué puedo ayudarte?`,
        [
          { id: "menu_order_status", title: "📋 Mi Pedido" },
          { id: "menu_how_it_works", title: "ℹ️ ¿Cómo funciona?" },
          { id: "menu_support", title: "💬 Hablar con alguien" },
        ]
      );
      break;
    }

    case "order_status": {
      const orderNum = extractOrderNumber(message);
      if (orderNum) {
        // Look up the order
        const pgStorage = storage as PgStorage;
        const orders: Order[] = await pgStorage.getAllOrders();
        const order = orders.find((o: Order) => o.orderNumber === orderNum);
        if (order) {
          const statusLabel = STATUS_LABELS_ES[order.status] || order.status;
          const items = order.items.map((i: any) => `• ${i.name} (x${i.quantity})`).join("\n");
          await sendWhatsAppMessage(
            from,
            `📋 *Pedido ${order.orderNumber}*\n\n` +
            `Estado: ${statusLabel}\n` +
            `Total: $${order.totalUsd.toFixed(2)}\n` +
            `Sucursal: ${order.branch}\n` +
            `Entrega estimada: ${new Date(order.estimatedDelivery).toLocaleDateString("es-VE")}\n\n` +
            `*Productos:*\n${items}\n\n` +
            `¿Necesitas algo más? Escribe *menú* para ver las opciones.`
          );
        } else {
          await sendWhatsAppMessage(
            from,
            `No encontré un pedido con el número *${orderNum}*. 🔍\n\nPor favor verifica el número e intenta de nuevo. El formato es COP-XXXXXX.\n\nSi necesitas ayuda, escribe *soporte*.`
          );
        }
      } else {
        await sendWhatsAppMessage(
          from,
          `Para consultar tu pedido, envíame el número de pedido. 📋\n\nEjemplo: *COP-123456*\n\nLo encuentras en tu email de confirmación o en tu cuenta de copikonusa.com`
        );
      }
      break;
    }

    case "pricing": {
      await sendWhatsAppMessage(
        from,
        `💰 *¿Cómo funcionan los precios en CopikonUSA?*\n\n` +
        `Nuestros precios ya incluyen:\n` +
        `✅ Costo del producto\n` +
        `✅ Envío aéreo desde USA\n` +
        `✅ Gastos de importación\n\n` +
        `💵 *Precios en dólares y bolívares*\n` +
        `La tasa de cambio se actualiza diariamente según BCV.\n\n` +
        `📦 *Costo de envío*: $5.50 por libra (vía aérea)\n\n` +
        `Visita 👉 copikonusa.com para ver los precios actualizados de todos los productos.`
      );
      break;
    }

    case "payment": {
      await sendWhatsAppMessage(
        from,
        `💳 *Métodos de Pago*\n\n` +
        `Aceptamos:\n` +
        `🏦 Transferencia bancaria (Bs)\n` +
        `📱 Pago Móvil (Bs)\n` +
        `💵 Zelle (USD)\n` +
        `🔗 Binance Pay (USDT)\n\n` +
        `⏰ *Importante*: Tienes 48 horas después de hacer tu pedido para enviar el comprobante de pago.\n\n` +
        `Después de pagar, sube tu comprobante en copikonusa.com o envíalo por este chat.`
      );
      break;
    }

    case "shipping": {
      await sendWhatsAppMessage(
        from,
        `✈️ *Envío y Entregas*\n\n` +
        `📍 Enviamos desde Estados Unidos directo a Venezuela\n` +
        `⏱️ Tiempo estimado: 10-15 días hábiles\n` +
        `📦 Envío aéreo ($5.50/lb incluido en el precio)\n` +
        `⚖️ Peso máximo por pedido: 150 lbs\n\n` +
        `*Proceso de envío:*\n` +
        `1️⃣ Compra verificada → Producto comprado en USA\n` +
        `2️⃣ Enviado al almacén en USA\n` +
        `3️⃣ Enviado por avión a Venezuela\n` +
        `4️⃣ Trámites de aduana\n` +
        `5️⃣ Listo para retirar en tu sucursal\n\n` +
        `Te notificamos en cada paso por email y WhatsApp. 📩`
      );
      break;
    }

    case "branches": {
      await sendWhatsAppMessage(
        from,
        `📍 *Sucursales CopikonUSA*\n\n` +
        `Actualmente operamos con retiro en sucursal. Al hacer tu pedido, seleccionas la sucursal más cercana.\n\n` +
        `Para ver las sucursales disponibles y sus direcciones, visita 👉 copikonusa.com y ve a la sección de sucursales.\n\n` +
        `¿Necesitas ayuda con algo más?`
      );
      break;
    }

    case "products": {
      await sendWhatsAppMessage(
        from,
        `🛍️ *Catálogo CopikonUSA*\n\n` +
        `Tenemos miles de productos americanos disponibles:\n\n` +
        `📱 Electrónica y Tecnología\n` +
        `👗 Ropa y Moda\n` +
        `🏠 Hogar y Cocina\n` +
        `💄 Belleza y Cuidado Personal\n` +
        `🏋️ Deportes y Fitness\n` +
        `🧸 Juguetes y Juegos\n` +
        `Y mucho más...\n\n` +
        `👉 Busca cualquier producto en *copikonusa.com*\n\n` +
        `¿Buscas algo específico? Dime qué necesitas y te ayudo a encontrarlo.`
      );
      break;
    }

    case "support": {
      await sendWhatsAppMessage(
        from,
        `💬 *Soporte CopikonUSA*\n\n` +
        `Entiendo que necesitas hablar con alguien de nuestro equipo.\n\n` +
        `Un agente te atenderá lo antes posible. Mientras tanto, puedes:\n\n` +
        `📧 Escribirnos a: info@copikonusa.com\n` +
        `🌐 Revisar tu pedido en: copikonusa.com\n\n` +
        `Por favor describe tu consulta aquí y te responderemos pronto. 🙏`
      );
      // TODO: Forward to admin WhatsApp or CRM
      break;
    }

    case "thanks": {
      await sendWhatsAppMessage(
        from,
        `¡Con gusto! 😊 Si necesitas algo más, estoy aquí para ayudarte.\n\nEscribe *menú* para ver todas las opciones. 🇺🇸🇻🇪`
      );
      break;
    }

    case "menu": {
      await sendWhatsAppList(
        from,
        `¿En qué puedo ayudarte? Selecciona una opción:`,
        "Ver opciones",
        [{
          title: "Opciones",
          rows: [
            { id: "menu_order_status", title: "📋 Estado de mi pedido", description: "Consulta el estado actual de tu pedido" },
            { id: "menu_how_it_works", title: "ℹ️ ¿Cómo funciona?", description: "Precios, envíos y proceso de compra" },
            { id: "menu_payment", title: "💳 Métodos de pago", description: "Formas de pago disponibles" },
            { id: "menu_shipping", title: "✈️ Envíos y entregas", description: "Tiempos y proceso de envío" },
            { id: "menu_products", title: "🛍️ Productos", description: "Nuestro catálogo de productos" },
            { id: "menu_support", title: "💬 Hablar con soporte", description: "Contactar a un agente" },
          ],
        }]
      );
      break;
    }

    default: {
      // Unknown intent — offer menu
      await sendWhatsAppInteractiveButtons(
        from,
        `No estoy seguro de entender tu mensaje. 🤔\n\n¿En qué puedo ayudarte?`,
        [
          { id: "menu_order_status", title: "📋 Mi Pedido" },
          { id: "menu_how_it_works", title: "ℹ️ ¿Cómo funciona?" },
          { id: "menu_support", title: "💬 Hablar con alguien" },
        ]
      );
      break;
    }
  }
}

// Handle interactive button/list responses
async function handleInteractiveResponse(from: string, buttonId: string) {
  switch (buttonId) {
    case "menu_order_status":
      await sendWhatsAppMessage(
        from,
        `Para consultar tu pedido, envíame el número de pedido. 📋\n\nEjemplo: *COP-123456*\n\nLo encuentras en tu email de confirmación o en tu cuenta de copikonusa.com`
      );
      break;
    case "menu_how_it_works":
      await sendWhatsAppMessage(
        from,
        `🛒 *¿Cómo comprar en CopikonUSA?*\n\n` +
        `1️⃣ *Busca* tu producto en copikonusa.com\n` +
        `2️⃣ *Agrega* al carrito y haz tu pedido\n` +
        `3️⃣ *Paga* en bolívares o dólares (48h para pagar)\n` +
        `4️⃣ *Nosotros compramos* el producto en USA\n` +
        `5️⃣ *Enviamos* por avión a Venezuela (10-15 días)\n` +
        `6️⃣ *Retira* en tu sucursal 🎉\n\n` +
        `Los precios incluyen todo: producto + envío + importación.\n` +
        `Pago en bolívares a tasa BCV del día.\n\n` +
        `👉 Empieza en *copikonusa.com*`
      );
      break;
    case "menu_payment":
      await handleMessage(from, "métodos de pago", "");
      break;
    case "menu_shipping":
      await handleMessage(from, "envío y entregas", "");
      break;
    case "menu_products":
      await handleMessage(from, "productos catálogo", "");
      break;
    case "menu_support":
      await handleMessage(from, "necesito soporte", "");
      break;
    default:
      await handleMessage(from, "menú", "");
  }
}

// ─── WEBHOOK ROUTES ──────────────────────────────────────────────────────────

export function registerWhatsAppRoutes(app: Express) {
  // Webhook verification (GET) — Meta sends this when you first set up the webhook
  app.get("/api/whatsapp/webhook", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("[WhatsApp] Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.log("[WhatsApp] Webhook verification failed", { mode, token });
      res.sendStatus(403);
    }
  });

  // Incoming messages (POST) — Meta sends all incoming messages here
  app.post("/api/whatsapp/webhook", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      
      // Always respond 200 quickly to avoid Meta retries
      res.sendStatus(200);

      // Check if it's a valid WhatsApp message
      if (body?.object !== "whatsapp_business_account") return;

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field !== "messages") continue;
          const value = change.value;
          if (!value?.messages) continue;

          for (const msg of value.messages) {
            const from = msg.from; // phone number
            const senderName = value.contacts?.[0]?.profile?.name || "";

            if (msg.type === "text" && msg.text?.body) {
              await handleMessage(from, msg.text.body, senderName);
            } else if (msg.type === "interactive") {
              // Button or list reply
              const buttonId = msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id;
              if (buttonId) {
                await handleInteractiveResponse(from, buttonId);
              }
            }
            // Ignore other message types (images, audio, etc.) for now
          }
        }
      }
    } catch (error) {
      console.error("[WhatsApp] Webhook error:", error);
    }
  });

  // Admin endpoint: send manual WhatsApp message to a customer
  app.post("/api/admin/whatsapp/send", async (req: Request, res: Response) => {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: "Se requiere 'to' (teléfono) y 'message'" });
    }
    const result = await sendWhatsAppMessage(to, message);
    res.json({ sent: true, result });
  });

  // Status endpoint to check WhatsApp configuration
  app.get("/api/admin/whatsapp/status", (_req: Request, res: Response) => {
    res.json({
      configured: !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID),
      hasToken: !!WHATSAPP_TOKEN,
      hasPhoneId: !!WHATSAPP_PHONE_ID,
      webhookUrl: "https://copikonusa.com/api/whatsapp/webhook",
      verifyToken: WHATSAPP_VERIFY_TOKEN,
    });
  });

  console.log("[WhatsApp] Routes registered. Configured:", !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID));
}

// ─── OUTBOUND NOTIFICATIONS ─────────────────────────────────────────────────

// Send WhatsApp notification to customer (called from order status changes)
export async function sendWhatsAppOrderUpdate(phone: string, data: {
  orderNumber: string;
  status: string;
  customerName: string;
}) {
  if (!phone) return;
  const statusLabel = STATUS_LABELS_ES[data.status] || data.status;
  
  const messages: Record<string, string> = {
    payment_verified: `✅ *¡Pago confirmado!*\n\nHola ${data.customerName}, tu pago para el pedido *${data.orderNumber}* ha sido verificado.\n\nProcederemos con la compra de tus productos. Te mantendremos informado.`,
    
    purchased: `🛒 *¡Productos comprados!*\n\nHola ${data.customerName}, los productos de tu pedido *${data.orderNumber}* ya fueron comprados en USA.\n\nPronto los enviaremos a Venezuela.`,
    
    shipped_international: `✈️ *¡En camino!*\n\nHola ${data.customerName}, tu pedido *${data.orderNumber}* está volando hacia Venezuela.\n\nTiempo estimado de llegada: 7-10 días.`,
    
    ready_for_pickup: `🎉 *¡Tu pedido llegó!*\n\nHola ${data.customerName}, tu pedido *${data.orderNumber}* está listo para retirar en tu sucursal.\n\nRecuerda llevar tu cédula y número de pedido.`,
    
    cancelled: `❌ *Pedido cancelado*\n\nHola ${data.customerName}, tu pedido *${data.orderNumber}* ha sido cancelado.\n\nSi tienes preguntas, contáctanos por este medio o escribe a info@copikonusa.com`,
  };

  const text = messages[data.status] || 
    `📦 *Actualización de pedido*\n\nHola ${data.customerName}, tu pedido *${data.orderNumber}* ha sido actualizado:\n\n${statusLabel}\n\nPuedes ver los detalles en copikonusa.com`;

  await sendWhatsAppMessage(phone, text);
}
