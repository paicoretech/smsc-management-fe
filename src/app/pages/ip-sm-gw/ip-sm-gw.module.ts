import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IpSmGwRoutingModule } from './ip-sm-gw-routing.module';
import { SipSettingsComponent } from './sip-settings/sip-settings.component';

@NgModule({
  declarations: [
    SipSettingsComponent,
  ],
  imports: [
    CommonModule,
    IpSmGwRoutingModule,
  ],
})
export class IpSmGwModule {}
