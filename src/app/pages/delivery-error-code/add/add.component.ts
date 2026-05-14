import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryErrorCodeService, AlertService } from '@core/index';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {

  public title = '';
  public isEdit = false;
  public form!: FormGroup;

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
    private deliveryErrorCodeService: DeliveryErrorCodeService,
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
        code: (data.code == null || data.code == undefined) ? '' : data.code,
        description: (data.description == null || data.description == undefined) ? '' : data.description
      });
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      code: ['', Validators.required],
      description: ['', Validators.required]
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
      resp = await this.deliveryErrorCodeService.updatedeliveryErrorCode(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.deliveryErrorCodeService.createdeliveryErrorCode(obj);
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
