import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    CatalogService,
    ServiceProvidersService,
    AlertService,
    SettingServices,
    Catalog,
    ResponseI,
    SmscSetting,
    convertToSmscSetting,
    SmppServerConfig
} from '@app/core';

import { environment } from '@env/environment';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-add-smpp-sp',
    templateUrl: './add-smpp.component.html'
})
export class AddSmppSpComponent implements OnInit {

    title = '';
    newItemTitle = 'Create Service Provider'
    updateItemTitle = 'Edit Service Provider';
    form!: FormGroup;
    reponse!: ResponseI;
    catalogStatus: Catalog[] = [];
    catalogInterfaces: Catalog[] = [];
    catalogBalanceTypes: Catalog[] = [];
    tonCatalog: Catalog[] = [];
    npiCatalog: Catalog[] = [];
    bindTypes: Catalog[] = [];
    smscSetting!: SmscSetting;
    smppServerConfig: SmppServerConfig[] = [];
    smppServerId: number = 0;
    isEdit = false;
    defaultValues = environment.ServiceProviderDefaults;
    network_id: number = 0;
    patternEmail = environment.PatternEmail;
    saveDisabled = false;
    password: string = '';
    spPasswordVisible: boolean = false;
    spPasswordFieldType: string = 'password';
    headerPasswordVisible: boolean = false;
    headerPasswordFieldType: string = 'password';

    public headerList: any[] = [];
    public headerListDelete: any[] = [];

    constructor(
        private fb: FormBuilder,
        private serviceProvidersService: ServiceProvidersService,
        private alertSvr: AlertService,
        private settingServices: SettingServices,
        private catalogService: CatalogService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.load();

        // Read state passed via router navigation (mirror of HTTP component)
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
        this.getCatalogInterfaces();
        this.getCatalogBalanceTypes();
        this.getTonCatalog();
        this.getNpiCatalog();
        this.getBindTypes();
        this.getSmppServers();
        this.initializeForm();
        this.getSmscSetting();
    }

