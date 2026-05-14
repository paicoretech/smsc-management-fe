import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingServices } from '@app/core/services/settings.service';
import { AlertService } from '@app/core/utils/alert.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddSmppServerComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.smppServer, value.disableControls);
    }
    else {
      if (this.form != undefined) {
        this.form.reset();
      }
    }
  }

  isEdit = false;
  form!: FormGroup;
  saveDisabled = false;
  defaultValues = environment.smppServerListenerConfig;
  newItemTitle = 'Create SMPP Server';
  updateItemTitle = 'Edit SMPP Server';
  public title = this.newItemTitle;
  public isNameReadOnly: boolean = false;

  constructor(
      private fb: FormBuilder,
      private settingServices: SettingServices,
      private alertSvr: AlertService
  ) { }

  ngOnInit() {
      this.initializeForm();
      this.loadDataForm(null, false);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: ['', [Validators.required]],
      ip: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]],
      port: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]],
      transaction_timer: [5000, [Validators.required]],
      wait_for_bind: [5000, [Validators.required]],
      processor_degree: [15, [Validators.required]],
      queue_capacity: [1000, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      status: [this.defaultValues.status, [Validators.required]],
      tls_enabled: [false]
    });
  }

  loadDataForm(data: any, disableControls: boolean): void {
    this.resetCommonVariable();

    if (data) {
      this.title = this.updateItemTitle;
      this.isEdit = true;
      this.form.reset({
        id: (data.id == null || data.id == undefined) ? '' : parseInt(data.id),
        name: (data.name == null || data.name == undefined) ? '' : data.name,
        ip: (data.ip == null || data.ip == undefined) ? '' : data.ip,
        port: (data.port == null || data.port == undefined) ? 0 : data.port,
        transaction_timer: (data.transaction_timer == null || data.transaction_timer == undefined) ? 1000 : data.transaction_timer,
        wait_for_bind: (data.wait_for_bind == null || data.wait_for_bind == undefined) ? 1000 : data.wait_for_bind,
        processor_degree: (data.processor_degree == null || data.processor_degree == undefined) ? 15 : data.processor_degree,
        queue_capacity: (data.queue_capacity == null || data.queue_capacity == undefined) ? 500 : data.queue_capacity,
        status: (data.status == null || data.status == undefined) ? this.defaultValues.status : data.status,
        enabled: (data.enabled == null || data.enabled == undefined) ? this.defaultValues.enabled : data.enabled,
        tls_enabled: (data.tls_enabled == null || data.tls_enabled == undefined) ? false : data.tls_enabled,
      });

      if (data.is_default) {
        this.isNameReadOnly = true;
      }
    }

    if (disableControls) {
      this.form.get('name')?.disable();   
      this.form.get('ip')?.disable();
      this.form.get('port')?.disable();
      this.form.get('transaction_timer')?.disable();
      this.form.get('wait_for_bind')?.disable();
      this.form.get('processor_degree')?.disable();
      this.form.get('queue_capacity')?.disable();
      this.form.get('tls_enabled')?.disable();
      this.saveDisabled = true;
    }
  }

  async save() {
      if (this.form.invalid) {
        return
      }

      let obj = this.form.value;
      let resp;
      if (this.isEdit) {
        resp = await this.settingServices.updateSmppServer(obj.id, obj);
        if (resp.status == 200) {
          this.alertSvr.showAlert(1, resp.message, resp.comment);
        } else {
          this.alertSvr.showAlert(2, resp.message, resp.comment);
        }
      } else {
        resp = await this.settingServices.createSmppServer(obj);
        if (resp.status == 200) {
          this.alertSvr.showAlert(1, resp.message, resp.comment);
        } else {
          this.alertSvr.showAlert(2, resp.message, resp.comment);
        }
      }

      if (resp.status == 200) {
        this.close();
      }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  close(): void {
    this.closeModal.emit(true);
    this.isNameReadOnly = false;
    this.form.reset();
    this.resetCommonVariable();
    this.loadDataForm(null, false);
    this.initializeForm();
  }

  resetCommonVariable() {
    this.title = this.newItemTitle;
    this.isEdit = false;
    this.saveDisabled = false;
  }
}