import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, DataTableConfigService, RetryProfileSummary } from '@app/core';
import { RetriesService } from '@app/core/services/retry.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare const window: any;

@Component({
    selector: 'app-retry-profiles-list',
    templateUrl: './retry-profiles-list.component.html',
})
export class RetryProfilesListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false }) dtElement?: DataTableDirective;

    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();

    profiles: RetryProfileSummary[] = [];
    selectedProfile: RetryProfileSummary | null = null;

    deleteMessage = '';
    isLoading = false;
    isDeleting = false;

    private deleteModal: any;

    constructor(
        private retriesService: RetriesService,
        private alertService: AlertService,
        private dataTableConfigService: DataTableConfigService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.dtOptions = this.dataTableConfigService.getConfig();
        this.loadProfiles();
    }

    ngAfterViewInit(): void {
        const modalElement = document.getElementById('deleteRetryProfileModal');

        if (modalElement) {
            this.deleteModal = new window.bootstrap.Modal(modalElement);
        }
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    goToCreate(): void {
        this.router.navigate(['/pages/retries/retry-profiles/add']);
    }

    goToEdit(profile: RetryProfileSummary): void {
        this.router.navigate(['/pages/retries/retry-profiles/edit', profile.id]);
    }

    confirmDelete(profile: RetryProfileSummary): void {
        this.selectedProfile = profile;
        this.deleteMessage = `Are you sure you want to delete the retry profile "${profile.name}"?`;
        this.deleteModal?.show();
    }

    getTotalSteps(profile: RetryProfileSummary): number {
        return profile.steps?.length || 0;
    }

    getTotalRetries(profile: RetryProfileSummary): number {
        return (profile.steps || []).reduce((total, step) => total + Number(step.attempts || 0), 0);
    }

    getPriorityOverride(profile: RetryProfileSummary): string {
        return profile.action?.override_message_priority || '-';
    }

    async handleDeleteConfirmation(confirmed: boolean): Promise<void> {
        this.deleteModal?.hide();

        if (!confirmed || !this.selectedProfile || this.isDeleting) {
            this.selectedProfile = null;
            return;
        }

        this.isDeleting = true;

        try {
            const response = await this.retriesService.deleteProfile(this.selectedProfile.id);

            if (response.status !== 200) {
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.alertService.showAlert(1, response.message, response.comment);
            await this.refresh();
        } catch {
            this.alertService.showAlert(4, 'Error', 'Unable to delete the retry profile');
        } finally {
            this.isDeleting = false;
            this.selectedProfile = null;
            this.deleteMessage = '';
        }
    }

    async refresh(): Promise<void> {
        if (this.isLoading) {
            return;
        }

        const dataTableInstance = await this.dtElement?.dtInstance;

        if (dataTableInstance) {
            dataTableInstance.destroy();
        }

        await this.loadProfiles();
    }

    private async loadProfiles(): Promise<void> {
        this.isLoading = true;

        try {
            const response = await this.retriesService.getProfiles();

            if (response.status !== 200) {
                this.profiles = [];
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.profiles = response.data || [];
        } catch {
            this.profiles = [];
            this.alertService.showAlert(4, 'Error', 'Unable to load retry profiles');
        } finally {
            this.isLoading = false;
            this.dtTrigger.next(this.dtOptions);
        }
    }
}
