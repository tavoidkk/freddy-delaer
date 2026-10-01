export const site = {
  name: 'Freddy Díaz Toyota Dealer',
  advisor: 'Freddy Díaz',
  // Completar cuando el concesionario confirme estos datos.
  phone: '',
  whatsapp: '', // Solo dígitos con código de país, por ejemplo: 15551234567
  address: '',
  city: '',
  email: '',
};

export const whatsappMessage = 'Hola Freddy, vi tu página y quisiera información para comprar un Toyota. ¿Me ayudas a coordinar una cita?';

export function whatsappUrl() {
  const number = site.whatsapp.replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}` : '';
}
