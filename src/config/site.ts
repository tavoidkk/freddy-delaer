export const site = {
  name: 'Freddy Díaz | Don McGill Toyota',
  dealership: 'Don McGill Toyota',
  advisor: 'Freddy Díaz',
  // Número general de ventas publicado por el concesionario. Cámbialo aquí si Freddy confirma otro teléfono.
  phone: '+1 844.529.1532',
  phoneLabel: 'Ventas del concesionario',
  whatsapp: '', // Solo dígitos con código de país, por ejemplo: 15551234567
  address: '11800 Katy Freeway',
  city: 'Houston, TX 77079',
  hours: 'Lunes a sábado, 9:00 a. m. a 7:00 p. m.',
  dealershipUrl: 'https://www.donmcgilltoyota.com/',
  inventoryUrl: 'https://www.donmcgilltoyota.com/new-vehicles/',
  email: '',
};

export const whatsappMessage = 'Hola Freddy, vi tu página y quisiera información para comprar un Toyota. ¿Me ayudas a coordinar una cita?';

export function whatsappUrl() {
  const number = site.whatsapp.replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}` : '';
}
