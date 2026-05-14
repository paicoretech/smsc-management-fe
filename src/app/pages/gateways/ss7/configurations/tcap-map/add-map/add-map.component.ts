import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, TcapMapService } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add-map',
  templateUrl: './add-map.component.html',
})
export class AddMapComponent implements OnInit {

  public form!: FormGroup;
  isEdit!: boolean;
  @Input() networkId: number = 0;
  defaultValue = environment.GatewaySs7Defaults.map;
  
  constructor(
    private fb: FormBuilder,
    private service: TcapMapService,
    private alertService: AlertService,
  ) {
  }
  ngOnInit() : void {
    this.initializeForm();
    this.loadConfiguration();
  }

  private async loadConfiguration() {
    try {
      const response = await this.service.getMap(this.networkId);
      if (response.status == 200) {
        const { data } = response;
        this.isEdit = true;
        this.populateForm( data );
      }  else {
        this.save();
      }
    } catch (error) {
      console.error('MapComponent loadConfiguration',error);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      id: [null],
      sri_service_op_code: [this.defaultValue.sri_service_op_code, [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      forward_sm_service_op_code: [this.defaultValue.forward_sm_service_op_code, [Validators.required, Validators.min(1), Validators.max(100)]],
    });

    if (this.networkId) {
      this.form.disable();
    }
  }

  private populateForm(data: any) {
    this.form.setValue({
      id: data.id,
      sri_service_op_code: data.sri_service_op_code,
      forward_sm_service_op_code: data.forward_sm_service_op_code,
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
      resp = await this.service.updateMap(obj.id, obj);
      if (resp.status == 200) {
        this.alertService.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertService.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.id;
      resp = await this.service.createMap(obj);
      if (resp.status == 200) {
        this.alertService.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertService.showAlert(2, resp.message, resp.comment);
      }
    }

    this.loadConfiguration();
  }
}
