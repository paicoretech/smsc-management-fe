import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MnosComponent } from './mnos.component';

const routes: Routes = [
  {
    path: '',
    component: MnosComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MnosRoutingModule {
}
