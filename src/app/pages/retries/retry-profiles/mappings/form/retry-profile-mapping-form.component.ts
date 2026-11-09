import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, Network, RetryMappingCondition, RetryProfileMapping, RetryProfileMappingPayload, RoutingRolesService } from '@app/core';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { RetriesService } from '@app/core/services/retry.service';
import { FormArrayTableColumn } from '@app/shared/components/form-array-table/form-array-table.component';
import { Subscription } from 'rxjs';
import { buildRetryMappingProfileSection, RETRY_MAPPING_PROTOCOL_OPTIONS, RETRY_MESSAGE_EVENT_FIELD_OPTIONS, RETRY_PROPERTY_MATCHER_COLUMNS } from '../../../config/retry-profile-mapping-form-config';

@Component({
    selector: 'app-retry-profile-mapping-form',
    templateUrl: './retry-profile-mapping-form.component.html',
})
export class RetryProfileMappingFormComponent implements OnInit, OnDestroy {

    form: FormGroup;
    retryMappingId: number | null = null;

    networkOptions: FormFieldOption[] = [
        {
            label: 'Select Network',
            value: null,
        },
    ];

    profileOptions: FormFieldOption[] = [
        {
            label: 'Select Retry Profile',
            value: null,
        },
    ];

    networks: Network[] = [];
    profileSectionConfig: FormSectionConfig;
    protocolOptions: FormFieldOption[] = RETRY_MAPPING_PROTOCOL_OPTIONS;
    propertyMatcherColumns: FormArrayTableColumn[] = RETRY_PROPERTY_MATCHER_COLUMNS;

    isLoading = false;
    isSaving = false;
    isModified = false;
    showValidationMessage = false;

