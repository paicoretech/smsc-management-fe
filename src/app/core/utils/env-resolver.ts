const PLACEHOLDER_PREFIX = '___';

function isUnreplacedPlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  return s.startsWith(PLACEHOLDER_PREFIX) && s.endsWith(PLACEHOLDER_PREFIX);
}

function normalizeString(value: unknown): string {
  if (value === undefined || value === null) return '';
  const s = String(value).trim();
  const lower = s.toLowerCase();
  if (lower === 'null' || lower === 'undefined') return '';
  return s;
}

function pick(runtimeValue: unknown, fallback: unknown): string {
  const useFallback =
    runtimeValue === undefined ||
    runtimeValue === null ||
    runtimeValue === '' ||
    isUnreplacedPlaceholder(runtimeValue);

  return normalizeString(useFallback ? fallback : runtimeValue);
}

export function resolveString(runtimeValue: unknown, fallback: unknown, defaultValue = ''): string {
  const v = pick(runtimeValue, fallback);
  return v || defaultValue;
}

export function resolveBoolean(runtimeValue: unknown, fallback: unknown, defaultValue = false): boolean {
  const raw = resolveString(runtimeValue, fallback, defaultValue ? 'true' : 'false').toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

export function resolveNumber(runtimeValue: unknown, fallback: unknown, defaultValue = 0): number {
  const raw = resolveString(runtimeValue, fallback, String(defaultValue));
  const n = Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
}

export function resolveCsv(runtimeValue: unknown, fallback: unknown, defaultValue: string[] = []): string[] {
  const raw = resolveString(runtimeValue, fallback, '');
  if (!raw) return defaultValue;
  return raw.split(',').map(x => x.trim()).filter(Boolean);
}