    initializeForm(): void {
        let maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;
        let maxLengthPassword = environment.generalSettings.general.max_password_length || 9;

        this.form = this.fb.group({
            network_id: [{value: 0, disabled: true }, [Validators.required]],
            name: ['', [Validators.required]],
            system_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthSystemId),Validators.pattern(environment.PatternSystemId)]],
            password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthPassword)]],
            system_type: ['', [ Validators.minLength(0), Validators.maxLength(13), Validators.pattern('^[A-Za-z0-9 ]*$')]],
            interface_version: [this.defaultValues.interface_version, [Validators.required]],
            sessions_number: [this.defaultValues.sessions_number, [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern('^[0-9]*$')]],
            address_ton: [this.defaultValues.address_ton, [Validators.required, Validators.pattern('^[0-9]*')]],
            address_npi: [this.defaultValues.address_npi, [Validators.required, Validators.pattern('^[0-9]*')]],
            bind_type: [this.defaultValues.bind_type, [Validators.required]],
            address_range: [''],
            balance_type: [this.defaultValues.balance_type, [Validators.required]],
            balance: [this.defaultValues.balance, [Validators.required, Validators.pattern('^[0-9]*$')]],
            tps: [this.defaultValues.tps, [Validators.required, Validators.min(-1), Validators.pattern('^-?[0-9]+$')]],
            validity: [this.defaultValues.validity, [Validators.required, Validators.pattern('^[0-9]*$')]],
            status: [this.defaultValues.status, [Validators.required]],
            enabled: [this.defaultValues.enabled, [Validators.required]],
            enquire_link_period: [this.defaultValues.enquire_link_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
            pdu_timeout: [this.defaultValues.pdu_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
            smpp_server_id: [this.smppServerId, [Validators.required]],
            contact_name: ['', [Validators.pattern('^[A-Za-z0-9 ]*$')]],
            email: ['', [Validators.pattern(this.patternEmail)]],
            phone_number: [ '', [Validators.pattern('^[0-9]*$')]],
            protocol: ['SMPP', [Validators.required]],
            callback_url: [''],
            authentication_types: [''],
            header_security_name: [''],
            token: [''],
            user_name: [''],
            passwd: [''],
            callback_headers_http: [],
            message_priority: [this.defaultValues.message_priority]
        });
        this.form.get('network_id')?.enable();
    }

    async save() {
        if (this.form.invalid) {
            return
        }
        let obj = this.form.value;

        if (obj.tps === 0) {
            this.alertSvr.showAlert(2, 'Validation Error', 'TPS cannot be 0. Use -1 for unlimited or a positive number.');
            return;
        }

        obj.address_range = obj.address_range == '' ? this.defaultValues.address_range : obj.address_range;
        obj.callback_headers_http = [];

        if (obj.protocol === 'SMPP') {
            obj.authentication_types = "Undefined";
        } else {
            if (this.headerList.length > 0 ){
                for (let index = 0; index < this.headerList.length; index++) {
                    obj.callback_headers_http.push(this.headerList[index]);
                }
            }

            delete obj.smpp_server_id;
        }

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

            if ( this.smscSetting?.max_password_length != undefined ) {
                this.form.get('password')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(this.smscSetting.max_password_length)]);
            }
        }
    }

    async getCatalogStatus() {
        this.reponse = await this.catalogService.getByCatalogType('bindstatuses');
        if (this.reponse.status == 200) {
            this.catalogStatus = this.reponse.data;
        }
    }

    async getCatalogInterfaces() {
        this.reponse = await this.catalogService.getByCatalogType('interfazversion');
        if (this.reponse.status == 200) {
            this.catalogInterfaces = this.reponse.data;
        }
    }

    async getCatalogBalanceTypes() {
        this.reponse = await this.catalogService.getByCatalogType('balancetype');

        if (this.reponse.status == 200) {
            this.catalogBalanceTypes = this.reponse.data;
        }
    }

    async getTonCatalog() {
        this.reponse = await this.catalogService.getByCatalogType('toncatalog');

        if (this.reponse.status == 200) {
            this.tonCatalog = this.reponse.data;
        }
    }

    async getNpiCatalog() {
        this.reponse = await this.catalogService.getByCatalogType('npicatalog');
        if (this.reponse.status == 200) {
            this.npiCatalog = this.reponse.data;
        }
    }

    async getBindTypes() {
        this.reponse = await this.catalogService.getByCatalogType('bindtypes');
        if (this.reponse.status == 200) {
            this.bindTypes = this.reponse.data.filter((obj: any) => obj.useSp !== false);
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
            this.form.reset({
                network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
                name: (data.name == null || data.name == undefined) ? '' : data.name,
                system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
                password: (data.password == null || data.password == undefined) ? '' : data.password,
                system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
                interface_version: (data.interface_version == null || data.interface_version == undefined) ? '' : data.interface_version,
                sessions_number: (data.sessions_number == null || data.sessions_number == undefined) ? '' : data.sessions_number,
                address_ton: (data.address_ton == null || data.address_ton == undefined) ? '' : data.address_ton,
                address_npi: (data.address_npi == null || data.address_npi == undefined) ? '' : data.address_npi,
                address_range: (data.address_range == null || data.address_range == undefined) ? '' : data.address_range,
                balance_type: (data.balance_type == null || data.balance_type == undefined) ? '' : data.balance_type,
                bind_type: (data.bind_type == null || data.bind_type == undefined) ? '' : data.bind_type,
                balance: (data.balance == null || data.balance == undefined) ? '' : data.balance,
                tps: (data.tps == null || data.tps == undefined) ? 1 : data.tps,
                validity: (data.validity == null || data.validity == undefined) ? '' : data.validity,
                status: (data.status == null || data.status == undefined) ? '' : data.status,
                enabled: (data.enabled == null || data.enabled == undefined) ? false : data.enabled,
                enquire_link_period: (data.enquire_link_period == null || data.enquire_link_period == undefined) ? '' : data.enquire_link_period,
                pdu_timeout: (data.pdu_timeout == null || data.pdu_timeout == undefined) ? '' : data.pdu_timeout,
                smpp_server_id: (data.smpp_server_id == null || data.smpp_server_id == undefined) ? this.smppServerId : data.smpp_server_id,
                contact_name: (data.contact_name == null || data.contact_name == undefined) ? this.defaultValues.contact_name : data.contact_name,
                email: (data.email == null || data.email == undefined) ? this.defaultValues.email : data.email,
                phone_number: (data.phone_number == null || data.phone_number == undefined) ? this.defaultValues.phone_number : data.phone_number,
                protocol: (data.protocol == null || data.protocol == undefined) ? this.defaultValues.protocol : data.protocol,
                message_priority: (data.message_priority == null || data.message_priority == undefined) ? this.defaultValues.message_priority : data.message_priority,
                token: ''
            });

            this.form.get('network_id')?.disable();

            this.form.get('smpp_server_id')?.setValidators([Validators.required]);

        }
        if (disableControls) {
            this.form.disable();
            this.saveDisabled = true;
        }
    }

    togglePasswordVisibility(whatPassword: String): void {
        if(whatPassword.toLowerCase() == "sp") {
            this.spPasswordVisible = !this.spPasswordVisible;
            this.spPasswordFieldType = this.spPasswordVisible ? 'text' : 'password';
        } else {
            this.headerPasswordVisible = !this.headerPasswordVisible;
            this.headerPasswordFieldType = this.headerPasswordVisible ? 'text' : 'password';
        }
    }

    // Mirror of HTTP component: navigate back using ActivatedRoute
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

    resetCommonVariable() {
        this.title = this.newItemTitle;
        this.isEdit = false;
        this.saveDisabled = false;
    }
}