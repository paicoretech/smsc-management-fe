import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService, GatewaySs7, GatewaySs7Service, M3uaGeneralSettings } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';

@Component({
  selector: 'app-m3ua',
  templateUrl: './m3ua.component.html',
})
export class M3uaComponent {

  networkId!: number;
  activeTab: string = 'general';
  gatewaySs7!: GatewaySs7 | null;
  m3uaSettings?: M3uaGeneralSettings;

  constructor(
    private route: ActivatedRoute,
    private gatewaySs7Service: GatewaySs7Service,
    private m3uaSettingsService: M3uaSettingsService,
    private alertsvr: AlertService,
  ) { }

  async ngOnInit() {
    const networkIdParam = this.route.snapshot.paramMap.get('network_id');
    this.networkId = networkIdParam ? + networkIdParam : 0;

    let response = await this.gatewaySs7Service.getGatewaySs7ById(this.networkId);
    if (response.status == 200) {
      this.gatewaySs7 = response.data;
    }
    this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    });
  }

  changeTab(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const innerText = target.innerText.split(' ')[0];
    const tabId = innerText.toLowerCase().trim();

    const tabsThatRequireValidation = [ 'associations', 'application','routes'];

    if (tabsThatRequireValidation.includes(tabId)) {
      // if m3uaSettings is empty show a warning
      if (!this.m3uaSettings || this.isEmpty(this.m3uaSettings)) {
        this.alertsvr.showAlert(2,'warning','Please create the General configuration that allow to move this tab.');
        return;
      }
    }
    this.activeTab = tabId;
  }

  isEmpty(obj: M3uaGeneralSettings | null): boolean {
  return !obj || Object.keys(obj).length === 0;
}
}

