import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTablesModule} from 'angular-datatables';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '@app/shared';
import {DndComponent} from './dnd.component';
import {DndRoutingModule} from './dnd-routing.module';
import {AddComponent} from './add/add.component';
import {DetailComponent} from './detail/detail.component';
import {Select2Module} from "ng-select2-component";

@NgModule({
    declarations: [
        DndComponent,
        AddComponent,
        DetailComponent,
    ],
    imports: [
        CommonModule,
        DndRoutingModule,
        DataTablesModule,
        ReactiveFormsModule,
        SharedModule,
        Select2Module
    ]
})
export class DndModule {
}
 