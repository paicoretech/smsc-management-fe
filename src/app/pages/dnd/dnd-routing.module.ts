import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DndComponent } from './dnd.component';

const routes: Routes = [
  {
    path: '',
    component: DndComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DndRoutingModule { }