    private readonly dirtyTracker = new FormDirtyTracker();
    private readonly selectionSubs = new Subscription();
    private readonly matcherTypeSubs = new Map<FormGroup, Subscription>();
    private dirtySub?: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private alertService: AlertService,
        private retriesService: RetriesService,
        private routingRolesService: RoutingRolesService,
    ) {
        this.form = this.formBuilder.group({
            originNetworkId: [null],
            destinationNetworkId: [null],
            errorCodes: ['', [Validators.required, Validators.pattern(/^\s*(?:0[xX][0-9a-fA-F]+|\d+)\s*(?:,\s*(?:0[xX][0-9a-fA-F]+|\d+)\s*)*$/)]],
            originProtocol: [null],
            destinationProtocol: [null],
            propertyMatchers: this.formBuilder.array([]),
            retryProfileId: [null, Validators.required],
        });

        this.profileSectionConfig = buildRetryMappingProfileSection(this.profileOptions);
        this.configureNetworkProtocolControls('originNetworkId', 'originProtocol', 'Origin');
        this.configureNetworkProtocolControls('destinationNetworkId', 'destinationProtocol', 'Destination');
    }

    ngOnInit(): void {
        this.dirtySub = this.dirtyTracker.isModified$.subscribe((value) => {
            this.isModified = value;
        });

        this.initialize();
    }

    ngOnDestroy(): void {
        this.dirtySub?.unsubscribe();
        this.selectionSubs.unsubscribe();
        this.matcherTypeSubs.forEach((subscription) => subscription.unsubscribe());
        this.dirtyTracker.destroy();
    }

    get propertyMatchers(): FormArray {
        return this.form.get('propertyMatchers') as FormArray;
    }

    get isEdit(): boolean {
        return this.retryMappingId !== null;
    }

    get pageTitle(): string {
        return this.isEdit ? 'Edit Routing Retry Profile' : 'Create Routing Retry Profile';
    }

    get submitButtonText(): string {
        if (this.isSaving) {
            return 'Saving...';
        }

        return this.isEdit ? 'Update' : 'Create';
    }

    get canSubmit(): boolean {
        return this.form.valid && (!this.isEdit || this.isModified) && !this.isLoading && !this.isSaving;
    }

    addPropertyMatcher(matcher?: Partial<RetryMappingCondition>): void {
        const row = this.formBuilder.group({
            type: [matcher?.type || (matcher?.field ? this.getMatcherType(matcher.field) : null), Validators.required],
            field: [matcher?.field || '', Validators.required],
            operator: [matcher?.operator || null, Validators.required],
            value: [matcher?.value || '', Validators.required],
        });

        this.propertyMatchers.push(row);
        this.matcherTypeSubs.set(row, row.get('type')!.valueChanges.subscribe(() => {
            row.get('field')?.setValue('', { emitEvent: false });
        }));
    }

    removePropertyMatcher(index: number): void {
        const row = this.propertyMatchers.at(index) as FormGroup;
        this.matcherTypeSubs.get(row)?.unsubscribe();
        this.matcherTypeSubs.delete(row);
        this.propertyMatchers.removeAt(index);
    }

    async save(): Promise<void> {
        if (this.form.invalid || (this.isEdit && !this.isModified) || this.isSaving) {
            this.showValidationMessage = true;
            this.form.markAllAsTouched();
            return;
        }

        this.showValidationMessage = false;
        this.isSaving = true;

        try {
            const payload = this.buildPayload();
            const response = this.isEdit
                ? await this.retriesService.updateMapping(this.retryMappingId as number, payload)
                : await this.retriesService.createMapping(payload);

            if (response.status !== 200 && response.status !== 201) {
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.alertService.showAlert(1, response.message, response.comment);
            this.goBack();
        } catch {
            this.alertService.showAlert(4, 'Error', `Unable to ${this.isEdit ? 'update' : 'create'} the routing retry profile`);
        } finally {
            this.isSaving = false;
        }
    }

    goBack(): void {
        this.router.navigate(['/pages/retries/routing-retry-profiles']);
    }

    private async initialize(): Promise<void> {
        this.resolveRoute();
        await Promise.all([this.loadNetworks(), this.loadProfiles()]);

        if (this.isEdit) {
            await this.loadMapping();
            return;
        }

        this.dirtyTracker.attach(this.form);
    }

    private resolveRoute(): void {
        const routeId = this.activatedRoute.snapshot.paramMap.get('retryMappingId');

        if (routeId === null) {
            return;
        }

        const parsedId = Number(routeId);

        if (!Number.isInteger(parsedId) || parsedId <= 0) {
            this.alertService.showAlert(4, 'Error', 'Invalid routing retry profile identifier');
            this.goBack();
            return;
        }

        this.retryMappingId = parsedId;
    }

    private async loadNetworks(): Promise<void> {
        try {
            const response = await this.routingRolesService.getNetworks();
            const networks: Network[] = response.status === 200 ? response.data || [] : [];
            this.networks = networks;

            this.networkOptions = [
                {
                    label: 'Select Network',
                    value: null,
                },
                ...networks.map((network) => ({
                    label: `${network.network_id} | ${network.name}`,
                    value: network.network_id,
                })),
            ];

            this.form.updateValueAndValidity({ emitEvent: false });
        } catch {
            this.networks = [];
            this.networkOptions = [
                {
                    label: 'Select Network',
                    value: null,
                },
            ];

        }
    }

    private async loadProfiles(): Promise<void> {
        try {
            const response = await this.retriesService.getProfiles();

            this.profileOptions = [
                {
                    label: 'Select Retry Profile',
                    value: null,
                },
                ...(response.status === 200 ? response.data || [] : []).map((profile) => ({
                    label: profile.name,
                    value: profile.id,
                })),
            ];

            this.profileSectionConfig = buildRetryMappingProfileSection(this.profileOptions);
        } catch {
            this.profileOptions = [
                {
                    label: 'Select Retry Profile',
                    value: null,
                },
            ];

            this.profileSectionConfig = buildRetryMappingProfileSection(this.profileOptions);
        }
    }

    private async loadMapping(): Promise<void> {
        if (!this.retryMappingId) {
            return;
        }

        this.isLoading = true;
        this.form.disable({ emitEvent: false });

        try {
            const response = await this.retriesService.getMappingById(this.retryMappingId);

            if (response.status !== 200 || !response.data) {
                this.alertService.showAlert(4, response.message, response.comment);
                this.goBack();
                return;
            }

            this.patchMapping(response.data);
        } catch {
            this.alertService.showAlert(4, 'Error', 'Unable to load the routing retry profile');
        } finally {
            this.isLoading = false;
            this.form.enable({ emitEvent: false });
            this.applyNetworkProtocolStates();
        }
    }

    private patchMapping(mapping: RetryProfileMapping): void {
        this.form.patchValue({
            originNetworkId: mapping.origin_network_id,
            destinationNetworkId: mapping.destination_network_id,
            errorCodes: mapping.error_code || '',
            originProtocol: mapping.origin_protocol,
            destinationProtocol: mapping.destination_protocol,
            retryProfileId: mapping.profile_id,
        }, { emitEvent: false });

        this.matcherTypeSubs.forEach((subscription) => subscription.unsubscribe());
        this.matcherTypeSubs.clear();
        this.propertyMatchers.clear();
        (mapping.retry_mapping_conditions || []).forEach((matcher) => this.addPropertyMatcher(matcher));
        this.form.markAsPristine();
        this.dirtyTracker.attach(this.form);
    }

    private buildPayload(): RetryProfileMappingPayload {
        const value = this.form.getRawValue();

        return {
            origin_network_id: this.toNullableNetworkId(value.originNetworkId),
            destination_network_id: this.toNullableNetworkId(value.destinationNetworkId),
            error_code: this.normalizeErrorCodes(value.errorCodes),
            profile_id: Number(value.retryProfileId),
            message_priority: null,
            origin_protocol: value.originProtocol,
            destination_protocol: value.destinationProtocol,
            source_address: null,
            destination_address: null,
            retry_mapping_conditions: value.propertyMatchers.map((matcher: RetryMappingCondition & { type: string }) => ({
                type: matcher.type,
                field: matcher.field.trim(),
                operator: matcher.operator,
                value: matcher.value.trim(),
            })),
        };
    }

    private normalizeErrorCodes(errorCodes: string): string {
        return [...new Set(errorCodes.split(',').map((code) => code.trim()).filter((code) => code !== ''))].join(',');
    }

    private configureNetworkProtocolControls(networkControlName: string, protocolControlName: string, label: string): void {
        const networkControl = this.form.get(networkControlName);
        const protocolControl = this.form.get(protocolControlName);

        if (!networkControl || !protocolControl) {
            return;
        }

        this.selectionSubs.add(networkControl.valueChanges.subscribe((networkId) => {
            if (networkId === null || networkId === undefined || networkId === '') {
                protocolControl.setValue(null, { emitEvent: false });
                protocolControl.enable({ emitEvent: false });
                networkControl.setErrors(null);
                return;
            }

            const network = this.networks.find((item) => item.network_id === Number(networkId));

            if (!network?.protocol) {
                protocolControl.setValue(null, { emitEvent: false });
                protocolControl.disable({ emitEvent: false });
                networkControl.setErrors({ networkNotFound: true });
                this.alertService.showAlert(4, 'Error', `${label} Network protocol could not be resolved`);
                return;
            }

            networkControl.setErrors(null);
            protocolControl.setValue(network.protocol.toUpperCase(), { emitEvent: false });
            protocolControl.disable({ emitEvent: false });
        }));

        this.selectionSubs.add(protocolControl.valueChanges.subscribe((protocol) => {
            if (protocol === null || protocol === undefined || protocol === '') {
                networkControl.enable({ emitEvent: false });
                return;
            }

            networkControl.setValue(null, { emitEvent: false });
            networkControl.disable({ emitEvent: false });
        }));
    }

    private applyNetworkProtocolStates(): void {
        this.applyNetworkProtocolState('originNetworkId', 'originProtocol', 'Origin');
        this.applyNetworkProtocolState('destinationNetworkId', 'destinationProtocol', 'Destination');
        this.form.updateValueAndValidity({ emitEvent: false });
    }

    private applyNetworkProtocolState(networkControlName: string, protocolControlName: string, label: string): void {
        const networkControl = this.form.get(networkControlName);
        const protocolControl = this.form.get(protocolControlName);
        const networkId = networkControl?.value;

        if (networkId !== null && networkId !== undefined && networkId !== '') {
            const network = this.networks.find((item) => item.network_id === Number(networkId));

            if (!network?.protocol) {
                networkControl?.setErrors({ networkNotFound: true });
                protocolControl?.disable({ emitEvent: false });
                this.alertService.showAlert(4, 'Error', `${label} Network is not available in the loaded Network catalog`);
                return;
            }

            networkControl?.setErrors(null);
            networkControl?.enable({ emitEvent: false });
            protocolControl?.setValue(network.protocol.toUpperCase(), { emitEvent: false });
            protocolControl?.disable({ emitEvent: false });
            return;
        }

        if (protocolControl?.value) {
            networkControl?.setValue(null, { emitEvent: false });
            networkControl?.disable({ emitEvent: false });
            protocolControl.enable({ emitEvent: false });
            return;
        }

        networkControl?.enable({ emitEvent: false });
        protocolControl?.enable({ emitEvent: false });
    }

    private getMatcherType(field: string): 'CUSTOM_PARAMETER' | 'MESSAGE_EVENT' {
        const messageEventFields = RETRY_MESSAGE_EVENT_FIELD_OPTIONS.map((option) => option.value);
        return messageEventFields.includes(field) ? 'MESSAGE_EVENT' : 'CUSTOM_PARAMETER';
    }

    private toNullableNetworkId(networkId: number | string | null): number | null {
        return networkId === null || networkId === '' ? null : Number(networkId);
    }
}
