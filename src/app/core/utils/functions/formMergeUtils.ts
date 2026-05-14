function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasOwnKeys(obj: any): boolean {
  return isPlainObject(obj) && Object.keys(obj).length > 0;
}

function isMeaningful(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) {
    const cleaned = value.filter(v => v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== ''));
    return cleaned.length > 0;
  }
  return true;
}

export function mergeWithBackup(formValue: any, backup: any): any {
  const fv = isPlainObject(formValue) ? formValue : {};
  const bk = isPlainObject(backup) ? backup : {};

  if (!hasOwnKeys(bk)) {
    const normalized = { ...fv };
    Object.keys(normalized).forEach(k => {
      const v = normalized[k];
      if (Array.isArray(v) && v.every(x => x == null || x === '')) normalized[k] = [];
    });
    return normalized;
  }

  const result: Record<string, any> = { ...bk };

  Object.keys(bk).forEach(key => {
    const candidate = fv[key];
    if (isMeaningful(candidate)) {
      if (Array.isArray(candidate) && candidate.every(x => x == null || x === '')) {
        return;
      }
      result[key] = candidate;
    }
  });

  return result;
}
