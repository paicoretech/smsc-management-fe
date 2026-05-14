import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { AddComponent } from './add/add.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthModule } from '@app/auth/auth.module';
@NgModule({
  declarations: [
    UserComponent,
    AddComponent,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    UserRoutingModule,
    NgSelectModule,
  ]
})
export class UserModule { }
