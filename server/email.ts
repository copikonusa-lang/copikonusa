import { Resend } from "resend";

// Lazy-init: only create Resend client when actually sending email
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ─── DIAGNOSTIC: Test Resend connection ─────────────────────────────────────
export async function testResendConnection(testTo: string): Promise<{ success: boolean; keyLoaded: boolean; keyPrefix: string; response?: any; error?: string }> {
  const keyLoaded = !!process.env.RESEND_API_KEY;
  const keyPrefix = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 8) + "..." : "NOT SET";
  
  if (!keyLoaded) {
    return { success: false, keyLoaded, keyPrefix, error: "RESEND_API_KEY not set in environment" };
  }
  
  const resend = getResend();
  if (!resend) {
    return { success: false, keyLoaded, keyPrefix, error: "Resend client failed to initialize" };
  }
  
  try {
    const result = await resend.emails.send({
      from: "CopikonUSA <info@copikonusa.com>",
      to: testTo,
      subject: "Test de conexión Resend — CopikonUSA",
      html: "<h2>Conexión exitosa</h2><p>Este email confirma que Resend está configurado correctamente para CopikonUSA.</p><p>Fecha: " + new Date().toISOString() + "</p>",
    });
    return { success: true, keyLoaded, keyPrefix, response: result };
  } catch (error: any) {
    return { success: false, keyLoaded, keyPrefix, error: error.message || String(error), response: error.response?.body || error.statusCode };
  }
}

// Official CopikonUSA email addresses
const FROM_INFO = "CopikonUSA <info@copikonusa.com>";
const FROM_PEDIDOS = "CopikonUSA Pedidos <pedidos@copikonusa.com>";
const FROM_SOPORTE = "CopikonUSA Soporte <soporte@copikonusa.com>";
const REPLY_TO_INFO = "info@copikonusa.com";
const REPLY_TO_ADMIN = "admin@copikonusa.com";

// CopikonUSA brand colors
const NAVY = "#1B2A4A";
const RED = "#E31E24";
const LIGHT_BG = "#f4f4f4";
const WHITE = "#ffffff";

function baseTemplate(title: string, body: string, preheader?: string, footerExtra?: string): string {
  const preheaderBlock = preheader
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;background:${LIGHT_BG};-webkit-font-smoothing:antialiased;">
${preheaderBlock}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LIGHT_BG};padding:0;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1);max-width:600px;width:100%;">
  <!-- Top accent bar -->
  <tr><td style="background:${RED};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <!-- Header -->
  <tr><td style="background:${NAVY};padding:24px 32px;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      <span style="font-size:28px;font-weight:800;color:${WHITE};letter-spacing:1.5px;">COP</span><span style="font-size:28px;font-weight:800;color:${RED};letter-spacing:1.5px;">IKON</span><span style="font-size:28px;font-weight:800;color:${WHITE};letter-spacing:1.5px;">USA</span>
    </td></tr><tr><td align="center" style="padding-top:6px;">
      <span style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Tu tienda de productos americanos</span>
    </td></tr></table>
  </td></tr>
  <!-- Accent line below header -->
  <tr><td style="background:linear-gradient(90deg,${RED},${NAVY});height:3px;font-size:0;line-height:0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="width:50%;background:${RED};height:3px;font-size:0;line-height:0;">&nbsp;</td>
      <td style="width:50%;background:${NAVY};height:3px;font-size:0;line-height:0;">&nbsp;</td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 32px 24px 32px;">
    <h2 style="color:${NAVY};margin:0 0 20px 0;font-size:22px;font-weight:700;">${title}</h2>
    ${body}
  </td></tr>
  <!-- Footer -->
  <tr><td style="border-top:1px solid #e8e8e8;background:#fafafa;padding:24px 32px;text-align:center;">
    ${footerExtra || ""}
    <!-- WhatsApp contact -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-bottom:16px;">
      <a href="https://wa.me/17869695464" style="color:${NAVY};font-size:13px;text-decoration:none;font-weight:600;">&#9742; WhatsApp: +1 (786) 969-5464</a>
    </td></tr></table>
    <!-- Social placeholders -->
    <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
      <td style="padding:0 8px;"><a href="https://instagram.com/copikonusa" style="color:#999;font-size:12px;text-decoration:none;">Instagram</a></td>
      <td style="color:#ccc;font-size:12px;">|</td>
      <td style="padding:0 8px;"><a href="https://copikonusa.com" style="color:#999;font-size:12px;text-decoration:none;">Web</a></td>
      <td style="color:#ccc;font-size:12px;">|</td>
      <td style="padding:0 8px;"><a href="https://wa.me/17869695464" style="color:#999;font-size:12px;text-decoration:none;">WhatsApp</a></td>
    </tr></table>
    <p style="color:#999;font-size:11px;margin:14px 0 0 0;">&copy; ${new Date().getFullYear()} CopikonUSA &mdash; Productos americanos al mejor precio</p>
    <p style="color:#bbb;font-size:10px;margin:6px 0 0 0;">Si no deseas recibir estos correos, puedes <a href="https://copikonusa.com" style="color:#bbb;text-decoration:underline;">cancelar tu suscripci&oacute;n</a>.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// Status label mapping
