import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MnosRoutingModule } from './mnos-routing.module';
import { MnosComponent } from './mnos.component';
import { AddComponent } from './add/add.component';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';



@NgModule({
  declarations: [
    MnosComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    MnosRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    DatePipe
  ]
})
export class MnosModule { }
