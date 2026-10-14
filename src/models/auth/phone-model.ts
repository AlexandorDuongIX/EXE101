export function formatPhoneInput(rawText: string): string {
  let digits = rawText.replace(/\D/g, '');

  // Keep the existing input limits and spacing for local phone numbers.
  if (digits.startsWith('0')) {
    digits = digits.slice(0, 10);
  } else {
    digits = digits.slice(0, 9);
  }

  if (digits.startsWith('0')) {
    if (digits.length > 4 && digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    if (digits.length > 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
  } else {
    if (digits.length > 3 && digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    if (digits.length > 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  }

  return digits;
}

export function getNormalizedPhone(phoneText: string): { isValid: boolean; display: string } {
  const digits = phoneText.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    const isValid = digits.length === 10;
    const body = digits.slice(1);
    const display = isValid ? `0${body.slice(0, 3)} ${body.slice(3, 6)} ${body.slice(6)}` : phoneText;
    return { isValid, display };
  }

  const isValid = digits.length === 9;
  const display = isValid ? `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : phoneText;
  return { isValid, display };
}

export function formatMaskedPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\s+/g, '');
  if (digits.length >= 9) {
    const start = digits.slice(0, 4);
    const end = digits.slice(-3);
    return `${start} ••• ${end}`;
  }
  return rawPhone || '0912 ••• 889';
}
