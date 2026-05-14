import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorCodeRoutingModule } from './error-code-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { ErrorCodeComponent } from './error-code.component';
import { AddComponent } from './add/add.component';

@NgModule({
  declarations: [
    ErrorCodeComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    ErrorCodeRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ErrorCodeModule { }
