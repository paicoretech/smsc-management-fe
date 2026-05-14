import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResponseI, Broadcast, AlertService, Statistic, RoutingRolesService, Network,BroadCastService } from '@core/index';
import {environment} from "@env/environment";

type FailureReason = { comment: string; count: number };
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
})
export class StatisticsComponent implements OnInit {
    activeTab: 'stats' | 'failures' = 'stats';
    failureReasons: FailureReason[] = [];
    visibleReasons: FailureReason[] = [];
    failuresLoading = false;
    failuresError = '';
    PAGE_SIZE = environment.MaxLengthIp;
    showFailures = false;
    broadcastId: number = 0;

    @Input() set setId(value: any) {
        if (value != null && value != undefined && value != 0) {
            this.broadcastId = value;
            this.loadDataForm();
        }
    }

    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    response!: ResponseI;
    itemBroadcast!: Broadcast;
    broadcast: Broadcast = this.getInitialBroadcast();
    statistics: Statistic = this.getInitialStatistics();
    serviceProviderList: Network[] = [];

    constructor(
        private broadCastService: BroadCastService,
        private routingService: RoutingRolesService,
        private alertSvr: AlertService,
    ) {}

    ngOnInit() {
        this.loadProviders();
    }

    async loadProviders() {
        const response = await this.routingService.getNetworks();
        if (response.status === 200) {
          this.serviceProviderList = response.data.filter((p: { protocol: string; }) => p.protocol === 'HTTP');
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
          first_record_mapping: '',
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
          is_immediate: false
        };
    }

    private getInitialStatistics(): Statistic {
        return {
          total_message: 0,
          pending: 0,
          enqueue: 0,
          sent: 0,
          failed: 0,
          duplicated: 0,
          invalid: 0
        };
    }

    get providerName(): string {
        const provider = this.serviceProviderList.find(p => p.network_id === this.broadcast.network_id);
        return provider?.name || 'Unknown';
    }

    async loadDataForm(): Promise<void> {

        const dataResponse = await this.broadCastService.getBroadCastById(this.broadcastId);
        if (dataResponse.status !== 200) {
        this.alertSvr.showAlert(2, dataResponse.message, dataResponse.comment);
        return;
        }

        this.broadcast = dataResponse.data.broadcast;
        this.statistics = dataResponse.data.statistics;
        this.failureReasons = [];
        this.visibleReasons = [];
        this.failuresLoading = false;
        this.failuresError = '';
        this.showFailures = false;
    }

    async fetchFailureReasons() {
        if (this.failureReasons.length || this.failuresLoading) return;
        this.failuresLoading = true;
        this.failuresError = '';
        try {
            const resp = await this.broadCastService.getFailureReasons(this.broadcastId);
            if (resp.status === 200) {
                const list = Array.isArray(resp.data) ? resp.data : [];
                this.failureReasons = list.map((x: any) => ({
                    comment: x?.comment ?? '',
                    count: Number(x?.count ?? 0),
                }));
                this.visibleReasons = this.failureReasons.slice(0, this.PAGE_SIZE);
            } else {
                this.failuresError = resp.message || 'Failed to load failure reasons.';
            }
        } catch {
            this.failuresError = 'Network error while loading failure reasons.';
        } finally {
            this.failuresLoading = false;
        }
    }

    async showTab(tab: 'stats' | 'failures') {
        this.activeTab = tab;
        if (tab === 'failures' && this.statistics.failed > 0) {
            await this.fetchFailureReasons();
        }
    }

    onReasonsScroll(e: Event) {
        if (!this.failureReasons.length) return;
        const element = e.target as HTMLElement;
        const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 24;
        if (nearBottom && this.visibleReasons.length < this.failureReasons.length) {
            const next = Math.min(this.visibleReasons.length + this.PAGE_SIZE, this.failureReasons.length);
            this.visibleReasons = this.failureReasons.slice(0, next);
        }
    }

    close() {
        this.broadcast = this.getInitialBroadcast();
        this.statistics = this.getInitialStatistics();
        this.closeModal.emit(true);
    }
}
