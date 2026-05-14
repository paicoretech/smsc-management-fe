import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, SccpService, SccpServiceAccessPoint } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';

@Component({
  selector: 'app-add-service-access-point',
  templateUrl: './add-service-access-point.component.html',
})
export class AddServiceAccessPointComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataId(value: number) { this.sccpId = value; }
  @Input() set dataUpdate(value: SccpServiceAccessPoint|undefined) {
    this.sap = value;
    this.init(value??null);
  }
  title = 'Create SAP';
  form!: FormGroup;
  sccpId!: number;
  sap?: SccpServiceAccessPoint;

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
  ) {}

  ngOnInit(): void {
    this.init(null);
  }

  init(data: SccpServiceAccessPoint|null): void {
    this.initializeForm();
    this.loadDataForm(data);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      opc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      network_indicator: ['', [Validators.required, Validators.min(0), Validators.max(3), Validators.pattern('^[0-9]*$')]],
      local_gt_digits: ['', []],
    });
  }

  loadDataForm(data: SccpServiceAccessPoint|null): void {
    if (data == null || data == undefined) {
      this.title = 'Create SAP';
      return;
    } else {
      this.title = 'Edit SAP';
      this.form.reset({
        name: data.name,
        opc: data.origin_point_code,
        network_indicator: data.network_indicator,
        local_gt_digits: data.local_gt_digits,
      });
    }
  }

  async save() {
    var appResult: AppResult;
    if (this.sap?.id == undefined)
      appResult = await this.create();
    else
      appResult = await this.edit();

    if (appResult.isOk()) {
      this.alertSvr.success(appResult.message);
      this.close(true);
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
      let resp = await this.sccpService.createServiceAccessPoint(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('SAP created');
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
      let dto = this.mapFormToDto(this.sap!.id!);
      let resp = await this.sccpService.updateServiceAccessPoint(this.sccpId, dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('SAP updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpServiceAccessPoint {
    let dto : SccpServiceAccessPoint = {
      "id": id,
      "ss7_sccp_id": this.sccpId, 
      "name": this.form.get('name')?.value,
      "origin_point_code": this.form.get('opc')?.value,
      "network_indicator": parseInt(this.form.get('network_indicator')?.value),
      "local_gt_digits": this.form.get('local_gt_digits')?.value,
    }
    return dto;

  }

  close(refresh: boolean): void {
    this.form.reset();
    this.sccpId = 0;
    this.sap = undefined;
    this.closeModal.emit(refresh);
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getPatternMessage(name: string) {
    return this.form.get(name)?.errors?.['pattern'] ? 'Only numbers are allowed' : '';
  }

}
