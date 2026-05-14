import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, TcapMapService, Catalog, CatalogService } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add-tcap',
  templateUrl: './add-tcap.component.html',
})
export class AddTcapComponent implements OnInit {
  
  public form!: FormGroup;
  isEdit!: boolean;
  @Input() networkId: number = 0;
  slsRangeList: Catalog[] = [];
  defaultValue = environment.GatewaySs7Defaults.tcap;
  
  constructor(
    private fb: FormBuilder,
    private service: TcapMapService,
    private alertService: AlertService,
    private catalogService: CatalogService,
  ) {
  }
  ngOnInit() : void {
    this.initializeForm();
    this.loadSlsRange();
    this.loadConfiguration();
  }

  async loadSlsRange() {
    let response = await this.catalogService.getByCatalogType('slsRange')
    if (response.status == 200) {
      this.slsRangeList = response.data;
    }
  }

  private async loadConfiguration() {
    try {
      const response = await this.service.getTcap(this.networkId);
      if (response.status == 200) {
        const { data } = response;
        this.isEdit = true;
        this.populateForm( data );
      } else {
        this.save();
      }
    } catch (error) {
      console.error('TcapComponent loadConfiguration',error);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      id: [null],
      ssn_list: [this.defaultValue.ssn_list, [Validators.required, Validators.pattern('^\\d+(,\\d+)*$')]],
      preview_mode: [this.defaultValue.preview_mode, [Validators.required]],
      dialog_idle_timeout: [this.defaultValue.dialog_timeout, [Validators.required, Validators.min(0), Validators.max(1000000), Validators.pattern('^[0-9]*$')]],
      invoke_timeout: [this.defaultValue.invoke_timeout, [Validators.required, Validators.min(0), Validators.max(1000000), Validators.pattern('^[0-9]*$')]],
      dialog_id_range_start: [this.defaultValue.dialog_range_start, [Validators.required, Validators.min(0), Validators.max(9999999999), Validators.pattern('^[0-9]*$')]],
      dialog_id_range_end: [this.defaultValue.dialog_range_end, [Validators.required, Validators.min(0), Validators.max(9999999999), Validators.pattern('^[0-9]*$')]],
      max_dialogs: [this.defaultValue.max_dialogs, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      do_not_send_protocol_version: [this.defaultValue.do_not_send, [Validators.required]],
      swap_tcap_id_enabled: [this.defaultValue.swap_tcap, [Validators.required]],
      sls_range_id: [this.defaultValue.sls_range, [Validators.required]],
      exr_delay_thr1: [this.defaultValue.exr_delay_thr_1, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      exr_delay_thr2: [this.defaultValue.exr_delay_thr_2, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      exr_delay_thr3: [this.defaultValue.exr_delay_thr_3, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      exr_back_to_normal_delay_thr1: [this.defaultValue.exr_normal_delay_thr_1, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      exr_back_to_normal_delay_thr2: [this.defaultValue.exr_normal_delay_thr_2, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      exr_back_to_normal_delay_thr3: [this.defaultValue.exr_normal_delay_thr_3, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      memory_monitor_thr1: [this.defaultValue.memory_monitor_thr_1, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      memory_monitor_thr2: [this.defaultValue.memory_monitor_thr_2, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      memory_monitor_thr3: [this.defaultValue.memory_monitor_thr_3, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      mem_back_to_normal_delay_thr1: [this.defaultValue.mem_normal_delay_thr_1, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      mem_back_to_normal_delay_thr2: [this.defaultValue.mem_normal_delay_thr_2, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      mem_back_to_normal_delay_thr3: [this.defaultValue.mem_normal_delay_thr_3, [Validators.required, Validators.min(0), Validators.max(10000), Validators.pattern('^[0-9]*$')]],
      blocking_incoming_tcap_messages: [this.defaultValue.blocking_tcap, [Validators.required]],
    });
  }

  private populateForm(data: any) {
    this.form.setValue({
      id: data.id,
      ssn_list: data.ssn_list,
      preview_mode: data.preview_mode,
      dialog_idle_timeout: data.dialog_idle_timeout,
      invoke_timeout: data.invoke_timeout,
      dialog_id_range_start: data.dialog_id_range_start,
      dialog_id_range_end: data.dialog_id_range_end,
      max_dialogs: data.max_dialogs,
      do_not_send_protocol_version: data.do_not_send_protocol_version,
      swap_tcap_id_enabled: data.swap_tcap_id_enabled,
      sls_range_id: data.sls_range_id,
      exr_delay_thr1: data.exr_delay_thr1,
      exr_delay_thr2: data.exr_delay_thr2,
      exr_delay_thr3: data.exr_delay_thr3,
      exr_back_to_normal_delay_thr1: data.exr_back_to_normal_delay_thr1,
      exr_back_to_normal_delay_thr2: data.exr_back_to_normal_delay_thr2,
      exr_back_to_normal_delay_thr3: data.exr_back_to_normal_delay_thr3,
      memory_monitor_thr1: data.memory_monitor_thr1,
      memory_monitor_thr2: data.memory_monitor_thr2,
      memory_monitor_thr3: data.memory_monitor_thr3,
      mem_back_to_normal_delay_thr1: data.mem_back_to_normal_delay_thr1,
      mem_back_to_normal_delay_thr2: data.mem_back_to_normal_delay_thr2,
      mem_back_to_normal_delay_thr3: data.mem_back_to_normal_delay_thr3,
      blocking_incoming_tcap_messages: data.blocking_incoming_tcap_messages,
    });
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }
  
  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } if (this.form.get('ssn_list')?.errors?.['pattern']?.requiredPattern === '^\\d+(,\\d+)*$') {
      return 'should be just numbers separated by commas';
    } else {
      return 'Only numbers are allowed';
    }
  }

  clearForm() {
    this.form.reset({});
  }
  
  async save() {
    if (this.form.invalid) {
      return
    }
    let obj = this.form.value;
    obj.network_id = this.networkId;
    let resp;
    if (this.isEdit) {
      resp = await this.service.updateTcap(obj.id, obj);
      if (resp.status == 200) {
        this.alertService.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertService.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.id;
      resp = await this.service.createTcap(obj);
      if (resp.status == 200) {
        this.alertService.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertService.showAlert(2, resp.message, resp.comment);
      }
    }

    this.loadConfiguration();
  }
}
