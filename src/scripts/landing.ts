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

const form = document.querySelector<HTMLFormElement>('#lead-form');
const modelButtons = document.querySelectorAll<HTMLButtonElement>('[data-model-select]');

if (form) {
  const status = document.querySelector<HTMLElement>('#form-status');
  const success = document.querySelector<HTMLElement>('[data-form-success]');
  const successTitle = document.querySelector<HTMLElement>('[data-success-title]');
  const successCopy = document.querySelector<HTMLElement>('[data-success-copy]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const progressLabel = document.querySelector<HTMLElement>('[data-progress-label]');
  const progressBar = document.querySelector<HTMLElement>('[data-progress-bar]');
  const progress = document.querySelector<HTMLElement>('.form-progress');
  const stepPanels = [...form.querySelectorAll<HTMLElement>('[data-form-step]')];
  const stepOneFields = ['vehicle', 'priority'] as const;
  const allFields = ['vehicle', 'priority', 'name', 'phone', 'email', 'contactPreference', 'consent'] as const;
  type FieldName = typeof allFields[number];
  const get = (name: Exclude<FieldName, 'contactPreference'>) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;

  const fieldControl = (name: FieldName): HTMLElement | null => name === 'contactPreference'
    ? form.querySelector<HTMLElement>('[data-contact-group]')
    : get(name);

  const error = (name: FieldName, message: string) => {
    const control = fieldControl(name);
    const target = document.querySelector<HTMLElement>(`#${name}-error`);
    if (target) target.textContent = message;
    control?.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) control?.setAttribute('aria-describedby', `${name}-error`);
    else control?.removeAttribute('aria-describedby');
    return !message;
  };

  const validate = (name: FieldName) => {
    if (name === 'contactPreference') {
      const choice = form.querySelector<HTMLInputElement>('input[name="contactPreference"]:checked')?.value ?? '';
      return error(name, choice ? '' : 'Elige cómo prefieres que Freddy te contacte.');
    }

    const value = get(name).value.trim();
    switch (name) {
      case 'name': return error(name, value.length >= 2 && value.length <= 100 && /^[\p{L}\p{M} .'-]+$/u.test(value) ? '' : 'Escribe tu nombre completo (mínimo 2 caracteres).');
      case 'phone': return error(name, value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15 ? '' : 'Escribe un número válido de 10 a 15 dígitos.');
      case 'email': return error(name, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 ? '' : 'Escribe un correo válido.');
      case 'vehicle': return error(name, value ? '' : 'Selecciona un modelo o elige “Aún no lo sé”.');
      case 'priority': return error(name, value ? '' : 'Elige lo que más te ayudaría a avanzar.');
      case 'consent': return error(name, (get(name) as HTMLInputElement).checked ? '' : 'Lee y acepta la política y el uso de datos indicado para continuar.');
    }
  };

  const focusFirstInvalid = (fields: readonly FieldName[]) => {
    const invalid = fields.find((name) => fieldControl(name)?.getAttribute('aria-invalid') === 'true');
    if (invalid === 'contactPreference') {
      form.querySelector<HTMLInputElement>('input[name="contactPreference"]')?.focus();
    } else if (invalid) {
      get(invalid).focus();
    }
  };

  const showStatus = (message: string, kind: 'error' | 'success' = 'error') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status ${kind}`;
  };

  const changeStep = (nextStep: 1 | 2) => {
    stepPanels.forEach((panel) => {
      const active = Number(panel.dataset.formStep) === nextStep;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    });
    if (progressLabel) progressLabel.textContent = `Paso ${nextStep} de 2`;
    if (progressBar) progressBar.style.width = nextStep === 1 ? '50%' : '100%';
    progress?.setAttribute('aria-valuenow', String(nextStep));
    if (status) { status.textContent = ''; status.className = 'form-status'; }
    const target = document.querySelector<HTMLElement>(`[data-form-step="${nextStep}"]`);
    target?.querySelector<HTMLElement>('h4')?.focus({ preventScroll: true });
  };

  form.querySelector<HTMLButtonElement>('[data-form-next]')?.addEventListener('click', () => {
    const valid = stepOneFields.map(validate).every(Boolean);
    if (!valid) {
      focusFirstInvalid(stepOneFields);
      showStatus('Completa estos dos datos para continuar.');
      return;
    }
    changeStep(2);
  });
  form.querySelector<HTMLButtonElement>('[data-form-back]')?.addEventListener('click', () => changeStep(1));

  allFields.forEach((name) => {
    if (name === 'contactPreference') {
      form.querySelectorAll<HTMLInputElement>('input[name="contactPreference"]').forEach((choice) => choice.addEventListener('change', () => validate(name)));
      return;
    }
    const control = get(name);
    control.addEventListener(control instanceof HTMLInputElement && control.type === 'checkbox' ? 'change' : 'input', () => validate(name));
    if (control instanceof HTMLSelectElement) control.addEventListener('change', () => validate(name));
  });

  modelButtons.forEach((button) => button.addEventListener('click', () => {
    const vehicle = form.querySelector<HTMLSelectElement>('#vehicle');
    const model = button.dataset.modelSelect ?? '';
    if (vehicle && [...vehicle.options].some((option) => option.value === model)) {
      vehicle.value = model;
      vehicle.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.querySelector<HTMLElement>('#cita')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const valid = allFields.map(validate).every(Boolean);
    if (!valid) {
      changeStep(2);
      focusFirstInvalid(allFields);
      showStatus('Revisa los campos señalados para continuar.');
      return;
    }

    if (submit) { submit.disabled = true; submit.textContent = 'Enviando solicitud…'; }
    if (status) { status.textContent = ''; status.className = 'form-status'; }
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No pudimos enviar la solicitud. Inténtalo de nuevo.');

      window.dispatchEvent(new Event('freddy:lead-submitted'));
      const fullName = String(data.name ?? '').trim();
      const firstName = fullName.split(/\s+/)[0] || 'gracias';
      const contactCopy: Record<string, string> = {
        'Llamada': 'por teléfono',
        'Mensaje de texto': 'por mensaje de texto',
        'WhatsApp': 'por WhatsApp',
      };
      const preferred = String(data.contactPreference ?? '');
      const vehicle = String(data.vehicle ?? '');
      if (successTitle) successTitle.textContent = `Gracias, ${firstName}.`;
      if (successCopy) successCopy.textContent = `Freddy y su equipo te contactarán ${contactCopy[preferred] ?? 'pronto'} para conversar sobre el Toyota ${vehicle} y coordinar una cita.`;
      form.reset();
      allFields.forEach((name) => error(name, ''));
      form.hidden = true;
      if (success) success.hidden = false;
    } catch (cause) {
      showStatus(cause instanceof Error ? cause.message : 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      if (submit && !form.hidden) { submit.disabled = false; submit.innerHTML = 'Enviar mi solicitud <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>'; }
    }
  });
}
