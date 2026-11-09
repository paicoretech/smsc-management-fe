import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function priorityRequiredValidator(
  highField: string,
  mediumField: string,
  lowField: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const high = Number(control.get(highField)?.value ?? 0);
    const medium = Number(control.get(mediumField)?.value ?? 0);
    const low = Number(control.get(lowField)?.value ?? 0);

    const hasAtLeastOneActive = high > 0 || medium > 0 || low > 0;

    return hasAtLeastOneActive ? null : { atLeastOnePriorityActive: true };
  };
}

export function maxResponseGteRequestValidator(
  maxField: string,
  requestField: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const maxRaw = control.get(maxField)?.value;
    const reqRaw = control.get(requestField)?.value;

    if (maxRaw == null || maxRaw === '' || reqRaw == null || reqRaw === '') {
      return null;
    }

    const max = Number(maxRaw);
    const req = Number(reqRaw);

    if (!Number.isFinite(max) || !Number.isFinite(req)) {
      return null;
    }

    return max >= req ? null : { maxResponseLtRequest: true };
  };
}

export function hasPriorityGroupError(
  form: FormGroup,
  errorKey: string,
  fields: string[]
): boolean {
  const hasError = !!form.errors?.[errorKey];
  const hasTouchedField = fields.some(field => !!form.get(field)?.touched);

  return hasError && hasTouchedField;
}
