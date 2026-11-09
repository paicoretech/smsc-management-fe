import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertService, DataTableConfigService, PlmnNetwork, PlmnNetworkService } from '@core/index';
import { DataTableDirective } from 'angular-datatables';

declare const window: any;

@Component({
  selector: 'app-plmn-networks',
  templateUrl: './networks.component.html',
})
export class NetworksComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  selectedNetwork?: PlmnNetwork;
  deleteMessage = '';

  private formModal: any;
  private deleteModal: any;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly plmnNetworkService: PlmnNetworkService,
    private readonly alertService: AlertService,
    private readonly dataTableConfigService: DataTableConfigService,
  ) {}

  ngOnInit(): void {
    this.loadDtOptions();
  }

  ngAfterViewInit(): void {
    this.formModal = new window.bootstrap.Modal(document.getElementById('plmnNetworkModal'));
    this.deleteModal = new window.bootstrap.Modal(document.getElementById('deletePlmnNetworkModal'));
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  createNetwork(): void {
    this.selectedNetwork = undefined;
    this.formModal.show();
  }

  editNetwork(network: PlmnNetwork): void {
    this.selectedNetwork = network;
    this.formModal.show();
  }

  closeForm(saved: boolean): void {
    this.formModal.hide();
    this.selectedNetwork = undefined;
    if (saved) {
      this.refresh();
    }
  }

  confirmDelete(network: PlmnNetwork): void {
    this.selectedNetwork = network;
    this.deleteMessage = `Are you sure you want to delete network ${this.formatMccMnc(network.mcc, network.mnc)}?`;
    this.deleteModal.show();
  }

  async closeDelete(confirmed: boolean): Promise<void> {
    this.deleteModal.hide();
    if (!confirmed || !this.selectedNetwork) {
      return;
    }

    const response = await this.plmnNetworkService.deleteNetwork(this.selectedNetwork.id);
    if (response.status === 200) {
      this.alertService.showAlert(1, response.message, response.comment);
      this.refresh();
    } else {
      this.alertService.showAlert(2, response.message, response.comment);
    }
  }

  refresh(): void {
    this.dtElement.dtInstance.then((instance: DataTables.Api) => {
      instance.ajax.reload(undefined, false);
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.dtElement.dtInstance.then((instance: DataTables.Api) => {
        instance.search(value).draw();
      });
    }, 1000);
  }

  formatMccMnc(mcc: string, mnc: string): string {
    return `${mcc}-${mnc}`;
  }

  countryLabel(network: PlmnNetwork): string {
    const code = network.country_code.startsWith('+')
      ? network.country_code
      : `+${network.country_code}`;
    return `${network.country} (${code})`;
  }

  private loadDtOptions(): void {
    this.dtOptions = {
      ...this.dataTableConfigService.getConfig(),
      serverSide: true,
      processing: true,
      ordering: false,
      dom: 'lrtip',
      ajax: async (parameters: any, callback) => {
        const limit = parameters.length;
        const offset = Math.floor(parameters.start / limit) + 1;
        const search = parameters.search?.value ?? '';
        try {
          const response = await this.plmnNetworkService.getNetworksPage(offset, limit, search);
          const result = response.data;
          if (response.status !== 200) {
            this.alertService.showAlert(2, response.message, response.comment);
          }
          callback({
            recordsTotal: response.status === 200 ? result?.total_elements ?? 0 : 0,
            recordsFiltered: response.status === 200 ? result?.total_elements ?? 0 : 0,
            data: response.status === 200 ? result?.data ?? [] : [],
          });
        } catch {
          callback({ recordsTotal: 0, recordsFiltered: 0, data: [] });
        }
      },
      columns: [
        { data: null, render: (_data: unknown, _type: unknown, row: PlmnNetwork) => this.escapeHtml(this.formatMccMnc(row.mcc, row.mnc)) },
        { data: 'network_name', render: (value: string) => this.escapeHtml(value) },
        { data: null, render: (_data: unknown, _type: unknown, row: PlmnNetwork) => this.escapeHtml(this.countryLabel(row)) },
        { data: 'country_iso', render: (value: string) => this.escapeHtml(value) },
        { data: 'prefix_count' },
        {
          data: null,
          orderable: false,
          searchable: false,
          render: () => `
            <button class="btn btn-sm btn-red me-2 edit-network-btn" title="Edit network">
              <i class="bx bxs-pencil" aria-hidden="true"></i>
            </button>
            <button class="btn btn-sm btn-secondary me-2 delete-network-btn" title="Delete network">
              <i class="bx bxs-trash-alt" aria-hidden="true"></i>
            </button>`,
        },
      ],
      createdRow: (row: Node, data: PlmnNetwork) => {
        const element = row as HTMLElement;
        element.querySelector('.edit-network-btn')?.addEventListener('click', () => this.editNetwork(data));
        element.querySelector('.delete-network-btn')?.addEventListener('click', () => this.confirmDelete(data));
      },
      initComplete: () => {
        this.dtElement.dtInstance.then((instance: DataTables.Api) => {
          instance.on('length.dt', (_event: Event, _settings: unknown, length: number) => {
            this.dataTableConfigService.updateConfig({ pageLength: length });
            this.dtOptions.pageLength = length;
          });
        });
      },
    };
  }

  private escapeHtml(value: unknown): string {
    const element = document.createElement('div');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
  }
}
