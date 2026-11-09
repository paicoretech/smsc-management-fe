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


type SecurityAuthenticationType = 'Undefined' | 'Basic' | 'Bearer' | 'Api-key';

interface GeneratedSecurityToken {
    header_name: string;
    authentication_type: SecurityAuthenticationType;
    token: string;
}

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
    showHttpDlrHealthCheckConfig = environment.showHttpDlrHealthCheckConfig;
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

    readonly SECURITY_AUTH_TYPE_UNDEFINED: SecurityAuthenticationType = 'Undefined';
    readonly SECURITY_AUTH_TYPE_BASIC: SecurityAuthenticationType = 'Basic';
    readonly SECURITY_AUTH_TYPE_BEARER: SecurityAuthenticationType = 'Bearer';
    readonly SECURITY_AUTH_TYPE_API_KEY: SecurityAuthenticationType = 'Api-key';

    showGeneratedSecurityTokenPopup = false;
    generatedSecurityTokenHeaderName = '';
    generatedSecurityTokenAuthenticationType = '';
    generatedSecurityTokenValue = '';
    closeAfterGeneratedSecurityTokenPopup = false;

    private generatedSecurityTokenContext: {
        authenticationType: SecurityAuthenticationType;
        bearerExpirationSeconds?: number | null;
    } | null = null;

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
            http_dlr_health_check_enabled: [false],
            authentication_types: ['Undefined', [Validators.required]],
            header_security_name: [''],
            token: [''],
            user_name: [''],
            passwd: [''],
            message_priority: [this.defaultValues.message_priority],
            security_authentication_type: [this.SECURITY_AUTH_TYPE_UNDEFINED, [Validators.required]],
            basic_security_password: [''],
            bearer_token_expiration_seconds: [null],
            api_key_security_token: [{ value: '', disabled: true }],
            callback_headers_http: this.fb.array([
                this.initializeTarget()
            ])
        });

        this.form.get('network_id')?.enable();

        this.applyAuthValidators(this.form.get('authentication_types')?.value);
        this.applySecurityAuthValidators(this.form.get('security_authentication_type')?.value, false);
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
        if (!this.validateGeneratedTokenWhenSecurityTypeChanged()) {
            return;
        }
        const formValue = this.form.getRawValue();
        let obj = mergeWithBackup(formValue, this.originalData);
        // Preserve basic_security_password from form since WRITE_ONLY prevents it from being in originalData
        if (formValue.basic_security_password) {
            obj.basic_security_password = formValue.basic_security_password;
        }

        if (obj.tps === 0) {
            this.alertSvr.showAlert(2, 'Validation Error', 'TPS cannot be 0. Use -1 for unlimited or a positive number.');
            return;
        }

        // Take callback_url straight from the form since mergeWithBackup drops empty values and it is optional
        obj.callback_url = formValue.callback_url ?? '';
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
        obj = this.prepareSecurityAuthenticationPayload(obj);

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
            const generatedSecurityToken = this.extractGeneratedSecurityToken(resp);

        if (this.shouldShowBearerTokenPopupOnCreate(generatedSecurityToken)) {
            this.openGeneratedSecurityTokenPopup(generatedSecurityToken, true);
            return;
        }
            
            this.close();
        }
    }

    private shouldShowBearerTokenPopupOnCreate(generatedSecurityToken: GeneratedSecurityToken | null): generatedSecurityToken is GeneratedSecurityToken {
        return !this.isEdit
            && this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_BEARER
            && generatedSecurityToken?.authentication_type === this.SECURITY_AUTH_TYPE_BEARER
            && !!generatedSecurityToken.token;
    }

    private extractGeneratedSecurityToken(resp: any): GeneratedSecurityToken | null {
        const generatedSecurityToken = resp?.data?.generated_security_token
            ?? resp?.generated_security_token
            ?? resp?.data
            ?? null;

        if (!generatedSecurityToken?.token) {
            return null;
        }

        return {
            header_name: generatedSecurityToken.header_name ?? '',
            authentication_type: this.normalizeSecurityAuthenticationType(
                generatedSecurityToken.authentication_type
            ),
            token: generatedSecurityToken.token,
        };
    }

    private openGeneratedSecurityTokenPopup(generatedSecurityToken: GeneratedSecurityToken, closeAfterPopup: boolean): void {
        this.generatedSecurityTokenHeaderName = generatedSecurityToken.header_name ?? '';
        this.generatedSecurityTokenAuthenticationType = generatedSecurityToken.authentication_type ?? '';
        this.generatedSecurityTokenValue = generatedSecurityToken.token ?? '';
        this.closeAfterGeneratedSecurityTokenPopup = closeAfterPopup;
        this.showGeneratedSecurityTokenPopup = true;

        this.cdr.detectChanges();
    }

    closeGeneratedSecurityTokenPopup(): void {
        const shouldClosePage = this.closeAfterGeneratedSecurityTokenPopup;

        this.showGeneratedSecurityTokenPopup = false;
        this.generatedSecurityTokenHeaderName = '';
        this.generatedSecurityTokenAuthenticationType = '';
        this.generatedSecurityTokenValue = '';
        this.closeAfterGeneratedSecurityTokenPopup = false;

        if (shouldClosePage) {
            this.close();
        }
    }

    copyGeneratedSecurityToken(): void {
        if (!this.generatedSecurityTokenValue) {
            return;
        }

        navigator.clipboard.writeText(this.generatedSecurityTokenValue);
        this.alertSvr.showAlert(1, 'Copied', 'Security token copied to clipboard');
    }

    async generateSecurityToken(): Promise<void> {
        if (!this.isEdit || !this.network_id) {
            return;
        }

        const securityType = this.securityAuthenticationType;

        if (
            securityType !== this.SECURITY_AUTH_TYPE_BEARER &&
            securityType !== this.SECURITY_AUTH_TYPE_API_KEY
        ) {
            this.alertSvr.showAlert(2, 'Warning', 'Security token generation is only supported for Bearer or Api-key authentication.'
            );
            return;
        }

        if (
            securityType === this.SECURITY_AUTH_TYPE_BEARER &&
            this.form.get('bearer_token_expiration_seconds')?.invalid
        ) {
            this.form.get('bearer_token_expiration_seconds')?.markAsTouched();
            return;
        }

        if (securityType === this.SECURITY_AUTH_TYPE_BEARER && !this.canGenerateSecurityToken) {
            this.form.get('bearer_token_expiration_seconds')?.markAsTouched();

            this.alertSvr.showAlert(2, 'Warning', 'Expiration seconds are required to generate a Bearer token.');

            return;
        }

        const request = this.buildGenerateSecurityTokenRequest(securityType);

        const resp = await this.serviceProvidersService.generateServiceProviderSecurityToken(
            this.network_id,
            request
        );

        if (resp.status !== 200) {
            this.alertSvr.showAlert(2, resp.message, resp.comment);
            return;
        }

        const generatedSecurityToken = this.extractGeneratedSecurityToken(resp);

        if (!generatedSecurityToken) {
            this.alertSvr.showAlert(2, 'Warning', 'Token was generated, but the response did not include a valid token.');
            return;
        }

        if (generatedSecurityToken.authentication_type === this.SECURITY_AUTH_TYPE_API_KEY) {
            this.form.get('api_key_security_token')?.setValue(generatedSecurityToken.token, { emitEvent: false });
        }
        this.generatedSecurityTokenContext = {
            authenticationType: generatedSecurityToken.authentication_type,
            bearerExpirationSeconds: generatedSecurityToken.authentication_type === this.SECURITY_AUTH_TYPE_BEARER
                ? Number(this.form.get('bearer_token_expiration_seconds')?.value)
                : null,
        };

        this.openGeneratedSecurityTokenPopup(generatedSecurityToken, false);
        this.alertSvr.showAlert(1, resp.message, resp.comment);
    }

    get canGenerateSecurityToken(): boolean {
        if (!this.isEdit || this.saveDisabled) {
            return false;
        }

        if (this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_API_KEY) {
            return true;
        }

        if (this.securityAuthenticationType !== this.SECURITY_AUTH_TYPE_BEARER) {
            return false;
        }

        const expirationControl = this.form?.get('bearer_token_expiration_seconds');

        return !!expirationControl
            && expirationControl.valid
            && expirationControl.value !== null
            && expirationControl.value !== undefined
            && expirationControl.value !== '';
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
                http_dlr_health_check_enabled: (data.http_dlr_health_check_enabled == null || data.http_dlr_health_check_enabled == undefined) ? false : data.http_dlr_health_check_enabled,
                authentication_types: (data.authentication_types == null || data.authentication_types == undefined) ? '' : data.authentication_types,
                header_security_name: (data.header_security_name == null || data.header_security_name == undefined) ? '' : data.header_security_name,
                token: (data.token == null || data.token == undefined) ? '' : data.token,
                user_name: (data.user_name == null || data.user_name == undefined) ? '' : data.user_name,
                passwd: (data.passwd == null || data.passwd == undefined) ? '' : data.passwd,
                message_priority: (data.message_priority == null || data.message_priority == undefined) ? this.defaultValues.message_priority : data.message_priority,
                security_authentication_type: this.normalizeSecurityAuthenticationType(data.security_authentication_type),
                basic_security_password: '',
                bearer_token_expiration_seconds: (data.bearer_token_expiration_seconds == null || data.bearer_token_expiration_seconds == undefined)
                    ? null
                    : data.bearer_token_expiration_seconds,

                api_key_security_token: (data.api_key_security_token == null || data.api_key_security_token == undefined)
                    ? ''
                    : data.api_key_security_token,
            });

            this.form.get('network_id')?.disable();

            this.applyAuthValidators(data?.authentication_types, false);
            this.applySecurityAuthValidators(data?.security_authentication_type, false);
            
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

    get securityAuthenticationType(): SecurityAuthenticationType {
        return this.normalizeSecurityAuthenticationType(
            this.form?.get('security_authentication_type')?.value
        );
    }

    get showSecurityBasicPassword(): boolean {
        return this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_BASIC;
    }

    get showSecurityBearerExpiration(): boolean {
        return this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_BEARER;
    }

    get showSecurityApiKeyToken(): boolean {
        return this.isEdit && this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_API_KEY;
    }

    get showSecurityGenerateTokenButton(): boolean {
        return this.isEdit
            && !this.saveDisabled
            && (
                this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_BEARER
                || this.securityAuthenticationType === this.SECURITY_AUTH_TYPE_API_KEY
            );
    }


    onSelectSecurityAuthenticationType(event: any): void {
        this.generatedSecurityTokenContext = null;
        this.applySecurityAuthValidators(event.target.value);
    }

    private applySecurityAuthValidators(type: string, clearValues = true): void {
        const securityType = this.normalizeSecurityAuthenticationType(type);

        const basicPasswordControl = this.form.get('basic_security_password');
        const bearerExpirationControl = this.form.get('bearer_token_expiration_seconds');

        basicPasswordControl?.clearValidators();
        bearerExpirationControl?.clearValidators();

        if (clearValues) {
            basicPasswordControl?.setValue('');
            bearerExpirationControl?.setValue(null);
        }

        if (securityType === this.SECURITY_AUTH_TYPE_BASIC) {
            /*
            * On create, Basic security password is required.
            * On edit, do not force it because backend may not return the real password.
            */
            if (!this.isEdit) {
                basicPasswordControl?.setValidators([Validators.required]);
            }
        }

        if (securityType === this.SECURITY_AUTH_TYPE_BEARER) {
            bearerExpirationControl?.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.pattern('^[0-9]+$'),
            ]);
        }

        this.form.get('security_authentication_type')?.setValue(securityType, { emitEvent: false });

        basicPasswordControl?.updateValueAndValidity({ emitEvent: false });
        bearerExpirationControl?.updateValueAndValidity({ emitEvent: false });

        this.cdr.detectChanges();
    }

    private normalizeSecurityAuthenticationType(type: string | null | undefined): SecurityAuthenticationType {
        if (type === this.SECURITY_AUTH_TYPE_BASIC) {
            return this.SECURITY_AUTH_TYPE_BASIC;
        }

        if (type === this.SECURITY_AUTH_TYPE_BEARER) {
            return this.SECURITY_AUTH_TYPE_BEARER;
        }

        if (type === this.SECURITY_AUTH_TYPE_API_KEY) {
            return this.SECURITY_AUTH_TYPE_API_KEY;
        }

        return this.SECURITY_AUTH_TYPE_UNDEFINED;
    }

    private prepareSecurityAuthenticationPayload(obj: any): any {
        const securityType = this.normalizeSecurityAuthenticationType(obj.security_authentication_type);
        obj.security_authentication_type = securityType;

        if (securityType === this.SECURITY_AUTH_TYPE_UNDEFINED) {
            obj.basic_security_password = null;
            obj.bearer_token_expiration_seconds = null;

            delete obj.api_key_security_token;

            return obj;
        }

        if (securityType === this.SECURITY_AUTH_TYPE_BASIC) {
            obj.token = '';
            obj.bearer_token_expiration_seconds = null;


            delete obj.api_key_security_token;


            if (this.isEdit && !obj.basic_security_password && this.originalData?.basic_security_password) {
                delete obj.basic_security_password;
            }

            return obj;
        }

        if (securityType === this.SECURITY_AUTH_TYPE_BEARER) {
            obj.basic_security_password = null;


            delete obj.api_key_security_token;

            return obj;
        }

        if (securityType === this.SECURITY_AUTH_TYPE_API_KEY) {
            obj.basic_security_password = null;
            obj.bearer_token_expiration_seconds = null;

            delete obj.api_key_security_token;

            return obj;
        }

        return obj;
    }

    private buildGenerateSecurityTokenRequest(securityType: SecurityAuthenticationType): {
        security_authentication_type: string;
        bearer_token_expiration_seconds?: number | null;
    } {
        const request: {
            security_authentication_type: string;
            bearer_token_expiration_seconds?: number | null;
        } = {
            security_authentication_type: securityType
        };

        if (securityType === this.SECURITY_AUTH_TYPE_BEARER) {
            request.bearer_token_expiration_seconds =
                this.form.get('bearer_token_expiration_seconds')?.value;
        }

        return request;
    }

    private validateGeneratedTokenWhenSecurityTypeChanged(): boolean {
        if (!this.isEdit) {
            return true;
        }

        const originalSecurityType = this.normalizeSecurityAuthenticationType(
            this.originalData?.security_authentication_type
        );

        const currentSecurityType = this.securityAuthenticationType;

        const changedToTokenBasedSecurity =
            originalSecurityType !== currentSecurityType &&
            (
                currentSecurityType === this.SECURITY_AUTH_TYPE_BEARER ||
                currentSecurityType === this.SECURITY_AUTH_TYPE_API_KEY
            );

        if (!changedToTokenBasedSecurity) {
            return true;
        }

        if (!this.generatedSecurityTokenContext) {
            this.alertSvr.showAlert(2, 'Validation Error', `Please generate the ${currentSecurityType} token before saving this change.`);
            return false;
        }

        if (this.generatedSecurityTokenContext.authenticationType !== currentSecurityType) {
            this.alertSvr.showAlert(2, 'Validation Error', `Please generate the ${currentSecurityType} token before saving this change.`);
            return false;
        }

        if (currentSecurityType === this.SECURITY_AUTH_TYPE_BEARER) {
            const currentExpirationSeconds = Number(this.form.get('bearer_token_expiration_seconds')?.value);

            if (this.generatedSecurityTokenContext.bearerExpirationSeconds !== currentExpirationSeconds) {
                this.alertSvr.showAlert(2, 'Validation Error', 'Please generate the Bearer token again after changing the expiration seconds.');
                return false;
            }
        }

        return true;
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