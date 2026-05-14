import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AlertService, Catalog, CatalogService, ResponseI, SccpAddress, SccpService } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';

declare var window: any;

@Component({
  selector: 'app-add-sccp-address',
  templateUrl: './add-sccp-address.component.html',
})
export class AddSccpAddressComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataId(value: number) { this.sccpId = value; }
  @Input() set dataUpdate(value: SccpAddress|undefined) {
    this.address = value;
    this.init(value??null);
  }
  title = 'Create SCCP Address';
  form!: FormGroup;
  sccpId!: number;
  address?: SccpAddress;
  numberingPlanList: Catalog[] = [];
  naturaOfAddressList: Catalog[] = [];

  response!: ResponseI;

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private catalogSvr: CatalogService,
  ) {}

  ngOnInit(): void {
    this.init(null);
    this.loadNumberingPlanList();
    this.loadNatureOfAddressList();
  }

  async loadNumberingPlanList() {
    this.response = await this.catalogSvr.getByCatalogType('numberingPlan');
    if (this.response.status == 200) {
      this.numberingPlanList = this.response.data;
    }
  }

  async loadNatureOfAddressList() {
    this.response = await this.catalogSvr.getByCatalogType('natureOfAddress');
    if (this.response.status == 200) {
      this.naturaOfAddressList = this.response.data;
    }
  }

  init(data: SccpAddress|null): void {
    this.initializeForm();
    this.loadDataForm(data);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      ai: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      ssn: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      // gt_indicator: ['', [Validators.required]],
      tt: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      numbering_plan_id: ['', []],
      nature_of_address: ['', []],
      digits: ['', [Validators.required]],
    });
  }

  loadDataForm(data: SccpAddress|null): void {
    if (data == null) {
      this.title = 'Create SCCP Address';
      return;
    } else {
      this.title = 'Edit SCCP Address';
      this.form.reset({
        name: data.name,
        ai: data.address_indicator,
        pc: data.point_code,
        ssn: data.subsystem_number,
        // gt_indicator: data.gt_indicator,
        tt: data.translation_type,
        numbering_plan_id: data.numbering_plan_id,
        nature_of_address: data.nature_of_address_id,
        digits: data.digits,
      });
    }
  }

  async save() {
    var appResult: AppResult;
    if (this.address?.id == undefined)
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
      let resp = await this.sccpService.createAddress(this.sccpId, dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Address created');
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
      let dto = this.mapFormToDto(this.address!.id!);
      let resp = await this.sccpService.updateAddress(this.sccpId, dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Address updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpAddress {
    let dto : SccpAddress = {
      "id": id,
      "ss7_sccp_id": this.sccpId,
      "name": this.form.get('name')?.value,
      "address_indicator": parseInt(this.form.get('ai')?.value),
      "point_code": parseInt(this.form.get('pc')?.value),
      "subsystem_number": parseInt(this.form.get('ssn')?.value),
      "gt_indicator": "",
      "translation_type": parseInt(this.form.get('tt')?.value),
      "numbering_plan_id": parseInt(this.form.get('numbering_plan_id')?.value),
      "nature_of_address_id": parseInt(this.form.get('nature_of_address')?.value),
      "digits": this.form.get('digits')?.value,
    }
    return dto;
  }

  close(refresh: boolean): void {
    this.form.reset();
    this.address = undefined;
    this.closeModal.emit(refresh===true);
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

  getFormValidationErrors() {
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: ValidationErrors|null|undefined = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
         console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }
}
