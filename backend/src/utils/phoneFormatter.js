/**
 * Format phone numbers to WhatsApp format: <country><number>@c.us
 * - Strips non-digits
 * - Adds default country code when necessary
 */

function formatPhoneToWhatsApp(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Invalid phone');

  // Remove non-digit characters
  let digits = raw.replace(/\D/g, '');

  // Remove leading 0s
  while (digits.startsWith('0')) digits = digits.slice(1);

  const defaultCountry = (process.env.DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');

  if (digits.length === 10) {
    digits = defaultCountry + digits;
  }

  if (!digits.endsWith('@c.us')) {
    digits = digits + '@c.us';
  }

  return digits;
}

module.exports = { formatPhoneToWhatsApp };
