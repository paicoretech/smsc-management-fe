import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { SmppServiceProvidersComponent } from './smpp/sp-gateway-smpp.component';
import { HttpServiceProvidersComponent } from './http/sp-gateway-http.component';
import { AddSmppSpComponent } from './smpp/add-smpp/add-smpp.component';
import { AddHttpSpComponent } from './http/add-http/add-http.component';

const routes: Routes = [
    {
        path: 'smpp',
        children: [
            { path: '', component: SmppServiceProvidersComponent },
            { path: 'new', redirectTo: 'configurations/general', pathMatch: 'full' },
            {
                path: 'configurations',
                children: [
                    { path: 'general', component: AddSmppSpComponent },
                ],
            },
        ],
    },
    {
        path: 'http',
        children: [
            { path: '', component: HttpServiceProvidersComponent },
            { path: 'new', redirectTo: 'configurations/general', pathMatch: 'full' },
            {
                path: 'configurations',
                children: [
                    { path: 'general', component: AddHttpSpComponent },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ServiceProvidersRoutingModule {
}