import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, Network, RetryProfileDetail, RetryProfilePayload, RoutingRolesService } from '@app/core';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { FormArrayTableColumn } from '@app/shared/components/form-array-table/form-array-table.component';
import { buildRetryProfileActionsSection, buildRetryProfileGeneralSection, RETRY_STEP_COLUMNS } from '../../config/retry-profile-form-config';
import { RetriesService } from '@app/core/services/retry.service';
import { Subscription } from 'rxjs';

function retryProfileConflictsValidator(control: AbstractControl): ValidationErrors | null {
    const recoveryProfileId = control.get('recoveryProfileId')?.value;
    const rerouteNetworkId = control.get('rerouteNetworkId')?.value;
    const messagePriorityStaggeredEnabled = control.get('messagePriorityStaggeredEnabled')?.value;
    const overrideMessagePriority = control.get('overrideMessagePriority')?.value;
    const errors: ValidationErrors = {};

    if (hasConfiguredValue(recoveryProfileId) && hasConfiguredValue(rerouteNetworkId)) {
        errors['exitActionConflict'] = true;
    }

    if (messagePriorityStaggeredEnabled === true && hasConfiguredValue(overrideMessagePriority)) {
        errors['messagePriorityConflict'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

function hasConfiguredValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
}

@Component({
    selector: 'app-retry-profile-form',
    templateUrl: './retry-profile-form.component.html',
})
export class RetryProfileFormComponent implements OnInit, OnDestroy {

    form: FormGroup;

    retryProfileId: number | null = null;

    recoveryProfileOptions: FormFieldOption[] = [
        {
            label: 'Select Recovery Profile',
            value: null,
        },
    ];

    networkOptions: FormFieldOption[] = [
        {
            label: 'Select Network',
            value: null,
        },
    ];

    generalSectionConfig: FormSectionConfig;
    actionsSectionConfig: FormSectionConfig;

    stepColumns: FormArrayTableColumn[] = RETRY_STEP_COLUMNS;

    isLoading = false;
    isSaving = false;
    isModified = false;
    showValidationMessage = false;

    private readonly dirtyTracker = new FormDirtyTracker();
    private readonly controlSubs = new Subscription();
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
            name: ['', Validators.required],
            recoveryProfileId: [null],
            rerouteNetworkId: [null],
            maxDueDelay: [null, [Validators.required, Validators.min(0)]],
            periodRSeconds: [null],
            newSourceAddress: [''],
            newDestinationAddress: [''],
            removeSourceAddressPrefix: [''],
            addSourceAddressPrefix: [''],
            removeDestinationAddressPrefix: [''],
            addDestinationAddressPrefix: [''],
            messagePriorityStaggeredEnabled: [false],
            overrideMessagePriority: [null],
            steps: this.formBuilder.array([]),
        }, {
            validators: retryProfileConflictsValidator,
        });

        this.generalSectionConfig = buildRetryProfileGeneralSection(this.recoveryProfileOptions, this.networkOptions);
        this.actionsSectionConfig = buildRetryProfileActionsSection();
        this.configureMutuallyExclusiveControls();
    }

    ngOnInit(): void {
        this.dirtySub = this.dirtyTracker.isModified$.subscribe((value) => {
            this.isModified = value;
        });

        this.initialize();
    }

    ngOnDestroy(): void {
        this.dirtySub?.unsubscribe();
        this.controlSubs.unsubscribe();
        this.dirtyTracker.destroy();
    }

    private async initialize(): Promise<void> {
        this.resolveRoute();
        this.addStep();
        await Promise.all([
            this.loadRecoveryProfiles(),
            this.loadNetworks(),
        ]);

        if (this.isEdit) {
            await this.loadProfile();
            return;
        }

        this.dirtyTracker.attach(this.form);
    }

    get steps(): FormArray {
        return this.form.get('steps') as FormArray;
    }

    get isEdit(): boolean {
        return this.retryProfileId !== null;
    }

    get pageTitle(): string {
        return this.isEdit ? 'Edit Retry Profile' : 'Create Retry Profile';
    }

    get submitButtonText(): string {
        if (this.isSaving) {
            return 'Saving...';
        }

        return this.isEdit ? 'Update' : 'Create';
    }

    get canSubmit(): boolean {
        const canSaveForm = this.isEdit ? this.isModified && this.form.valid : this.form.valid;
        return canSaveForm && !this.isLoading && !this.isSaving;
    }

    addStep(attempts = 1, delay = 1): void {
        this.steps.push(this.formBuilder.group({
            attempts: [attempts, [Validators.required, Validators.min(0)]],
            delay: [delay, [Validators.required, Validators.min(0)]],
        }));
    }

    removeStep(index: number): void {
        if (this.steps.length <= 1) {
            return;
        }

        this.steps.removeAt(index);
    }

    async save(): Promise<void> {
        if (this.form.invalid || (this.isEdit && !this.isModified) || this.isSaving) {
            this.showValidationMessage = this.form.invalid;
            this.form.markAllAsTouched();
            return;
        }

        this.showValidationMessage = false;
        this.isSaving = true;

        try {
            const payload = this.buildPayload();
            const response = this.isEdit
                ? await this.retriesService.updateProfile(this.retryProfileId as number, payload)
                : await this.retriesService.createProfile(payload);

            if (response.status !== 200 && response.status !== 201) {
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.alertService.showAlert(1, response.message, response.comment);
            this.goBack();
        } catch {
            this.alertService.showAlert(4, 'Error', `Unable to ${this.isEdit ? 'update' : 'create'} the retry profile`);
        } finally {
            this.isSaving = false;
        }
    }

    goBack(): void {
        this.router.navigate(['/pages/retries/retry-profiles']);
    }

    private resolveRoute(): void {
        const routeId = this.activatedRoute.snapshot.paramMap.get('retryProfileId');

        if (routeId === null) {
            return;
        }

        const parsedId = Number(routeId);

        if (!Number.isInteger(parsedId) || parsedId <= 0) {
            this.alertService.showAlert(4, 'Error', 'Invalid retry profile identifier');
            this.goBack();
            return;
        }

        this.retryProfileId = parsedId;
    }

    private async loadRecoveryProfiles(): Promise<void> {
        try {
            const response = await this.retriesService.getProfiles();

            if (response.status !== 200 || !response.data) {
                return;
            }

            this.recoveryProfileOptions = [
                {
                    label: 'Select Recovery Profile',
                    value: null,
                },
                ...response.data
                    .filter((profile: { id: number | null; }) => profile.id !== this.retryProfileId)
                    .map((profile: { name: any; id: any; }) => ({
                        label: profile.name,
                        value: profile.id,
                    })),
            ];

            this.generalSectionConfig = buildRetryProfileGeneralSection(this.recoveryProfileOptions, this.networkOptions);
        } catch {
            this.recoveryProfileOptions = [
                {
                    label: 'Select Recovery Profile',
                    value: null,
                },
            ];

            this.generalSectionConfig = buildRetryProfileGeneralSection(this.recoveryProfileOptions, this.networkOptions);
        }
    }

    private async loadNetworks(): Promise<void> {
        try {
            const response = await this.routingRolesService.getNetworks();
            const networks: Network[] = response.status === 200 ? response.data || [] : [];

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

            this.generalSectionConfig = buildRetryProfileGeneralSection(this.recoveryProfileOptions, this.networkOptions);
        } catch {
            this.networkOptions = [
                {
                    label: 'Select Network',
                    value: null,
                },
            ];

            this.generalSectionConfig = buildRetryProfileGeneralSection(this.recoveryProfileOptions, this.networkOptions);
        }
    }

    private async loadProfile(): Promise<void> {
        if (!this.retryProfileId) {
            return;
        }

        this.isLoading = true;
        this.form.disable({ emitEvent: false });

        try {
            const response = await this.retriesService.getProfileById(this.retryProfileId);

            if (response.status !== 200 || !response.data) {
                this.alertService.showAlert(4, response.message, response.comment);
                this.goBack();
                return;
            }

            this.patchProfile(response.data);
        } catch {
            this.alertService.showAlert(4, 'Error', 'Unable to load the retry profile');
        } finally {
            this.isLoading = false;
            this.form.enable({ emitEvent: false });
            this.applyMutuallyExclusiveStates();
        }
    }

    private patchProfile(profile: RetryProfileDetail): void {
        this.form.patchValue({
            name: profile.name,
            recoveryProfileId: profile.recovery_profile_id,
            rerouteNetworkId: profile.reroute_network_id,
            maxDueDelay: profile.max_due_delay_seconds,
            periodRSeconds: profile.period_r_seconds,
            newSourceAddress: profile.action?.new_source_address || '',
            newDestinationAddress: profile.action?.new_destination_address || '',
            removeSourceAddressPrefix: profile.action?.remove_source_address_prefix || '',
            addSourceAddressPrefix: profile.action?.add_source_address_prefix || '',
            removeDestinationAddressPrefix: profile.action?.remove_destination_address_prefix || '',
            addDestinationAddressPrefix: profile.action?.add_destination_address_prefix || '',
            messagePriorityStaggeredEnabled: profile.action?.message_priority_staggered_enabled || false,
            overrideMessagePriority: profile.action?.override_message_priority || null,
        }, { emitEvent: false });

        this.applyMutuallyExclusiveStates();

        this.steps.clear();

        (profile.steps || []).forEach((step) => this.addStep(step.attempts, step.delay_seconds));

        if (this.steps.length === 0) {
            this.addStep();
        }

        this.form.markAsPristine();
        this.dirtyTracker.attach(this.form);
    }

    private buildPayload(): RetryProfilePayload {
        const value = this.form.getRawValue();
        const hasRecoveryProfile = hasConfiguredValue(value.recoveryProfileId);
        const hasRerouteNetwork = hasConfiguredValue(value.rerouteNetworkId);
        const hasOverrideMessagePriority = hasConfiguredValue(value.overrideMessagePriority);

        return {
            name: value.name?.trim() || '',
            recovery_profile_id: hasRerouteNetwork ? null : value.recoveryProfileId,
            reroute_network_id: hasRecoveryProfile ? null : value.rerouteNetworkId,
            max_due_delay_seconds: Number(value.maxDueDelay),
            period_r_seconds: value.periodRSeconds === null || value.periodRSeconds === ''
                ? null
                : Number(value.periodRSeconds),
            steps: value.steps.map((step: { attempts: number; delay: number }, index: number) => ({
                step_number: index + 1,
                attempts: Number(step.attempts),
                delay_seconds: Number(step.delay),
            })),
            action: {
                new_source_address: value.newSourceAddress?.trim() || null,
                new_destination_address: value.newDestinationAddress?.trim() || null,
                remove_source_address_prefix: value.removeSourceAddressPrefix?.trim() || null,
                add_source_address_prefix: value.addSourceAddressPrefix?.trim() || null,
                remove_destination_address_prefix: value.removeDestinationAddressPrefix?.trim() || null,
                add_destination_address_prefix: value.addDestinationAddressPrefix?.trim() || null,
                message_priority_staggered_enabled: hasOverrideMessagePriority ? false : value.messagePriorityStaggeredEnabled,
                override_message_priority: value.messagePriorityStaggeredEnabled ? null : value.overrideMessagePriority,
            },
        };
    }

    private configureMutuallyExclusiveControls(): void {
        const recoveryProfileControl = this.form.get('recoveryProfileId');
        const rerouteNetworkControl = this.form.get('rerouteNetworkId');
        const staggeredControl = this.form.get('messagePriorityStaggeredEnabled');
        const overridePriorityControl = this.form.get('overrideMessagePriority');

        if (recoveryProfileControl && rerouteNetworkControl) {
            this.controlSubs.add(recoveryProfileControl.valueChanges.subscribe((value) => {
                if (hasConfiguredValue(value)) {
                    rerouteNetworkControl.setValue(null, { emitEvent: false });
                    rerouteNetworkControl.disable({ emitEvent: false });
                    return;
                }

                rerouteNetworkControl.enable({ emitEvent: false });
            }));

            this.controlSubs.add(rerouteNetworkControl.valueChanges.subscribe((value) => {
                if (hasConfiguredValue(value)) {
                    recoveryProfileControl.setValue(null, { emitEvent: false });
                    recoveryProfileControl.disable({ emitEvent: false });
                    return;
                }

                recoveryProfileControl.enable({ emitEvent: false });
            }));
        }

        if (staggeredControl && overridePriorityControl) {
            this.controlSubs.add(staggeredControl.valueChanges.subscribe((enabled) => {
                if (enabled === true) {
                    overridePriorityControl.setValue(null, { emitEvent: false });
                    overridePriorityControl.disable({ emitEvent: false });
                    return;
                }

                overridePriorityControl.enable({ emitEvent: false });
            }));

            this.controlSubs.add(overridePriorityControl.valueChanges.subscribe((value) => {
                if (hasConfiguredValue(value)) {
                    staggeredControl.setValue(false, { emitEvent: false });
                    staggeredControl.disable({ emitEvent: false });
                    return;
                }

                staggeredControl.enable({ emitEvent: false });
            }));
        }
    }

    private applyMutuallyExclusiveStates(): void {
        const recoveryProfileControl = this.form.get('recoveryProfileId');
        const rerouteNetworkControl = this.form.get('rerouteNetworkId');
        const staggeredControl = this.form.get('messagePriorityStaggeredEnabled');
        const overridePriorityControl = this.form.get('overrideMessagePriority');
        const hasRecoveryProfile = hasConfiguredValue(recoveryProfileControl?.value);
        const hasRerouteNetwork = hasConfiguredValue(rerouteNetworkControl?.value);
        const hasStaggeredPriority = staggeredControl?.value === true;
        const hasOverridePriority = hasConfiguredValue(overridePriorityControl?.value);

        if (hasRecoveryProfile && !hasRerouteNetwork) {
            rerouteNetworkControl?.disable({ emitEvent: false });
            recoveryProfileControl?.enable({ emitEvent: false });
        } else if (hasRerouteNetwork && !hasRecoveryProfile) {
            recoveryProfileControl?.disable({ emitEvent: false });
            rerouteNetworkControl?.enable({ emitEvent: false });
        } else {
            recoveryProfileControl?.enable({ emitEvent: false });
            rerouteNetworkControl?.enable({ emitEvent: false });
        }

        if (hasStaggeredPriority && !hasOverridePriority) {
            overridePriorityControl?.disable({ emitEvent: false });
            staggeredControl?.enable({ emitEvent: false });
        } else if (hasOverridePriority && !hasStaggeredPriority) {
            staggeredControl?.disable({ emitEvent: false });
            overridePriorityControl?.enable({ emitEvent: false });
        } else {
            staggeredControl?.enable({ emitEvent: false });
            overridePriorityControl?.enable({ emitEvent: false });
        }

        this.form.updateValueAndValidity({ emitEvent: false });
    }
}
