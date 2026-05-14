import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, SccpLongMessageRule, SccpService, SccpServiceAccessPoint } from '@app/core';
import { AppResult } from '@app/core/interfaces/AppResult';

@Component({
  selector: 'app-add-long-message-rule',
  templateUrl: './add-long-message-rule.component.html',
})
export class AddLongMessageRuleComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataListSAP(value: any) {
    this.listSAP = value??[];
  }
  @Input() set dataUpdate(value: SccpLongMessageRule|undefined) {
    this.longMessageRule = value;
    this.init(value??null);
  }
  title = 'Create Long Message Rule';
  form!: FormGroup;

  longMessageRule?: SccpLongMessageRule;
  listSAP: SccpServiceAccessPoint[] = [];

  longMessageRuleTypes = [
    { value: 'LUDT_ENABLED', label: 'LUDT ENABLED' },
    { value: 'LUDT_ENABLED_WITH_SEGMENTATION', label: 'LUDT ENABLED WITH SEGMENTATION' },
    { value: 'XUDT_ENABLED', label: 'XUDT ENABLED' },
    { value: 'LONG_MESSAGE_FORBBIDEN', label: 'LONG MESSAGE FORBIDDEN' }
  ];

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
  ) {}

  ngOnInit(): void {
    this.init(null);
  }

  init(data: SccpLongMessageRule|null): void {
    this.initializeForm();
    this.loadDataForm(data);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      first_pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      last_pc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      long_message_rule_type: ['', [Validators.required]],
      sap_id: ['', [Validators.required]],
    });
  }

  loadDataForm(data: SccpLongMessageRule|null): void {
    if (data == null || data == undefined) {
      this.title = 'Create Long Message Rule';
      return;
    } else {
      this.title = 'Edit Long Message Rule';
      this.form.reset({
        first_pc: data.first_point_code,
        last_pc: data.last_point_code,
        long_message_rule_type: data.long_message_rule_type,
        sap_id: data.sccp_sap_id,
      });
    }
  }

  async save() {
    var appResult: AppResult;
    if (this.longMessageRule?.id == undefined)
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
      let resp = await this.sccpService.createLongMessageRule(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Long Message Rule created');
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
      let dto = this.mapFormToDto(this.longMessageRule!.id!);
      let resp = await this.sccpService.updateLongMessageRule(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Long Message Rule updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpLongMessageRule {
    let dto : SccpLongMessageRule = {
      "id": id,
      "first_point_code": this.form.get('first_pc')?.value,
      "last_point_code": this.form.get('last_pc')?.value,
      "long_message_rule_type": this.form.get('long_message_rule_type')?.value,
      "sccp_sap_id": this.form.get('sap_id')?.value,
    }
    return dto;

  }

  close(refresh: boolean): void {
    this.form.reset();
    this.longMessageRule = undefined;
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
