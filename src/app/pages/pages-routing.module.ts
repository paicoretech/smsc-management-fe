import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppLayoutComponent } from '@theme/layout/app-layout/app-layout.component';
import { AdminGuard, AnalyzeGuard } from '@app/core';


const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'service-providers', 
        loadChildren: () => import('./service-providers/service-providers.module').then(m => m.ServiceProvidersModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'gateways', 
        loadChildren: () => import('./gateways/gateways.module').then(m => m.GatewaysModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'mnos', 
        loadChildren: () => import('./mnos/mnos.module').then(m => m.MnosModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'rules-and-routing', 
        loadChildren: () => import('./rules-service-providers/rules-service-providers.module').then(m => m.RulesServiceProvidersModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'delivery-error-code',
        loadChildren: () => import('./delivery-error-code/delivery-error-code.module').then(m => m.DeliveryErrorCodeModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'error-code',
        loadChildren: () => import('./error-code/error-code.module').then(m => m.ErrorCodeModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'error-code-mappging',
        loadChildren: () => import('./error-code-mapping/error-code-mapping.module').then(m => m.ErrorCodeMappingModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'broadcast',
        loadChildren: () => import('./broadcast/broadcast.module').then(m => m.BroadCastModule)
      },
      {
        path: 'dnd',
        loadChildren: () => import('./dnd/dnd.module').then(m => m.DndModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'interpreter',
        loadChildren: () => import('./interpreter/interpreter.module').then(m => m.InterpreterModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'charging-settings',
        loadChildren: () => import('./charging-settings/charging-setting.module').then(m => m.ChargingSettingModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'users',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule),
        canLoad: [AdminGuard]
      },
      {
        path: 'analyze',
        loadChildren: () => import('./analyze/analyze.module').then(m => m.AnalyzeModule),
        canLoad: [AnalyzeGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      {
        path: 'ip-sm-gw',
        loadChildren: () => import('./ip-sm-gw/ip-sm-gw.module').then(m => m.IpSmGwModule),
        canLoad: [AdminGuard]
      },
      // {
      //   path: '**',
      //   component: NotFoundComponent,
      // },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
