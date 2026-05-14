import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, SccpMtp3Destination, SccpService, SccpServiceAccessPoint } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';

@Component({
  selector: 'app-add-mtp3-destination',
  templateUrl: './add-mtp3-destination.component.html',
})
export class AddMtp3DestinationComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataListSAP(value: any) {
    this.listSAP = value??[];
  }
  @Input() set dataUpdate(value: SccpMtp3Destination|undefined) {
    this.mtp3 = value;
    this.init(value??null);
  }
  title = 'Create MTP3 Destination';
  form!: FormGroup;

  mtp3?: SccpMtp3Destination;
  listSAP: SccpServiceAccessPoint[] = [];

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
  ) {}

  ngOnInit(): void {
    this.init(null);
  }

  init(data: SccpMtp3Destination|null): void {
    this.initializeForm();
    this.loadDataForm(data);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      sap_id: ['', [Validators.required]],
      first_pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      last_pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      first_sls: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      last_sls: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      sls_mask: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  loadDataForm(data: SccpMtp3Destination|null): void {
    if (data == null || data == undefined) {
      this.title = 'Create MTP3 Destination';
      return;
    } else {
      this.title = 'Edit MTP3 Destination';
      this.form.reset({
        name: data.name,
        sap_id: data.sccp_sap_id,
        first_pc: data.first_point_code,
        last_pc: data.last_point_code,
        first_sls: data.first_sls,
        last_sls: data.last_sls,
        sls_mask: data.sls_mask,
      });
    }
  }

  async save() {
    var appResult: AppResult;
    if (this.mtp3?.id == undefined)
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
      let resp = await this.sccpService.createMtp3Destination(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('MTP3 created');
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
      let dto = this.mapFormToDto(this.mtp3!.id!);
      let resp = await this.sccpService.updateMtp3Destination(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('MTP3 updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpMtp3Destination {
    let dto : SccpMtp3Destination = {
      "id": id,
      "name": this.form.get('name')?.value,
      "sccp_sap_id": this.form.get('sap_id')?.value,
      "first_point_code": this.form.get('first_pc')?.value,
      "last_point_code": this.form.get('last_pc')?.value,
      "first_sls": this.form.get('first_sls')?.value,
      "last_sls": this.form.get('last_sls')?.value,
      "sls_mask": this.form.get('sls_mask')?.value,
    }
    return dto;

  }

  close(refresh: boolean): void {
    this.form.reset();
    this.mtp3 = undefined;
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
