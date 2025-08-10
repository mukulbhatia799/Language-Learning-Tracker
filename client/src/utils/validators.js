export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[+]?\d{7,15}$/;

export function validateRegister({ name, email, phone, password }) {
  const errors = {};
  if (!name || name.length < 2) errors.name = 'Name is too short';
  if (!emailRegex.test(email || '')) errors.email = 'Invalid email';
  if (phone && !phoneRegex.test(phone)) errors.phone = 'Invalid phone';
  if (!password || password.length < 6) errors.password = 'Min 6 characters';
  return errors;
}