import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewaySs7, GatewaySs7Service } from '@app/core';

@Component({
  selector: 'app-home-routing',
  templateUrl: './hr.component.html',
})
export class HRComponent implements OnInit {

  networkId!: number;
  gatewaySs7!: GatewaySs7 | null;
  activeTab: 'general' | 'mcmccmnc' = 'general';

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

  setTab(tab: 'general' | 'mcmccmnc') {
    this.activeTab = tab;
  }
}