const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobileNav = document.querySelector<HTMLElement>('.mobile-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (mobileNav) mobileNav.hidden = !open;
});
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menú');
}));

const modelCarousel = document.querySelector<HTMLElement>('#model-carousel');
const scrollModels = (direction: -1 | 1) => {
  if (!modelCarousel) return;
  const card = modelCarousel.querySelector<HTMLElement>('.model-card');
  const gap = Number.parseFloat(getComputedStyle(modelCarousel).columnGap) || 0;
  modelCarousel.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || 280) + gap), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
};
document.querySelector<HTMLButtonElement>('[data-carousel-prev]')?.addEventListener('click', () => scrollModels(-1));
document.querySelector<HTMLButtonElement>('[data-carousel-next]')?.addEventListener('click', () => scrollModels(1));

const form = document.querySelector<HTMLFormElement>('#lead-form');
if (form) {
  const status = document.querySelector<HTMLElement>('#form-status');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const names = ['name', 'phone', 'email', 'vehicle', 'priority', 'consent'] as const;
  type FieldName = typeof names[number];
  const get = (name: FieldName) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
  const error = (name: FieldName, message: string) => {
    const control = get(name);
    const target = document.querySelector<HTMLElement>(`#${name}-error`);
    if (target) target.textContent = message;
    control.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) control.setAttribute('aria-describedby', `${name}-error`);
    else control.removeAttribute('aria-describedby');
    return !message;
  };
  const validate = (name: FieldName) => {
    const value = get(name).value.trim();
    switch (name) {
      case 'name': return error(name, value.length >= 2 && value.length <= 100 && /^[\p{L}\p{M} .'-]+$/u.test(value) ? '' : 'Escribe tu nombre completo (mínimo 2 caracteres).');
      case 'phone': return error(name, value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15 ? '' : 'Escribe un número válido de 10 a 15 dígitos.');
      case 'email': return error(name, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 ? '' : 'Escribe un correo válido.');
      case 'vehicle': return error(name, value ? '' : 'Selecciona el tipo de vehículo.');
      case 'priority': return error(name, value ? '' : 'Selecciona qué te gustaría resolver primero.');
      case 'consent': return error(name, (get(name) as HTMLInputElement).checked ? '' : 'Lee y acepta la política y el uso de datos indicado para continuar.');
    }
  };
  names.forEach((name) => {
    const control = get(name);
    control.addEventListener(control instanceof HTMLInputElement && control.type === 'checkbox' ? 'change' : 'input', () => {
      validate(name);
    });
    if (control instanceof HTMLSelectElement) control.addEventListener('change', () => validate(name));
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const valid = names.map((name) => validate(name)).every(Boolean);
    if (!valid) {
      names.find((name) => get(name).getAttribute('aria-invalid') === 'true' && get(name).focus());
      if (status) { status.textContent = 'Revisa los campos señalados para continuar.'; status.className = 'form-status error'; }
      return;
    }
    if (submit) { submit.disabled = true; submit.textContent = 'Enviando solicitud…'; }
    if (status) { status.textContent = ''; status.className = 'form-status'; }
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No pudimos enviar la solicitud. Inténtalo de nuevo.');
      form.reset();
      names.forEach((name) => error(name, ''));
      if (status) { status.textContent = '¡Solicitud enviada! Nos pondremos en contacto contigo para coordinar tu cita.'; status.className = 'form-status success'; }
    } catch (cause) {
      if (status) { status.textContent = cause instanceof Error ? cause.message : 'Ocurrió un error. Inténtalo de nuevo.'; status.className = 'form-status error'; }
    } finally {
      if (submit) { submit.disabled = false; submit.innerHTML = 'Quiero coordinar una cita <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>'; }
    }
  });
}
