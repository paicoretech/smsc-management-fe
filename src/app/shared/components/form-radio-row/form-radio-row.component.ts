import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldOption } from '../../../core/forms/form-section.model';

@Component({
  selector: 'app-form-radio-row',
  templateUrl: './form-radio-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRadioRowComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label = '';
  @Input() labelCol = 'col-sm-4';
  @Input() inputCol = 'col-sm-8';
  @Input() options: FormFieldOption[] = [];

  get control(): FormControl {
    const control = this.form.get(this.controlName);

    if (!control) {
      throw new Error(`Control "${this.controlName}" was not found in the provided form group.`);
    }

    return control as FormControl;
  }
}
