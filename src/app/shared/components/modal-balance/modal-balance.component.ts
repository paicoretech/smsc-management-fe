import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, CreditBalance, ServiceProvidersService } from '@app/core';
import { environment } from '@env/environment';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-balance',
  templateUrl: './modal-balance.component.html',
})
export class ModalBalanceComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;
  
  public creditBalance!: CreditBalance;
  activeTab: string = 'credit';
  form!: FormGroup;
  env = environment;

  dataHistory: any[] = [];

  @Input() set setCreditBalance(creditBalance: CreditBalance) {

    if (!creditBalance) return;

    this.activeTab = 'credit';
    this.creditBalance = creditBalance;
    this.dataHistory = creditBalance.credit_sales_history || [];
    
    if (this.dataHistory.length == 0) return;

    this.dataHistory.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  
  }
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private serviceProvidersService: ServiceProvidersService,
    private alertSvr: AlertService,
  ) { 
    this.dtOptions = this.env.dtOptions;
    this.dtOptions.searching = false;
    this.dtOptions.ordering = false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  close() {
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }

    this.dataHistory = [];
    this.closeModal.emit(true);
  }

  changeTab(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const tabId = target.id;
    this.activeTab = tabId;

    if (tabId == 'history') {
      this.dtOptions = this.env.dtOptions;
      this.dtOptions.searching = false;
      this.dtOptions.ordering = false;
      this.dtOptions.pageLength = 5;
      this.dtTrigger.next(this.dtOptions);
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      credit: ['', [Validators.required, Validators.pattern('^-?[0-9]+(\.[0-9]+)?$')]],
      description: [''],
    });
  }

  async save() {
    if (this.form.invalid) {
      return
    }
    let network_id = this.creditBalance.network_id;
    
    if (!network_id) return;

    if (this.form.value.credit == 0) {
      this.alertSvr.showAlert(2, 'Error', 'The credit must be greater than 0');
      return;
    }

    let resp = await this.serviceProvidersService.setCreditBalance(network_id, this.form.value);
    if (resp.status == 200) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
      this.clearForm();
      this.close();
    } else {
      this.clearForm();
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  clearForm() {
    this.form.reset({
      credit: '',
      description: '',
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
