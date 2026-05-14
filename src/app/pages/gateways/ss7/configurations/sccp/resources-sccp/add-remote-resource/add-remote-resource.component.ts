import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, SccpService } from '@app/core';
import { SccpRemoteResource } from '@app/core/interfaces/GatewaySs7';
import { AppResult } from '@app/core/interfaces/AppResult';

@Component({
  selector: 'app-add-remote-resource',
  templateUrl: './add-remote-resource.component.html',
})
export class AddRemoteResourceComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataId(value: number) { this.sccpId = value; }
  @Input() set dataUpdate(value: SccpRemoteResource|undefined) {

    if ( value !== null ) {
      if (value?.id  == 0 ) {
        this.init(null);
      } else {
        this.remoteResource = value;
        this.init(value??null);
      }
    }
  }

  title = 'Create Remote Resource';
  form!: FormGroup;
  sccpId!: number;
  remoteResource?: SccpRemoteResource;

  constructor(
    private fb: FormBuilder,
    private sccpService: SccpService,
    private alertSvr: AlertService,
  ) {}

  ngOnInit(): void {
    this.init(null);
  }

  init(data: SccpRemoteResource|null): void {
    this.initializeForm();
    this.loadDataForm(data);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      spc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      ssn: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      prohibited: ['false', [Validators.required]],
    });
  }

  loadDataForm(data: SccpRemoteResource|null): void {
    if (data == null || data == undefined) {
      this.title = 'Create Remote Resource';
      this.form.get('prohibited')?.setValue('false');
      return;
    } else {
      this.title = 'Edit Remote Resource';
      this.form.reset({
        spc: data.remote_spc,
        ssn: data.remote_ssn,
        prohibited: data.mark_prohibited ?? false,
      });
    }
  }

  async save() {
    var appResult: AppResult;
    if (this.remoteResource?.id == undefined)
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
      let resp = await this.sccpService.createRemoteResource(dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Remote resource created');
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
      let dto = this.mapFormToDto(this.remoteResource!.id!);
      let resp = await this.sccpService.updateRemoteResource(this.sccpId, dto);
      if (resp.status == 200) {
        appResult = AppResult.successNoData('Remote resource updated');
      } else {
        appResult = AppResult.warning('Failed to save information');
      }
    } catch (error) {
      appResult = AppResult.error('An unexpected error has occurred', error);
    }
    return appResult;
  }

  mapFormToDto(id: number|undefined): SccpRemoteResource {
    let dto : SccpRemoteResource = {
      "id": id,
      "ss7_sccp_id": this.sccpId,
      "remote_spc": parseInt(this.form.get('spc')?.value),
      "remote_ssn": parseInt(this.form.get('ssn')?.value),
      "mark_prohibited": this.form.get('prohibited')?.value,
      "remote_spc_status": this.remoteResource?.remote_spc_status ?? "ALLOWED",
      "remote_ssn_status": this.remoteResource?.remote_ssn_status ?? "ALLOWED",
      "remote_sccp_status": this.remoteResource?.remote_spc_status ?? "ALLOWED",
    }
    return dto;

  }

  close(refresh: boolean): void {
    this.form.reset();
    this.remoteResource = undefined;
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
