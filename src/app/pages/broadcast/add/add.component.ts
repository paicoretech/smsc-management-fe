import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BroadCastService,
  AlertService,
  RoutingRolesService,
  Network,
  Broadcast,
  SpinnerService,
  DateTimeUtil,
  CatalogService,
  Catalog,
  ResponseI,
  AuthService
} from '@core/index';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit, OnDestroy {

  isEdit = false;
  showBtnEdit = false;
  form!: FormGroup;
  title = 'Create Broadcast SMS';
  serviceProviderList: Network[] = [];
  fileName: string | null = null;
  disabled = false;
  isUploadingFile = false;
  uploadProgress = 0;
  updateFile = false;

  broadcast: Broadcast = this.getInitialBroadcast();

  messageEventFieldsGrouped: any[] = [];
  private allMessageEventFields: any[] = [];
  private readonly ADVANCED_MAPPING_KEYS = ['sourceAddrTon', 'sourceAddrNpi', 'destAddrTon', 'destAddrNpi', 'dataCoding'];
  fileColumns: string[] = [];
  filePreview: string[] = [];
  encodingList: Catalog[] = [
    { id: 0, name: 'DCS-0' },
    { id: 3, name: 'DCS-3' },
    { id: 8, name: 'DCS-8' },
  ];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  columnMapping: { [key: string]: string } = {};
  senderId: string = '';
  messagePreview: string = '';
  showInfo: boolean = false;
  showAdvancedSettings = false;
  allowedSenderIds: string[] = [];

  constructor(
    private fb: FormBuilder,
    private broadCastService: BroadCastService,
    private routingService: RoutingRolesService,
    private catalogService: CatalogService,
    private alertSvr: AlertService,
    private spinnerSvr: SpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadInitData();
  }

  async loadInitData() {
    this.allowedSenderIds = this.authService.getSenderIds();

    this.updateSenderIdField();
    this.loadMessageEventFields();
    this.loadProviders();
    this.getTonCatalog();
    this.getNpiCatalog();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.title = 'Edit Broadcast SMS';
      this.loadDataForm({ broadcast_id: +id });
    } else {
      this.title = 'Create Broadcast SMS';
      this.disabled = true;
      this.resetFileLabel();
    }
  }


  private getEffectiveSenderId(): { value: string; isImmutable: boolean } {
    if (this.allowedSenderIds.length === 1) {
      return { value: this.allowedSenderIds[0], isImmutable: false };
    }
    return { value: '', isImmutable: false };
  }

  ngOnDestroy(): void {
    this.fileColumns.forEach(col => {
      if (this.form.contains(col)) {
        this.form.removeControl(col);
      }
    });
    this.form.reset();
    this.resetBroadcastState();
    this.resetFileState();
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;

    if (!this.showAdvancedSettings) {
      // Switching to Basic: clear Advanced column mappings that are no longer visible
      for (const col of Object.keys(this.columnMapping)) {
        if (this.ADVANCED_MAPPING_KEYS.includes(this.columnMapping[col])) {
          this.columnMapping[col] = '';
          this.form.get(col)?.setValue('');
        }
      }

      // Re-enable Advanced form controls (all Advanced mappings were just cleared above,
      // so these controls are no longer driven by a column — enable them for direct input)
      this.form.get('source_addr_ton')?.enable();
      this.form.get('source_addr_npi')?.enable();
      this.form.get('dest_addr_ton')?.enable();
      this.form.get('dest_addr_npi')?.enable();
      this.form.get('data_coding')?.enable();

      // When a column was mapped to an Advanced field, the control was disabled and set to null.
      // Re-enabling does not restore a value, so restore form defaults for any null controls.
      const advancedDefaults: { [key: string]: any } = {
        source_addr_ton: 1, source_addr_npi: 1,
        dest_addr_ton: 1, dest_addr_npi: 1, data_coding: 0
      };
      Object.entries(advancedDefaults).forEach(([key, def]) => {
        const ctrl = this.form.get(key);
        if (ctrl && (ctrl.value === null || ctrl.value === undefined)) {
          ctrl.setValue(def);
        }
      });
    }

    this.updateFilteredFields();
  }

  private updateFilteredFields(): void {
    if (this.showAdvancedSettings) {
      this.messageEventFieldsGrouped = this.allMessageEventFields;
    } else {
      this.messageEventFieldsGrouped = this.allMessageEventFields.filter(f => f.group === 'Basic');
    }
  }

  private getInitialBroadcast(): Broadcast {
    return {
      broadcast_id: 0,
      name: '',
      total_message: 0,
      network_id: 0,
      description: '',
      file_id: 0,
      status: '',
      request_dlr: false,
      column_mapping: {},
      first_record_mapping: "",
      sender_id: '',
      start_datetime: '',
      max_execution_datetime: '',
      message_template: '',
      comment: '',
      source_addr_ton: 0,
      source_addr_npi: 0,
      dest_addr_ton: 0,
      dest_addr_npi: 0,
      data_coding: 0,
      is_immediate: true,
    };
  }

  private resetBroadcastState(): void {
    this.broadcast = this.getInitialBroadcast();
    this.serviceProviderList = [];
  }

  private resetFileLabel(): void {
    const fileNameElement = document.getElementById('file-name');
    if (fileNameElement) fileNameElement.textContent = 'No file chosen';
  }

  async loadProviders() {
    const response = await this.routingService.getNetworks();
    if (response.status === 200) {
      this.serviceProviderList = response.data.filter((p: { protocol: string; type: string }) => p.protocol === 'HTTP' && p.type === 'sp');
    }
  }

  async loadMessageEventFields() {
    const response = await this.broadCastService.getMessageEventFields();
    if (response.status === 200 && Array.isArray(response.data)) {
      this.allMessageEventFields = response.data.flatMap(group =>
        group.fields.map((field: any) => ({
          key: field.key,
          label: field.label,
          group: group.group ?? 'General'
        }))
      );
      this.updateFilteredFields();
    }
  }

  async getTonCatalog() {
    const resp = await this.catalogService.getByCatalogType('toncatalog');
    if (resp.status == 200) {
      this.tonCatalog = resp.data;
    }
  }

  async getNpiCatalog() {
    const resp = await this.catalogService.getByCatalogType('npicatalog');
    if (resp.status == 200) {
      this.npiCatalog = resp.data;
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: ['', [Validators.required]],
      network_id: [null, [Validators.required]],
      description: [''],
      status: [false],
      request_dlr: [false],
      hasHeader: [false],
      selectedDelimiter: [','],
      column_mapping: [{}],
      sender_id: [{ value: this.getEffectiveSenderId().value, disabled: this.getEffectiveSenderId().isImmutable }],
      start_datetime: [''],
      max_execution_datetime: [''],
      message_template: [''],
      selectedVariable: [null],
      destination_addr: [''],
      comment: [''],
      source_addr_ton: [1],
      source_addr_npi: [1],
      dest_addr_ton: [1],
      dest_addr_npi: [1],
      data_coding: [0],
      is_immediate: [true],
      execution_hours: [1],
      execution_minutes: [0],
    });
  }

  private getFileExtension(filename: string): string {
    return filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';
  }

  handleFileChange(event: Event): void {
    this.columnMapping = {};
    this.fileColumns = [];
    this.filePreview = [];
    this.updateFile = false;

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return this.resetFileState();

    const file = input.files[0];
    const extension = this.getFileExtension(file.name);
    const allowed = environment.broadcastAllowedExtensions?.split(',').map(e => e.trim().toLowerCase()) || ['.csv', '.txt', '.xlsx'];

    if (!allowed.includes(extension)) {
      this.alertSvr.showAlert(2, 'Invalid file type', `Only the following file types are allowed: ${allowed.join(', ')}`);
      return this.resetFileState();
    }

    if (extension === '.xlsx') {
      this.form.get('selectedDelimiter')?.setValue(null);
      this.form.get('selectedDelimiter')?.disable();
    } else {
      this.form.get('selectedDelimiter')?.setValue(',');
      this.form.get('selectedDelimiter')?.enable();
    }

    this.fileName = file.name;
    this.updateFileLabel();
    this.uploadProgress = 0;
    this.isUploadingFile = true;
    this.simulateFileUpload();
    this.cdr.detectChanges();
  }

  private resetFileState(): void {
    this.fileName = null;
    this.uploadProgress = 0;
    this.isUploadingFile = false;
    this.form.get('hasHeader')?.setValue(false);
    this.form.get('selectedDelimiter')?.setValue(',');
    this.updateFileLabel();
  }

  simulateFileUpload(): void {
    const interval = setInterval(() => {
      this.uploadProgress += 20;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploadProgress = 100;
        this.isUploadingFile = false;
      }
    }, 150);
  }

  updateFileLabel(): void {
    const label = document.getElementById('file-label');
    const name = document.getElementById('file-name');
    if (this.fileName) {
      label?.classList.remove('disabled');
      if (name) name.textContent = this.fileName;
    } else {
      label?.classList.add('disabled');
      if (name) name.textContent = 'No file chosen';
    }
  }

  async analyzeFile(): Promise<void> {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput.files?.length) return;

    const file = fileInput.files[0];
    const hasHeader = this.form.get('hasHeader')?.value;
    const delimiterRaw = this.form.get('selectedDelimiter')?.value;
    const delimiter = delimiterRaw === '\\t' ? '\t' : delimiterRaw;

    this.spinnerSvr.showSpinner();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('hasHeader', hasHeader);
    formData.append('delimiter', delimiter);

    this.isUploadingFile = true;

    try {
      const response = await this.broadCastService.uploadFile(formData);
      const { status, data, message, comment }: ResponseI = response;
      if (status === 200) {
        const { id, columns } = data;
        this.broadcast.file_id = id;
        this.broadcast.first_record_mapping = columns || "";

        const parsed = JSON.parse(columns);

        this.fileColumns = Object.keys(parsed);
        this.filePreview = Object.values(parsed);

        this.columnMapping = {};
        this.fileColumns.forEach(col => {
          this.columnMapping[col] = '';
          if (!this.form.contains(col)) {
            this.form.addControl(col, this.fb.control(''));
          }
        });

        this.alertSvr.showAlert(1, 'Success', 'File uploaded successfully.');
      } else {
        this.alertSvr.showAlert(2, message, comment || 'File upload failed.');
        this.resetFileState();
      }
    } catch (error) {
      this.alertSvr.showAlert(2, 'Upload Error', 'An unexpected error occurred during file upload.');
      this.resetFileState();
    } finally {
      this.isUploadingFile = false;
      setTimeout(() => {
        this.spinnerSvr.hideSpinner();
      }, 500);
    }

    if (this.isEdit) this.updateFile = true;

    this.updateSelectMapping();
    this.cdr.detectChanges();
  }

  updateSelectMapping(): void {
    setTimeout(() => {
      const selects = document.querySelectorAll('select.form-select');

      selects.forEach((selectEl) => {
        const rowElement = selectEl.closest('tr');
        const columnName = rowElement?.querySelector('td')?.textContent?.trim();

        if (columnName && this.columnMapping[columnName]) {
          (selectEl as HTMLSelectElement).value = this.columnMapping[columnName];
        }
      });
    }, 100);
  }

  onMappingChange(value: any, column: string, position: number): void {
    const control = this.form.get(column);
    if (!control) return;

    if (value?.key) {
      const alreadyUsed = Object.entries(this.columnMapping).some(
        ([key, val]) => val === value?.key && key !== column
      );

      if (alreadyUsed) {
        this.alertSvr.showAlert(2, 'Mapping Conflict', `"${value?.key}" has already been assigned to another column.`);
        control.setValue('');
        this.columnMapping[column] = '';
        return;
      }

      this.columnMapping[column] = value?.key;
    } else {
      this.columnMapping[column] = '';
    }

  }

  insertVariable() {
    const current = this.form.get('message_template')?.value || '';
    const selectedVariable = this.form.get('selectedVariable')?.value;
    if (selectedVariable) {
      const variableTag = `{{${selectedVariable}}}`;
      this.form.get('message_template')?.setValue(current + variableTag);
      this.onMessageTemplateChange();
      this.form.get('selectedVariable')?.setValue(null);
    }
  }

  onMessageTemplateChange(): void {
    const template = this.form.get('message_template')?.value || '';
    let preview = template;

    const variableRegex = /{{\s*(\w+)\s*}}/g;
    preview = preview.replace(variableRegex, (match: any, variableName: string) => {
      const colIndex = this.fileColumns.findIndex(col => col === variableName);
      if (colIndex !== -1) {
        return this.filePreview[colIndex] || '';
      }
      return match;
    });

    this.messagePreview = preview;
  }

  onChangeSender() {
    const senderId = this.form.get('sender_id')?.value;
    if (senderId) {
      this.senderId = senderId;
    }
  }

  onExecutionTypeChange(): void {
    const is_immediate = this.form.get('is_immediate')?.value;
    this.form.get('execution_hours')?.setValue(1);
    this.form.get('execution_minutes')?.setValue(0);
    this.form.get('start_datetime')?.setValue(null);
    this.form.get('max_execution_datetime')?.setValue(null);

    if (is_immediate) {
      this.form.get('start_datetime')?.clearValidators();
      this.form.get('max_execution_datetime')?.clearValidators();
    } else {
      this.form.get('start_datetime')?.setValidators([Validators.required]);
      this.form.get('max_execution_datetime')?.setValidators([Validators.required]);
    }

    this.form.get('start_datetime')?.updateValueAndValidity();
    this.form.get('max_execution_datetime')?.updateValueAndValidity();
  }

  async save(): Promise<void> {
    if (!this.isFormValid()) return;

    const payload = this.form.value;

    const effectiveSenderId = this.validateAndGetSenderId();
    if (effectiveSenderId === null) {
      return;
    }
    payload.sender_id = effectiveSenderId;


    if (this.isEdit) payload.file_id = this.broadcast.file_id;
    else delete payload.status;

    delete payload.selectedDelimiter;
    delete payload.hasHeader;
    delete payload.selectedVariable;

    this.fileColumns.forEach(col => {
      if (!this.columnMapping[col]) {
        this.columnMapping[col] = '';
      }
    });

    payload.column_mapping = this.columnMapping;
    payload.first_record_mapping = this.broadcast.first_record_mapping || "";

    // validation of date and time fields
    if (this.form.get('is_immediate')?.value) {
      const hours = Number(this.form.get('execution_hours')?.value || 1);
      const minutes = Number(this.form.get('execution_minutes')?.value || 0);

      if (isNaN(hours) || isNaN(minutes) || (hours === 0 && minutes === 0)) {
        this.alertSvr.showAlert(2, 'Invalid Duration', 'Please enter a valid execution duration.');
        return;
      }

      const now = DateTime.local();
      const end = now.plus({ hours, minutes });

      payload.start_datetime = DateTimeUtil.toUtc0(now.toJSDate());
      payload.max_execution_datetime = DateTimeUtil.toUtc0(end.toJSDate());
    } else {
      const startInput = this.form.get('start_datetime')?.value;
      const maxInput = this.form.get('max_execution_datetime')?.value;

      if (!startInput || !maxInput) {
        this.alertSvr.showAlert(2, 'Missing Dates', 'Both start and max execution dates are required.');
        return;
      }

      const start = new Date(startInput);
      const max = new Date(maxInput);

      if (isNaN(start.getTime()) || isNaN(max.getTime())) {
        this.alertSvr.showAlert(2, 'Invalid Date Format', 'Please enter valid dates.');
        return;
      }

      const currentDate = new Date();
      if (start.getTime() < currentDate.getTime()) {
        this.alertSvr.showAlert(2, 'Invalid Dates', 'Start date must be greater than the current date.');
        return;
      }

      if (start.getTime() >= max.getTime()) {
        this.alertSvr.showAlert(2, 'Invalid Dates', 'Max execution date must be greater than start date.');
        return;
      }

      payload.start_datetime = DateTimeUtil.toUtc0(start);
      payload.max_execution_datetime = DateTimeUtil.toUtc0(max);
    }

    delete payload.execution_hours;
    delete payload.execution_minutes;

    payload.file_id = this.broadcast.file_id;

    if (typeof payload.network_id === 'string') {
      payload.network_id = parseInt(payload.network_id, 10);
    }

    if (this.isEdit) {
      if (this.broadcast.status !== 'DRAFT' && this.broadcast.status !== 'REJECTED' && this.broadcast.status !== 'CANCELED') {
        this.alertSvr.showAlert(2, 'Invalid Action', 'You can only edit broadcasts with status DRAFT, REJECTED or CANCELED.');
        return;
      }

      const resp = await this.broadCastService.updateBroadCast(payload.id, payload, this.updateFile);
      this.handleSaveResponse(resp);
    } else {
      const resp = await this.broadCastService.createBroadCast(payload);
      this.handleSaveResponse(resp);
    }
  }

  private validateAndGetSenderId(): string | null {
    const formSenderId = this.form.get('sender_id')?.value;

    if (!formSenderId) {
      this.alertSvr.showAlert(2, 'Sender Required', 'Please select a Sender ID from the dropdown.');
      return null;
    }

    return formSenderId;
  }

  private handleSaveResponse(resp: any): void {
    if (resp.status === 200) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
      this.router.navigate(['/pages/broadcast']);
    } else {
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }
  }

  private isFormValid(): boolean {
    if (this.form.invalid) return false;

    const isDestinationMapped = Object.values(this.columnMapping).includes('destinationAddr');
    if (!isDestinationMapped) {
      this.alertSvr.showAlert(2, 'Mapping Required', 'Please map at least the "Recipient" field.');
      return false;
    }

    const senderIdControl = this.form.get('sender_id');
    if (!senderIdControl?.value || String(senderIdControl.value).trim() === '') {
      this.alertSvr.showAlert(2, 'Sender Required', 'Please select a Sender ID from the dropdown.');
      return false;
    }

    if (!this.isEdit && !this.fileName) {
      this.alertSvr.showAlert(2, 'File required', 'Please select a file to upload.');
      return false;
    }

    return true;
  }

  validInput(name: string): boolean {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  async loadDataForm(data: any): Promise<void> {
    if (!data) {
      this.title = 'Create Broadcast SMS';
      this.disabled = true;
      this.resetFileLabel();
      return;
    }

    this.title = 'Edit Broadcast SMS';

    const dataResponse = await this.broadCastService.getBroadCastById(data.broadcast_id);
    if (dataResponse.status !== 200) {
      this.alertSvr.showAlert(2, dataResponse.message, dataResponse.comment);
      return;
    }

    this.broadcast = dataResponse.data.broadcast;
    const fileData = dataResponse.data?.file_data;
    const firstRecordMapping = dataResponse.data?.first_record_mapping;

    this.form.patchValue({
      id: data.broadcast_id,
      name: this.broadcast.name,
      network_id: this.broadcast.network_id,
      description: this.broadcast.description,
      status: this.broadcast.status,
      request_dlr: this.broadcast.request_dlr,
      sender_id: this.broadcast.sender_id,
      start_datetime: DateTimeUtil.toUtcFromLocal(this.broadcast.start_datetime),
      max_execution_datetime: DateTimeUtil.toUtcFromLocal(this.broadcast.max_execution_datetime),
      message_template: this.broadcast.message_template,
      source_addr_ton: this.broadcast.source_addr_ton,
      source_addr_npi: this.broadcast.source_addr_npi,
      dest_addr_ton: this.broadcast.dest_addr_ton,
      dest_addr_npi: this.broadcast.dest_addr_npi,
      data_coding: this.broadcast.data_coding,
      is_immediate: this.broadcast.is_immediate,
    });

    if (this.broadcast.sender_id && this.allowedSenderIds.includes(this.broadcast.sender_id)) {
      this.form.get('sender_id')?.setValue(this.broadcast.sender_id);
    }

    const fileNameElement = document.getElementById('file-name');
    if (fileNameElement) {

      fileNameElement.textContent = this.broadcast.file_id ? fileData?.filename : 'No file chosen';
      this.form.get('hasHeader')?.setValue(fileData?.hasHeader);
    }

    this.disabled = this.broadcast.status === 'COMPLETED' ? false : true;

    if (!this.broadcast.column_mapping) {
      this.broadcast.column_mapping = {};
    }

    this.columnMapping = { ...this.broadcast.column_mapping };

    this.showAdvancedSettings = Object.values(this.columnMapping).some(v =>
      this.ADVANCED_MAPPING_KEYS.includes(v as string)
    );
    this.updateFilteredFields();

    this.fileColumns = Object.keys(this.broadcast.column_mapping);

    this.fileColumns.forEach(col => {
      const initial = this.columnMapping[col] ?? '';
      if (!this.form.contains(col)) {
        this.form.addControl(col, this.fb.control(initial));
      } else {
        this.form.get(col)?.setValue(initial);
      }
    });

    if (firstRecordMapping) {
      this.senderId = this.form.get('sender_id')?.value || '';

    } else {
      this.filePreview = this.fileColumns.map(() => '');
    }

    this.updateSelectMapping();
    this.onMessageTemplateChange();

    if (
      this.broadcast.status === 'DRAFT' ||
      this.broadcast.status === 'REJECTED' ||
      this.broadcast.status === 'CANCELED' ||
      this.broadcast.status === 'FAILED'
    ) {
      this.showBtnEdit = true;
    } else {
      this.showBtnEdit = false;
    }
    this.cdr.detectChanges();
  }

  private updateFormControlBasedOnMapping(mappingKey: string, formKey: string, nullValue: any = null): void {
    const isMapped = Object.values(this.columnMapping).includes(mappingKey);
    const control = this.form.get(formKey);

    if (!control) return;

    if (isMapped) {
      control.disable();
      control.setValue(nullValue);
    } else {
      control.enable();
    }
  }

  isSendButtonEnabled(): boolean {
    const hasSenderId = !!this.form.get('sender_id')?.value;
    const hasDestinationAddr = !!this.form.get('destination_addr')?.value?.trim();
    return hasDestinationAddr && hasSenderId;
  }

  async sendTest() {

    if (!this.validateTechnicalFields()) return;

    const testData = await this.getTestingParameters();
    try {
      const response = await this.broadCastService.testBroadcast(testData);
      if (response.status === 200) {
        this.alertSvr.showAlert(1, 'Test Successful', 'The test message was sent successfully');
      } else {
        this.alertSvr.showAlert(2, 'Test Failed', response.message || 'Failed to send test message');
      }
    } catch (error) {
      this.alertSvr.showAlert(2, 'Test Failed', 'An error occurred while sending the test message');
    }
  }

  async getTestingParameters() {
    const networkId = this.form.get('network_id')?.value;
    const messageTemplate = this.form.get('message_template')?.value;
    const sourceAddr = this.form.get('sender_id')?.value;
    const destinationAddr = this.form.get('destination_addr')?.value;
    const sourceAddrTon = this.form.get('source_addr_ton')?.value;
    const sourceAddrNpi = this.form.get('source_addr_npi')?.value;
    const destinationAddrTon = this.form.get('dest_addr_ton')?.value;
    const destinationAddrNpi = this.form.get('dest_addr_npi')?.value;
    const dataCoding = this.form.get('data_coding')?.value;
    const requestDlr = this.form.get('request_dlr')?.value;

    const testColumnMappingData: { [key: string]: string } = {};
    const previewLength = Math.min(
      this.fileColumns.length,
      this.filePreview.length
    );

    for (let i = 0; i < previewLength; i++) {
      testColumnMappingData[this.fileColumns[i]] = this.filePreview[i];
    }

    const testColumnsMapping: { [key: string]: string } = {};
    for (let i = 0; i < this.fileColumns.length; i++) {
      const columnName = this.fileColumns[i];
      testColumnsMapping[columnName] = this.columnMapping[columnName] || '';
    }
    const result = {
      network_id: networkId,
      message_template: messageTemplate,
      source_addr: sourceAddr,
      destination_addr: destinationAddr,
      column_mapping: testColumnsMapping,
      column_mapping_data: testColumnMappingData,
      source_addr_ton: sourceAddrTon,
      source_addr_npi: sourceAddrNpi,
      dest_addr_ton: destinationAddrTon,
      dest_addr_npi: destinationAddrNpi,
      data_coding: dataCoding,
      request_dlr: requestDlr
    };
    return result;
  }

  private validateTechnicalFields(): boolean {
    const isSourceAddrTonMapped = Object.values(this.columnMapping).includes('sourceAddrTon');
    const isSourceAddrNpiMapped = Object.values(this.columnMapping).includes('sourceAddrNpi');
    const isDestinationAddrTonMapped = Object.values(this.columnMapping).includes('destAddrTon');
    const isDestinationAddrNpiMapped = Object.values(this.columnMapping).includes('destAddrNpi');
    const isDataCodingMapped = Object.values(this.columnMapping).includes('dataCoding');

    const checkField = (mapped: boolean, formKey: string, label: string): boolean => {
      const value = this.form.get(formKey)?.value;
      if (!mapped && (value === null || value === undefined || value === '')) {
        this.alertSvr.showAlert(2, `${label} Required`, `Please provide a value for ${label} or map it from the file.`);
        return false;
      }
      return true;
    };

    if (!checkField(isSourceAddrTonMapped, 'source_addr_ton', 'Source Address TON')) return false;
    if (!checkField(isSourceAddrNpiMapped, 'source_addr_npi', 'Source Address NPI')) return false;
    if (!checkField(isDestinationAddrTonMapped, 'dest_addr_ton', 'Destination Address TON')) return false;
    if (!checkField(isDestinationAddrNpiMapped, 'dest_addr_npi', 'Destination Address NPI')) return false;
    if (!checkField(isDataCodingMapped, 'data_coding', 'Data Coding')) return false;

    return true;
  }

  updateSenderIdField() {
    const effectiveSenderId = this.getEffectiveSenderId();
    if (this.form && effectiveSenderId.value) {
      this.form.get('sender_id')?.setValue(effectiveSenderId.value);
      this.onChangeSender();
    }
  }
}
