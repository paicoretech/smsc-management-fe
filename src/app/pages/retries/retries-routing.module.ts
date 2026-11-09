import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetryGeneralConfigurationComponent } from './general-configuration/general-configuration.component';
import { RetryProfileFormComponent } from './retry-profiles/form/retry-profile-form.component';
import { RetryProfilesListComponent } from './retry-profiles/list/retry-profiles-list.component';
import { RetriesComponent } from './retries.component';
import { RetryProfileMappingFormComponent } from './retry-profiles/mappings/form/retry-profile-mapping-form.component';
import { RetryProfileMappingsListComponent } from './retry-profiles/mappings/list/retry-profile-mappings-list.component';

const routes: Routes = [
    {
        path: 'retry-profiles/add',
        component: RetryProfileFormComponent,
    },
    {
        path: 'retry-profiles/edit/:retryProfileId',
        component: RetryProfileFormComponent,
    },
    {
        path: 'routing-retry-profiles/add',
        component: RetryProfileMappingFormComponent,
    },
    {
        path: 'routing-retry-profiles/edit/:retryMappingId',
        component: RetryProfileMappingFormComponent,
    },
    {
        path: 'retry-profiles/mappings/add',
        redirectTo: 'routing-retry-profiles/add',
        pathMatch: 'full',
    },
    {
        path: 'retry-profiles/mappings/edit/:retryMappingId',
        redirectTo: 'routing-retry-profiles/edit/:retryMappingId',
        pathMatch: 'full',
    },
    {
        path: '',
        component: RetriesComponent,
        children: [
            {
                path: '',
                redirectTo: 'general-configuration',
                pathMatch: 'full',
            },
            {
                path: 'general-configuration',
                component: RetryGeneralConfigurationComponent,
            },
            {
                path: 'retry-profiles',
                component: RetryProfilesListComponent,
            },
            {
                path: 'routing-retry-profiles',
                component: RetryProfileMappingsListComponent,
            },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class RetriesRoutingModule { }
