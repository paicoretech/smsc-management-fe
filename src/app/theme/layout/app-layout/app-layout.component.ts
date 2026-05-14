import { Component, HostListener } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-app-layout',
  template: `
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <app-sidebar></app-sidebar>
        <div class="layout-page">
          <app-header></app-header>
          <div class="content-wrapper mt-2">
            <div class="flex-grow-1">
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="timezone-fab" [class.compact]="scrolled && !expanded" (click)="toggleExpand()">
      <span class="icon">🕒</span>
      <span class="label" *ngIf="!scrolled || expanded">{{ timezone }}</span>
    </div>

    <div class="upgrade-fab" (click)="toggleUpgradeModal()">
      <img class="icon" src="assets/img/crown.png" style="width: 16px; height: 16px;">
      <span class="label">Upgrade</span>
    </div>

    <div class="upgrade-modal" *ngIf="upgradeOpen" (click)="closeOnOutsideClick($event)">
      <div class="modal-content-premium" (click)="$event.stopPropagation()">
        <img class="icon-crown" src="assets/img/crown.png" alt="crown" />
        <h3 class="upgrade-title">SMSC PAiCore-as-a-Service</h3>
        <p class="upgrade-description">
          Features highlighted with the
          <img src="assets/img/crown.png" class="inline-crown" alt="crown" />
          icon can be unlocked by upgrading to our PaaS version.
        </p>
        <div class="feature">
          <img class="feature-icon" src="../../../../assets/img/check-circle.png" alt="check" />
          <span>Expanded Support for SMS Protocols (SS7 and Diameter)</span>
        </div>

        <div class="feature">
          <img class="feature-icon" src="../../../../assets/img/check-circle.png" alt="check" />
          <span>Charging</span>
        </div>

        <button class="upgrade-btn" (click)="upgradeNow()">Upgrade Now</button>
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  timezone: string;
  scrolled = false;
  expanded = false;
  upgradeOpen = false;

  constructor() {
    const local = DateTime.local();
    this.timezone = `GMT${local.toFormat('ZZ')} (${local.zoneName})`;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.scrolled = offset > 10;
    if (!this.scrolled) {
      this.expanded = false;
    }
  }

  toggleExpand(): void {
    if (this.scrolled) {
      this.expanded = !this.expanded;
    }
  }

  toggleUpgradeModal(): void {
    this.upgradeOpen = !this.upgradeOpen;
  }

  upgradeNow(): void {
    window.open('https://paicore.tech/smsc/', '_blank');
  }

  closeOnOutsideClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.upgradeOpen = false;
    }
  }
}
