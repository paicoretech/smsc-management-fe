import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AlertService, ResponseI, SccpGeneralSettings, SccpService } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';
import { environment } from '@env/environment';

@Component({
  selector: 'app-general-sccp',
  templateUrl: './general-sccp.component.html',
})
export class GeneralSccpComponent {

  networkId: number = 0;
  @Input() set dataNetworkId(value: number) {
    this.networkId = value;
  }

  @Output() setSccpId = new EventEmitter<number>();

  form!: FormGroup;
  response!: ResponseI;
  sccpProperties: SccpGeneralSettings = {} as SccpGeneralSettings;
  defaultValues = environment.GatewaySs7Defaults.sccp;
  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProperties();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      zMarginXudtMessage: [this.defaultValues.zmarin, [Validators.required]],
      removeSpc: [this.defaultValues.remove_spc, [Validators.required]],
      sstTimerDurationMin: [this.defaultValues.sst_timer_min, [Validators.required]],
      sstTimerDurationMax: [this.defaultValues.sst_timer_max, [Validators.required]],
      sstTimerDurationIncreaseFactor: [this.defaultValues.sst_timer_increase_factor, [Validators.required]],
      maxDataMessage: [this.defaultValues.max_data_message, [Validators.required]],
      periodOfLogging: [this.defaultValues.period_of_logging, [Validators.required]],
      reassemblyTimerDelay: [this.defaultValues.reassembly_timer, [Validators.required]],
      previewMode: [this.defaultValues.preview_mode, [Validators.required]],
      sccpProtocolVersion: [this.defaultValues.sccp_protocol_version, [Validators.required]],
      congestionControlTimeA: [this.defaultValues.congestion_control_timer_a, [Validators.required]],
      congestionControlTimeB: [this.defaultValues.congestion_control_timer_d, [Validators.required]],
      congestionControlAlgorithm: [this.defaultValues.congestion_control_algorithm, [Validators.required]],
      congestionControl: [this.defaultValues.congestion_control_outgoing, [Validators.required]],
      rspProhibitedByDefault: [false, [Validators.required]]
    });
  }

  async loadProperties() {
    this.response = await this.sccpService.getProperties(this.networkId);
    if (this.response.status == 200) {
      this.sccpProperties = this.response.data;
      this.setSccpId.emit(this.sccpProperties.id);

      let rspProhitedByDefault: boolean = this.sccpProperties.rsp_prohibited_by_default ?? false;

      this.form.setValue({
        zMarginXudtMessage: this.sccpProperties.z_margin_xudt_message,
        removeSpc: this.sccpProperties.remove_spc,
        sstTimerDurationMin: this.sccpProperties.sst_timer_duration_min,
        sstTimerDurationMax: this.sccpProperties.sst_timer_duration_max,
        sstTimerDurationIncreaseFactor: this.sccpProperties.sst_timer_duration_increase_factor,
        maxDataMessage: this.sccpProperties.max_data_message,
        periodOfLogging: this.sccpProperties.period_of_logging,
        reassemblyTimerDelay: this.sccpProperties.reassembly_timer_delay,
        previewMode: this.sccpProperties.preview_mode,
        sccpProtocolVersion: this.sccpProperties.sccp_protocol_version,
        congestionControlTimeA: this.sccpProperties.congestion_control_timer_a,
        congestionControlTimeB: this.sccpProperties.congestion_control_timer_d,
        congestionControlAlgorithm: this.sccpProperties.congestion_control_algorithm,
        congestionControl: this.sccpProperties.congestion_control,
        rspProhibitedByDefault: rspProhitedByDefault
      });

    } else {
      this.sccpProperties.id = 0
      this.save();
    }
  }

  async save() {
    if (this.form.invalid) {
      this.alertSvr.warning('Please fill in all required fields');
      return;
    }

    var appResult: AppResult;
    if (this.sccpProperties?.id == null || this.sccpProperties?.id == 0) {
      appResult = await this.create();
      this.setSccpId.emit(appResult.data.id);
    }
    else
      appResult = await this.edit();

    if (appResult.isOk()) {
      this.alertSvr.success(appResult.message);
    }
    else if (appResult.isWarn()) {
      this.alertSvr.warning(appResult.message);
    }
    else if (appResult.isError()) {
      this.alertSvr.error(appResult.message);
    }
  }

  async create(): Promise<AppResult> {
    var appResult: AppResult;
    try {
      let dto = this.mapFormToDto(undefined);
      let resp = await this.sccpService.create(dto);
      if (resp.status == 200) {
        appResult = AppResult.success(resp.data, 'Properties saved');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  async edit(): Promise<AppResult> {
    var appResult: AppResult;
    try {
      let dto = this.mapFormToDto(this.sccpProperties!.id!);
      let resp = await this.sccpService.update(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Properties saved');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpGeneralSettings {
    return {
      "id": id,
      "network_id": this.networkId,
      "z_margin_xudt_message": parseInt(this.form.get('zMarginXudtMessage')?.value),
      "remove_spc": this.form.get('removeSpc')?.value,
      "sst_timer_duration_min": parseInt(this.form.get('sstTimerDurationMin')?.value),
      "sst_timer_duration_max": parseInt(this.form.get('sstTimerDurationMax')?.value),
      "sst_timer_duration_increase_factor": parseInt(this.form.get('sstTimerDurationIncreaseFactor')?.value),
      "max_data_message": parseInt(this.form.get('maxDataMessage')?.value),
      "period_of_logging": parseInt(this.form.get('periodOfLogging')?.value),
      "reassembly_timer_delay": parseInt(this.form.get('reassemblyTimerDelay')?.value),
      "preview_mode": this.form.get('previewMode')?.value,
      "sccp_protocol_version": this.form.get('sccpProtocolVersion')?.value,
      "congestion_control_timer_a": parseInt(this.form.get('congestionControlTimeA')?.value),
      "congestion_control_timer_d": parseInt(this.form.get('congestionControlTimeB')?.value),
      "congestion_control_algorithm": this.form.get('congestionControlAlgorithm')?.value,
      "congestion_control": this.form.get('congestionControl')?.value,
      "rsp_prohibited_by_default": this.form.get('rspProhibitedByDefault')?.value,
    }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

}
