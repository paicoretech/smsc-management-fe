import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, M3uaAssociationSocket, M3uaGeneralSettings, M3uaService } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-add-server',
  templateUrl: './add-socket.component.html',
})
export class AddSocketComponent implements OnInit, OnDestroy {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.isEdit = true;
      this.title = 'Edit TCP/SCTP Socket';
      this.loadDataForm(value.dataSocket);
    } else {
      this.isEdit = false;
      this.title = 'Create TCP/SCTP Socket';
      this.initializeForm();
    }
  }
  title = 'Create TCP/SCTP Socket';
  form!: FormGroup;
  m3uaId?: number;
  isEdit = false;
  socketId?:number;
  m3uaSettings?: M3uaGeneralSettings;
  private subscriptions = new Subscription();
  patternIp: string = environment.PatternIp;
  defaultValue = environment.GatewaySs7Defaults.m3ua.sockets;
  showMaxConcurrentConnections = false;

  constructor(
    private fb: FormBuilder,
    private m3uaService: M3uaService,
    private alertSvr: AlertService,
    private m3uaSettingsService: M3uaSettingsService) {}

  ngOnInit(): void {
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      transport_type: ['', [Validators.required]],
      max_concurrent_connections: ['', [Validators.pattern('^(-1|[0-9]*)$')]],
      host_address: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15), Validators.pattern(this.patternIp)]],
      host_port: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      extra_address: [''],
      socket_type: [this.defaultValue.socket_type, [Validators.required]],
    });

    this.showMaxConcurrentConnections = false;
  }

  loadDataForm(data: any): void {
    this.socketId = data.id;
    this.m3uaId = data.ss7_m3ua_id
    this.form.patchValue({
      name: data.name,
      transport_type: data.transport_type,
      max_concurrent_connections: data.max_concurrent_connections ?? 0,
      host_address: data.host_address,
      host_port: data.host_port,
      extra_address: data.extra_address,
      socket_type: data.socket_type ? data.socket_type : this.defaultValue.socket_type,
    });

    if (data.socket_type == 'Client') {
      this.showMaxConcurrentConnections = false;
    } else {
      this.showMaxConcurrentConnections = true;
    }
  }

  async save() {
    if (!this.form.valid) {
      this.alertSvr.showAlert(2, 'Form is not valid', 'Please fill all required fields');
      return;
    }

    const formData = this.form.value;
    this.m3uaId = this.isEdit ? this.m3uaId : this.m3uaSettings?.id; 
    formData.max_concurrent_connections !== null ? formData.max_concurrent_connections : 0
    
    try {
      let resp;
      if (this.isEdit) {
        resp = await this.m3uaService.updateSocket(this.socketId!,{...formData, ss7_m3ua_id: this.m3uaId, id: this.socketId});
      } else {
        resp = await this.m3uaService.createSocket({...formData, ss7_m3ua_id: this.m3uaId});
      }

      if (resp && resp.status === 200) {
        this.alertSvr.showAlert(1, 'Success', resp.message || 'Operation successful');
        this.close();
      } else {
        this.alertSvr.showAlert(2, 'Error', resp!.message || 'An error occurred');
      }
    } catch (error) {
      this.alertSvr.showAlert(4, "Server error", "error");
    }
  }

  onChangeSocketType(event: any) {
    if (event.target.value == 'Client') {
      this.showMaxConcurrentConnections = false;
    } else {
      this.showMaxConcurrentConnections = true;
    }
  }

  close(): void {
    this.initializeForm();
    this.socketId = undefined;
    this.closeModal.emit(true);
  }

  validInput(name: string): boolean {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  validMinLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
  }

  validMaxLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['maxlength'];
  }

  getMinLength(name: string) {
    return this.form.get(name)?.errors?.['minlength']?.requiredLength;
  }

  getMaxLength(name: string) {
    return this.form.get(name)?.errors?.['maxlength']?.requiredLength;
  }

  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == this.patternIp ) {
      return 'Invalid IP address';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:keydown.escape', ['$event']) 
  handleEscape(event: KeyboardEvent) {
    this.initializeForm();
  }
}
