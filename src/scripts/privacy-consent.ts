export {};

type ConsentChoice = 'accepted' | 'rejected';
type PixelArgs = [command: string, ...args: unknown[]];
type MetaPixel = ((...args: PixelArgs) => void) & {
  callMethod?: (...args: PixelArgs) => void;
  queue?: PixelArgs[];
  push?: MetaPixel;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaPixel;
    _fbq?: MetaPixel;
    __freddyMetaPixelInitialized?: boolean;
    __freddyPageViewTracked?: boolean;
  }
}

const consentKey = 'freddy-privacy-advertising-consent';
let sessionChoice: ConsentChoice | null = null;
const banner = document.querySelector<HTMLElement>('[data-privacy-banner]');
const settingsButton = document.querySelector<HTMLButtonElement>('[data-privacy-open]');
const acceptButton = document.querySelector<HTMLButtonElement>('[data-privacy-accept]');
const rejectButton = document.querySelector<HTMLButtonElement>('[data-privacy-reject]');
const pixelId = document.querySelector<HTMLMetaElement>('meta[name="meta-pixel-id"]')?.content.trim() ?? '';

function getChoice(): ConsentChoice | null {
  try {
    const choice = localStorage.getItem(consentKey);
    return choice === 'accepted' || choice === 'rejected' ? choice : null;
  } catch {
    return sessionChoice;
  }
}

function updateControls() {
  const hasChoice = getChoice() !== null;
  if (banner) banner.hidden = hasChoice;
  if (settingsButton) {
    settingsButton.hidden = !hasChoice;
    settingsButton.setAttribute('aria-expanded', String(!hasChoice));
  }
  document.documentElement.classList.toggle('privacy-consent-visible', !hasChoice);
}

function ensurePixelStub(): MetaPixel {
  if (window.fbq) return window.fbq;

  const pixel = function (...args: PixelArgs) {
    if (pixel.callMethod) pixel.callMethod.apply(pixel, args);
    else pixel.queue?.push(args);
  } as MetaPixel;

  pixel.queue = [];
  pixel.loaded = true;
  pixel.version = '2.0';
  pixel.push = pixel;
  window.fbq = pixel;
  window._fbq = pixel;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
  else document.head.append(script);

  return pixel;
}

function enablePixel() {
  if (!/^\d+$/.test(pixelId)) return;
  const pixel = ensurePixelStub();
  pixel('consent', 'grant');

  if (!window.__freddyMetaPixelInitialized) {
    pixel('init', pixelId);
    window.__freddyMetaPixelInitialized = true;
  }

  if (!window.__freddyPageViewTracked) {
    pixel('track', 'PageView');
    window.__freddyPageViewTracked = true;
  }
}

function saveChoice(choice: ConsentChoice) {
  sessionChoice = choice;
  try {
    localStorage.setItem(consentKey, choice);
  } catch {
    // Without persistent storage, this choice applies for the current page only.
  }

  if (choice === 'accepted') {
    enablePixel();
  } else {
    window.fbq?.('consent', 'revoke');
    document.cookie = '_fbp=; Max-Age=0; path=/; SameSite=Lax';
    document.cookie = '_fbc=; Max-Age=0; path=/; SameSite=Lax';
  }

  updateControls();
}

acceptButton?.addEventListener('click', () => saveChoice('accepted'));
rejectButton?.addEventListener('click', () => saveChoice('rejected'));
settingsButton?.addEventListener('click', () => {
  if (banner) banner.hidden = false;
  if (settingsButton) settingsButton.hidden = true;
  document.documentElement.classList.add('privacy-consent-visible');
  acceptButton?.focus();
});

window.addEventListener('freddy:lead-submitted', () => {
  if (getChoice() === 'accepted' && window.fbq) window.fbq('track', 'Lead');
});

updateControls();
if (getChoice() === 'accepted') enablePixel();