const STATUS_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pending_payment: { label: "Pendiente de Pago", icon: "⏳", color: "#856404", bg: "#FFF3CD" },
  payment_verified: { label: "Pago Verificado", icon: "✅", color: "#155724", bg: "#D4EDDA" },
  processing: { label: "En Procesamiento", icon: "⚙️", color: "#0c5460", bg: "#D1ECF1" },
  purchased: { label: "Comprado en USA", icon: "🛒", color: "#155724", bg: "#D4EDDA" },
  shipped_to_warehouse: { label: "Enviado al Almacén", icon: "📦", color: "#0c5460", bg: "#D1ECF1" },
  in_warehouse: { label: "En Almacén USA", icon: "🏭", color: "#383d41", bg: "#E2E3E5" },
  shipped_international: { label: "En Camino a Venezuela", icon: "✈️", color: "#004085", bg: "#CCE5FF" },
  in_customs: { label: "En Aduana", icon: "🏛️", color: "#856404", bg: "#FFF3CD" },
  ready_for_pickup: { label: "Listo para Retirar", icon: "🎉", color: "#155724", bg: "#D4EDDA" },
  delivered: { label: "Entregado", icon: "✅", color: "#155724", bg: "#D4EDDA" },
  cancelled: { label: "Cancelado", icon: "❌", color: "#721c24", bg: "#F8D7DA" },
};

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, customerName: string) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping welcome email to", to); return; }
    await resend.emails.send({
      from: FROM_INFO,
      replyTo: REPLY_TO_INFO,
      to,
      subject: "🎉 ¡Bienvenido a CopikonUSA!",
      html: baseTemplate(
        `¡Hola ${customerName}!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">¡Bienvenido a <strong>CopikonUSA</strong>! Tu cuenta ha sido creada exitosamente.</p>
        <p style="color:#333;line-height:1.7;font-size:15px;">En CopikonUSA consigues cualquier producto de Estados Unidos al mejor precio del mercado, con envío incluido y pago en bolívares.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px 0;color:${NAVY};font-weight:600;font-size:14px;">¿Cómo funciona?</p>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#555;">
            <tr><td style="width:30px;vertical-align:top;">1️⃣</td><td>Busca y selecciona tus productos</td></tr>
            <tr><td style="width:30px;vertical-align:top;">2️⃣</td><td>Realiza tu pedido y paga en bolívares</td></tr>
            <tr><td style="width:30px;vertical-align:top;">3️⃣</td><td>Nosotros compramos y enviamos desde USA</td></tr>
            <tr><td style="width:30px;vertical-align:top;">4️⃣</td><td>Retira en tu sucursal en Venezuela</td></tr>
          </table>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${RED};color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:15px;">Explorar Productos</a>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;">¿Preguntas? Contáctanos por WhatsApp o escríbenos a info@copikonusa.com</p>`,
        "Tu cuenta está lista. Explora miles de productos de USA."
      ),
    });
    console.log("[Email] Welcome email sent to", to);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

