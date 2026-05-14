import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService, GatewaySs7, GatewaySs7Service } from '@app/core';

@Component({
  selector: 'app-sccp',
  templateUrl: './sccp.component.html',
})
export class SccpComponent implements OnInit {
  networkId!: number;
  activeTab: string = 'general';
  gatewaySs7!: GatewaySs7 | null;

  sccpId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private gatewaySs7Service: GatewaySs7Service,
    private alertSvr: AlertService,
  ) { }

  async ngOnInit() {
    const networkIdParam = this.route.snapshot.paramMap.get('network_id');
    this.networkId = networkIdParam ? + networkIdParam : 0;

    let response = await this.gatewaySs7Service.getGatewaySs7ById(this.networkId);
    if (response.status == 200) {
      this.gatewaySs7 = response.data;
    }
  }

  setSccpId(value: number) {
    this.sccpId = value;
  }

  changeTab(tabId: string) {
    if (this.sccpId <= 0) {
      this.alertSvr.error('Invalid SCCP ID');
      return;
    }

    this.activeTab = tabId;
  }
}
