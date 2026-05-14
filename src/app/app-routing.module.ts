import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { LoginGuard, AuthGuard } from '@core/index';

export const routes: Routes = [
  {
    path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [LoginGuard],
  },
  {
    path: 'pages', loadChildren: () => import('./pages/pages.module').then( m => m.PagesModule ),
    canLoad: [AuthGuard],
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
