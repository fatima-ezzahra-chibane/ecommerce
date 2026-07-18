/** Numéro WhatsApp international (sans + ni espaces). Ex. Maroc : 212612345678 */
export const WHATSAPP_NUMBER =
  process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '212707485561';

const DEFAULT_MESSAGE =
  "Bonjour Vivid ! Je souhaite plus d'informations sur vos produits.";

export function getWhatsAppUrl(message = DEFAULT_MESSAGE) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
