import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-charging-setting',
  templateUrl: './charging-setting.component.html',
})
export class ChargingSettingComponent implements OnInit {

  activeTab: string = 'diameter';

  constructor() { }

  ngOnInit(): void { }

  changeTab(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const innerText = target.innerText.split(' ')[0];
    const tabId = innerText.toLowerCase().trim();
    this.activeTab = tabId;
  }
}
