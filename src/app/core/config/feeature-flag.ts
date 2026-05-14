import { environment } from '@env/environment';

function toBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(v)) return true;
    if (['false', '0', 'no', 'off'].includes(v)) return false;
  }
  return fallback;
}

export const FEATURE_FLAGS = Object.freeze({
  ipSmGwEnabled: toBool(environment.IpSmGwModule, true), 
});
