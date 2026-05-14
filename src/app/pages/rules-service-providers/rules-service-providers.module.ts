import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RulesServiceProvidersRoutingModule } from './rules-service-providers-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '@app/shared';
import { ReactiveFormsModule } from '@angular/forms';
import { RulesServiceProvidersComponent } from './rules-service-providers.component';
import { AddComponent } from './add/add.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    RulesServiceProvidersComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    RulesServiceProvidersRoutingModule,
    DataTablesModule,
    SharedModule,
    ReactiveFormsModule,
    DragDropModule
  ]
})
export class RulesServiceProvidersModule { }
