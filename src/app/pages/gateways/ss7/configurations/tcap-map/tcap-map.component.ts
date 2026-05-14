import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewaySs7, GatewaySs7Service } from '@app/core';

@Component({
  selector: 'app-tcap-map',
  templateUrl: './tcap-map.component.html',
})
export class TcapMapComponent implements OnInit {

  activeTab: string = 'tcap';
  networkId!: number;
  gatewaySs7!: GatewaySs7 | null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gatewaySs7Service: GatewaySs7Service
  ) { }

  async ngOnInit() {
    const networkIdParam = this.route.snapshot.paramMap.get('network_id');
    this.networkId = networkIdParam ? + networkIdParam : 0;
    
    let response = await this.gatewaySs7Service.getGatewaySs7ById(this.networkId);
    if (response.status == 200) {
      this.gatewaySs7 = response.data;
    } else {
      this.router.navigate(['/pages/gateways/ss7']);
    }
  }

  changeTab(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const innerText = target.innerText.split(' ')[0];
    const tabId = innerText.toLowerCase().trim();
    this.activeTab = tabId;
  }
}
