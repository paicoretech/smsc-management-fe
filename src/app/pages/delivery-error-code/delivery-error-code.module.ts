import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerErrorCodeRoutingModule } from './delivery-error-code-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DeliveryErrorCodeComponent } from './delivery-error-code.component';
import { AddComponent } from './add/add.component';

@NgModule({
  declarations: [
    DeliveryErrorCodeComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    ServerErrorCodeRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class DeliveryErrorCodeModule { }
