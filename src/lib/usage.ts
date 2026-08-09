export const MAX_FREE_GENERATIONS = 5;

const USAGE_KEY = 'covercraft_free_generations_used';
const PRO_STATUS_KEY = 'covercraft_pro_status';
const CREDITS_KEY = 'covercraft_credits';

function readNonNegativeInteger(key: string): number {
  try {
    const value = Number.parseInt(localStorage.getItem(key) || '', 10);
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function getFreeGenerationsUsed(): number {
  if (typeof window === 'undefined') return 0;
  return readNonNegativeInteger(USAGE_KEY);
}

export function getCreditsRemaining(): number {
  if (typeof window === 'undefined') return 0;
  return readNonNegativeInteger(CREDITS_KEY);
}

export function addCredits(count: number): void {
  if (typeof window === 'undefined' || count <= 0) return;
  try {
    const amount = Math.floor(count);
    if (!Number.isSafeInteger(amount)) return;
    localStorage.setItem(
      CREDITS_KEY,
      String(Math.min(Number.MAX_SAFE_INTEGER, getCreditsRemaining() + amount))
    );
  } catch {
    // ignore storage errors
  }
}

export function getFreeGenerationsRemaining(): number {
  if (isProUser()) return 999;
  const credits = getCreditsRemaining();
  if (credits > 0) return credits;
  return Math.max(0, MAX_FREE_GENERATIONS - getFreeGenerationsUsed());
}

export function canGenerate(): boolean {
  if (isProUser()) return true;
  if (getCreditsRemaining() > 0) return true;
  return getFreeGenerationsUsed() < MAX_FREE_GENERATIONS;
}

export function incrementUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    if (isProUser()) return getCreditsRemaining();
    const credits = getCreditsRemaining();
    if (credits > 0) {
      localStorage.setItem(CREDITS_KEY, String(credits - 1));
    } else {
      const current = getFreeGenerationsUsed();
      const updated = Math.min(Number.MAX_SAFE_INTEGER, current + 1);
      localStorage.setItem(USAGE_KEY, updated.toString());
    }
    window.dispatchEvent(new CustomEvent('covercraft-usage-change'));
    return getCreditsRemaining();
  } catch {
    return getFreeGenerationsUsed();
  }
}

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PRO_STATUS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setProUser(status: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRO_STATUS_KEY, status ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}
