import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, Catalog, CatalogService, ResponseI, SccpAddress, SccpRule, SccpService } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';
import { delay } from 'rxjs';

@Component({
  selector: 'app-add-sccp-rules',
  templateUrl: './add-sccp-rules.component.html',
})
export class AddSccpRulesComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataId(value: number) {
    this.sccpId = value;
    if (this.sccpId > 0) {
      this.sccpService.getAddresses(this.sccpId).then(resp => {
        if (resp.status == 200) {
          this.listAddresses = resp.data;
        }
      });
    }
  }
  @Input() set dataUpdate(value: SccpRule|undefined) {
    if (value == null || value == undefined) {
      this.rule = undefined;
      this.init(null);
    } else {
      if (value?.id == 0) {
        this.rule = undefined;
        this.init(null);
      } else {
        this.rule = value;
        this.init(value??null);
      }
    }
  }

  title = 'Create SCCP Route';
  form!: FormGroup;
  sccpId!: number;
  rule?: SccpRule;
  listAddresses: SccpAddress[] = [];
  originationTypes: Catalog[] = [];
  ruleTypes: Catalog[] = [];
  sharingAlgorithms: Catalog[] = [];
  numberingPlanList: Catalog[] = [];
  naturaOfAddressList: Catalog[] = [];
  response!: ResponseI;

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private catalogSvc: CatalogService
  ) {}

  ngOnInit(): void {
    this.init(null);
  }

  init(data: SccpRule|null): void {
    this.initializeForm();
    this.loadDataForm(data);
    this.loadOriginationType();
    this.loadRuleType();
    this.loadSharingAlgorithm();
    this.loadNumberingPlanList();
    this.loadNatureOfAddressList();
  }

  async loadOriginationType() {
    this.response = await this.catalogSvc.getByCatalogType('ss7OriginType');
    if (this.response.status == 200) {
      this.originationTypes = this.response.data;

      if ( this.originationTypes.length > 0 ) {
        this.form.get('original_type')?.setValue(this.originationTypes[0].id);
      }
    }
  }

  async loadRuleType() {
    this.response = await this.catalogSvc.getByCatalogType('ss7RuleType');
    if (this.response.status == 200) {
      this.ruleTypes = this.response.data;

      if ( this.ruleTypes.length > 0 ) {
        this.form.get('rule_type')?.setValue(this.ruleTypes[0].id);
      }
    }
  }

  async loadSharingAlgorithm() {
    this.response = await this.catalogSvc.getByCatalogType('ss7LoadSharingAlgorithm');
    if (this.response.status == 200) {
      this.sharingAlgorithms = this.response.data;

      if ( this.sharingAlgorithms.length > 0 ) {
        this.form.get('load_sharing_algorithm')?.setValue(this.sharingAlgorithms[0].id);
      }
    }
  }

  async loadNumberingPlanList() {
    this.response = await this.catalogSvc.getByCatalogType('numberingPlan');
    if (this.response.status == 200) {
      this.numberingPlanList = this.response.data;

      if ( this.numberingPlanList.length > 0 ) {
        this.form.get('numbering_plan')?.setValue(this.numberingPlanList[0].id);
        this.form.get('calling_numbering_plan')?.setValue(this.numberingPlanList[0].id);
      }
    }
  }

  async loadNatureOfAddressList() {
    this.response = await this.catalogSvc.getByCatalogType('natureOfAddress');
    if (this.response.status == 200) {
      this.naturaOfAddressList = this.response.data;

      if ( this.naturaOfAddressList.length > 0 ) {
        this.form.get('nature_of_address')?.setValue(this.naturaOfAddressList[0].id);
        this.form.get('calling_nature_address')?.setValue(this.naturaOfAddressList[0].id);
      }
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      mask: ['', [Validators.required]],
      ai: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      ssn: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      tt: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      numbering_plan: ['', [Validators.required, Validators.pattern('^(-1|[0-9]*)$')]],
      nature_of_address: ['', [Validators.required, Validators.pattern('^(-1|[0-9]*)$')]],
      digits: ['', [Validators.required]],
      rule_type: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      primary_address: ['', [Validators.pattern('^[0-9]*$')]],
      secondary_address: ['', [Validators.pattern('^[0-9]*$')]],
      load_sharing_algorithm: ['', [Validators.pattern('^[0-9]*$')]],
      new_calling_party_address: [],
      original_type: ['', [Validators.pattern('^[0-9]*$')]],
      calling_address_indicator: ['', [Validators.pattern('^[0-9]*$')]],
      calling_point_code: ['', [Validators.pattern('^[0-9]*$')]],
      calling_ssn: ['', [Validators.pattern('^[0-9]*$')]],
      calling_translator_type: ['', [Validators.pattern('^[0-9]*$')]],
      calling_numbering_plan: ['', [Validators.pattern('^(-1|[0-9]*)$')]],
      calling_nature_address: ['', [Validators.pattern('^(-1|[0-9]*)$')]],
      ccalling_global_title_digits: []
    });
  }

  loadDataForm(data: SccpRule|null): void {
    if (data == null || data == undefined) {
      this.title = 'Create Rule';

      return;
    } else {
      setTimeout(() => {
        this.title = 'Edit Rule';
        this.form.reset({
          name: data.name,
          mask: data.mask,
          ai: data.address_indicator,
          pc: data.point_code,
          ssn: data.subsystem_number,
          tt: data.translation_type,
          numbering_plan: data.numbering_plan_id,
          nature_of_address: data.nature_of_address_id,
          digits: data.global_tittle_digits,
          rule_type: data.rule_type_id,
          primary_address: data.primary_address_id,
          secondary_address: data.secondary_address_id,
          load_sharing_algorithm: data.load_sharing_algorithm_id,
          new_calling_party_address: data.new_calling_party_address,
          original_type: data.origination_type_id,
          calling_address_indicator: data.calling_address_indicator,
          calling_point_code: data.calling_point_code,
          calling_ssn: data.calling_subsystem_number,
          calling_translator_type: data.calling_translator_type,
          calling_numbering_plan: data.calling_numbering_plan_id,
          calling_nature_address: data.calling_nature_of_address_id,
          calling_global_title_digits: data.calling_global_tittle_digits
        });
      }, 200);
    }
  }

  async save() {

    if (this.form.get('primary_address')?.value == this.form.get('secondary_address')?.value) {
      this.alertSvr.warning('Primary Address and Secondary Address must be different');
      return;
    }

    if (this.form.get('primary_address')?.value == -1 && this.form.get('secondary_address')?.value == -1) {
      this.alertSvr.warning('Select at least the Primary Address or Secondary Address');
      return;
    }


    var appResult: AppResult;
    if (this.rule?.id == null)
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

      let resp = await this.sccpService.createRule(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Rule created');
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
      let dto = this.mapFormToDto(this.rule!.id ?? undefined);
      let resp = await this.sccpService.updateRule(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Rule updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpRule {
    let dto : SccpRule = {
      "id": id,
      "sccp_sap_id": this.sccpId,
      "name": this.form.get('name')?.value,
      "mask": this.form.get('mask')?.value,
      "address_indicator": parseInt(this.form.get('ai')?.value),
      "point_code": parseInt(this.form.get('pc')?.value),
      "subsystem_number": parseInt(this.form.get('ssn')?.value),
      "gt_indicator": "",
      "translation_type": parseInt(this.form.get('tt')?.value),
      "numbering_plan_id": parseInt(this.form.get('numbering_plan')?.value),
      "nature_of_address_id": parseInt(this.form.get('nature_of_address')?.value),
      "global_tittle_digits": this.form.get('digits')?.value,
      "rule_type_id": parseInt(this.form.get('rule_type')?.value),
      "primary_address_id": parseInt(this.form.get('primary_address')?.value || null),
      "secondary_address_id": parseInt(this.form.get('secondary_address')?.value || null),
      "load_sharing_algorithm_id": parseInt(this.form.get('load_sharing_algorithm')?.value),
      "new_calling_party_address": this.form.get('new_calling_party_address')?.value,
      "origination_type_id": parseInt(this.form.get('original_type')?.value),
      "calling_address_indicator": parseInt(this.form.get('calling_address_indicator')?.value),
      "calling_point_code": parseInt(this.form.get('calling_point_code')?.value),
      "calling_subsystem_number": parseInt(this.form.get('calling_ssn')?.value),
      "calling_translator_type": parseInt(this.form.get('calling_translator_type')?.value),
      "calling_numbering_plan_id": parseInt(this.form.get('calling_numbering_plan')?.value),
      "calling_nature_of_address_id": parseInt(this.form.get('calling_nature_address')?.value),
      "calling_global_tittle_digits": this.form.get('ccalling_global_title_digits')?.value,
    };
    return dto;
  }

  close(refresh: boolean): void {
    this.form.reset();
    this.sccpId = 0;
    this.rule = undefined;
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

  onMaskInput(event: any) {
    let value: string = event.target.value;
    value = value.toUpperCase();
    this.form.get('mask')?.setValue(value);
  }

}
