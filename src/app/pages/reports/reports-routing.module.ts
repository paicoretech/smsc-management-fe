import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { GeneralComponent } from './general/general.component';
import { SmsComponent } from './sms/sms.component';


const routes: Routes = [
  {
    path: 'general',
    component: GeneralComponent
  },
  {
    path: 'sms-report',
    component: SmsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {
}
