import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SipSettingsComponent } from './sip-settings/sip-settings.component';
import { Ss7Component } from '../gateways/ss7/ss7.component';
import { DiameterGatewayComponent } from '../gateways/diameter/diameter-gateway.component';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { AddDiameterComponent } from '../gateways/diameter/add/add-diameter.component';
import { HRComponent } from '../gateways/ss7/configurations/hr/hr.component';
import { AddSs7Component } from '../gateways/ss7/add-ss7/add-ss7.component';
import { M3uaComponent } from '../gateways/ss7/configurations/m3ua/m3ua.component';
import { ConfigurationsComponent } from '../gateways/ss7/configurations/configurations.component';
import { SccpComponent } from '../gateways/ss7/configurations/sccp/sccp.component';
import { TcapMapComponent } from '../gateways/ss7/configurations/tcap-map/tcap-map.component';
import { ipSmGwEnabledGuard } from '@app/core/guards/ip-sm-gw-enable.guard';


const routes: Routes = [
  {
    path: '',
    data: { apiContext: ApiContext.IP_SM_GW },
    canActivate:[ipSmGwEnabledGuard],
    children: [
      {
        path: 'sip-settings',
        component: SipSettingsComponent,
      },
      {
        path: 'ss7',
        component: Ss7Component,
      },
      {
        path: 'diameter',
        component: DiameterGatewayComponent,
      },

      {
        path: 'ss7/configurations/general',
        component: AddSs7Component
      },
      {
        path: 'ss7/configurations/:network_id/general',
        component: AddSs7Component
      },
      {
        path: 'ss7/configurations/:network_id',
        component: ConfigurationsComponent
      },
      {
        path: 'ss7/configurations/:network_id/m3ua',
        component: M3uaComponent,
      },
      {
        path: 'ss7/configurations/:network_id/sccp',
        component: SccpComponent,
      },
      {
        path: 'ss7/configurations/:network_id/tcap-map',
        component: TcapMapComponent
      },
      {
        path: 'ss7/configurations/:network_id/home-routing',
        component: HRComponent
      },
      {
        path: 'diameter/add',
        component: AddDiameterComponent,
      },
      {
        path: 'diameter/edit/:diameterGatewayId',
        component: AddDiameterComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IpSmGwRoutingModule {}
