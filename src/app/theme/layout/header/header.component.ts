import { Component } from '@angular/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  
  sidebarVisible = false;
  document: any = document;

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible) {
      this.document.getElementById('layout-menu').classList.remove('layout-menu-hidden');
      this.document.getElementById('layout-menu').classList.add('layout-menu-active');
    } else {
      this.document.getElementById('layout-menu').classList.remove('layout-menu-active');
      this.document.getElementById('layout-menu').classList.add('layout-menu-hidden');
    }
  }

}
