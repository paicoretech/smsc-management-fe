import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@app/core/services/user.service';
import { AlertService, User, ServiceProvidersService } from '@core/index';


@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {

  public title = '';
  public isEdit = false;
  public form!: FormGroup;
  roles: any[] = [];
  isPasswordVisible: boolean = false;
  isPasswordConfirmVisible: boolean = false;
  passwordFieldType: string = 'password';
  passwordConfirmFieldType: string = 'password';
  readonly PASSWORD_MIN_LENGTH = 5;
  public isRoot = false;
  public btnEnabled = true;
  public lockMessage: string | null = null;
  providers: any[] = [];
  senderIdOptions: { value: string }[] = [];
  addSenderIdTag = (term: string): { value: string } => ({ value: term.trim() });
  private isInitializing = false;
  readonly SENDER_ID_MAX_LENGTH = 11;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.userEdit);
    }
    else {
      this.loadDataForm(null);
    }
  }

  onSenderIdAdded(item: any): void {
    const value = typeof item === 'object' ? item.value : item;
    if (value && !this.senderIdOptions.find(o => o.value === value)) {
      this.senderIdOptions = [...this.senderIdOptions, { value }];
    }
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private serviceProviderService: ServiceProvidersService,
    private alertSvr: AlertService,
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadRoles();
    this.loadProviders();
    this.loadDataForm(null);
  }

  async loadProviders() {
    const response = await this.serviceProviderService.getProviders();
    if (response && response.status === 200) {
      this.providers = (response.data || []).filter((p: any) => p.protocol === 'HTTP' && p.enabled !== 2);
    }
  }

  async loadRoles() {
    const response = await this.userService.getRoles();
    if (response) {
      this.roles = Array.isArray(response) ? response : [];
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [''],
      user_name: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: [''],
      confirmPassword: [''],
      roles: [[], Validators.required],
      all_service_providers: [false],
      service_providers: [[]],
      sender_ids: [[]],
    }, {
      validators: this.passwordsMatchValidator
    });

    this.form.get('all_service_providers')?.valueChanges.subscribe(all => {
      this.updateProvidersSelection(all);
    });

    this.form.get('roles')?.valueChanges.subscribe((roles) => {
      if (this.isInitializing) {
        return;
      }
      this.checkRolePermissions(roles, true);
    });
  }

  updateProvidersSelection(isAll: boolean): void {
    const control = this.form.get('service_providers');
    if (isAll) {
      control?.setValue(this.providers.map(p => p.network_id));
      control?.disable();
    } else {
      control?.enable();
    }
  }

  private validateSenderIds(senderIds: string[]): string | null {
    const invalid = senderIds.find(id => id.length > this.SENDER_ID_MAX_LENGTH);
    if (invalid) {
      return `Sender ID '${invalid}' exceeds maximum length of ${this.SENDER_ID_MAX_LENGTH} characters.`;
    }
    return null;
  }

  checkRolePermissions(roles: any[], isUserInteraction: boolean = true) {
    const roleNames = Array.isArray(roles) ? roles.map(r => r.name || r) : [];

    if (isUserInteraction) {
      if (this.isRoot || roleNames.includes('ADMINISTRATOR')) {
        this.form.get('all_service_providers')?.setValue(true);
        this.form.get('all_service_providers')?.disable();
        this.updateProvidersSelection(true);
      } else {
        this.form.get('all_service_providers')?.setValue(false);
        this.form.get('all_service_providers')?.enable();
      }
    }

    if (roleNames.includes('ADMINISTRATOR')) {
      this.form.get('sender_ids')?.disable();
      this.form.get('sender_ids')?.setValue([]);
    } else {
      if (!this.isRoot && this.btnEnabled) {
        this.form.get('sender_ids')?.enable();
      }
    }
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(whatPassword: String): void {
    if (whatPassword.toLowerCase() == "password") {
      this.isPasswordVisible = !this.isPasswordVisible;
      this.passwordFieldType = this.isPasswordVisible ? 'text' : 'password';
    } else {
      this.isPasswordConfirmVisible = !this.isPasswordConfirmVisible;
      this.passwordConfirmFieldType = this.isPasswordConfirmVisible ? 'text' : 'password';
    }
  }

  loadDataForm(data: User | null): void {
    this.isInitializing = true;
    if (data == null || data == undefined) {
      this.isEdit = false;
      this.isRoot = false;
      this.title = 'Create Item';
      this.btnEnabled = true;
      this.form.enable();
      this.form.reset();
      this.senderIdOptions = [];

      this.form.get('roles')?.setValue([]);
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(this.PASSWORD_MIN_LENGTH)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required, Validators.minLength(this.PASSWORD_MIN_LENGTH)]);
    } else {
      this.isEdit = true;
      this.title = 'Edit Item';

      this.form.reset({
        id: data.id ? String(data.id) : '',
        user_name: data.user_name || '',
        name: data.name || '',
        last_name: data.last_name || '',
        password: '',
        confirmPassword: '',
        roles: data.roles || [],
        all_service_providers: data.all_service_providers || false,
        service_providers: data.service_providers || [],
        sender_ids: []
      });

      const existingSenderIds = (data as any).sender_ids || [];
      const normalizedSenderIds: string[] = Array.isArray(existingSenderIds)
        ? existingSenderIds.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [];

      this.senderIdOptions = normalizedSenderIds.map(v => ({ value: v }));
      this.form.get('sender_ids')?.setValue(normalizedSenderIds);

      this.form.get('password')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('confirmPassword')?.updateValueAndValidity();

      this.isRoot = data.roles.includes('ROOT');

      if (data?.account_locked) {
        this.btnEnabled = false;
        const lockDate = new Date(data.lock_time).toLocaleString();
        this.lockMessage = `This account is locked since ${lockDate}`;
      } else {
        this.btnEnabled = true;
        this.lockMessage = null;
      }

      if (this.isRoot) {
        this.btnEnabled = false;
        this.addRootRole();
      } else {
        let data_roles = this.removeActionsAdvancedRole(data.roles);
        this.roles = this.roles.filter(role => role.name !== 'ROOT');
        this.form.get('roles')?.setValue(data_roles);
      }

      if (this.isRoot || data?.account_locked) {
        this.form.get('roles')?.disable();
        this.form.get('user_name')?.disable();
        this.form.get('name')?.disable();
        this.form.get('last_name')?.disable();
      } else {
        this.form.get('roles')?.enable();
        this.form.get('user_name')?.enable();
        this.form.get('name')?.enable();
        this.form.get('last_name')?.enable();
      }

      const isAll = data.all_service_providers || false;
      this.updateProvidersSelection(isAll);

      this.checkRolePermissions(this.form.get('roles')?.value, false);

      if ((this.isRoot || data.roles.includes('ADMINISTRATOR')) && isAll) {
        this.form.get('all_service_providers')?.disable();
      } else {
        this.form.get('all_service_providers')?.enable();
      }
    }
    this.isInitializing = false;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.btnEnabled = false;

    const formValues = this.form.getRawValue();

    const submittedSenderIds: string[] = Array.isArray(formValues.sender_ids)
      ? Array.from(new Set(
        (formValues.sender_ids as Array<string | { value: string }>)
          .map((s): string =>
            (typeof s === 'object' && s !== null ? s.value : s)?.trim() ?? ''
          )
          .filter(s => s.length > 0)
      ))
      : [];

    const senderIdError = this.validateSenderIds(submittedSenderIds);
    if (senderIdError) {
      this.alertSvr.showAlert(2, 'Error', senderIdError);
      this.btnEnabled = true;
      return;
    }

    const payload = {
      name: formValues.name,
      last_name: formValues.last_name,
      password: formValues.password,
      user_name: formValues.user_name,
      roles: formValues.roles,
      all_service_providers: formValues.all_service_providers,
      service_providers: [...new Set(formValues.service_providers || [])] as number[],
      sender_ids: submittedSenderIds
    };

    if (this.isRoot) {
      payload.roles = ['ROOT'];
    }

    try {
      let response;
      if (this.isEdit && formValues.id) {
        payload.password = null;
        response = await this.userService.updateUser(formValues.id, payload);
      } else {
        response = await this.userService.createUser(payload);
      }

      if (response.status === 200) {
        this.alertSvr.showAlert(1, 'Success', response.comment || 'User saved successfully.');
        this.close();
      } else {
        this.btnEnabled = true;
        this.alertSvr.showAlert(2, 'Error', response.comment || 'Something went wrong.');
      }
    } catch (error) {
      this.btnEnabled = true;
      this.alertSvr.showAlert(3, 'Server Error', 'Could not connect to server.');
    }
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

  addRootRole() {
    if (!this.roles.find(role => role.name === 'ROOT')) {
      this.roles = [...this.roles, { name: 'ROOT', displayName: 'Root' }];
    }
    this.form.get('roles')?.setValue(['ROOT']);
  }

  removeActionsAdvancedRole(roles: string[]): string[] {
    let data_roles = (roles || []);
    if (!this.roles.find(role => role.name === 'ACTIONS_ADVANCED')) {
      data_roles = data_roles.filter(r => r !== 'ACTIONS_ADVANCED');
    }

    return data_roles;
  }

  close(): void {
    this.closeModal.emit(true);
    this.form.reset();
    this.form.get('roles')?.enable();
    this.form.get('user_name')?.enable();
    this.form.get('name')?.enable();
    this.form.get('last_name')?.enable();
    this.roles = this.roles.filter(role => role.name !== 'ROOT');
    this.form.get('roles')?.setValue(this.roles.map(r => r.name));
  }
}
