import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Ss7Component } from './ss7/ss7.component';
import { SmppComponent } from './smpp/smpp.component';
import { ConfigurationsComponent } from './ss7/configurations/configurations.component';
import { M3uaComponent } from './ss7/configurations/m3ua/m3ua.component';
import { SccpComponent } from './ss7/configurations/sccp/sccp.component';
import { TcapMapComponent } from './ss7/configurations/tcap-map/tcap-map.component';
import { DiameterGatewayComponent } from './diameter/diameter-gateway.component';
import { AddDiameterComponent } from './diameter/add/add-diameter.component';
import { HttpComponent } from './http/http.component';
import { AddSs7Component } from './ss7/add-ss7/add-ss7.component';
import { HRComponent } from './ss7/configurations/hr/hr.component';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { AddHttpComponent } from './http/add-http/add-http.component';
import { AddSmppComponent } from './smpp/add-smpp/add-smpp.component';


const routes: Routes = [
  {
    path: 'smpp',
    component: SmppComponent,
  },
  {
    path: 'smpp/add',
    component: AddSmppComponent,
  },
  {
    path: 'smpp/edit/:smppGatewayId',
    component: AddSmppComponent,
  },
  {
    path: 'http',
    component: HttpComponent,
  },
  {
    path: 'http/add',
    component: AddHttpComponent,
  },
  {
    path: 'http/edit/:httpGatewayId',
    component: AddHttpComponent,
  },

  {
    path: 'smsc/ss7',
    component: Ss7Component,
    data: { apiContext: ApiContext.SMSC },
  },
  {
    path: 'smsc/ss7/configurations/general',
    component: AddSs7Component
  },
  {
    path: 'smsc/ss7/configurations/:network_id/general',
    component: AddSs7Component,
    data: { apiContext: ApiContext.SMSC  },
  },
  {
    path: 'smsc/ss7/configurations/:network_id',
    component: ConfigurationsComponent,
    data: { apiContext: ApiContext.SMSC  },
  },
  {
    path: 'smsc/ss7/configurations/:network_id/m3ua',
    component: M3uaComponent,
  },
  {
    path: 'smsc/ss7/configurations/:network_id/sccp',
    component: SccpComponent,
  },
  {
    path: 'smsc/ss7/configurations/:network_id/tcap-map',
    component: TcapMapComponent
  },
  {
    path: 'smsc/ss7/configurations/:network_id/home-routing',
    component: HRComponent
  },
  {
    path: 'smsc/diameter',
    component: DiameterGatewayComponent,
    data: { apiContext: ApiContext.SMSC  },
  },
  {
    path: 'smsc/diameter/add',
    component: AddDiameterComponent,
    data: { apiContext: ApiContext.SMSC  },
  },
  {
    path: 'smsc/diameter/edit/:diameterGatewayId',
    component: AddDiameterComponent,
    data: { apiContext: ApiContext.SMSC  },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewaysRoutingModule {
}