export async function sendOrderConfirmation(to: string, data: {
  customerName: string;
  orderNumber: string;
  products: string;
  totalUsd: string;
  totalBs: string;
  paymentMethod: string;
  estimatedDelivery: string;
  branch: string;
  paymentDeadline: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping order confirmation to", to); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `📋 Pedido ${data.orderNumber} — Recibido`,
      html: baseTemplate(
        `Pedido ${data.orderNumber}`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, hemos recibido tu pedido exitosamente.</p>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;border-bottom:1px solid #eee;width:40%;"><strong>Productos</strong></td><td style="border-bottom:1px solid #eee;">${data.products}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Total USD</strong></td><td style="border-bottom:1px solid #eee;font-weight:bold;color:${RED};font-size:16px;">$${data.totalUsd}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Total Bs</strong></td><td style="border-bottom:1px solid #eee;font-weight:600;">Bs. ${data.totalBs}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Método de pago</strong></td><td style="border-bottom:1px solid #eee;">${data.paymentMethod}</td></tr>
          <tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Sucursal</strong></td><td style="border-bottom:1px solid #eee;">${data.branch}</td></tr>
          <tr><td style="color:#666;"><strong>Entrega estimada</strong></td><td>${data.estimatedDelivery}</td></tr>
        </table>

        <div style="background:#FFF3CD;border-left:4px solid ${RED};padding:14px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#856404;font-size:14px;line-height:1.5;">⚠️ <strong>Importante:</strong> Tienes hasta el <strong>${data.paymentDeadline}</strong> para enviar tu comprobante de pago. De lo contrario, el pedido será cancelado automáticamente.</p>
        </div>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ver Mi Pedido</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">¿Necesitas ayuda? Responde a este correo o contáctanos por WhatsApp</p>`,
        "Pedido recibido. Realiza tu pago para procesarlo."
      ),
    });
    console.log("[Email] Order confirmation sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function sendPaymentConfirmed(to: string, data: {
  customerName: string;
  orderNumber: string;
  totalUsd: string;
  estimatedDelivery: string;
  branch: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping payment confirmed to", to); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `✅ Pago Confirmado — Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `¡Pago Confirmado!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pago para el pedido <strong>${data.orderNumber}</strong> ha sido verificado exitosamente.</p>

        <div style="background:#D4EDDA;border-left:4px solid #28a745;padding:16px 18px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#155724;font-size:18px;font-weight:bold;">✅ Monto Verificado: $${data.totalUsd}</p>
        </div>

        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px 0;color:${NAVY};font-weight:600;font-size:14px;">¿Qué sigue?</p>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#555;">
            <tr><td style="width:30px;vertical-align:top;">🛒</td><td>Procederemos con la compra de tus productos en USA</td></tr>
            <tr><td style="width:30px;vertical-align:top;">📦</td><td>Te notificaremos cuando estén en camino</td></tr>
            <tr><td style="width:30px;vertical-align:top;">🏢</td><td>Entrega estimada: <strong>${data.estimatedDelivery}</strong> en <strong>${data.branch}</strong></td></tr>
          </table>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Te mantendremos informado en cada paso del proceso</p>`,
        "Ya verificamos tu pago. Próximo paso: compra en USA."
      ),
    });
    console.log("[Email] Payment confirmed sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending payment confirmed email:", error);
  }
}

export async function sendStatusUpdate(to: string, data: {
  customerName: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  branch: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping status update to", to); return; }

    const statusInfo = STATUS_LABELS[data.status] || { label: data.statusLabel, icon: "📦", color: "#333", bg: "#E2E3E5" };

    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `${statusInfo.icon} Pedido ${data.orderNumber} — ${statusInfo.label}`,
      html: baseTemplate(
        `Actualización de Pedido`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pedido <strong>${data.orderNumber}</strong> tiene una actualización:</p>

        <div style="background:${statusInfo.bg};border-left:4px solid ${statusInfo.color};padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:${statusInfo.color};font-size:20px;font-weight:bold;">${statusInfo.icon} ${statusInfo.label}</p>
        </div>

        <table width="100%" cellpadding="8" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;"><strong>Pedido</strong></td><td>${data.orderNumber}</td></tr>
          <tr><td style="color:#666;"><strong>Sucursal de destino</strong></td><td>${data.branch}</td></tr>
        </table>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ver Detalles del Pedido</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">¿Preguntas sobre tu pedido? Responde a este correo</p>`,
        `Tu pedido ${data.orderNumber} cambió a: ${statusInfo.label}.`
      ),
    });
    console.log("[Email] Status update sent to", to, "order:", data.orderNumber, "status:", data.status);
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
}

// ─── NEW EMAIL TEMPLATES ──────────────────────────────────────────────────────

