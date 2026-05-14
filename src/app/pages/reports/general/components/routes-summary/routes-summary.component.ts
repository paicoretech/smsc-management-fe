import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService, ResponseI, RouteSummaryI } from '@app/core';
import { environment } from '@env/environment';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-routes-summary',
  templateUrl: './routes-summary.component.html',
})
export class RoutesSummaryComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  data: RouteSummaryI[] = [];
  env = environment;
  response!: ResponseI;

  constructor(
    private reportSvc: ReportService
  ) { 
    this.dtOptions = this.env.dtOptions;
    this.dtOptions.searching = false;
    this.dtOptions.lengthChange = false;
    this.dtOptions.info = false;
  }

  ngOnInit(): void {
      this.loadData();
  }
  
  async loadData() {
    this.response = await this.reportSvc.getRoutesSummary();

    if (this.response.status === 200) {
      this.data = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }
}
