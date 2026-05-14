import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModule } from '../auth/auth.module';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';

const COMPONENTS = [
  AppLayoutComponent,
  HeaderComponent,
  SidebarComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AuthModule,
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class ThemeModule { }
