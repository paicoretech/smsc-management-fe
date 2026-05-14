import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChargingSettingComponent } from './charging-setting.component';
import { ChargingSettingRoutingModule } from './charging-setting-routing.module';
import { LocalPeerComponent } from './diameter/local-peer/local-peer.component';
import { AddLocalPeerComponent } from './diameter/local-peer/add/add-local-peer.component';
import { ParameterComponent } from './diameter/parameters/parameters.component';
import { AddPeerComponent } from './diameter/peers/add-peer/add-peer.component';
import { PeerComponent } from './diameter/peers/peer.component';
import { RealmsComponent } from './diameter/realms/realms.component';
import { AddRealmsComponent } from './diameter/realms/add-realm/add-realms.component';
import { DiameterComponent } from './diameter/diameter.component';

const DIAMTER_COMPONENTS = [
  DiameterComponent,
  LocalPeerComponent,
  AddLocalPeerComponent,
  ParameterComponent,
  PeerComponent,
  AddPeerComponent,
  RealmsComponent,
  AddRealmsComponent,
];

@NgModule({
  declarations: [
    ChargingSettingComponent,
    ...DIAMTER_COMPONENTS,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule,
    ChargingSettingRoutingModule,
    DragDropModule
  ],
  exports: [
    DiameterComponent
  ],
  providers: [
    DatePipe
  ]
})
export class ChargingSettingModule { }