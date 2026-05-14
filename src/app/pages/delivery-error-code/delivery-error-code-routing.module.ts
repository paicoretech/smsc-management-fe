import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DeliveryErrorCodeComponent } from './delivery-error-code.component';
const routes: Routes = [
  {
    path: '',
    component: DeliveryErrorCodeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServerErrorCodeRoutingModule {
}
