export const ADMIN_EMAILS = [
  "kalim.apoffi@gmail.com",
  "kalimdon07@gmail.com"
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
