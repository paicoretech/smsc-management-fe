import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-input-row',
  templateUrl: './form-input-row.component.html',
})
export class FormInputRowComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label = '';
  @Input() id?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'number' | 'password' = 'text';
  @Input() labelCol = 'col-sm-4';
  @Input() inputCol = 'col-sm-8';
  @Input() readonly = false;
  @Input() showRequired = true;
  @Input() showMin = true;
  @Input() showMax = true;
  @Input() showPattern = true;
  @Input() groupErrorKey = '';
  @Input() groupErrorFields: string[] = [];
  @Input() groupErrorMessage = '';

    get control(): FormControl {
    const control = this.form.get(this.controlName);

    if (!control) {
        throw new Error(`Control "${this.controlName}" was not found in the provided form group.`);
    }

    return control as FormControl;
    }
  hasError(errorKey: string): boolean {
    return !!(this.control?.touched && this.control?.hasError(errorKey));
  }

  get hasGroupError(): boolean {
    if (!this.groupErrorKey || !this.groupErrorFields.length) {
      return false;
    }

    const hasError = !!this.form.errors?.[this.groupErrorKey];
    const hasInteractedField = this.groupErrorFields.some((field) => {
      const control = this.form.get(field);
      return !!control && (control.touched || control.dirty);
    });

    return hasError && hasInteractedField;
  }

  get minValue(): number | null {
    return this.control?.getError('min')?.min ?? null;
  }

  get maxValue(): number | null {
    return this.control?.getError('max')?.max ?? null;
  }

  get patternMessage(): string {
    const requiredPattern = this.control?.getError('pattern')?.requiredPattern;
    if (requiredPattern === '^[0-9]+$' || requiredPattern === '^[0-9]*$') {
      return 'Only numbers are allowed';
    }
    if (requiredPattern === '^\\S+$') {
      return 'Spaces are not allowed';
    }
    if (requiredPattern === '^(\\d+(\\s*,\\s*\\d+)*)?$') {
      return 'Use numeric codes separated by commas (e.g. 404, 410, 500)';
    }

    return 'Invalid format';
  }

  get elementId(): string {
    return this.id || this.controlName;
  }

  isPasswordVisible = false;

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  get isPasswordField(): boolean {
    return this.type === 'password';
  }

  get displayType(): 'text' | 'number' | 'password' {
    if (this.type === 'password' && this.isPasswordVisible) {
      return 'text';
    }
    return this.type;
  }
}
