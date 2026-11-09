import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworksComponent } from './networks/networks.component';
import { PlmnNetworkComponent } from './plmn-network.component';
import { PrefixesComponent } from './prefixes/prefixes.component';

const routes: Routes = [
  {
    path: '',
    component: PlmnNetworkComponent,
    children: [
      {
        path: '',
        redirectTo: 'networks',
        pathMatch: 'full',
      },
      {
        path: 'networks',
        component: NetworksComponent,
      },
      {
        path: 'prefixes',
        component: PrefixesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlmnNetworkRoutingModule {}
