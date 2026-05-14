import { Component, Input, OnInit, ViewChild, Type } from '@angular/core';
import { ActionConfig, ColumnConfig } from '@app/core/interfaces/utils';
import { environment } from '@env/environment';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-generic-datatable',
  templateUrl: './generic-datatable.component.html',
})
export class GenericDatatableComponent<T> implements OnInit {
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;

  @Input() dataService!: { loadData: () => Observable<T[]>; deleteItem?: (item: T) => Observable<any> };
  @Input() columns: ColumnConfig[] = [];
  @Input() actions: ActionConfig[] = [];

  data: T[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  env = environment;

  ngOnInit(): void {
    this.loadData();
    this.dtOptions = this.env.dtOptions;
  }

  loadData(): void {
    this.dataService.loadData().subscribe(data => {
      this.data = data;
      this.dtTrigger.next(data);
    });
  }

  onActionClick(action: ActionConfig, item: T): void {
    action.callback(item);
  }

  deleteItem(item: T): void {
    this.dataService.deleteItem?.(item).subscribe(() => {
      // Manejo post-eliminación (p.ej., mostrar mensaje de éxito, recargar datos)
      this.loadData();
    });
  }
}
