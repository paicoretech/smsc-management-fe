import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '@app/shared';
import { SmppComponent } from './smpp/smpp.component';
import { AddSmppServerComponent } from './smpp/add/add.component'
import { SettingsComponent } from './settings.component';
import { HttpComponent } from './http/http.component';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { GeneralComponent } from './general/general.component';
import { RetriesComponent } from './general/retries/retries.component';



@NgModule({
  declarations: [
    SettingsComponent,
    SmppComponent,
    HttpComponent,
    GeneralComponent,
    RetriesComponent,
    AddSmppServerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
  ]
})
export class SettingsModule { }
