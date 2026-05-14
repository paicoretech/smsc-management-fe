import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RulesServiceProvidersComponent } from './rules-service-providers.component';

const routes: Routes = [
  {
    path: '',
    component: RulesServiceProvidersComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RulesServiceProvidersRoutingModule {
}
