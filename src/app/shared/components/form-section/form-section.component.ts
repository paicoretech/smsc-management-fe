import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormFieldConfig, FormSectionConfig } from '../../../core/forms/form-section.model';


@Component({
  selector: 'app-form-section',
  templateUrl: './form-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
  @Input() form!: FormGroup;
  @Input() config!: FormSectionConfig;

  isVisible(field: FormFieldConfig): boolean {
    return !field.hidden;
  }

  isInputField(field: FormFieldConfig): boolean {
    return field.type === 'text' || field.type === 'number' || field.type === 'password';
  }

  isSelectField(field: FormFieldConfig): boolean {
    return field.type === 'select';
  }

  isCheckboxField(field: FormFieldConfig): boolean {
    return field.type === 'checkbox';
  }

  isRadioField(field: FormFieldConfig): boolean {
    return field.type === 'radio';
  }

  getInputType(field: FormFieldConfig): 'text' | 'number' | 'password' {
    if (field.type === 'number') return 'number';
    if (field.type === 'password') return 'password';
    return 'text';
  }
}