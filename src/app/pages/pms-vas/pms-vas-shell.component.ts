import { Component } from '@angular/core';

@Component({
  selector: 'app-pms-vas-shell',
  template: `
    <div class="container-fluid flex-grow-1 container-p-y mt-5">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class PmsVasShellComponent {}
