import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { priorityRequiredValidator, hasPriorityGroupError } from '@shared/message-validator';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import {
  AlertService,
  GatewaySmppService,
  MnosService,
  SettingServices,
  ResponseI,
  Mno,
  SmscSetting,
  convertToSmscSetting,
  mergeWithBackup
} from '@core/index';

type GatewayHttpFormValue = {
  network_id: number | null;
  name: string;
  system_id: string;
  password: string;
  ip: string;
  port: number | string;

  bind_type: string;
  system_type: string;
  interface_version: string;
  sessions_number: number | string;
  address_ton: number | string;
  address_npi: number | string;
  address_range: string;

  messages_per_second_high: number | string;
  messages_per_second_medium: number | string;
  messages_per_second_low: number | string;
  messages_per_second: number | string;

  status: string | number;
  enabled: number | string;
  enquire_link_period: number | string;
  request_dlr: number | string;

  auto_retry_error_code: string;
  no_retry_error_code: string;
  retry_alternate_destination_error_code: string;

  bind_timeout: number | string;
  bind_retry_period: number | string;
  pdu_timeout: number | string;
  pdu_degree: number | string;
  thread_pool_size: number | string;

  mno_id: number | string;
  protocol: string;

  encoding_gsm7: number | string;
  encoding_iso88591: number | string;
  encoding_ucs2: number | string;

  split_message: boolean;
  split_smpp_type: string;

  authentication_types: string;
  header_security_name: string;
  token: string;
  user_name: string;
  passwd: string;
};

function normalizeHttpForm(v: GatewayHttpFormValue): GatewayHttpFormValue {
  const toNum = (x: any, fallback = 0) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : fallback;
  };

  const toNullableNum = (x: any) => {
    if (x === null || x === undefined || x === '') return null;
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  };

  const toStr = (x: any) => (x ?? '').toString().trim();

  return {
    network_id: toNullableNum(v.network_id),
    name: toStr(v.name),
    system_id: toStr(v.system_id),
    password: toStr(v.password),
    ip: toStr(v.ip),
    port: toNum(v.port),

    bind_type: toStr(v.bind_type),
    system_type: toStr(v.system_type),
    interface_version: toStr(v.interface_version),
    sessions_number: toNum(v.sessions_number),
    address_ton: toNum(v.address_ton),
    address_npi: toNum(v.address_npi),
    address_range: toStr(v.address_range),

    messages_per_second_high: toNum(v.messages_per_second_high),
    messages_per_second_medium: toNum(v.messages_per_second_medium),
    messages_per_second_low: toNum(v.messages_per_second_low),
    messages_per_second: toNum(v.messages_per_second),

    status: toStr(v.status),
    enabled: toNum(v.enabled),
    enquire_link_period: toNum(v.enquire_link_period),
    request_dlr: toNum(v.request_dlr),

    auto_retry_error_code: toStr(v.auto_retry_error_code),
    no_retry_error_code: toStr(v.no_retry_error_code),
    retry_alternate_destination_error_code: toStr(v.retry_alternate_destination_error_code),

    bind_timeout: toNum(v.bind_timeout),
    bind_retry_period: toNum(v.bind_retry_period),
    pdu_timeout: toNum(v.pdu_timeout),
    pdu_degree: toNum(v.pdu_degree),
    thread_pool_size: toNum(v.thread_pool_size),

    mno_id: toNum(v.mno_id),
    protocol: toStr(v.protocol),

    encoding_gsm7: toNum(v.encoding_gsm7),
    encoding_iso88591: toNum(v.encoding_iso88591),
    encoding_ucs2: toNum(v.encoding_ucs2),

    split_message: !!v.split_message,
    split_smpp_type: toStr(v.split_smpp_type),

    authentication_types: toStr(v.authentication_types),
    header_security_name: toStr(v.header_security_name),
    token: toStr(v.token),
    user_name: toStr(v.user_name),
    passwd: toStr(v.passwd),
  };
}

@Component({
  selector: 'app-add-http',
  templateUrl: './add-http.component.html'
})
export class AddHttpComponent implements OnInit, OnDestroy {
  gatewayHttp: any = null;

