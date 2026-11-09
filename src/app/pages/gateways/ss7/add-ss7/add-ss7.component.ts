import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { priorityRequiredValidator, hasPriorityGroupError } from '@shared/message-validator';
import {
  AlertService,
  CatalogService,
  GatewaySs7Service,
  Mno,
  MnosService,
  ResponseI,
} from '@app/core';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs/internal/Subscription';
import { isIpSmGw as isIpSmGwCtx, isSmsc as isSmscCtx } from '@core/utils/functions/apiContext.helper';
import { FEATURE_FLAGS } from '@app/core/config/feeature-flag';


export type GatewaySs7FormValue = {
  network_id: number | null;
  name: string;

  status: string | number;
  enabled: number;

  mno_id: number;

  global_title: string;
  global_title_indicator: string | number;

  translation_type: number;
  smsc_ssn: number;
  hlr_ssn: number;
  msc_ssn: number;

  map_version: number;
  report_sm_delivery_status: boolean;
  auto_retry_error_code: string;
  no_retry_error_code: string;
  retry_alternate_destination_error_code: string;
  split_message: boolean;
  home_routing: boolean;

  hss_update_enabled: boolean;
  allowed_traffic: boolean;
  allowed_ussi: boolean;

  api_enabled: boolean;
  messages_per_second_high: number;
  messages_per_second_medium: number;
  messages_per_second_low: number;
  messages_per_second: number;
  
};

function normalizeSs7Form(v: GatewaySs7FormValue): GatewaySs7FormValue {
  const toNum = (x: any, fallback = 0) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : fallback;
  };
  const toStr = (x: any) => (x ?? '').toString().trim();

  return {
    network_id: v.network_id == null ? null : toNum(v.network_id),
    name: toStr(v.name),

    status: toStr(v.status),
    enabled: toNum(v.enabled),

    mno_id: toNum(v.mno_id),

    global_title: toStr(v.global_title),
    global_title_indicator: toStr(v.global_title_indicator),

    translation_type: toNum(v.translation_type),
    smsc_ssn: toNum(v.smsc_ssn),
    hlr_ssn: toNum(v.hlr_ssn),
    msc_ssn: toNum(v.msc_ssn),

    map_version: toNum(v.map_version),
    report_sm_delivery_status: !!v.report_sm_delivery_status,
    auto_retry_error_code: toStr(v.auto_retry_error_code),
    no_retry_error_code: toStr(v.no_retry_error_code),
    retry_alternate_destination_error_code: toStr(v.retry_alternate_destination_error_code),

    messages_per_second_high: toNum(v.messages_per_second_high),
    messages_per_second_medium: toNum(v.messages_per_second_medium),
    messages_per_second_low: toNum(v.messages_per_second_low),

    split_message: !!v.split_message,
    home_routing: !!v.home_routing,

    hss_update_enabled: !!v.hss_update_enabled,
    allowed_traffic: !!v.allowed_traffic,
    allowed_ussi: !!v.allowed_ussi,

    api_enabled: !!v.api_enabled,
    messages_per_second: toNum(v.messages_per_second),
  };
}

function ussiHomeRoutingConflictValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const allowedUssi = !!control.get('allowed_ussi')?.value;
    const homeRouting = !!control.get('home_routing')?.value;

    return allowedUssi && homeRouting
      ? { ussiHomeRoutingConflict: true }
      : null;
  };
}

@Component({
  selector: 'app-add-ss7',
  templateUrl: './add-ss7.component.html',
})
export class AddSs7Component {
  gatewaySs7: any = null;

  title = '';
  form!: FormGroup;
  reponse!: ResponseI;
  isEdit = false;
  mnoList: Mno[] = [];
  network_id: number = 0;
  defaultValues = environment.GatewaySs7Defaults;
  disabled: boolean = false;
  generating = false;
  tokenPreview = '';
  ctx: ApiContext = ApiContext.SMSC;
  isIpSmGw = false;
  isSMSC = false;
  readonly ipSmGwFeatureEnabled = FEATURE_FLAGS.ipSmGwEnabled;


  

