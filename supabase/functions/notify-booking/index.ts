// Supabase Edge Function: emails the band when a new booking is submitted.
//
// Triggered by a Database Webhook on INSERT into public.bookings (see
// db/bookings.sql). The webhook POSTs { type, table, record, old_record };
// we read `record` (the new booking) and send it via the Resend API.
//
// Required Edge Function secrets (Dashboard → Edge Functions → notify-booking → Secrets):
//   RESEND_API_KEY  – from https://resend.com (free tier)
//   HOOK_SECRET     – any long random string; also set as an x-hook-secret
//                     header on the Database Webhook so only Supabase can call this.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const HOOK_SECRET = Deno.env.get("HOOK_SECRET");

// Where the notification goes.
const NOTIFY_TO = "lafuerzadebetomoreno@gmail.com";
// Resend's shared sender delivers to your own account email with no domain.
// After you verify a domain, change to e.g. "Reservas <bookings@tudominio.com>".
const FROM = "La Fuerza Web <onboarding@resend.dev>";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

Deno.serve(async (request) => {
  // Only allow calls that carry the shared secret (i.e. our webhook).
  if (!HOOK_SECRET || request.headers.get("x-hook-secret") !== HOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const b = payload.record ?? {};

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: NOTIFY_TO,
      reply_to: b.email || undefined,
      subject: `Nueva contratación — ${b.name || "Sin nombre"}`,
      html:
        `<h2>Nueva solicitud de contratación</h2>` +
        `<p><strong>Nombre:</strong> ${esc(b.name)}</p>` +
        `<p><strong>Correo:</strong> ${esc(b.email)}</p>` +
        `<p><strong>Teléfono:</strong> ${esc(b.phone)}</p>` +
        `<p><strong>Tipo de evento:</strong> ${esc(b.event_type)}</p>` +
        `<p><strong>Mensaje:</strong><br>${esc(b.message).replace(/\n/g, "<br>")}</p>` +
        `<hr><p style="color:#888;font-size:12px">Enviado desde el formulario de contacto del sitio.</p>`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return Response.json({ ok: res.ok, resend: data }, { status: res.ok ? 200 : 502 });
});
