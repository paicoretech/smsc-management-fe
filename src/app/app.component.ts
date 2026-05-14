import { Component } from '@angular/core';
import { SpinnerService } from './core';

@Component({
  selector: 'app-root',
  template: `
  <div *ngIf="loading | async" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
  <router-outlet></router-outlet>
  `
})
export class AppComponent {
  loading = this.spinnerService.loading$;

  constructor(private spinnerService: SpinnerService) {}
  title = 'smsc-management-be';
}
