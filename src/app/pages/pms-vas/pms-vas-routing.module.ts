import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PmsVasShellComponent } from './pms-vas-shell.component';

const routes: Routes = [
  {
    path: '',
    component: PmsVasShellComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('@paicore/pms-vas-ui/dashboard').then((m) => m.DashboardModule),
      },
      {
        path: 'operators',
        loadChildren: () => import('@paicore/pms-vas-ui/operators').then((m) => m.OperatorsModule),
      },
      {
        path: 'packages',
        loadChildren: () => import('@paicore/pms-vas-ui/products').then((m) => m.ProductsModule),
      },
      { path: 'products', redirectTo: 'packages', pathMatch: 'prefix' },
      {
        path: 'branding',
        loadChildren: () => import('@paicore/pms-vas-ui/branding').then((m) => m.BrandingModule),
      },
      {
        path: 'targets',
        loadChildren: () => import('@paicore/pms-vas-ui/targets').then((m) => m.TargetsModule),
      },
      {
        path: 'subscriptions',
        loadChildren: () => import('@paicore/pms-vas-ui/subscriptions').then((m) => m.SubscriptionsModule),
      },
      {
        path: 'campaigns',
        loadChildren: () => import('@paicore/pms-vas-ui/campaigns').then((m) => m.CampaignsModule),
      },
      {
        path: 'overview',
        children: [
          {
            path: 'dashboards',
            loadChildren: () => import('@paicore/pms-vas-ui/billing-dashboard').then((m) => m.BillingDashboardModule),
          },
          {
            path: 'logs',
            loadChildren: () => import('@paicore/pms-vas-ui/logs').then((m) => m.LogsModule),
          },
          {
            path: 'reports',
            loadChildren: () => import('@paicore/pms-vas-ui/reports').then((m) => m.ReportsModule),
          },
          { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
        ],
      },
      { path: 'billing-dashboard', redirectTo: 'overview/dashboards', pathMatch: 'full' },
      { path: 'billing', redirectTo: 'overview/dashboards', pathMatch: 'full' },
      { path: 'logs', redirectTo: 'overview/logs', pathMatch: 'full' },
      { path: 'reports', redirectTo: 'overview/reports', pathMatch: 'full' },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PmsVasRoutingModule {}
