import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PmsVasRoutingModule } from './pms-vas-routing.module';
import { PmsVasShellComponent } from './pms-vas-shell.component';

@NgModule({
  declarations: [PmsVasShellComponent],
  imports: [RouterModule, PmsVasRoutingModule],
})
export class PmsVasModule {}
