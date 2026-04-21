export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedPhone?: string;
}

/**
 * Validate Indian mobile phone number
 * Must be 10 digits starting with 6, 7, 8, or 9
 */
export const validateIndianPhone = (phone: string): PhoneValidationResult => {
  // Remove any whitespace or special characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check length
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must be exactly 10 digits'
    };
  }
  
  // Check if starts with valid prefix (6, 7, 8, or 9)
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      error: 'Phone number must start with 6, 7, 8, or 9'
    };
  }
  
  return {
    isValid: true,
    formattedPhone: cleaned
  };
};

/**
 * Format phone number for display (e.g., "98765 43210")
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Format phone number for SMS with country code (e.g., "+919876543210")
 */
export const formatPhoneForSMS = (phone: string, countryCode: string = '+91'): string => {
  const cleaned = phone.replace(/\D/g, '');
  return `${countryCode}${cleaned}`;
};
