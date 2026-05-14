import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseCodeMappingRoutingModule } from './error-code-mapping-routing.module';
import { ErrorCodeMappingComponent } from './error-code-mapping.component';
import { AddComponent } from './add/add.component';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';

@NgModule({
  declarations: [
    ErrorCodeMappingComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    ResponseCodeMappingRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ErrorCodeMappingModule { }
