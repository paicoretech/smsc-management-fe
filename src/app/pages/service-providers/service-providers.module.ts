import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceProvidersRoutingModule } from './service-providers-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AddSmppSpComponent } from './smpp/add-smpp/add-smpp.component';
import { SmppServiceProvidersComponent } from './smpp/sp-gateway-smpp.component';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '@app/shared';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpServiceProvidersComponent } from './http/sp-gateway-http.component';
import { AddHttpSpComponent } from './http/add-http/add-http.component';

@NgModule({
  declarations: [
    SmppServiceProvidersComponent,
    HttpServiceProvidersComponent,
    AddSmppSpComponent,
    AddHttpSpComponent,
  ],
  imports: [
    CommonModule,
    ServiceProvidersRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    SharedModule,
    DragDropModule,
  ],
  providers: []
})
export class ServiceProvidersModule { }
