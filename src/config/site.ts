export const site = {
  name: 'Freddy Díaz | Don McGill Toyota',
  dealership: 'Don McGill Toyota',
  advisor: 'Freddy Díaz',
  // Pixel ID is public and belongs here so it can be changed without editing scripts.
  metaPixelId: '1112239225055765',
  // Datos de contacto personalizables de Freddy.
  phone: '+1 (346) 637-0319',
  phoneLabel: 'Habla con Freddy',
  whatsapp: '13466370319', // Solo dígitos con código de país, por ejemplo: 15551234567
  address: '11800 Katy Freeway',
  city: 'Houston, TX 77079',
  hours: 'Lunes a sábado, 9:00 a. m. a 7:00 p. m.',
  dealershipUrl: 'https://www.donmcgilltoyota.com/',
  inventoryUrl: 'https://www.donmcgilltoyota.com/new-vehicles/',
  email: '',
};

export const whatsappMessage = 'Hola Freddy, vi tu página y quiero contarte lo que busco para mi próximo Toyota. ¿Me ayudas a explorar opciones y coordinar una cita?';

export function whatsappUrl() {
  const number = site.whatsapp.replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}` : '';
}
