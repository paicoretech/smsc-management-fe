import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DataTablesModule } from 'angular-datatables';
import { NetworkFormComponent } from './networks/network-form/network-form.component';
import { NetworksComponent } from './networks/networks.component';
import { PlmnNetworkRoutingModule } from './plmn-network-routing.module';
import { PlmnNetworkComponent } from './plmn-network.component';
import { PrefixFormComponent } from './prefixes/prefix-form/prefix-form.component';
import { PrefixesComponent } from './prefixes/prefixes.component';

@NgModule({
  declarations: [
    PlmnNetworkComponent,
    NetworksComponent,
    NetworkFormComponent,
    PrefixesComponent,
    PrefixFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    SharedModule,
    PlmnNetworkRoutingModule,
  ],
})
export class PlmnNetworkModule {}
