/**
 * Form validation utilities
 * Extracted from FormView.tsx for reusability and testability
 */

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const isEmail = (email: string): boolean => {
  const emailReg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
  return emailReg.test(email);
};

/**
 * Validates that a field is not empty
 * @param value - Value to validate
 * @returns true if value is not empty, false otherwise
 */
export const validateRequired = (value: string): boolean => {
  return value.trim() !== '';
};

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}
