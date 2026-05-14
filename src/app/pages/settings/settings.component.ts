import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {

  activeTab: string = 'general';

  constructor() {}

  ngOnInit(): void {
      
  }

  changeTab(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const innerText = target.innerText.split(' ')[0];
    const tabId = innerText.toLowerCase().trim();
    this.activeTab = tabId;
  }

}
