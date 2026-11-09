import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-checkbox-row',
  templateUrl: './form-checkbox-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckboxRowComponent {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label = '';
  @Input() tooltip = '';
  @Input() labelCol = 'col-sm-6';
  @Input() inputCol = 'col-sm-6';

get control(): FormControl {
  const control = this.form.get(this.controlName);

  if (!control) {
    throw new Error(`Control "${this.controlName}" was not found in the provided form group.`);
  }

  return control as FormControl;
}
}
