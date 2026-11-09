import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export interface FormSelectOption<T = string | number | null> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-form-select-row',
  templateUrl: './form-select-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelectRowComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label = '';
  @Input() options: FormSelectOption[] = [];
  @Input() id?: string;
  @Input() labelCol = 'col-sm-4';
  @Input() inputCol = 'col-sm-8';

    get control(): FormControl {
    const control = this.form.get(this.controlName);

    if (!control) {
        throw new Error(`Control "${this.controlName}" was not found in the provided form group.`);
    }

    return control as FormControl;
    }

  get elementId(): string {
    return this.id || this.controlName;
  }

  get showRequiredError(): boolean {
    return this.control.touched && this.control.hasError('required');
  }
}
