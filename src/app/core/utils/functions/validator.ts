import { AbstractControl } from '@angular/forms';

export function minArrayLength(min: number) {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value.length >= min) {
      return null;
    }
    return { 'minArrayLength': { valid: false } };
  };
}

/**
 * Checks if a value is null, undefined, or an empty string after trimming white spaces.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is `null`, `undefined`, or an empty string after trimming spaces, and `false` otherwise.
 * 
 * @example
 * isBlank('');          // true
 * isBlank('   ');       // true
 * isBlank(null);        // true
 * isBlank(undefined);   // true
 * isBlank('Hello');     // false
 * isBlank(42);          // false
 */
export function isBlank(value: any): boolean {
  return value == null || (typeof value === 'string' && value.trim() === '');
}
