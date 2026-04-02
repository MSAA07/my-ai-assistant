const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value, t) {
  const email = value.trim();
  if (!email) return t('auth.validation.emailRequired');
  if (!EMAIL_PATTERN.test(email)) return t('auth.validation.emailInvalid');
  return '';
}

export function validatePassword(value, t) {
  if (!value) return t('auth.validation.passwordRequired');
  if (value.length < PASSWORD_MIN_LENGTH) return t('auth.validation.passwordMin', { count: PASSWORD_MIN_LENGTH });
  return '';
}

export function validateName(value, t) {
  if (!value.trim()) return t('auth.validation.nameRequired');
  return '';
}

export function validateConfirmPassword(password, confirmPassword, t) {
  if (!confirmPassword) return t('auth.validation.confirmPasswordRequired');
  if (password !== confirmPassword) return t('auth.validation.confirmPasswordMismatch');
  return '';
}
