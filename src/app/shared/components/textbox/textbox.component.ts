import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type TextboxInputType = 'text' | 'number' | 'password' | 'email' | 'tel' | 'url';

@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextboxComponent implements ControlValueAccessor {
  @Input() id = `app-textbox-${TextboxComponent.nextId++}`;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: TextboxInputType = 'text';
  @Input() autocomplete = '';
  @Input() inputClass = '';
  @Input() labelClass = 'form-label';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() maxLength: number | null = null;
  @Input() requiredMessage = 'The field is required.';
  @Input() showValidation = true;

  value = '';
  isDisabled = false;

  private static nextId = 0;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    @Optional() @Self() public readonly ngControl: NgControl | null,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: string | number | null | undefined): void {
    this.value = value === null || value === undefined ? '' : String(value);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  markAsTouched(): void {
    this.onTouched();
  }

  get hasError(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get errorMessage(): string {
    const errors = this.ngControl?.control?.errors;

    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return this.requiredMessage;
    }

    if (errors['minlength']) {
      return `Minimum length: ${errors['minlength'].requiredLength}`;
    }

    if (errors['maxlength']) {
      return `Maximum length: ${errors['maxlength'].requiredLength}`;
    }

    if (errors['min']) {
      return `Minimum value: ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `Maximum value: ${errors['max'].max}`;
    }

    if (errors['pattern']) {
      return 'Invalid format.';
    }

    return 'Invalid value.';
  }
}
