import { AlertService, M3uaAssociationSocket, M3uaService } from '@app/core';

import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { environment } from '@env/environment';
@Component({
  selector: 'app-add-association',
  templateUrl: './add-association.component.html',
})
export class AddAssociationComponent implements OnInit, OnDestroy {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  m3uaSettings: any;
  @Input() set dataUpdate(value: any) {
    if (value && !value?.reload ) {
      this.title = 'Edit Association';
      this.isEdit = true;
      this.associationId = value.dataAssociation.id;
      this.loadDataForm(value.dataAssociation);
    } else {
      this.title = 'Create Association';
      this.isEdit = false;
    }
    this.loadSockets();
  }
  title = 'Create Association';
  form!: FormGroup;
  isEdit = false;
  associationId!: number;
  listSockets: M3uaAssociationSocket[] = [];
  private subscriptions = new Subscription();
  patternIp: string = environment.PatternIp;

  constructor(
    private fb: FormBuilder,
    private m3uaService: M3uaService,
    private alertService: AlertService,
    private m3uaSettingsService: M3uaSettingsService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.load();
  }

  load():void{
    this.loadDataForm(null);
    this.initializeForm();
    this.loadSockets();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      m3ua_socket_id: [0, [Validators.required]],
      peer: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15), Validators.pattern(this.patternIp)]],
      peer_port: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      m3ua_heartbeat: ['', [Validators.required]],
    });
  }

  loadDataForm(data: any): void {

    if (!data) {
      this.title = 'Create Association';
      this.isEdit = false;
    }
    else{
      this.form.patchValue({
        name: data.name,
        socket: data.socket,
        peer: data.peer,
        peer_port: data.peer_port,
        m3ua_heartbeat: data.m3ua_heartbeat ? 'TRUE' : 'FALSE',
        m3ua_socket_id: data.m3ua_socket_id,
      });
    }
  }

  async save() {
    if (!this.form.valid) {
      this.alertService.showAlert(2, 'Form is not valid', 'Please fill all required fields');
      return;
    }

    const formData = this.form.value;
    const saveMethod = this.isEdit
      ? this.m3uaService.updateAssociations(this.associationId, {...formData, id:this.associationId})
      : this.m3uaService.createAssociations({...formData});

    try {
      const resp = await saveMethod;
      if (resp.status === 200) {
        this.alertService.showAlert(1, resp.message, resp.comment || (this.isEdit ? 'Association updated successfully.' : 'Association created successfully.'));
        this.close();
      } else {
        this.alertService.showAlert(2, resp.message, resp.comment || 'An error occurred');
      }
    } catch (error) {
      this.alertService.showAlert(3, 'Server error', 'An error occurred' );
    }
  }

  close(): void {
    this.load();
    this.associationId = 0;
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

  async loadSockets() {
    if (!this.m3uaSettings) return;
    
    try {
      const response = await this.m3uaService.getSocketsList(this.m3uaSettings.id);
      if (response.status === 200) {
        this.listSockets = response.data;
      } else {
        this.alertService.showAlert(2, response.message, response.comment);
      }
    } catch (error) {
      this.alertService.showAlert(3, 'Server error', 'An error occurred while loading sockets.');
    }
  }

  @HostListener('document:keydown.escape', ['$event']) 
  handleEscape(event: KeyboardEvent) {
    this.initializeForm();
  }

}