export async function sendPaymentReminder(to: string, data: {
  customerName: string;
  orderNumber: string;
  totalUsd: string;
  totalBs: string;
  paymentDeadline: string;
  hoursRemaining: number;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping payment reminder to", to); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `⏰ Recordatorio de Pago — Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `Recordatorio de Pago`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, te recordamos que tu pedido <strong>${data.orderNumber}</strong> está pendiente de pago.</p>

        <div style="background:#FFF3CD;border-left:4px solid ${RED};padding:16px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#856404;font-size:15px;font-weight:bold;">⏰ Te quedan aproximadamente ${data.hoursRemaining} horas</p>
          <p style="margin:8px 0 0 0;color:#856404;font-size:14px;">Fecha límite: <strong>${data.paymentDeadline}</strong></p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Total USD</strong></td><td style="border-bottom:1px solid #eee;font-weight:bold;color:${RED};font-size:16px;">$${data.totalUsd}</td></tr>
          <tr><td style="color:#666;"><strong>Total Bs</strong></td><td style="font-weight:600;">Bs. ${data.totalBs}</td></tr>
        </table>

        <p style="color:#333;line-height:1.7;font-size:14px;">Si ya realizaste el pago, por favor envía tu comprobante a través de tu cuenta en CopikonUSA o por WhatsApp.</p>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${RED};color:#fff;padding:14px 36px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:15px;">Enviar Comprobante</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Si el pago no se recibe antes de la fecha límite, el pedido será cancelado automáticamente.</p>`,
        "Tu pedido está pendiente de pago."
      ),
    });
    console.log("[Email] Payment reminder sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending payment reminder email:", error);
  }
}

export async function sendOrderShipped(to: string, data: {
  customerName: string;
  orderNumber: string;
  trackingInfo?: string;
  estimatedDelivery: string;
  branch: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping shipped email to", to); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `✈️ ¡Tu Pedido ${data.orderNumber} Está en Camino!`,
      html: baseTemplate(
        `¡Tu Pedido Está en Camino!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, ¡excelentes noticias! Tu pedido <strong>${data.orderNumber}</strong> ya fue enviado desde Estados Unidos.</p>

        <div style="background:#CCE5FF;border-left:4px solid #004085;padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#004085;font-size:20px;font-weight:bold;">✈️ En Camino a Venezuela</p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          ${data.trackingInfo ? `<tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Tracking</strong></td><td style="border-bottom:1px solid #eee;font-family:monospace;">${data.trackingInfo}</td></tr>` : ""}
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Entrega estimada</strong></td><td style="border-bottom:1px solid #eee;">${data.estimatedDelivery}</td></tr>
          <tr><td style="color:#666;"><strong>Sucursal</strong></td><td>${data.branch}</td></tr>
        </table>

        <p style="color:#333;line-height:1.7;font-size:14px;">Te notificaremos cuando tu pedido llegue a la sucursal y esté listo para retirar.</p>

        <p style="color:#888;font-size:13px;text-align:center;">¿Preguntas? Responde a este correo o contáctanos por WhatsApp</p>`,
        "Tu pedido ya está en camino desde Estados Unidos."
      ),
    });
    console.log("[Email] Order shipped email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order shipped email:", error);
  }
}

export async function sendReadyForPickup(to: string, data: {
  customerName: string;
  orderNumber: string;
  branch: string;
  branchAddress?: string;
  pickupDeadlineDays?: number;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping ready for pickup email to", to); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `🎉 ¡Pedido ${data.orderNumber} Listo para Retirar!`,
      html: baseTemplate(
        `¡Tu Pedido Llegó!`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, ¡tu pedido <strong>${data.orderNumber}</strong> ya está en tu sucursal listo para que lo retires!</p>

        <div style="background:#D4EDDA;border-left:4px solid #28a745;padding:18px 20px;border-radius:6px;margin:20px 0;text-align:center;">
          <p style="margin:0;color:#155724;font-size:22px;font-weight:bold;">🎉 ¡Listo para Retirar!</p>
        </div>

        <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin:16px 0;font-size:14px;">
          <tr><td style="color:#666;width:40%;border-bottom:1px solid #eee;"><strong>Sucursal</strong></td><td style="border-bottom:1px solid #eee;font-weight:600;">${data.branch}</td></tr>
          ${data.branchAddress ? `<tr><td style="color:#666;border-bottom:1px solid #eee;"><strong>Dirección</strong></td><td style="border-bottom:1px solid #eee;">${data.branchAddress}</td></tr>` : ""}
          <tr><td style="color:#666;"><strong>Pedido</strong></td><td>${data.orderNumber}</td></tr>
        </table>

        ${data.pickupDeadlineDays ? `
        <div style="background:#FFF3CD;border-left:4px solid #ffc107;padding:12px 16px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#856404;font-size:13px;">📌 Por favor retira tu pedido dentro de los próximos <strong>${data.pickupDeadlineDays} días</strong>.</p>
        </div>` : ""}

        <p style="color:#333;line-height:1.7;font-size:14px;">Presenta tu número de pedido y cédula al momento de retirar.</p>

        <p style="color:#888;font-size:13px;text-align:center;">¡Gracias por comprar en CopikonUSA! 🇺🇸🇻🇪</p>`,
        "¡Tu paquete llegó! Retíralo en tu sucursal."
      ),
    });
    console.log("[Email] Ready for pickup email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending ready for pickup email:", error);
  }
}

export async function sendOrderCancelled(to: string, data: {
  customerName: string;
  orderNumber: string;
  reason: string;
  refundInfo?: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping cancellation email to", to); return; }
    await resend.emails.send({
      from: FROM_SOPORTE,
      replyTo: REPLY_TO_INFO,
      to,
      subject: `❌ Pedido ${data.orderNumber} — Cancelado`,
      html: baseTemplate(
        `Pedido Cancelado`,
        `<p style="color:#333;line-height:1.7;font-size:15px;">Hola <strong>${data.customerName}</strong>, lamentamos informarte que tu pedido <strong>${data.orderNumber}</strong> ha sido cancelado.</p>

        <div style="background:#F8D7DA;border-left:4px solid #dc3545;padding:16px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;color:#721c24;font-size:14px;"><strong>Motivo:</strong> ${data.reason}</p>
        </div>

        ${data.refundInfo ? `
        <div style="background:#D1ECF1;border-left:4px solid #17a2b8;padding:14px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#0c5460;font-size:14px;"><strong>Reembolso:</strong> ${data.refundInfo}</p>
        </div>` : ""}

        <p style="color:#333;line-height:1.7;font-size:14px;">Si crees que esto es un error o necesitas ayuda, no dudes en contactarnos.</p>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com" style="background:${NAVY};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Seguir Comprando</a>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;">Responde a este correo si necesitas asistencia</p>`,
        "Tu pedido ha sido cancelado."
      ),
    });
    console.log("[Email] Order cancelled email sent to", to, "order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending order cancelled email:", error);
  }
}

