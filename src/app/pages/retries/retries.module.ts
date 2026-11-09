import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DataTablesModule } from 'angular-datatables';
import { RetryGeneralConfigurationComponent } from './general-configuration/general-configuration.component';
import { RetryProfileFormComponent } from './retry-profiles/form/retry-profile-form.component';
import { RetryProfilesListComponent } from './retry-profiles/list/retry-profiles-list.component';
import { RetriesRoutingModule } from './retries-routing.module';
import { RetriesComponent } from './retries.component';
import { RetryProfileMappingFormComponent } from './retry-profiles/mappings/form/retry-profile-mapping-form.component';
import { RetryProfileMappingsListComponent } from './retry-profiles/mappings/list/retry-profile-mappings-list.component';

@NgModule({
    declarations: [
        RetriesComponent,
        RetryGeneralConfigurationComponent,
        RetryProfilesListComponent,
        RetryProfileFormComponent,
        RetryProfileMappingsListComponent,
        RetryProfileMappingFormComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DataTablesModule,
        SharedModule,
        RetriesRoutingModule,
    ],
})
export class RetriesModule { }