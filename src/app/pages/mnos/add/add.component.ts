import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MnosService } from '@app/core/services/mnos.service';
import { AlertService } from '@app/core/utils/alert.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.mnoEdit);
    }
    else {
      this.title = 'Create Item';
      this.isEdit = false;
      if (this.form != undefined) {
        this.form.reset();
      }
    }
  }

  isEdit = false;
  form!: FormGroup;
  public title = 'Create Item';

  constructor(
    private fb: FormBuilder,
    private mnosService: MnosService,
    private alertSvr: AlertService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadDataForm(null);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: ['', [Validators.required]],
      tlv_message_receipt_id: [false],
      message_id_decimal_format: [false]
    });
  }

  async save() {
    if (this.form.invalid) {
      return
    }
    let obj = this.form.value;

    let resp;
    if (this.isEdit) {
      resp = await this.mnosService.updateMnos(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.mnosService.createMnos(obj);
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

  close(): void {
    this.closeModal.emit(true);
    this.form.reset();
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
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
        name: (data.name == null || data.name == undefined) ? '' : data.name,
        tlv_message_receipt_id: (data.tlv_message_receipt_id == null || data.tlv_message_receipt_id == undefined) ? false : data.tlv_message_receipt_id,
        message_id_decimal_format: (data.message_id_decimal_format == null || data.message_id_decimal_format == undefined) ? false : data.message_id_decimal_format
      });
    }
  }

}
