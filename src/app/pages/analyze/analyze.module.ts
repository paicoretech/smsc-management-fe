import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeRoutingModule } from './analyze-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { AnalyzeComponent } from './analyze.component';
import { AnalyzeLogComponent } from './Log/analyze-log.component';
import { ViewComponent } from './components/view/view.component';
import { LogFiltersComponent } from './components/filters/filters.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DownloadCdrComponent } from './download/download-cdr/download-cdr.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ReportComponent } from './report/report.component';
import { DownloadReportComponent } from './download/download-report/download-report.component';

Chart.register(zoomPlugin); 

@NgModule({
  declarations: [
    AnalyzeComponent,
    AnalyzeLogComponent,
    ViewComponent,
    LogFiltersComponent,
    DashboardComponent,
    ReportComponent,
    DownloadCdrComponent,
    DownloadReportComponent
  ],
  imports: [
    CommonModule,
    AnalyzeRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    NgSelectModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class AnalyzeModule { }
