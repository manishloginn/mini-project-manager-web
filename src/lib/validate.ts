export function validateAuth(input: {
  name?: string;
  email: string;
  password: string;
  requireName?: boolean;
}) {
  const errors: Record<string, string> = {};
  if (input.requireName) {
    const name = input.name?.trim() ?? "";
    if (!name) errors.name = "Name is required.";
    else if (name.length > 80) errors.name = "Name must be at most 80 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (input.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (input.password.length > 72) errors.password = "Password must be at most 72 characters.";
  return errors;
}

export function validateTitle(title: string, label = "Title") {
  const value = title.trim();
  if (!value) return `${label} is required.`;
  if (value.length > 120) return `${label} must be at most 120 characters.`;
  return "";
}
