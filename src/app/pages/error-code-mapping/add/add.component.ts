import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Catalog, ErrorCode, DeliveryErrorCode } from '@core/index';
import { ErrorCodeMappingService, AlertService } from '@core/index';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {

  public title = '';
  public isEdit = false;
  public form!: FormGroup;

  @Input() errorCodeList: ErrorCode[] = [];
  @Input() deliveryErrorCodeList: DeliveryErrorCode[] = [];
  @Input() deliveryStatusList: Catalog[] = [];
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.responseCodeEdit);
    }
    else {
      this.title = 'Create Item';
      this.isEdit = false;
      if (this.form != undefined) {
        this.form.reset();
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private errorCodeMappingService: ErrorCodeMappingService,
    private alertSvr: AlertService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadDataForm(null);
  }

  loadDataForm(data: any): void {
    if (data == null || data == undefined) {
      this.title = 'Create Item';
      return;
    } else {
      this.title = 'Edit Item';
      this.isEdit = true;
      this.form.reset({
        id: (data.id == null || data.id == undefined) ? '' : parseInt(data.id),
        error_code_id: (data.error_code_id == null || data.error_code_id == undefined) ? '' : data.error_code_id,
        delivery_error_code_id: (data.delivery_error_code_id == null || data.delivery_error_code_id == undefined) ? '' : data.delivery_error_code_id,
        delivery_status_id: (data.delivery_status == null || data.delivery_status == undefined) ? '' : data.delivery_status,
      });
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      error_code_id: ['', [Validators.required]],
      delivery_error_code_id: ['', [Validators.required]],
      delivery_status_id: ['', [Validators.required]],
    });
  }

  close(): void {
    this.closeModal.emit(true);
    this.form.reset();
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  async save() {
    if (this.form.invalid) {
      return
    }
    let obj = this.form.value;

    let resp;
    if (this.isEdit) {
      resp = await this.errorCodeMappingService.updateErrorCodeMapping(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.errorCodeMappingService.createErrorCodeMapping(obj);
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

}
