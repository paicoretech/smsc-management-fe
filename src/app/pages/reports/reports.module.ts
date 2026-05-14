import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './reports-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '@app/shared';
import { GeneralComponent } from './general/general.component';
import { SmsComponent } from './sms/sms.component';
import { CardComponent } from './general/components/card/card.component';
import { ReportsComponent } from './reports.component';
import { UsersSmsSummaryComponent } from './general/components/users-sms-summary/users-sms-summary.component';
import { RoutesSummaryComponent } from './general/components/routes-summary/routes-summary.component';

const COMPONENTS = [
  CardComponent,
  UsersSmsSummaryComponent,
  RoutesSummaryComponent,
]

@NgModule({
  declarations: [
    ReportsComponent,
    GeneralComponent,
    SmsComponent,
    COMPONENTS,
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    DataTablesModule,
    SharedModule,
  ]
})
export class ReportsModule { }
