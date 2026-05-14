import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    ServiceProvidersService,
    AlertService,
    SettingServices,
    ResponseI,
    SmscSetting,
    convertToSmscSetting,
    SmppServerConfig,
    mergeWithBackup
} from '@app/core';

import { environment } from '@env/environment';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-add-http-sp',
    templateUrl: './add-http.component.html'
})
export class AddHttpSpComponent implements OnInit {

    title = '';
    newItemTitle = 'Create HTTP Service Provider'
    updateItemTitle = 'Edit HTTP Service Provider';
    form!: FormGroup;
    formTarget!: FormGroup;
    reponse!: ResponseI;
    smscSetting!: SmscSetting;
    smppServerConfig: SmppServerConfig[] = [];
    smppServerId: number = 0;
    isEdit = false;
    defaultValues = environment.ServiceProviderDefaults;
    network_id: number = 0;
    patternEmail = environment.PatternEmail;
    saveDisabled = false;
    showHeadersPanel = true; // Collapsible panel for headers
    headerPasswordVisible: boolean = false;
    headerPasswordFieldType: string = 'password';
    public headerList: any[] = [];
    public headerListDelete: any[] = [];
    showInputUser: boolean = false;
    showInputPass: boolean = false;
    showInputToken: boolean = false;
    showInputHeader: boolean = false;
    showCustomParamsPanel = true;
    public customParamsList: { key: string; value: string }[] = [];
    customParamKey: string = '';
    customParamValue: string = '';
    private originalData: any = {};

    constructor(
        private fb: FormBuilder,
        private serviceProvidersService: ServiceProvidersService,
        private alertSvr: AlertService,
        private settingServices: SettingServices,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.load();
        const navState = this.router.getCurrentNavigation()?.extras?.state
            ?? history.state;
        if (navState?.providerEdit != null) {
            this.loadDataForm(navState.providerEdit, navState.disableControls ?? false);
        } else {
            this.resetCommonVariable();
            this.initializeForm();
        }
    }

    load(): void {
        this.headerList = [];
        this.customParamsList = [];
        this.getSmppServers();
        this.getSmscSetting();
        this.initializeForm();
    }

