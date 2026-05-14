import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AnalyzeLogComponent } from './Log/analyze-log.component';
import { DownloadCdrComponent } from './download/download-cdr/download-cdr.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { DownloadReportComponent } from './download/download-report/download-report.component';

const routes: Routes = [
  {
    path: 'log',
    component: AnalyzeLogComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'report',
    component: ReportComponent,
  },
  {
    path: 'download-cdr',
    component: DownloadCdrComponent,
  },
  {
    path: 'download-report',
    component: DownloadReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyzeRoutingModule {
}
