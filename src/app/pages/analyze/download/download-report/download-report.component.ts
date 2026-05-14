import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AnalyceService } from '@app/core/services/analyze.service';
import { AlertService, DataTableConfigService, DateTimeUtil, SpinnerService, REPORT_NAME_MAP, REPORT_OPTIONS } from '@app/core';
import { DateTime } from 'luxon';

@Component({
    selector: 'app-download-report',
    templateUrl: './download-report.component.html',
    styleUrls: ['./download-report.component.scss'],
})
export class DownloadReportComponent implements OnInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false })
    dtElement!: DataTableDirective;

    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();

    dataTable: any;
    reportType: string = 'ALL';
    startDate: string = '';
    endDate: string = '';
    data: any[] = [];
    originalData: any[] = [];

    readonly reportOptions = REPORT_OPTIONS;
    showTable: boolean = false;

    constructor(
        private dtConfigService: DataTableConfigService,
        private analyzeService: AnalyceService,
        private alertService: AlertService,
        private spinnerService: SpinnerService,
    ) {
        const today = DateTime.local();
        const sevenDaysAgo = today.minus({ days: 7 });

        this.startDate = sevenDaysAgo.toISODate();
        this.endDate = today.toISODate();
    }

    ngOnInit(): void {
        this.loadDtOptions();
        setTimeout(() => {
            this.spinnerService.showSpinner();
            this.loadData(this.startDate, this.endDate);
        });
    }

    async loadData(startDate?: string, endDate?: string): Promise<void> {
        this.originalData = [];
        this.data = [];

        const types = (!this.reportType || this.reportType === 'ALL')
            ? this.reportOptions.map(option => option.value)
            : [this.reportType];

        try {
            const response = await this.analyzeService.getReportHistory(types);

            if (response.status === 200) {
                const { data } = response;
                this.originalData = data;

                if (startDate && endDate && data.length > 0) {
                    const start = DateTimeUtil.fromDateInputAsUtc(startDate);
                    const end = DateTimeUtil.fromDateInputAsUtcEndOfDay(endDate);
                    this.data = data.filter((item: { created_at: string; updated_at: string; }) => {
                        const createdAt = DateTime.fromISO(item.created_at, { zone: 'utc' });
                        const updatedAt = DateTime.fromISO(item.updated_at, { zone: 'utc' });
                        return (createdAt >= start && createdAt <= end) ||
                            (updatedAt >= start && updatedAt <= end);
                    });
                } else {
                    this.data = [...data];
                }

                setTimeout(() => {
                    this.dtTrigger.next(this.dtOptions);
                });

            } else {
                this.alertService.showAlert(4, 'Error', 'Failed to fetch report data.');
            }
        } catch (error) {
            this.alertService.showAlert(4, 'Error', 'An error occurred while fetching report data.');
        }

        this.spinnerService.hideSpinner();
    }


    async refresh(): Promise<void> {
        if (!this.startDate || !this.endDate) {
            console.warn('Both start and end dates are required.');
            return;
        }

        const dtInstance = await this.dtElement.dtInstance;
        dtInstance.destroy();

        this.dtTrigger = new Subject<any>();
        this.originalData = [];
        this.data = [];

        setTimeout(() => {
            this.spinnerService.showSpinner();
            this.loadData(this.startDate, this.endDate);
        }, 0);
    }

    async downloadFile(cdr: any) {
        try {
            await this.analyzeService.downloadReportFile(cdr.token);
        } catch (error) {
            this.alertService.showAlert(4, 'Error', 'Failed to download the file.');
        }
    }

    loadDtOptions() {
        this.dtOptions = {
            ...this.dtConfigService.getConfig(),
            searching: false,
            initComplete: () => {
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                        this.onPageLengthChange(len);
                    });
                });
            }
        };
    }

    onPageLengthChange(newPageLength: number): void {
        this.dtConfigService.updateConfig({ pageLength: newPageLength });
        this.dtOptions.pageLength = newPageLength;
    }

    getReportName(report: { type: string }): string {
        return REPORT_NAME_MAP[report.type] || 'Unknown Report Type';
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }
}