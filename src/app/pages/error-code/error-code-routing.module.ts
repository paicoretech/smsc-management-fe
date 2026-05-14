import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ErrorCodeComponent } from './error-code.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorCodeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorCodeRoutingModule { }