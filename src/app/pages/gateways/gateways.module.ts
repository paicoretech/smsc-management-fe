import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatewaysRoutingModule } from './gateways-routing.module';
import { SharedModule } from '@app/shared';
import { GatewaysComponent } from './gateways.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { AddSmppComponent } from './smpp/add-smpp/add-smpp.component';
import { SmppComponent } from './smpp/smpp.component';
import { Ss7Component } from './ss7/ss7.component';
import { AddSs7Component } from './ss7/add-ss7/add-ss7.component';
import { ConfigurationsComponent } from './ss7/configurations/configurations.component';
import { M3uaComponent } from './ss7/configurations/m3ua/m3ua.component';
import { SccpComponent } from './ss7/configurations/sccp/sccp.component';
import { TcapMapComponent } from './ss7/configurations/tcap-map/tcap-map.component';
import { GeneralComponent } from './ss7/configurations/m3ua/general/general.component';
import { ApplicationServersComponent } from './ss7/configurations/m3ua/application-servers/application-servers.component';
import { AssociationsComponent } from './ss7/configurations/m3ua/associations/associations.component';
import { RoutesComponent } from './ss7/configurations/m3ua/routes/routes.component';
import { AddSocketComponent } from './ss7/configurations/m3ua/associations/add-socket/add-socket.component';
import { AddAssociationComponent } from './ss7/configurations/m3ua/associations/add-association/add-association.component';
import { AddAppServerComponent } from './ss7/configurations/m3ua/application-servers/add-app-server/add-app-server.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddRouteComponent } from './ss7/configurations/m3ua/routes/add-route/add-route.component';
import { GeneralSccpComponent } from './ss7/configurations/sccp/general-sccp/general-sccp.component';
import { ResourcesSccpComponent } from './ss7/configurations/sccp/resources-sccp/resources-sccp.component';
import { AddRemoteResourceComponent } from './ss7/configurations/sccp/resources-sccp/add-remote-resource/add-remote-resource.component';
import { AddRemoteSignalingPointCodeComponent } from './ss7/configurations/sccp/resources-sccp/add-remote-signaling-point-code/add-remote-signaling-point-code.component';
import { AddRemoteSubsystemNumberComponent } from './ss7/configurations/sccp/resources-sccp/add-remote-subsystem-number/add-remote-subsystem-number.component';
import { SccpAddressComponent } from './ss7/configurations/sccp/sccp-address/sccp-address.component';
import { AddSccpAddressComponent } from './ss7/configurations/sccp/sccp-address/add-sccp-address/add-sccp-address.component';
import { ServiceAccessPointsComponent } from './ss7/configurations/sccp/service-access-points/service-access-points.component';
import { AddMtp3DestinationComponent } from './ss7/configurations/sccp/service-access-points/add-mtp3-destination/add-mtp3-destination.component';
import { AddLongMessageRuleComponent } from './ss7/configurations/sccp/service-access-points/add-long-message-rule/add-long-message-rule.component';
import { AddServiceAccessPointComponent } from './ss7/configurations/sccp/service-access-points/add-service-access-point/add-service-access-point.component';
import { SccpRulesComponent } from './ss7/configurations/sccp/sccp-rules/sccp-rules.component';
import { AddSccpRulesComponent } from './ss7/configurations/sccp/sccp-rules/add-sccp-rules/add-sccp-rules.component';
import { AddTcapComponent } from './ss7/configurations/tcap-map/add-tcap/add-tcap.component';
import { AddMapComponent } from './ss7/configurations/tcap-map/add-map/add-map.component';
import { DiameterGatewayComponent } from './diameter/diameter-gateway.component';
import { AddDiameterComponent } from './diameter/add/add-diameter.component';
import { ChargingSettingModule } from '../charging-settings/charging-setting.module';
import { HttpComponent } from './http/http.component';
import { AddHttpComponent } from './http/add-http/add-http.component';
import { HRComponent } from './ss7/configurations/hr/hr.component';
import { GeneralHRComponent } from './ss7/configurations/hr/general-hr/general-hr.component';
import { HrCcMccMncComponent } from './ss7/configurations/hr/cc-mcc-mnc/hr-cc-mcc-mnc.component';
import { AddHrCcMccMncComponent } from './ss7/configurations/hr/cc-mcc-mnc/add/add-hr-cc-mcc-mnc.component';

const M3UACOMPONENTS = [
  M3uaComponent,
  GeneralComponent,
  ApplicationServersComponent,
  AssociationsComponent,
  RoutesComponent,
  AddSocketComponent,
  AddAssociationComponent,
  AddAppServerComponent,
  AddRouteComponent,
  DiameterGatewayComponent,
  AddDiameterComponent,
];

const SCCPCOMPONENT = [
  SccpComponent,
  GeneralSccpComponent,
  ResourcesSccpComponent,
  AddRemoteResourceComponent,
  AddRemoteSignalingPointCodeComponent,
  AddRemoteSubsystemNumberComponent,
  SccpAddressComponent,
  AddSccpAddressComponent,
  ServiceAccessPointsComponent,
  SccpRulesComponent,
  AddSccpRulesComponent,
  AddMtp3DestinationComponent,
  AddLongMessageRuleComponent,
  AddServiceAccessPointComponent,
];

const TCAPMAPCOMPONENT = [
  TcapMapComponent,
  AddTcapComponent,
  AddMapComponent,
];

const HRCOMPONENT = [
  HRComponent,
  GeneralHRComponent,
  HrCcMccMncComponent,
  AddHrCcMccMncComponent,
];

@NgModule({
  declarations: [
    GatewaysComponent,
    SmppComponent,
    HttpComponent,
    Ss7Component,
    AddSmppComponent,
    AddHttpComponent,
    AddSs7Component,
    ConfigurationsComponent,
    M3UACOMPONENTS,
    SCCPCOMPONENT,
    TCAPMAPCOMPONENT,
    HRCOMPONENT,
  ],
  imports: [
    CommonModule,
    GatewaysRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    SharedModule,
    DragDropModule,
    ChargingSettingModule
  ],
  providers: []
})
export class GatewaysModule { }