    initializeForm(): void {
        let maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;
        let maxLengthPassword = environment.generalSettings.general.max_password_length || 9;

        this.form = this.fb.group({
            network_id: [{value: 0, disabled: true }, [Validators.required]],
            name: ['', [Validators.required]],
            system_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthSystemId),Validators.pattern(environment.PatternSystemId)]],
            password: [''], // No validators - will send empty string
            system_type: ['', [ Validators.minLength(0), Validators.maxLength(13), Validators.pattern('^[A-Za-z0-9 ]*$')]],
            interface_version: [this.defaultValues.interface_version],
            sessions_number: [this.defaultValues.sessions_number],
            address_ton: [this.defaultValues.address_ton],
            address_npi: [this.defaultValues.address_npi],
            bind_type: [this.defaultValues.bind_type],
            address_range: [''],
            balance_type: [this.defaultValues.balance_type],
            balance: [this.defaultValues.balance],
            tps: [this.defaultValues.tps, [Validators.required, Validators.min(-1), Validators.pattern('^-?[0-9]+$')]],
            validity: [this.defaultValues.validity],
            status: [this.defaultValues.status, [Validators.required]],
            enabled: [this.defaultValues.enabled, [Validators.required]],
            enquire_link_period: [this.defaultValues.enquire_link_period],
            pdu_timeout: [this.defaultValues.pdu_timeout],
            smpp_server_id: [this.smppServerId],
            contact_name: ['', [Validators.pattern('^[A-Za-z0-9 ]*$')]],
            email: ['', [Validators.pattern(this.patternEmail)]],
            phone_number: [ '', [Validators.pattern('^[0-9]*$')]],
            protocol: ['HTTP', [Validators.required]],
            callback_url: [''],
            authentication_types: ['Undefined', [Validators.required]],
            header_security_name: [''],
            token: [''],
            user_name: [''],
            passwd: [''],
            message_priority: [this.defaultValues.message_priority],
            callback_headers_http: this.fb.array([
                this.initializeTarget()
            ])
        });
        this.form.get('network_id')?.enable();

        this.applyAuthValidators(this.form.get('authentication_types')?.value);
    }

    initializeTarget(): void {
        this.formTarget = this.fb.group({
            header_name: ['', [Validators.required]],
            header_value: ['', [Validators.required]],
        });
    }

    async save() {
        if (this.form.invalid) {
            return
        }
        const formValue = this.form.getRawValue();
        let obj = mergeWithBackup(formValue, this.originalData);

        if (obj.tps === 0) {
            this.alertSvr.showAlert(2, 'Validation Error', 'TPS cannot be 0. Use -1 for unlimited or a positive number.');
            return;
        }

        obj.address_range = obj.address_range == '' ? this.defaultValues.address_range : obj.address_range;
        obj.password = '';
        obj.callback_headers_http = [];

        if (this.customParamsList.length > 0) {
            const paramsMap: { [key: string]: string } = {};
            this.customParamsList.forEach(p => paramsMap[p.key] = p.value);
            obj.custom_parameters = JSON.stringify(paramsMap);
        } else {
            obj.custom_parameters = null;
        }

        if (this.headerList.length > 0 ){
            for (let index = 0; index < this.headerList.length; index++) {
                obj.callback_headers_http.push(this.headerList[index]);
            }
        }

        delete obj.smpp_server_id;

        let resp;
        if (this.isEdit) {
            obj.network_id = this.network_id;
            resp = await this.serviceProvidersService.updateProvider(obj);
            if (resp.status == 200) {
                this.alertSvr.showAlert(1, resp.message, resp.comment);
            } else {
                this.alertSvr.showAlert(2, resp.message, resp.comment);
            }
        } else {
            delete obj.network_id;
            resp = await this.serviceProvidersService.createProvider(obj);
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

    async getSmscSetting() {
        this.reponse = await this.settingServices.getSmscSetting();
        if (this.reponse.status == 200) {
            this.smscSetting = convertToSmscSetting(this.reponse.data);

            if ( this.smscSetting?.max_system_id_length != undefined ) {
                this.form.get('system_id')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(this.smscSetting.max_system_id_length),Validators.pattern(environment.PatternSystemId)]);
            }
        }
    }

    async getSmppServers() {
        this.reponse = await this.settingServices.getSmppServerConfig();
        if (this.reponse.status == 200) {
            this.smppServerConfig = this.reponse.data;

            const defaultSmppServer = this.smppServerConfig.find((server: any) => server.is_default === true);
            if (defaultSmppServer) {
                this.smppServerId = defaultSmppServer.id;
            }
        }
    }

    loadDataForm(data: any, disableControls: boolean): void {
        this.resetCommonVariable();
        if (data !== null && data !== undefined) {
            this.title = this.updateItemTitle;
            this.isEdit = true;
            this.network_id = data.network_id;

            this.originalData = JSON.parse(JSON.stringify(data));

            this.form.reset({
                network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
                name: (data.name == null || data.name == undefined) ? '' : data.name,
                system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
                password: (data.password == null || data.password == undefined) ? '' : data.password,
                system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
                status: (data.status == null || data.status == undefined) ? '' : data.status,
                enabled: (data.enabled == null || data.enabled == undefined) ? false : data.enabled,
                contact_name: (data.contact_name == null || data.contact_name == undefined) ? this.defaultValues.contact_name : data.contact_name,
                email: (data.email == null || data.email == undefined) ? this.defaultValues.email : data.email,
                tps: (data.tps == null || data.tps == undefined) ? this.defaultValues.tps : data.tps,
                phone_number: (data.phone_number == null || data.phone_number == undefined) ? this.defaultValues.phone_number : data.phone_number,
                protocol: (data.protocol == null || data.protocol == undefined) ? this.defaultValues.protocol : data.protocol,
                callback_url: (data.callback_url == null || data.callback_url == undefined) ? '' : data.callback_url,
                authentication_types: (data.authentication_types == null || data.authentication_types == undefined) ? '' : data.authentication_types,
                header_security_name: (data.header_security_name == null || data.header_security_name == undefined) ? '' : data.header_security_name,
                token: (data.token == null || data.token == undefined) ? '' : data.token,
                user_name: (data.user_name == null || data.user_name == undefined) ? '' : data.user_name,
                passwd: (data.passwd == null || data.passwd == undefined) ? '' : data.passwd,
                message_priority: (data.message_priority == null || data.message_priority == undefined) ? this.defaultValues.message_priority : data.message_priority
            });

            this.form.get('network_id')?.disable();

            this.applyAuthValidators(data?.authentication_types, false);

            this.headerListDelete = [];
            if (data.callback_headers_http == null || data.callback_headers_http == undefined) {
                data.callback_headers_http = [];
            } else {
                this.headerList = data.callback_headers_http;
            }

            if (data.custom_parameters) {
                try {
                    const parsed: { [key: string]: string } = JSON.parse(data.custom_parameters);
                    this.customParamsList = Object.entries(parsed).map(([key, value]) => ({ key, value }));
                } catch {
                    this.customParamsList = [];
                }
            }
        }
        if (disableControls) {
            this.form.disable();
            this.saveDisabled = true;
        }
    }

    togglePasswordVisibility(whatPassword: String): void {
        this.headerPasswordVisible = !this.headerPasswordVisible;
        this.headerPasswordFieldType = this.headerPasswordVisible ? 'text' : 'password';
    }
    toggleHeadersPanel(): void {
        this.showHeadersPanel = !this.showHeadersPanel;
    }

    close(): void {
        this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
    }

    validInput(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
    }

    validMinLength(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
    }

    validMaxLength(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['maxlength'];
    }

    validMin(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
    }

    validMax(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['max'];
    }

    validPattern(name: string) {
        return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
    }

    getMinLength(name: string) {
        return this.form.get(name)?.errors?.['minlength']?.requiredLength;
    }

    getMaxLength(name: string) {
        return this.form.get(name)?.errors?.['maxlength']?.requiredLength;
    }

    getMin(name: string) {
        return this.form.get(name)?.errors?.['min']?.min;
    }

    getMax(name: string) {
        return this.form.get(name)?.errors?.['max']?.max;
    }

    getPatternMessage(name: string) {
        if (name === 'system_id') {
            return `The characters: ${environment.PatternSystemLabel} are not valid.`;
        } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern === this.patternEmail ) {
            return 'Invalid email';
        } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern === '^[A-Za-z0-9]*$') {
            return 'Only alphanumeric characters are allowed';
        } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
            return 'No spaces allowed';
        } else {
            return 'Only numbers are allowed';
        }
    }

    onSelectAuthenticationTypes(event: any) {
        let value = event.target.value;
        this.applyAuthValidators(value);
    }

    addHeader(): void {
        if (this.formTarget.invalid) {
            this.alertSvr.showAlert(2, 'Error', 'Please fill in the required fields');
            return
        }

        let header = this.headerList.find(x => x.header_name == this.formTarget.get('header_name')?.value && x.header_value == this.formTarget.get('header_value')?.value);

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

    addCustomParam(): void {
        const key = this.customParamKey.trim();
        const value = this.customParamValue.trim();

        if (!key || !value) {
            this.alertSvr.showAlert(2, 'Error', 'Both key and value are required');
            return;
        }

        if (this.customParamsList.find(p => p.key === key)) {
            this.alertSvr.showAlert(2, 'Error', 'A parameter with that key already exists');
            return;
        }

        this.customParamsList.push({ key, value });
        this.customParamKey = '';
        this.customParamValue = '';
    }

    removeCustomParam(index: number): void {
        this.customParamsList.splice(index, 1);
    }

    toggleCustomParamsPanel(): void {
        this.showCustomParamsPanel = !this.showCustomParamsPanel;
    }

    resetCommonVariable() {
        this.title = this.newItemTitle;
        this.isEdit = false;
        this.saveDisabled = false;
        this.customParamsList = [];
        this.customParamKey = '';
        this.customParamValue = '';
    }

    private applyAuthValidators(type: string, clearValues = true) {
        ['header_security_name', 'user_name', 'passwd', 'token'].forEach(ctrl => {
            this.form.get(ctrl)?.clearValidators();
            if (clearValues) {
                this.form.get(ctrl)?.setValue('');
            }
        });

        this.showInputUser = false;
        this.showInputPass = false;
        this.showInputToken = false;
        this.showInputHeader = false;

        if (type === 'Basic') {
            this.showInputUser = this.showInputPass = this.showInputHeader = true;
            this.form.get('user_name')?.setValidators([Validators.required]);
            this.form.get('passwd')?.setValidators([Validators.required]);
            this.form.get('header_security_name')?.setValidators([Validators.required]);
        } else if (type === 'Bearer' || type === 'Api-key') {
            this.showInputToken = this.showInputHeader = true;
            this.form.get('token')?.setValidators([Validators.required]);
            this.form.get('header_security_name')?.setValidators([Validators.required]);
        }

        this.cdr.detectChanges();
    }
}