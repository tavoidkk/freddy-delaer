import type { APIRoute } from 'astro';

const respond = (body: object, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const allowedVehicles = new Set(['Corolla', 'Camry', 'RAV4', 'Tacoma', 'Tundra', 'Highlander', 'Grand Highlander', '4Runner', 'Corolla Cross', 'Sienna', 'Prius', 'Otro modelo Toyota', 'Vehículo usado', 'Aún no lo sé']);
const allowedPriorities = new Set(['Encontrar una cuota que se ajuste a mi presupuesto', 'Conocer opciones de financiamiento', 'Elegir el modelo y tamaño adecuado', 'Explorar opciones para primeros compradores', 'Conocer inicial y elegibilidad', 'Comparar beneficios y cobertura', 'Aún no lo tengo claro']);
const allowedContactPreferences = new Set(['Llamada', 'Mensaje de texto', 'WhatsApp']);

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) return respond({ error: 'Formato de solicitud inválido.' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 10000) return respond({ error: 'Solicitud demasiado grande.' }, 413);
  let raw: Record<string, unknown>;
  try {
    const body = await request.text();
    if (body.length > 10000) return respond({ error: 'Solicitud demasiado grande.' }, 413);
    raw = JSON.parse(body);
  }
  catch { return respond({ error: 'Solicitud inválida.' }, 400); }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return respond({ error: 'Solicitud inválida.' }, 400);
  if (raw.website) return respond({ ok: true }, 200);
  const value = (key: string) => typeof raw[key] === 'string' ? raw[key].trim() : '';
  const name = value('name');
  const phone = value('phone');
  const email = value('email');
  const vehicle = value('vehicle');
  const priority = value('priority');
  const contactPreference = value('contactPreference');
  const message = value('message');
  const consent = raw.consent === 'on' || raw.consent === true;
  if (name.length < 2 || name.length > 100 || !/^[\p{L}\p{M} .'-]+$/u.test(name)) return respond({ error: 'Revisa el nombre.' }, 400);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15 || phone.length > 30) return respond({ error: 'Revisa el teléfono.' }, 400);
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond({ error: 'Revisa el correo.' }, 400);
  if (!allowedVehicles.has(vehicle) || !allowedPriorities.has(priority) || !allowedContactPreferences.has(contactPreference) || message.length > 500 || !consent) return respond({ error: 'Revisa los campos obligatorios.' }, 400);
  const webhook = process.env.CRM_WEBHOOK_URL;
  if (!webhook) return respond({ error: 'El formulario aún no está conectado. Inténtalo más tarde.' }, 503);
  let target: URL;
  try { target = new URL(webhook); }
  catch { return respond({ error: 'El formulario aún no está disponible.' }, 503); }
  if (target.protocol !== 'https:' && !(target.hostname === 'localhost' && target.protocol === 'http:')) return respond({ error: 'El formulario aún no está disponible.' }, 503);
  const contactNote = `Canal preferido de contacto: ${contactPreference}.`;
  const customerMessage = message.slice(0, Math.max(0, 499 - contactNote.length));
  const crmMessage = [customerMessage, contactNote].filter(Boolean).join('\n');
  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.CRM_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CRM_WEBHOOK_TOKEN}` } : {}) },
      body: JSON.stringify({ name, phone, email, vehicle, priority, message: crmMessage, privacyAccepted: true, marketingConsent: true, communicationsConsent: true, source: 'freddy-diaz-toyota-dealer', submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return respond({ error: 'No pudimos enviar la solicitud. Inténtalo de nuevo.' }, 502);
    return respond({ ok: true }, 200);
  } catch {
    return respond({ error: 'No pudimos conectar con el equipo. Inténtalo de nuevo.' }, 502);
  }
};
