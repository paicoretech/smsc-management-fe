import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterpreterService } from '@app/core/services/interpreter.service';
import { AlertService } from '@app/core/utils/alert.service';
import { ChangeDetectorRef } from '@angular/core';
import { ResponseI, InterpreterHttpGateways } from '@core/index';
import * as xml2js from 'xml2js';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {
  @ViewChild('codeElement') codeElement!: ElementRef;
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    this.resetAccordions();
    if (value != null && value != undefined) {
      this.loadDataForm(value.interpreterEdit, value.disableControls);
    }
  }

  response!: ResponseI;
  messageEventType: String[] = [];
  dataTypeCatalog: any[] = [];
  httpGateways: InterpreterHttpGateways[] = [];
  public saveDisabled = false;
  public updateItemTitle = 'Edit Interpreter Settings';
  public viewItemTitle = 'Interpreter Settings';
  public form!: FormGroup;
  formTarget!: FormGroup;
  public template: string = '';
  public notTransformClicked: boolean = true;
  public activeProxy: boolean = false;
  public showPath: boolean = false;
  public title = this.updateItemTitle;

  public headerList: any[] = [];
  public headerListDelete: any[] = [];

  accordionA: boolean = false;
  accordionB: boolean = false;

  constructor(
    private fb: FormBuilder,
    private interpreterService: InterpreterService,
    private alertSvr: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.resetAccordions();
    this.loadHttpGateways();
    this.fieldsOnlyToRead();
  }

  private resetAccordions() {
    this.accordionA = true;
    this.accordionB = false;
  }

  initializeForm(): void {
    let direction = 'input';
    let body_type = 'JSON';

    this.form = this.fb.group({
      id: [undefined],
      event_type: ['message', [Validators.required]],
      direction: [direction, [Validators.required]],
      body_type: [body_type, [Validators.required]],
      template: ['', [Validators.required]],
      gateway_id: ['', [Validators.required]],
      use_proxy: [false, [Validators.required]],
      path: [''],
      default_template: [false],
      callback_headers_http: this.fb.array([this.initializeTarget()]),
    });

    this.onChangeBodyType({ target: { value: body_type } });
  }

  initializeTarget(): void {
    this.formTarget = this.fb.group({
      header_name: ['', [Validators.required]],
      header_value: ['', [Validators.required]],
    });
  }

  get isOutput(): boolean {
    return (
      (this.form?.get('direction')?.value || '').toLowerCase() === 'output'
    );
  }

  async loadHttpGateways() {
    this.response = await this.interpreterService.getHttpGateways();
    if (this.response.status == 200) {
      this.httpGateways = this.response.data;
    }
  }

  loadDataForm(data: any, disableControls: boolean): void {
    this.resetCommonVariable();

    if (data) {
      this.title = this.updateItemTitle;
      const use_proxy =
        data.direction === 'input' && data.event_type === 'message'
          ? data.use_proxy ?? false
          : false;

      this.form.reset({
        id: data.id == null || data.id == undefined ? '' : parseInt(data.id),
        event_type:
          data.event_type == null || data.event_type == undefined
            ? ''
            : data.event_type,
        direction:
          data.direction == null || data.direction == undefined
            ? ''
            : data.direction,
        body_type:
          data.body_type == null || data.body_type == undefined
            ? ''
            : data.body_type,
        template:
          data.template == null || data.template == undefined
            ? ''
            : data.template,
        gateway_id:
          data.gateway_id == null || data.gateway_id == undefined
            ? 0
            : data.gateway_id,
        use_proxy: use_proxy,
        path: data.path == null || data.path == undefined ? '' : data.path,
        default_template:
          data.default_template == null || data.default_template == undefined
            ? false
            : data.default_template,
      });

      if (
        data.template != null &&
        data.template !== undefined &&
        data.template.length > 0
      ) {
        this.transformPayload();
      }

      this.headerListDelete = [];
      if (
        data.callback_headers_http == null ||
        data.callback_headers_http == undefined
      ) {
        data.callback_headers_http = [];
      } else {
        this.headerList = data.callback_headers_http;
      }

      this.validateDirectionAndEventType(data.direction, data.event_type);
      this.onChangeDefaultTemplate({
        target: { checked: disableControls ? true : data.default_template },
      });
    }

    if (disableControls) {
      this.title = this.viewItemTitle;
      this.form.get('body_type')?.disable();
      this.form.get('template')?.disable();
      this.form.get('use_proxy')?.disable();
      this.form.get('path')?.disable();
      this.form.get('default_template')?.disable();
      this.formTarget.disable();  
      this.saveDisabled = true;
    }
  }

  async save() {
    if (this.form.invalid) {
      return;
    }

    let resp;
    this.form.get('path')?.enable();
    this.form.get('body_type')?.enable();
    let obj = this.form.value;
    obj.callback_headers_http = [];

    if (this.headerList.length > 0) {
      for (let index = 0; index < this.headerList.length; index++) {
        obj.callback_headers_http.push(this.headerList[index]);
      }
    }

    if (!this.validateKeyForDefaultTemplate()) {
      return;
    }

    resp = await this.interpreterService.updateInterpreter(obj);
    if (resp.status == 200) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
    } else {
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }

    if (resp.status == 200) {
      this.close();
    }
  }

  onChangeBodyType(event: any) {
    let value = event.target.value;

    setTimeout(() => {
      this.template = '';
      this.styleCodePrism(value);
      this.notTransformClicked = true;
      this.cdr.detectChanges();
    });
  }

  onTemplateChange(): void {
    this.notTransformClicked = true;
    this.template = '';
    this.styleCodePrism(this.form.get('body_type')?.value);
  }

  onChangeDefaultTemplate(event: any): void {
    const isChecked = event.target.checked;

    setTimeout(() => {
      if (isChecked) {
        this.form.get('path')?.disable();
        this.form.get('body_type')?.disable();
      } else {
        const direction = this.form.get('direction')?.value;
        const eventType = this.form.get('event_type')?.value;
        this.validateDirectionAndEventType(direction, eventType);

        this.form.get('body_type')?.enable();
        this.form.get('body_type')?.setValidators([Validators.required]);
        this.form.get('body_type')?.updateValueAndValidity();
      }
    });
  }

  validateDirectionAndEventType(direction: string, eventType: string): void {
    const isInput = direction === 'input';
    const isMessage = eventType === 'message';
    const isMessageOrDlr = (eventType === 'message' || eventType === 'dlr');

    setTimeout(() => {
      this.activeProxy = false;
      this.showPath = false;
      this.form.get('path')?.clearValidators();

      if (isInput && isMessage) {
        this.activeProxy = true;
      }

      if (isInput && isMessageOrDlr) {
        this.showPath = true;
        this.form.get('path')?.enable();
        this.form.get('path')?.setValidators([Validators.required]);
      }

      this.form.get('path')?.updateValueAndValidity();
    });
  }

  close(): void {
    this.form.reset();
    this.resetAccordions();
    this.initializeForm();
    this.initializeTarget();
    this.fieldsOnlyToRead();
    this.resetCommonVariable();
    this.closeModal.emit(true);
  }

  validInput(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['required']
    );
  }

  resetCommonVariable() {
    this.title = this.updateItemTitle;
    this.saveDisabled = false;
    this.template = '';
  }

  transformPayload() {
    let bodyType = '';
    try {
      bodyType = this.form.get('body_type')?.value;
      let dataTemplate = this.form.get('template')?.value;

      if (bodyType == 'JSON') {
        this.parseJson(dataTemplate);
      } else {
        this.parseXml(bodyType, dataTemplate);
      }

      this.styleCodePrism(bodyType);

      if (this.template.length > 0) {
        this.notTransformClicked = false;
      }

      return;
    } catch (e) {
      this.alertSvr.showAlert(2, 'Error parse ' + bodyType, e as string);
    }
    this.notTransformClicked = true;
  }

  parseJson(data: string): void {
    data = data.replace(/\n/g, '');
    const parsed = JSON.parse(data);
    let formattedJson = JSON.stringify(parsed, null, 2);
    this.template = formattedJson;
  }

  parseXml(bodyType: string, data: string) {
    xml2js.parseString(
      data,
      { explicitArray: false, trim: true },
      (err: any, result: any) => {
        if (err) {
          this.alertSvr.showAlert(4, 'Error parse ' + bodyType, err.message);
          return;
        }

        let parsedXml = result;
        const builder = new xml2js.Builder({
          renderOpts: {
            pretty: true,
            indent: '  ',
            newline: '\n',
          },
        });

        let formattedXml = builder.buildObject(parsedXml);
        this.template = formattedXml;
      }
    );
  }

  styleCodePrism(format: string) {
    setTimeout(() => {
      const htmlCode = Prism.highlight(
        this.template,
        Prism.languages[format.toLowerCase()],
        format.toLowerCase()
      );
      this.codeElement.nativeElement.innerHTML = htmlCode;
    }, 0);
  }

  fieldsOnlyToRead() {
    this.form.get('event_type')?.disable();
    this.form.get('direction')?.disable();
    this.form.get('gateway_id')?.disable();
  }

  validateKeyForDefaultTemplate(): boolean {
    const direction = this.form.get('direction')?.value;
    const event_type = this.form.get('event_type')?.value;
    const default_template = this.form.get('default_template')?.value;
    let response = true;

    if (direction === 'input' && default_template) {
      if (event_type === 'message') {
        response = this.validateKeyIntoStringTemplate('system_id');
        if (!response) {
          this.alertSvr.showAlert(
            2,
            'Key required for default template',
            'system_id was not found'
          );
        }
      } else if (event_type === 'dlr') {
        response = this.validateKeyIntoStringTemplate('message_id');
        if (!response) {
          this.alertSvr.showAlert(
            2,
            'Key required for default template',
            'message_id was not found'
          );
        }
      }
    }

    return response;
  }

  validateKeyIntoStringTemplate(key: string): boolean {
    const body_type: string = this.form.get('body_type')?.value;

    if (body_type.toUpperCase() == 'JSON') {
      try {
        return this.keyExistsInJson(JSON.parse(this.template), key);
      } catch (error) {
        this.alertSvr.showAlert(
          4,
          'Error parse JSON to find ' + key,
          key + ' was not found'
        );
      }
    } else if (body_type.toUpperCase() == 'XML') {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.template, 'application/xml');
        return this.keyExistsInXml(xmlDoc, key);
      } catch (error) {
        this.alertSvr.showAlert(
          4,
          'Error parse XML to find ' + key,
          key + ' was not found'
        );
      }
    }

    return false;
  }

  private keyExistsInJson(json: any, key: string): boolean {
    return key in json;
  }

  private keyExistsInXml(xmlDoc: Document, key: string): boolean {
    const element = xmlDoc.querySelector(key);
    return element !== null;
  }

  addHeader(): void {
    if (this.formTarget.invalid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill in the required fields');
      return;
    }

    let header = this.headerList.find(
      (x) =>
        x.header_name == this.formTarget.get('header_name')?.value &&
        x.header_value == this.formTarget.get('header_value')?.value
    );

    if (header) {
      this.alertSvr.showAlert(2, 'Error', 'The header already exists');
      return;
    }

    this.headerList.push(this.formTarget.value);
    this.initializeTarget();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
  }

  removeHeader(index: number): void {
    let item: any = this.headerList[index];
    item.action = 1;
    this.headerListDelete.push(item);
    this.headerList.splice(index, 1);
  }
}
