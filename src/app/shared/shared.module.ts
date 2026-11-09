import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDeleteComponent } from './components/modal-delete/modal-delete.component';
import { ModalBalanceComponent } from './components/modal-balance/modal-balance.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { PasswordFormComponent } from './components/password-form/password-form.component';
import { FormInputRowComponent } from './components/form-input-row/form-input-row.component';
import { FormSelectRowComponent } from './components/form-select-row/form-select-row.component';
import { FormCheckboxRowComponent } from './components/form-checkbox-row/form-checkbox-row.component';
import { FormRadioRowComponent } from './components/form-radio-row/form-radio-row.component';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { CheckFormTooltipDirective } from './directives/check-form-tooltip.directive';
import { AccordionSectionComponent } from './components/accordion-section/accordion-section.component';
import { TagInputComponent } from './components/tag-input/tag-input.component';
import { FormArrayTableComponent } from './components/form-array-table/form-array-table.component';
import { TextboxComponent } from './components/textbox/textbox.component';
import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [
    ModalDeleteComponent,
    ModalBalanceComponent,
    PasswordFormComponent,
    FormInputRowComponent,
    FormSelectRowComponent,
    FormCheckboxRowComponent,
    FormSectionComponent,
    AccordionSectionComponent,
    TagInputComponent,
    FormArrayTableComponent,
    CheckFormTooltipDirective,
    TextboxComponent,
    ButtonComponent,
    FormRadioRowComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule
  ],
  exports: [
    ModalDeleteComponent,
    ModalBalanceComponent,
    PasswordFormComponent,
    FormInputRowComponent,
    FormSelectRowComponent,
    FormCheckboxRowComponent,
    FormRadioRowComponent,
    FormSectionComponent,
    AccordionSectionComponent,
    TagInputComponent,
    FormArrayTableComponent,
    CheckFormTooltipDirective,
    TextboxComponent,
    ButtonComponent,
  ]
})
export class SharedModule { }
