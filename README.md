# Freddy Díaz Toyota Dealer

Landing en Astro para solicitar una conversación y coordinar una cita.

## Desarrollo local

```bash
npm install
npm run dev
```

## Configuración

1. Edita `src/config/site.ts` para agregar teléfono, WhatsApp, dirección y correo. El botón de WhatsApp aparece automáticamente cuando haya un número.
2. Copia `.env.example` a `.env` y configura `CRM_WEBHOOK_URL`. Si el CRM exige un token Bearer, configura `CRM_WEBHOOK_TOKEN`.
3. El formulario envía un JSON al webhook con `name`, `phone`, `email`, `vehicle`, `priority`, `message`, `privacyAccepted`, `marketingConsent`, `communicationsConsent`, `source` y `submittedAt`. Adapta este mapeo en `src/pages/api/lead.ts` si el CRM espera otros nombres.
4. Revisa con el concesionario las condiciones comerciales y los textos de `/terminos/` y `/privacidad/` antes de publicar. Confirma identidad legal, contacto de privacidad y disponibilidad de los beneficios.

La aplicación usa el adaptador Node de Astro porque `/api/lead` se ejecuta en el servidor. El webhook nunca se expone en el navegador. El consentimiento obligatorio combina el aviso de privacidad, el contacto relacionado con la solicitud y el envío de promociones; cada correo promocional debe incluir una opción de baja.

La imagen en `public/images/hero-car.png` es generada para esta landing e ilustrativa. No es una fotografía de inventario ni un recurso oficial de Toyota. El monograma FD es una marca tipográfica de esta página, no el logo de Toyota.

El retrato `public/images/freddy-portrait.png` es una edición con la herramienta integrada `imagegen` de la foto proporcionada por el usuario (`C:/Users/user/Pictures/freddy.jpg`). Se editó vestimenta, lentes, pose y fondo para uso en la landing. Revisar visualmente el parecido con Freddy antes de publicar.

### Prompt del retrato editado

> Edit the supplied photo into a premium, photorealistic professional portrait for a personal-brand automotive advisor website. The man in the input is Freddy Diaz. Preserve his exact facial identity and recognizable facial features, skin tone, hairstyle, age, build, and natural expression. Add tasteful clear-lens prescription eyeglasses with a thin dark frame; eyes must remain visible, no sunglasses. Replace the mirror-selfie setting and phone with a confident natural portrait pose, looking toward camera, shoulders relaxed. Dress him in a well-tailored dark navy business suit, crisp white shirt, subtle neutral tie. Use a refined modern automotive showroom background in softly blurred neutral tones, natural professional lighting. Composition: waist-up vertical portrait, sufficient room around head and shoulders for web layout. Realistic human anatomy, realistic glasses, high quality editorial photography. Do not change his facial structure or make him look like a different person. No logos, text, car badges, watermarks, or excessive retouching.

### Prompt de la imagen (herramienta integrada `imagegen`)

> Photorealistic premium automotive advertising photograph for a professional Spanish-language Toyota sales advisor landing page. A modern dark metallic gray midsize SUV parked outside a contemporary glass-and-concrete dealership at golden hour, subtle warm reflections, elegant sophisticated atmosphere, believable realistic vehicle details, clean cinematic framing. Wide landscape composition with car on the right half and generous darker negative space on the left for webpage headline overlay. No people, no text, no logo, no badges, no trademark emblems, no watermarks. High-end editorial automotive photography, natural color grading, sharp yet tasteful.
