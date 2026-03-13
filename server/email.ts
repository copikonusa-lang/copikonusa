import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_FROM = process.env.EMAIL_FROM || "CopikonUSA <noreply@copikonusa.com>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return transporter;
}

export async function sendOrderConfirmationEmail(order: any, user: any) {
  const t = getTransporter();
  if (!t) return;

  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  await t.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: `CopikonUSA - Pedido #${order.orderNumber} confirmado`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#9C0000;color:white;padding:20px;text-align:center">
          <h1 style="margin:0;font-size:24px">CopikonUSA</h1>
          <p style="margin:5px 0 0">Tu tienda americana en Venezuela</p>
        </div>
        <div style="padding:30px">
          <h2 style="color:#333">¡Pedido recibido, ${user.name}!</h2>
          <p style="color:#666">Hemos recibido tu pedido <strong>#${order.orderNumber}</strong>. 
          Te contactaremos pronto para confirmar el pago.</p>
          
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Producto</th>
                <th style="padding:8px;text-align:center">Cantidad</th>
                <th style="padding:8px;text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div style="border-top:2px solid #9C0000;padding-top:15px">
            <p style="margin:5px 0"><strong>Total USD:</strong> $${order.totalUsd.toFixed(2)}</p>
            <p style="margin:5px 0"><strong>Método de pago:</strong> ${order.paymentMethod}</p>
            <p style="margin:5px 0"><strong>Entrega estimada:</strong> ${order.estimatedDelivery}</p>
          </div>
          
          <div style="background:#fff8e1;border:1px solid #ffd54f;padding:15px;border-radius:4px;margin-top:20px">
            <p style="margin:0;color:#f57c00">⚠️ Recuerda enviar tu comprobante de pago por WhatsApp al +58 412-000-0000</p>
          </div>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;color:#999;font-size:12px">
          <p>CopikonUSA © 2025 | Tu puente con Amazon</p>
        </div>
      </div>`,
  });
}

export async function sendStatusUpdateEmail(order: any, user: any, newStatus: string) {
  const t = getTransporter();
  if (!t) return;

  const statusMessages: Record<string, string> = {
    payment_confirmed: "✅ Tu pago ha sido confirmado. Estamos procesando tu pedido.",
    processing: "📦 Tu pedido está siendo preparado y comprado en Amazon.",
    shipped: "✈️ Tu pedido está en camino desde Miami a Venezuela.",
    delivered: "🎉 Tu pedido ha sido entregado. ¡Disfruta tu compra!",
    cancelled: "❌ Tu pedido ha sido cancelado. Contacta soporte para más info.",
  };

  const message = statusMessages[newStatus] || `Tu pedido ahora está en estado: ${newStatus}`;

  await t.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: `CopikonUSA - Actualización de pedido #${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#9C0000;color:white;padding:20px;text-align:center">
          <h1 style="margin:0">CopikonUSA</h1>
        </div>
        <div style="padding:30px">
          <h2>Actualización de tu pedido #${order.orderNumber}</h2>
          <p style="font-size:18px;color:#333">${message}</p>
          <p style="color:#666">Entrega estimada: ${order.estimatedDelivery}</p>
        </div>
      </div>`,
  });
}


export async function sendWelcomeEmail(user: any) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Bienvenido a CopikonUSA",
      html: `<h1>Bienvenido ${user.name || user.email}!</h1><p>Gracias por registrarte en CopikonUSA.</p>`,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendOrderConfirmation(order: any, user: any) {
  return sendOrderConfirmationEmail(order, user);
}

export async function sendPaymentConfirmed(order: any, user: any) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Pago Confirmado - Pedido #${order.id}`,
      html: `<h1>Pago Confirmado</h1><p>Tu pago para el pedido #${order.id} ha sido confirmado.</p>`,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendStatusUpdate(order: any, user: any, status: string) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: `Actualizacion de Pedido #${order.id}`,
      html: `<h1>Estado Actualizado</h1><p>Tu pedido #${order.id} ahora esta: ${status}</p>`,
    });
  } catch (e) { console.error("Email error:", e); }
}
