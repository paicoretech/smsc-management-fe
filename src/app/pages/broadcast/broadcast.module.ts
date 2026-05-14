import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadCastRoutingModule } from './broadcast-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { AddComponent } from './add/add.component';
import { BroadCastComponent } from './broadcast.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ViewComponent } from './view/view.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    BroadCastComponent,
    AddComponent,
    StatisticsComponent,
    ViewComponent,
  ],
  imports: [
    CommonModule,
    BroadCastRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    NgSelectModule,
  ]
})
export class BroadCastModule { }
