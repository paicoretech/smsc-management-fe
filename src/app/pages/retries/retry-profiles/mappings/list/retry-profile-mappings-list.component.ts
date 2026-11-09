import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, DataTableConfigService, Network, RetryProfileMapping, RetryProfileSummary, RoutingRolesService } from '@app/core';
import { RetriesService } from '@app/core/services/retry.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare const window: any;

@Component({
    selector: 'app-retry-profile-mappings-list',
    templateUrl: './retry-profile-mappings-list.component.html',
})
export class RetryProfileMappingsListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false }) dtElement?: DataTableDirective;

    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();

    mappings: RetryProfileMapping[] = [];
    networks: Network[] = [];
    profiles: RetryProfileSummary[] = [];
    selectedMapping: RetryProfileMapping | null = null;

    deleteMessage = '';
    isLoading = false;
    isDeleting = false;

    private deleteModal: any;

    constructor(
        private retriesService: RetriesService,
        private routingRolesService: RoutingRolesService,
        private alertService: AlertService,
        private dataTableConfigService: DataTableConfigService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.dtOptions = this.dataTableConfigService.getConfig();
        this.loadReferences();
        this.loadMappings();
    }

    ngAfterViewInit(): void {
        const modalElement = document.getElementById('deleteRetryProfileMappingModal');

        if (modalElement) {
            this.deleteModal = new window.bootstrap.Modal(modalElement);
        }
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    goToCreate(): void {
        this.router.navigate(['/pages/retries/routing-retry-profiles/add']);
    }

    goToEdit(mapping: RetryProfileMapping): void {
        this.router.navigate(['/pages/retries/routing-retry-profiles/edit', mapping.id]);
    }

    confirmDelete(mapping: RetryProfileMapping): void {
        this.selectedMapping = mapping;
        this.deleteMessage = 'Are you sure you want to delete the routing retry profile?';
        this.deleteModal?.show();
    }

    async handleDeleteConfirmation(confirmed: boolean): Promise<void> {
        this.deleteModal?.hide();

        if (!confirmed || !this.selectedMapping || this.isDeleting) {
            this.selectedMapping = null;
            return;
        }

        this.isDeleting = true;

        try {
            const response = await this.retriesService.deleteMapping(this.selectedMapping.id);

            if (response.status !== 200) {
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.alertService.showAlert(1, response.message, response.comment);
            await this.refresh();
        } catch {
            this.alertService.showAlert(4, 'Error', 'Unable to delete the routing retry profile');
        } finally {
            this.isDeleting = false;
            this.selectedMapping = null;
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

        await this.loadMappings();
    }

    getNetworkLabel(networkId: number | null): string {
        if (networkId === null || networkId === undefined) {
            return '-';
        }

        const network = this.networks.find((item) => item.network_id === networkId);
        return network ? `${networkId} | ${network.name}` : `${networkId}`;
    }

    getProfileLabel(mapping: RetryProfileMapping): string {
        const profile = this.profiles.find((item) => item.id === mapping.profile_id);
        return profile ? profile.name : `${mapping.profile_id}`;
    }

    getPropertyMatchersLabel(mapping: RetryProfileMapping): string {
        if (!mapping.retry_mapping_conditions?.length) {
            return '-';
        }

        return mapping.retry_mapping_conditions.map((item) => {
            const type = item.type === 'MESSAGE_EVENT' ? 'Message' : 'Custom';
            return `${type}: ${item.field} ${item.operator} ${item.value}`;
        }).join(', ');
    }

    private async loadReferences(): Promise<void> {
        try {
            const [networksResponse, profilesResponse] = await Promise.all([
                this.routingRolesService.getNetworks(),
                this.retriesService.getProfiles(),
            ]);

            this.networks = networksResponse.status === 200 ? networksResponse.data || [] : [];
            this.profiles = profilesResponse.status === 200 ? profilesResponse.data || [] : [];
        } catch {
            this.networks = [];
            this.profiles = [];
        }
    }

    private async loadMappings(): Promise<void> {
        this.isLoading = true;

        try {
            const response = await this.retriesService.getMappings();

            if (response.status !== 200) {
                this.mappings = [];
                this.alertService.showAlert(4, response.message, response.comment);
                return;
            }

            this.mappings = response.data || [];
        } catch {
            this.mappings = [];
            this.alertService.showAlert(4, 'Error', 'Unable to load routing retry profiles');
        } finally {
            this.isLoading = false;
            this.dtTrigger.next(this.dtOptions);
        }
    }
}
