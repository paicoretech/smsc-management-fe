import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ChargingSettingComponent } from './charging-setting.component';

const routes: Routes = [
  {
    path: '',
    component: ChargingSettingComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChargingSettingRoutingModule {
}