// ─── ADMIN NOTIFICATION EMAILS ───────────────────────────────────────────────

export async function sendAdminNewOrderAlert(data: {
  orderNumber: string;
  customerName: string;
  totalUsd: string;
  products: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping admin alert"); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      to: REPLY_TO_ADMIN,
      subject: `🔔 Nuevo Pedido ${data.orderNumber} — $${data.totalUsd}`,
      html: baseTemplate(
        `Nuevo Pedido Recibido`,
        `<div style="background:#D1ECF1;border-left:4px solid #17a2b8;padding:16px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0 0 8px 0;color:#0c5460;font-size:16px;font-weight:bold;">🔔 Nuevo pedido de ${data.customerName}</p>
          <p style="margin:0;color:#0c5460;font-size:14px;">Pedido: <strong>${data.orderNumber}</strong> — Total: <strong>$${data.totalUsd}</strong></p>
        </div>
        <p style="color:#333;font-size:14px;">${data.products}</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com/#/admin" style="background:${RED};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Ir al Panel de Admin</a>
        </div>`,
        `Nuevo pedido de ${data.customerName} por $${data.totalUsd}.`
      ),
    });
    console.log("[Email] Admin new order alert sent for order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending admin new order alert:", error);
  }
}

export async function sendAdminPaymentReceivedAlert(data: {
  orderNumber: string;
  customerName: string;
  totalUsd: string;
}) {
  try {
    const resend = getResend();
    if (!resend) { console.log("[Email] RESEND_API_KEY not set, skipping admin payment alert"); return; }
    await resend.emails.send({
      from: FROM_PEDIDOS,
      to: REPLY_TO_ADMIN,
      subject: `💰 Pago Recibido — Pedido ${data.orderNumber}`,
      html: baseTemplate(
        `Pago Recibido`,
        `<div style="background:#D4EDDA;border-left:4px solid #28a745;padding:16px 18px;border-radius:6px;margin:16px 0;">
          <p style="margin:0 0 8px 0;color:#155724;font-size:16px;font-weight:bold;">💰 Comprobante de pago recibido</p>
          <p style="margin:0;color:#155724;font-size:14px;">Cliente: <strong>${data.customerName}</strong> — Pedido: <strong>${data.orderNumber}</strong> — $${data.totalUsd}</p>
        </div>
        <p style="color:#333;font-size:14px;">Verifica el pago y actualiza el estado del pedido en el panel de administración.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://copikonusa.com/#/admin" style="background:${RED};color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;display:inline-block;text-decoration:none;font-size:14px;">Verificar Pago</a>
        </div>`,
        `Pago recibido de ${data.customerName} — Pedido ${data.orderNumber}.`
      ),
    });
    console.log("[Email] Admin payment alert sent for order:", data.orderNumber);
  } catch (error) {
    console.error("Error sending admin payment alert:", error);
  }
}
