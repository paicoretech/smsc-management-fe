import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AddComponent } from './add/add.component';
import { InterpreterComponent } from './interpreter.component';
import { InterpreterRoutingModule } from './interpreter-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    InterpreterComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule,
    InterpreterRoutingModule,
    DragDropModule
  ],
  providers: [
    DatePipe
  ]
})
export class InterpreterModule { }