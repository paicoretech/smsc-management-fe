import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { priorityRequiredValidator, hasPriorityGroupError } from '@shared/message-validator';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import {
  CatalogService,
  AlertService,
  GatewaySmppService,
  MnosService,
  SettingServices,
  Catalog,
  ResponseI,
  Mno,
  SmscSetting,
  convertToSmscSetting
} from '@core/index';

type GatewaySmppFormValue = {
  network_id: number | null;
  name: string;
  system_id: string;
  password: string;
  ip: string;
  port: number | string;
  bind_type: string;
  system_type: string;
  interface_version: string | number;
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
  tls_enabled: boolean;
  authentication_types: string;
  header_security_name: string;
  token: string;
  user_name: string;
  passwd: string;
};

function normalizeSmppForm(v: GatewaySmppFormValue): GatewaySmppFormValue {
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
    tls_enabled: !!v.tls_enabled,
    authentication_types: toStr(v.authentication_types),
    header_security_name: toStr(v.header_security_name),
    token: toStr(v.token),
    user_name: toStr(v.user_name),
    passwd: toStr(v.passwd),
  };
}

@Component({
  selector: 'app-add-smpp',
  templateUrl: './add-smpp.component.html'
})
export class AddSmppComponent implements OnInit, OnDestroy {
  title = '';
  form!: FormGroup;
  reponse!: ResponseI;
  catalogStatus: Catalog[] = [];
  catalogInterfaces: Catalog[] = [];
  mnoList: Mno[] = [];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  bindTypes: Catalog[] = [];
  encodingList: Catalog[] = [];
  smscSetting!: SmscSetting;
  saveDisabled = false;
  password: string = '';
  isPasswordVisible: boolean = false;
  passwordFieldType: string = 'password';

  isEdit = false;
  isReadonly = false;
  isModified = false;
  defaultValues = environment.GatewaySmppDefaults;
  network_id: number = 0;
  private originalData: any = {};

  readonly smppBasePath: string[] = ['/pages/gateways/smpp'];

  private dirtyTracker = new FormDirtyTracker<GatewaySmppFormValue>(normalizeSmppForm);
  private dirtySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
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

    this.getCatalogInterfaces();
    this.getCatalogEncodings();
    this.getMnos();
    this.getTonCatalog();
    this.getNpiCatalog();
    this.getBindTypes();
    this.getSmscSetting();