  title = '';
  form!: FormGroup;
  reponse!: ResponseI;
  mnoList: Mno[] = [];
  smscSetting!: SmscSetting;
  saveDisabled = false;
  isReadonly = false;
  password: string = '';
  headerPasswordVisible: boolean = false;
  headerPasswordFieldType: string = 'password';
  private originalData: any = {};

  showInputUser: boolean = false;
  showInputPass: boolean = false;
  showInputToken: boolean = false;
  showInputHeader: boolean = false;

  isEdit = false;
  isModified = false;
  defaultValues = environment.GatewaySmppDefaults;
  network_id: number = 0;

  readonly httpBasePath: string[] = ['/pages/gateways/http'];

  private dirtyTracker = new FormDirtyTracker<GatewayHttpFormValue>(normalizeHttpForm);
  private dirtySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private gatewaySmppService: GatewaySmppService,
    private mnoService: MnosService,
    private alertSvr: AlertService,
    private settingServices: SettingServices,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.dirtySub = this.dirtyTracker.isModified$.subscribe(v => {
      this.isModified = v;
    });

    this.getMnos();
    this.getSmscSetting();

    this.route.paramMap.subscribe(async (pm) => {
      const idParam =
        pm.get('network_id') ||
        pm.get('id') ||
        pm.get('httpGatewayId');

      const readonly = this.route.snapshot.queryParamMap.get('readonly') === '1';

      if (idParam && !isNaN(Number(idParam))) {
        const routeId = Number(idParam);
        const navState = history.state ?? {};
        const stateGateway = navState.gateway;

        if (stateGateway && Number(stateGateway.network_id) === routeId) {
          this.loadDataForm(stateGateway, readonly || !!navState.disableControls);
          return;
        }

        await this.loadGatewayFromList(routeId, readonly);
        return;
      }

      this.prepareForCreate();
      this.dirtyTracker.attach(this.form);
    });
  }

  ngOnDestroy(): void {
    this.dirtySub?.unsubscribe();
    this.dirtyTracker.destroy();
  }

  initializeForm(): void {
    const request_dlr: number = 2;
    const split_message: boolean = this.defaultValues.split_message === 'true';
    const maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;

    this.form = this.fb.group({
      network_id: [{ value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      system_id: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(maxLengthSystemId),
        Validators.pattern(environment.PatternSystemId)
      ]],
      password: [''],
      ip: ['', [Validators.required]],
      port: ['', []],
      bind_type: [this.defaultValues.bind_type],
      system_type: [''],
      interface_version: [this.defaultValues.interface_version],
      sessions_number: [this.defaultValues.sessions_number],
      address_ton: [this.defaultValues.address_ton],
      address_npi: [this.defaultValues.address_npi],
      address_range: [''],
      messages_per_second_high: [70, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_medium: [20, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_low: [10, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second: [{ value: 100, disabled: true }],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      enquire_link_period: [this.defaultValues.enquire_link_period],
      request_dlr: [request_dlr, [Validators.required]],
      auto_retry_error_code: [''],
      no_retry_error_code: [''],
      retry_alternate_destination_error_code: [''],
      bind_timeout: [this.defaultValues.bind_timeout],
      bind_retry_period: [this.defaultValues.bind_retry_period],
      pdu_timeout: [this.defaultValues.pdu_timeout],
      pdu_degree: [this.defaultValues.pdu_degree],
      thread_pool_size: [this.defaultValues.thread_pool_size],
      mno_id: [0, [Validators.required]],
      protocol: ['HTTP', [Validators.required]],
      encoding_gsm7: [this.defaultValues.encoding_gsm7],
      encoding_iso88591: [this.defaultValues.encoding_iso88591],
      encoding_ucs2: [this.defaultValues.encoding_ucs2],
      split_message: [split_message],
      split_smpp_type: [this.defaultValues.split_smpp_type],
      authentication_types: ['Undefined', [Validators.required]],
      header_security_name: [''],
      token: [''],
      user_name: [''],
      passwd: [''],
    }, {
      validators: priorityRequiredValidator('messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low')
    });

    this.form.get('network_id')?.enable();
    this.applyAuthValidators(this.form.get('authentication_types')?.value);

    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach(field => {
      this.form.get(field)?.valueChanges.subscribe(() => {
        this.calculateTotalTps();
      });
    });

    this.calculateTotalTps();
  }

  private prepareForCreate(): void {
    this.title = 'Create HTTP Gateway';
    this.isEdit = false;
    this.isReadonly = false;
    this.gatewayHttp = null;
    this.network_id = 0;
    this.originalData = {};
    this.saveDisabled = false;

    this.dirtyTracker.pause();

    this.form.enable();
    this.form.reset({
      network_id: 0,
      name: '',
      system_id: '',
      password: '',
      ip: '',
      port: '',
      bind_type: this.defaultValues.bind_type,
      system_type: '',
      interface_version: this.defaultValues.interface_version,
      sessions_number: this.defaultValues.sessions_number,
      address_ton: this.defaultValues.address_ton,
      address_npi: this.defaultValues.address_npi,
      address_range: '',
      messages_per_second_high: 70,
      messages_per_second_medium: 20,
      messages_per_second_low: 10,
      messages_per_second: 100,
      status: this.defaultValues.status,
      enabled: this.defaultValues.enabled,
      enquire_link_period: this.defaultValues.enquire_link_period,
      request_dlr: 2,
      auto_retry_error_code: '',
      no_retry_error_code: '',
      retry_alternate_destination_error_code: '',
      bind_timeout: this.defaultValues.bind_timeout,
      bind_retry_period: this.defaultValues.bind_retry_period,
      pdu_timeout: this.defaultValues.pdu_timeout,
      pdu_degree: this.defaultValues.pdu_degree,
      thread_pool_size: this.defaultValues.thread_pool_size,
      mno_id: 0,
      protocol: 'HTTP',
      encoding_gsm7: this.defaultValues.encoding_gsm7,
      encoding_iso88591: this.defaultValues.encoding_iso88591,
      encoding_ucs2: this.defaultValues.encoding_ucs2,
      split_message: this.defaultValues.split_message === 'true',
      split_smpp_type: this.defaultValues.split_smpp_type,
      authentication_types: 'Undefined',
      header_security_name: '',
      token: '',
      user_name: '',
      passwd: '',
    });

    this.form.get('network_id')?.disable();
    this.applyAuthValidators(this.form.get('authentication_types')?.value);
    this.calculateTotalTps();

    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);
  }

  private async loadGatewayFromList(id: number, disableControls: boolean = false): Promise<void> {
    const response = await this.gatewaySmppService.getGateways();

    if (response.status != 200) {
      this.alertSvr.showAlert(2, 'Error', 'Could not load gateways');
      return;
    }

    const gateway = response.data.find((item: any) =>
      item.protocol === 'HTTP' && Number(item.network_id) === id
    );

    if (!gateway) {
      this.alertSvr.showAlert(2, 'Error', 'HTTP Gateway not found');
      return;
    }

    this.loadDataForm(gateway, disableControls);
  }

  loadDataForm(data: any, disableControls: boolean = false): void {
    this.saveDisabled = false;
    this.isReadonly = false;

    if (data == null || data == undefined) {
      this.prepareForCreate();
      return;
    }

    this.title = 'Edit HTTP Gateway';
    this.isEdit = true;
    this.network_id = data.network_id;
    this.gatewayHttp = data;
    this.originalData = JSON.parse(JSON.stringify(data));

    this.dirtyTracker.pause();

    this.form.enable();
    this.form.reset({
      network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
      name: (data.name == null || data.name == undefined) ? '' : data.name,
      system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
      password: (data.password == null || data.password == undefined) ? '' : data.password,
      ip: (data.ip == null || data.ip == undefined) ? '' : data.ip,
      port: (data.port == null || data.port == undefined) ? '' : data.port,
      bind_type: (data.bind_type == null || data.bind_type == undefined) ? this.defaultValues.bind_type : data.bind_type,
      system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
      interface_version: (data.interface_version == null || data.interface_version == undefined) ? this.defaultValues.interface_version : data.interface_version,
      sessions_number: (data.sessions_number == null || data.sessions_number == undefined) ? this.defaultValues.sessions_number : data.sessions_number,
      address_ton: (data.address_ton == null || data.address_ton == undefined) ? this.defaultValues.address_ton : data.address_ton,
      address_npi: (data.address_npi == null || data.address_npi == undefined) ? this.defaultValues.address_npi : data.address_npi,
      address_range: (data.address_range == null || data.address_range == undefined) ? '' : data.address_range,
      messages_per_second_high: (data.messages_per_second_high == null || data.messages_per_second_high == undefined) ? 70 : parseInt(data.messages_per_second_high),
      messages_per_second_medium: (data.messages_per_second_medium == null || data.messages_per_second_medium == undefined) ? 20 : parseInt(data.messages_per_second_medium),
      messages_per_second_low: (data.messages_per_second_low == null || data.messages_per_second_low == undefined) ? 10 : parseInt(data.messages_per_second_low),
      messages_per_second: (data.messages_per_second != null && data.messages_per_second != undefined)
        ? parseInt(data.messages_per_second)
        : ((data.messages_per_second_high || 70) + (data.messages_per_second_medium || 20) + (data.messages_per_second_low || 10)),
      status: (data.status == null || data.status == undefined) ? '' : data.status,
      enabled: (data.enabled == null || data.enabled == undefined) ? '' : parseInt(data.enabled),
      request_dlr: (data.request_dlr == null || data.request_dlr == undefined) ? '' : data.request_dlr,
      auto_retry_error_code: (data.auto_retry_error_code == null || data.auto_retry_error_code == undefined) ? '' : data.auto_retry_error_code,
      no_retry_error_code: (data.no_retry_error_code == null || data.no_retry_error_code == undefined) ? '' : data.no_retry_error_code,
      retry_alternate_destination_error_code: (data.retry_alternate_destination_error_code == null || data.retry_alternate_destination_error_code == undefined) ? '' : data.retry_alternate_destination_error_code,
      pdu_timeout: (data.pdu_timeout == null || data.pdu_timeout == undefined) ? '' : parseInt(data.pdu_timeout),
      mno_id: (data.mno_id == null || data.mno_id == undefined) ? '' : parseInt(data.mno_id),
      protocol: (data.protocol == null || data.protocol == undefined) ? 'HTTP' : data.protocol,
      encoding_gsm7: (data.encoding_gsm7 == null || data.encoding_gsm7 == undefined) ? this.defaultValues.encoding_gsm7 : data.encoding_gsm7,
      encoding_iso88591: (data.encoding_iso88591 == null || data.encoding_iso88591 == undefined) ? this.defaultValues.encoding_iso88591 : data.encoding_iso88591,
      encoding_ucs2: (data.encoding_ucs2 == null || data.encoding_ucs2 == undefined) ? this.defaultValues.encoding_ucs2 : data.encoding_ucs2,
      split_message: (data.split_message == null || data.split_message == undefined)
        ? this.defaultValues.split_message === 'true'
        : !!data.split_message,
      split_smpp_type: (data.split_smpp_type == null || data.split_smpp_type == undefined) ? this.defaultValues.split_smpp_type : data.split_smpp_type,
      authentication_types: (data.authentication_types == null || data.authentication_types == undefined) ? 'Undefined' : data.authentication_types,
      header_security_name: (data.header_security_name == null || data.header_security_name == undefined) ? '' : data.header_security_name,
      token: (data.token == null || data.token == undefined) ? '' : data.token,
      user_name: (data.user_name == null || data.user_name == undefined) ? '' : data.user_name,
      passwd: (data.passwd == null || data.passwd == undefined) ? '' : data.passwd,
    });

    this.form.get('network_id')?.disable();
    this.cdr.detectChanges();
    this.applyAuthValidators(data?.authentication_types, false);
    this.calculateTotalTps();

    if (disableControls) {
      this.isReadonly = true;
      this.form.disable();
    }

    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);
  }

  calculateTotalTps(): void {
    const high = this.form.get('messages_per_second_high')?.value || 0;
    const medium = this.form.get('messages_per_second_medium')?.value || 0;
    const low = this.form.get('messages_per_second_low')?.value || 0;
    const total = high + medium + low;
    this.form.get('messages_per_second')?.setValue(total, { emitEvent: false });
  }

  async save() {
    if (this.form.invalid || this.isReadonly) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    let obj = mergeWithBackup(formValue, this.originalData);

    let resp;
    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.gatewaySmppService.updateGateway(obj);
    } else {
      delete obj.network_id;
      resp = await this.gatewaySmppService.createGateway(obj);
    }

    if (resp.status == 200) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
      this.dirtyTracker.captureSnapshot(this.form);
      this.close();
    } else {
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }
  }

  async getSmscSetting() {
    this.reponse = await this.settingServices.getSmscSetting();
    if (this.reponse.status == 200) {
      this.smscSetting = convertToSmscSetting(this.reponse.data);

      if (this.smscSetting?.max_system_id_length != undefined) {
        this.form.get('system_id')?.setValidators([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(this.smscSetting.max_system_id_length),
          Validators.pattern(environment.PatternSystemId)
        ]);
        this.form.get('system_id')?.updateValueAndValidity({ emitEvent: false });
      }

      // if (this.smscSetting?.max_password_length != undefined) {
      //   this.form.get('password')?.setValidators([
      //     Validators.required,
      //     Validators.minLength(1),
      //     Validators.maxLength(this.smscSetting.max_password_length)
      //   ]);
      //   this.form.get('password')?.updateValueAndValidity({ emitEvent: false });
      // }
      if (this.smscSetting?.max_password_length != undefined) {
  this.form.get('password')?.setValidators([
    Validators.minLength(1),
    Validators.maxLength(this.smscSetting.max_password_length)
  ]);
  this.form.get('password')?.updateValueAndValidity({ emitEvent: false });
}
    }
  }

  async getMnos() {
    this.reponse = await this.mnoService.getMnos();

    if (this.reponse.status == 200) {
      this.mnoList = this.reponse.data;
    }
  }

  togglePasswordVisibility(): void {
    this.headerPasswordVisible = !this.headerPasswordVisible;
    this.headerPasswordFieldType = this.headerPasswordVisible ? 'text' : 'password';
  }

  onSelectAuthenticationTypes(event: any) {
    const value = event.target.value;
    this.applyAuthValidators(value);
  }

  close(): void {
    this.router.navigate(this.httpBasePath);
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMinLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
  }

  validMaxLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['maxlength'];
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validMax(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['max'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getMinLength(name: string) {
    return this.form.get(name)?.errors?.['minlength']?.requiredLength;
  }

  getMaxLength(name: string) {
    return this.form.get(name)?.errors?.['maxlength']?.requiredLength;
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  getMax(name: string) {
    return this.form.get(name)?.errors?.['max']?.max;
  }

  getPatternMessage(name: string) {
    if (name === 'system_id') {
      return `The characters: ${environment.PatternSystemLabel} are not valid.`;
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  getValueForm(name: string) {
    return this.form.get(name)?.value;
  }

  private applyAuthValidators(type: string, clearValues = true): void {
    ['header_security_name', 'user_name', 'passwd', 'token'].forEach(ctrl => {
      this.form.get(ctrl)?.clearValidators();

      if (clearValues) {
        this.form.get(ctrl)?.setValue('');
      }

      this.form.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
    });

    this.showInputUser = false;
    this.showInputPass = false;
    this.showInputToken = false;
    this.showInputHeader = false;

    if (type === 'Basic') {
      this.showInputUser = true;
      this.showInputPass = true;
      this.showInputHeader = true;

      this.form.get('user_name')?.setValidators([Validators.required]);
      this.form.get('passwd')?.setValidators([Validators.required]);
      this.form.get('header_security_name')?.setValidators([Validators.required]);
    } else if (type === 'Bearer' || type === 'Api-key') {
      this.showInputToken = true;
      this.showInputHeader = true;

      this.form.get('token')?.setValidators([Validators.required]);
      this.form.get('header_security_name')?.setValidators([Validators.required]);
    }

    ['header_security_name', 'user_name', 'passwd', 'token'].forEach(ctrl => {
      this.form.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
    });

    this.cdr.detectChanges();
  }

  hasPriorityValidationError(): boolean {
    return hasPriorityGroupError(
      this.form,
      'atLeastOnePriorityActive',
      [
        'messages_per_second_high',
        'messages_per_second_medium',
        'messages_per_second_low'
      ]
    );
  }
}