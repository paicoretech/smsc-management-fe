import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.component.html'
})
export class PasswordFormComponent implements OnInit {

  @Input() title: string = 'Change Password';
  @Input() showCancel: boolean = false;
  @Output() submitForm = new EventEmitter<FormGroup>();
  @Output() cancel = new EventEmitter<void>();

  public form!: FormGroup;
  public passwordFieldType: string = 'password';
  public confirmFieldType: string = 'password';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5)]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  toggleVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else {
      this.confirmFieldType = this.confirmFieldType === 'password' ? 'text' : 'password';
    }
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMinLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
  }

  getMinLength(name: string) {
    return this.form.get(name)?.errors?.['minlength']?.requiredLength;
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitForm.emit(this.form);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