    this.route.paramMap.subscribe(async (pm) => {
      const idParam =
        pm.get('network_id') ||
        pm.get('id') ||
        pm.get('smppGatewayId');

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
    });
  }

  ngOnDestroy(): void {
    this.dirtySub?.unsubscribe();
    this.dirtyTracker.destroy();
  }

  initializeForm(): void {
    let request_dlr: number = 2;
    let split_message: boolean = this.defaultValues.split_message === 'true' ? true : false;

    let maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;
    let maxLengthPassword = environment.generalSettings.general.max_password_length || 9;

    this.form = this.fb.group({
      network_id: [{ value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      system_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthSystemId), Validators.pattern(environment.PatternSystemId)]],
      password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthPassword)]],
      ip: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]],
      port: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]],
      bind_type: [this.defaultValues.bind_type, [Validators.required]],
      system_type: ['', [Validators.minLength(0), Validators.maxLength(13), Validators.pattern('^[A-Za-z0-9 ]*$')]],
      interface_version: [this.defaultValues.interface_version, [Validators.required]],
      sessions_number: [this.defaultValues.sessions_number, [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern('^[0-9]*$')]],
      address_ton: [this.defaultValues.address_ton, [Validators.required, Validators.pattern('^[0-9]*')]],
      address_npi: [this.defaultValues.address_npi, [Validators.required, Validators.pattern('^[0-9]*')]],
      address_range: [''],
      messages_per_second_high: [70, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_medium: [20, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_low: [10, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second: [{ value: 100, disabled: true }],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      enquire_link_period: [this.defaultValues.enquire_link_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
      request_dlr: [request_dlr, [Validators.required]],
      auto_retry_error_code: [''],
      no_retry_error_code: [''],
      retry_alternate_destination_error_code: [''],
      bind_timeout: [this.defaultValues.bind_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
      bind_retry_period: [this.defaultValues.bind_retry_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
      pdu_timeout: [this.defaultValues.pdu_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
      pdu_degree: [this.defaultValues.pdu_degree, [Validators.required, Validators.pattern('^[0-9]*$')]],
      thread_pool_size: [this.defaultValues.thread_pool_size, [Validators.required, Validators.min(100), Validators.pattern('^[0-9]*$')]],
      mno_id: [0, [Validators.required]],
      protocol: ['SMPP', [Validators.required]],
      encoding_gsm7: [this.defaultValues.encoding_gsm7, [Validators.required]],
      encoding_iso88591: [this.defaultValues.encoding_iso88591, [Validators.required]],
      encoding_ucs2: [this.defaultValues.encoding_ucs2, [Validators.required]],
      split_message: [split_message, [Validators.required]],
      split_smpp_type: [this.defaultValues.split_smpp_type],
      tls_enabled: [false],
      authentication_types: [''],
      header_security_name: [''],
      token: [''],
      user_name: [''],
      passwd: [''],
    }, {
      validators: priorityRequiredValidator('messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low')
    });

    this.form.get('network_id')?.enable();

    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach(field => {
      this.form.get(field)?.valueChanges.subscribe(() => {
        this.calculateTotalTps();
      });
    });

    this.calculateTotalTps();
  }

  private prepareForCreate(): void {
    this.title = 'Create SMPP Gateway';
    this.isEdit = false;
    this.isReadonly = false;
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
      protocol: 'SMPP',
      encoding_gsm7: this.defaultValues.encoding_gsm7,
      encoding_iso88591: this.defaultValues.encoding_iso88591,
      encoding_ucs2: this.defaultValues.encoding_ucs2,
      split_message: this.defaultValues.split_message === 'true',
      split_smpp_type: this.defaultValues.split_smpp_type,
      tls_enabled: false,
      authentication_types: '',
      header_security_name: '',
      token: '',
      user_name: '',
      passwd: '',
    });

    this.form.get('network_id')?.disable();
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
      item.protocol === 'SMPP' && Number(item.network_id) === id
    );

    if (!gateway) {
      this.alertSvr.showAlert(2, 'Error', 'SMPP Gateway not found');
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

    this.title = 'Edit SMPP Gateway';
    this.isEdit = true;
    this.network_id = data.network_id;
    this.originalData = JSON.parse(JSON.stringify(data));

    this.dirtyTracker.pause();

    this.form.enable();
    this.form.reset({
      network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
      name: (data.name == null || data.name == undefined) ? '' : data.name,
      system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
      password: (data.password == null || data.password == undefined) ? '' : data.password,
      ip: (data.ip == null || data.ip == undefined) ? '' : data.ip,
      port: (data.port == null || data.port == undefined) ? '' : parseInt(data.port),
      bind_type: (data.bind_type == null || data.bind_type == undefined) ? '' : data.bind_type,
      system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
      interface_version: (data.interface_version == null || data.interface_version == undefined) ? '' : data.interface_version,
      sessions_number: (data.sessions_number == null || data.sessions_number == undefined) ? '' : parseInt(data.sessions_number),
      address_ton: (data.address_ton == null || data.address_ton == undefined) ? '' : parseInt(data.address_ton),
      address_npi: (data.address_npi == null || data.address_npi == undefined) ? '' : parseInt(data.address_npi),
      address_range: (data.address_range == null || data.address_range == undefined) ? '' : data.address_range,
      messages_per_second_high: (data.messages_per_second_high == null || data.messages_per_second_high == undefined) ? 70 : parseInt(data.messages_per_second_high),
      messages_per_second_medium: (data.messages_per_second_medium == null || data.messages_per_second_medium == undefined) ? 20 : parseInt(data.messages_per_second_medium),
      messages_per_second_low: (data.messages_per_second_low == null || data.messages_per_second_low == undefined) ? 10 : parseInt(data.messages_per_second_low),
      messages_per_second: (data.messages_per_second != null && data.messages_per_second != undefined) ? parseInt(data.messages_per_second) : ((data.messages_per_second_high || 70) + (data.messages_per_second_medium || 20) + (data.messages_per_second_low || 10)),
      status: (data.status == null || data.status == undefined) ? '' : data.status,
      enabled: (data.enabled == null || data.enabled == undefined) ? '' : parseInt(data.enabled),
      enquire_link_period: (data.enquire_link_period == null || data.enquire_link_period == undefined) ? '' : parseInt(data.enquire_link_period),
      request_dlr: (data.request_dlr == null || data.request_dlr == undefined) ? '' : parseInt(data.request_dlr),
      auto_retry_error_code: (data.auto_retry_error_code == null || data.auto_retry_error_code == undefined) ? '' : data.auto_retry_error_code,
      no_retry_error_code: (data.no_retry_error_code == null || data.no_retry_error_code == undefined) ? '' : data.no_retry_error_code,
      retry_alternate_destination_error_code: (data.retry_alternate_destination_error_code == null || data.retry_alternate_destination_error_code == undefined) ? '' : data.retry_alternate_destination_error_code,
      bind_timeout: (data.bind_timeout == null || data.bind_timeout == undefined) ? '' : parseInt(data.bind_timeout),
      bind_retry_period: (data.bind_retry_period == null || data.bind_retry_period == undefined) ? '' : parseInt(data.bind_retry_period),
      pdu_timeout: (data.pdu_timeout == null || data.pdu_timeout == undefined) ? '' : parseInt(data.pdu_timeout),
      pdu_degree: (data.pdu_degree == null || data.pdu_degree == undefined) ? '' : parseInt(data.pdu_degree),
      thread_pool_size: (data.thread_pool_size == null || data.thread_pool_size == undefined) ? '' : parseInt(data.thread_pool_size),
      mno_id: (data.mno_id == null || data.mno_id == undefined) ? '' : parseInt(data.mno_id),
      protocol: (data.protocol == null || data.protocol == undefined) ? 'SMPP' : data.protocol,
      encoding_gsm7: (data.encoding_gsm7 == null || data.encoding_gsm7 == undefined) ? this.defaultValues.encoding_gsm7 : parseInt(data.encoding_gsm7),
      encoding_iso88591: (data.encoding_iso88591 == null || data.encoding_iso88591 == undefined) ? this.defaultValues.encoding_iso88591 : parseInt(data.encoding_iso88591),
      encoding_ucs2: (data.encoding_ucs2 == null || data.encoding_ucs2 == undefined) ? this.defaultValues.encoding_ucs2 : parseInt(data.encoding_ucs2),
      split_message: (data.split_message == null || data.split_message == undefined) ? this.defaultValues.split_message === 'true' : !!data.split_message,
      split_smpp_type: (data.split_smpp_type == null || data.split_smpp_type == undefined) ? this.defaultValues.split_smpp_type : data.split_smpp_type,
      tls_enabled: data.tls_enabled ?? false,
      authentication_types: '',
      header_security_name: '',
      token: '',
      user_name: '',
      passwd: '',
    });

    this.form.get('network_id')?.disable();
    this.cdr.detectChanges();
    this.calculateTotalTps();

    if (disableControls) {
      this.isReadonly = true;
      this.form.disable();
      this.saveDisabled = true;
    }

    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);
  }

  private calculateTotalTps(): void {
    const high = this.form.get('messages_per_second_high')?.value || 0;
    const medium = this.form.get('messages_per_second_medium')?.value || 0;
    const low = this.form.get('messages_per_second_low')?.value || 0;
    const total = high + medium + low;
    this.form.get('messages_per_second')?.setValue(total, { emitEvent: false });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      return;
    }

    let obj = this.form.getRawValue();

    if (obj.protocol === 'SMPP') {
      obj.authentication_types = 'Undefined';
    }

    let resp;
    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.gatewaySmppService.updateGateway(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.gatewaySmppService.createGateway(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    }

    if (resp.status == 200) {
      this.dirtyTracker.captureSnapshot(this.form);
      this.close();
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

      if (this.smscSetting?.max_password_length != undefined) {
        this.form.get('password')?.setValidators([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(this.smscSetting.max_password_length)
        ]);
        this.form.get('password')?.updateValueAndValidity({ emitEvent: false });
      }
    }
  }

  async getCatalogInterfaces() {
    this.reponse = await this.catalogService.getByCatalogType('interfazversion');
    if (this.reponse.status == 200) {
      this.catalogInterfaces = this.reponse.data;
    }
  }

  async getMnos() {
    this.reponse = await this.mnoService.getMnos();

    if (this.reponse.status == 200) {
      this.mnoList = this.reponse.data;
    }
  }

  async getTonCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('toncatalog');

    if (this.reponse.status == 200) {
      this.tonCatalog = this.reponse.data;
    }
  }

  async getNpiCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('npicatalog');
    if (this.reponse.status == 200) {
      this.npiCatalog = this.reponse.data;
    }
  }

  async getBindTypes() {
    this.reponse = await this.catalogService.getByCatalogType('bindtypes');
    if (this.reponse.status == 200) {
      this.bindTypes = this.reponse.data.filter((obj: any) => obj.useGateway !== false);
    }
  }

  async getCatalogEncodings() {
    const resp = await this.catalogService.getByCatalogType('encodingType');

    if (resp.status == 200) {
      this.encodingList = resp.data;
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.passwordFieldType = this.isPasswordVisible ? 'text' : 'password';
  }

  close(): void {
    this.router.navigate(this.smppBasePath);
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
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9 ]*$') {
      return 'Only alphanumeric characters and spaces are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  getValueForm(name: string) {
    return this.form.get(name)?.value;
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