/**
 * Format phone numbers
 * @param phoneNumber The phone number to format (i.e. +11234567890)
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // If the phone number starts with a country code (e.g., +1), remove it
  const normalized =
    cleaned.length === 11 && cleaned.startsWith('1')
      ? cleaned.slice(1)
      : cleaned;

  // Check if the input is of correct length
  const match = normalized.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }

  return phoneNumber;
}
