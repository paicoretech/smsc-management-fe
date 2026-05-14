import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BroadCastComponent } from './broadcast.component';
import { AddComponent } from './add/add.component';
import { ViewComponent } from './view/view.component';
import { BroadcastOperatorGuard } from '@app/core';

const routes: Routes = [
  {
    path: '',
    component: BroadCastComponent,
  },
  {
    path: 'add',
    component: AddComponent,
    canActivate: [BroadcastOperatorGuard],
  },
  {
    path: 'edit/:id',
    component: AddComponent,
    canActivate: [BroadcastOperatorGuard],
  },
  {
    path: 'view/:id',
    component: ViewComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BroadCastRoutingModule {
}