  global_title_indicator: any[] = [];
  isModified = false;
  private dirtyTracker = new FormDirtyTracker<GatewaySs7FormValue>(normalizeSs7Form);
  private dirtySub?: Subscription;
  private trafficFlagsSub?: Subscription;  

  constructor(
    private fb: FormBuilder,
    private gatewaySs7Service: GatewaySs7Service,
    private catalogService: CatalogService,
    private mnoService: MnosService,
    private alertSvr: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}



  ngOnInit(): void {
    console.log('Add/Edit SS7 Component Init ',(this.route.snapshot.data['apiContext'] as ApiContext));
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || 'SMSC';
    console.log('API Context SS7 Add/Edit:', this.ctx);
    this.initializeForm();
    this.applyCtxRulesToForm();
    this.getMnos();
    this.getGlobalTitleIndicator();
    this.isIpSmGw = isIpSmGwCtx(this.ctx);
    this.isSMSC = isSmscCtx(this.ctx);
    this.dirtySub = this.dirtyTracker.isModified$.subscribe(v => {
      this.isModified = v;
    });
    this.setupTrafficFlagsBehavior();


    this.route.paramMap.subscribe(async (pm) => {
      const idParam = pm.get('network_id');
      if (idParam && !isNaN(Number(idParam))) {
        await this.loadForEdit(Number(idParam));
      } else {
        this.prepareForCreate();
        this.dirtyTracker.attach(this.form);
      }
    });
  }

  ngOnDestroy(): void {
    this.dirtySub?.unsubscribe();
    this.dirtyTracker.destroy();
    this.trafficFlagsSub?.unsubscribe();
  }

  get flagsUi() {

    if (!this.ipSmGwFeatureEnabled) {
      return {
        showHssUpdate: false,
        showAllowedTraffic: false,
        showAllowedUssi: false,
      };
    }


    return {
      showHssUpdate: !isIpSmGwCtx(this.ctx),
      showAllowedTraffic: !isSmscCtx(this.ctx),
      showAllowedUssi: true,
    };
  }

  private setupTrafficFlagsBehavior(): void {
  const allowedUssiCtrl = this.form.get('allowed_ussi');
  const homeRoutingCtrl = this.form.get('home_routing');

  this.trafficFlagsSub = this.form.valueChanges.subscribe(() => {
    if (!allowedUssiCtrl || !homeRoutingCtrl) {
      return;
    }

    const allowedUssi = !!allowedUssiCtrl.value;
    const homeRouting = !!homeRoutingCtrl.value;

    if (this.disabled) {
      return;
    }

    if (allowedUssi) {
      homeRoutingCtrl.disable({ emitEvent: false });
    } else {
      homeRoutingCtrl.enable({ emitEvent: false });
    }

    if (homeRouting) {
      allowedUssiCtrl.disable({ emitEvent: false });
    } else {
      allowedUssiCtrl.enable({ emitEvent: false });
    }
  });
}
  
  async getGlobalTitleIndicator() {
    this.reponse = await this.catalogService.getByCatalogType('gtIndicators');

    if (this.reponse.status == 200) {
      this.global_title_indicator = this.reponse.data;
    }
  }

  initializeForm(): void {
    let split_message: boolean =
      this.defaultValues.split_message === 'true' ? true : false;
    let home_routing: boolean =
      this.defaultValues.home_routing === 'true' ? true : false;
    let hss_update_enabled: boolean =
      this.defaultValues.hss_update_enabled === 'true' ? true : false;
    let allowed_traffic: boolean =
      this.defaultValues.allowed_traffic === 'true' ? true : false;
    let allowed_ussi: boolean =
      this.defaultValues.allowed_ussi === 'true' ? true : false;
    this.form = this.fb.group({
      network_id: [{ value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      mno_id: [0, [Validators.required]],
      messages_per_second_high: [70, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_medium: [20, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_low: [10, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second: [{ value: 100, disabled: true }],
      global_title: [this.defaultValues.global_title, [Validators.required]],
      global_title_indicator: [
        this.defaultValues.global_title_indicator,
        [Validators.required],
      ],
      translation_type: [
        this.defaultValues.translation_type,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(255),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      smsc_ssn: [
        this.defaultValues.smsc_ssn,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      hlr_ssn: [
        this.defaultValues.hlr_ssn,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      msc_ssn: [
        this.defaultValues.msc_ssn,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      map_version: [
        this.defaultValues.map_version,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      report_sm_delivery_status: [true],
      auto_retry_error_code: [''],
      no_retry_error_code: [''],
      retry_alternate_destination_error_code: [''],
      split_message: [split_message, [Validators.required]],
      home_routing: [false, [Validators.required]],
      hss_update_enabled: [hss_update_enabled],
      allowed_traffic: [allowed_traffic],
      allowed_ussi: [allowed_ussi],
      api_enabled: [false],
    },
    {
      validators: [ussiHomeRoutingConflictValidator(),priorityRequiredValidator('messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low')],
    }
  );

    this.form.get('network_id')?.enable();

    // Subscribe to priority field changes to calculate total tps
    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach(field => {
      this.form.get(field)?.valueChanges.subscribe(() => {
        this.calculateTotalTps();
      });
    });

    // Initial calculation
    this.calculateTotalTps();
  }

  calculateTotalTps(): void {
    const high = this.form.get('messages_per_second_high')?.value || 0;
    const medium = this.form.get('messages_per_second_medium')?.value || 0;
    const low = this.form.get('messages_per_second_low')?.value || 0;
    const total = high + medium + low;
    this.form.get('messages_per_second')?.setValue(total, { emitEvent: false });
  }

  async getMnos() {
    this.reponse = await this.mnoService.getMnos();

    if (this.reponse.status == 200) {
      this.mnoList = this.reponse.data;
    }
  }

  private prepareForCreate(): void {
    this.title = 'Create SS7 Gateway';
    this.isEdit = false;
    this.gatewaySs7 = null;
    this.form.get('network_id')?.disable();
    this.tokenPreview = '';
    this.disabled = false;
  }

  private async loadForEdit(id: number): Promise<void> {
    this.title = 'Edit SS7 Gateway';
    this.isEdit = true;
    this.network_id = id;

    const resp = await this.gatewaySs7Service.getGatewaySs7ById(id);
    if (resp.status !== 200) {
      this.alertSvr.showAlert(2, 'Error', 'Invalid Gateway');
      this.router.navigate(['/pages/gateways/ss7']);
      return;
    }

    const data = resp.data?.gatewaySs7 ?? resp.data;
    this.gatewaySs7 = data;

    const split_message_default = this.defaultValues.split_message === 'true';
    const home_routing_default: boolean =
      this.defaultValues.home_routing === 'true' ? true : false;
    const hss_update_enabled: boolean =
      this.defaultValues.hss_update_enabled === 'true' ? true : false;
    const allowed_traffic: boolean =
      this.defaultValues.allowed_traffic === 'true' ? true : false;
    const allowed_ussi_default: boolean =
      this.defaultValues.allowed_ussi === 'true' ? true : false;

    this.dirtyTracker.pause();
    this.form.reset({
      network_id: data.network_id != null ? Number(data.network_id) : '',
      name: data.name ?? '',
      status: data.status ?? '',
      enabled: data.enabled ?? '',
      mno_id: data.mno_id != null ? Number(data.mno_id) : '',
      messages_per_second_high: data.messages_per_second_high != null ? Number(data.messages_per_second_high) : 70,
      messages_per_second_medium: data.messages_per_second_medium != null ? Number(data.messages_per_second_medium) : 20,
      messages_per_second_low: data.messages_per_second_low != null ? Number(data.messages_per_second_low) : 10,
      messages_per_second: data.messages_per_second != null ? Number(data.messages_per_second) : ((data.messages_per_second_high || 70) + (data.messages_per_second_medium || 20) + (data.messages_per_second_low || 10)),
      global_title: data.global_title ?? '',
      global_title_indicator: data.global_title_indicator ?? '',
      translation_type:
        data.translation_type != null ? Number(data.translation_type) : '',
      smsc_ssn: data.smsc_ssn != null ? Number(data.smsc_ssn) : '',
      hlr_ssn: data.hlr_ssn != null ? Number(data.hlr_ssn) : '',
      msc_ssn: data.msc_ssn != null ? Number(data.msc_ssn) : '',
      map_version: data.map_version != null ? Number(data.map_version) : '',
      report_sm_delivery_status:
        data.report_sm_delivery_status == null || data.report_sm_delivery_status == undefined
          ? true
          : !!data.report_sm_delivery_status,
      auto_retry_error_code:
        data.auto_retry_error_code == null || data.auto_retry_error_code == undefined
          ? ''
          : data.auto_retry_error_code,
      no_retry_error_code:
        data.no_retry_error_code == null || data.no_retry_error_code == undefined
          ? ''
          : data.no_retry_error_code,
      retry_alternate_destination_error_code:
        data.retry_alternate_destination_error_code == null || data.retry_alternate_destination_error_code == undefined
          ? ''
          : data.retry_alternate_destination_error_code,
      split_message:
        data.split_message != null
          ? !!data.split_message
          : split_message_default,
      home_routing:
        data.home_routing == null || data.home_routing == undefined
          ? home_routing_default
          : data.home_routing,
      hss_update_enabled:
      data.hss_update_enabled != null ? !!data.hss_update_enabled : hss_update_enabled,
      allowed_traffic:
      data.allowed_traffic != null ? !!data.allowed_traffic : allowed_traffic,
      allowed_ussi: data.allowed_ussi !=null ? !!data.allowed_ussi: allowed_ussi_default,
      api_enabled: !!data.api_enabled,
    });

    this.tokenPreview = data.app_token ?? '';

    this.form.get('network_id')?.disable();
    if (data.enabled === 1) {
      this.disabled = true;
      this.form.disable();
    } else {
      this.disabled = false;
      this.form.enable();
    }
    this.applyCtxRulesToForm();
    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);
  }

  async save() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log('Invalid control:', key, control.errors);
        }
      });
      if (this.form.errors?.['ussiHomeRoutingConflict']) {
        this.alertSvr.showAlert(2, 'Validation', 'Allowed USSI and Home Routing cannot be active at the same time.');
      }

      console.log('form invalid.');
      return;
    }

    if (this.form.get('mno_id')?.value == 0) {
      this.alertSvr.showAlert(2, 'Error', 'MNO is required');
      return;
    }

    // const obj: any = { ...this.form.getRawValue() };

    // if (this.tokenPreview) obj.app_token = this.tokenPreview.trim();
    const obj = this.buildPayload();


    let resp: ResponseI;

    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.gatewaySs7Service.updateGatewaySs7(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
        this.dirtyTracker.captureSnapshot(this.form);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.gatewaySs7Service.createGatewaySs7(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    }

    if (resp.status == 200) {
      const newId =
        resp.data?.network_id ??
        resp.data?.id ??
        resp.data?.gatewaySs7?.network_id;
      this.dirtyTracker.captureSnapshot(this.form);
      if (newId) {
        if(isIpSmGwCtx(this.ctx)){
          this.router.navigate(['/pages/ip-sm-gw/ss7/configurations', newId]);
        }else{
          this.router.navigate(['/pages/gateways/smsc/ss7/configurations', newId]);
        }
      } else {
        console.warn('No network_id returned on create response');
      }
    }
  }

  async onGenerateToken() {
    if (!this.isEdit) {
      this.alertSvr.showAlert(
        2,
        'Error',
        'You must save the gateway before generating a token.'
      );
      return;
    }
    if (!this.form.get('api_enabled')?.value) {
      this.alertSvr.showAlert(
        2,
        'Error',
        'Enable API before generating a token.'
      );
      return;
    }

    this.generating = true;
    try {
      const resp = await this.gatewaySs7Service.generateApiToken(
        this.network_id
      );
      if (resp.status === 200) {
        const token = resp.data?.app_token || '';
        this.tokenPreview = token;
        this.alertSvr.showAlert(
          1,
          'Success',
          'API token generated successfully.'
        );
      } else {
        this.alertSvr.showAlert(
          2,
          resp.message || 'Error',
          resp.comment || 'Could not generate token'
        );
      }
    } catch (e: any) {
      this.alertSvr.showAlert(2, 'Error', 'Unexpected error generating token');
    } finally {
      this.generating = false;
    }
  }

  onTrafficFlagBlockedClick(field: 'home_routing' | 'allowed_ussi', event: MouseEvent): void {
      const targetCtrl = this.form.get(field);
      const allowedUssiCtrl = this.form.get('allowed_ussi');
      const homeRoutingCtrl = this.form.get('home_routing');

      if (!targetCtrl || this.disabled) {
        return;
      }

      if (!targetCtrl.disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (field === 'home_routing' && !!allowedUssiCtrl?.value) {
        this.alertSvr.warning('Home Routing cannot be enabled because Allowed USSI is currently active.');
        return;
      }

      if (field === 'allowed_ussi' && !!homeRoutingCtrl?.value) {
        this.alertSvr.warning('Allowed USSI cannot be enabled because Home Routing is currently active.');
      }
    }

  async copyToken() {
    if (!this.tokenPreview) return;
    try {
      await navigator.clipboard.writeText(this.tokenPreview);
      this.alertSvr.showAlert(1, 'Copied', 'Token copied to clipboard');
    } catch {
      this.alertSvr.showAlert(2, 'Error', 'Failed to copy token');
    }
  }

  validInput(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['required']
    );
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validMax(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['max'];
  }

  validPattern(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern']
    );
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  getMax(name: string) {
    return this.form.get(name)?.errors?.['max']?.max;
  }

  getPatternMessage(name: string) {
    if (
      this.form.get(name)?.errors?.['pattern']?.requiredPattern ==
      '^[A-Za-z0-9]*$'
    ) {
      return 'Only alphanumeric characters are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  private applyCtxRulesToForm(): void {
    if (!this.form) return;

    const hssCtrl = this.form.get('hss_update_enabled');
    const trafficCtrl = this.form.get('allowed_traffic');

    this.dirtyTracker.pause();

    if (this.disabled) {
      hssCtrl?.disable({ emitEvent: false });
      trafficCtrl?.disable({ emitEvent: false });
      this.dirtyTracker.resume();
      return;
    }

    if (isIpSmGwCtx(this.ctx)) {
      hssCtrl?.setValue(true, { emitEvent: false });
      hssCtrl?.disable({ emitEvent: false });
    } else {
      hssCtrl?.enable({ emitEvent: false });
    }


    if (isSmscCtx(this.ctx)) {
      trafficCtrl?.setValue(true, { emitEvent: false });
      trafficCtrl?.disable({ emitEvent: false });
    } else {
      trafficCtrl?.enable({ emitEvent: false });
    }
    this.dirtyTracker.resume();
  }

  private buildPayload(): any {
    const obj: any = { ...this.form.getRawValue() };

    if (isSmscCtx(this.ctx)) {
      obj.allowed_traffic = true;
    }
    if (isIpSmGwCtx(this.ctx)) {
      obj.hss_update_enabled = true;
    }

    if (this.tokenPreview) obj.app_token = this.tokenPreview.trim();
    return obj;
  }

  clearForm() {
    if (this.form) {
      this.form.reset({
        network_id: '',
        name: '',
        status: '',
        enabled: '',
        mno_id: '',
        global_title: '',
        global_title_indicator: '',
        translation_type: '',
        smsc_ssn: '',
        hlr_ssn: '',
        msc_ssn: '',
        map_version: '',
        report_sm_delivery_status: true,
        auto_retry_error_code: '',
        no_retry_error_code: '',
        retry_alternate_destination_error_code: '',
      });
    }
  }

  get ss7BasePath(): string[] {
    return this.isIpSmGw
      ? ['/pages/ip-sm-gw/ss7']
      : ['/pages/gateways/smsc/ss7'];
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
