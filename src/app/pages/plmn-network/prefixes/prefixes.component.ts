import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertService, DataTableConfigService, PlmnNetwork, PlmnNetworkService, PlmnPrefix, ResponseI } from '@core/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';

declare const window: any;

@Component({
  selector: 'app-plmn-prefixes',
  templateUrl: './prefixes.component.html',
})
export class PrefixesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  networks: PlmnNetwork[] = [];
  selectedPrefix?: PlmnPrefix;
  deleteMessage = '';
  uploadForm: FormGroup;
  selectedFile?: File;
  fileError = '';
  uploading = false;

  private formModal: any;
  private deleteModal: any;
  private uploadModal: any;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly plmnNetworkService: PlmnNetworkService,
    private readonly alertService: AlertService,
    private readonly dataTableConfigService: DataTableConfigService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.uploadForm = this.formBuilder.group({
      plmn_id: [null, [Validators.required]],
      has_header: [false],
    });
  }

  ngOnInit(): void {
    this.loadDtOptions();
    void this.loadNetworks();
  }

  ngAfterViewInit(): void {
    this.formModal = new window.bootstrap.Modal(document.getElementById('plmnPrefixModal'));
    this.deleteModal = new window.bootstrap.Modal(document.getElementById('deletePlmnPrefixModal'));
    this.uploadModal = new window.bootstrap.Modal(document.getElementById('uploadPlmnPrefixModal'));
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  async loadNetworks(): Promise<void> {
    const response: ResponseI<PlmnNetwork[]> = await this.plmnNetworkService.getNetworks();
    this.networks = response.status === 200 ? response.data ?? [] : [];
    if (response.status !== 200) {
      this.alertService.showAlert(2, response.message, response.comment);
    }
  }

  createPrefix(): void {
    this.selectedPrefix = undefined;
    this.formModal.show();
  }

  openUpload(): void {
    this.uploadForm.reset({ plmn_id: null, has_header: false });
    this.selectedFile = undefined;
    this.fileError = '';
    this.uploadModal.show();
  }

  closeUpload(): void {
    if (this.uploading) {
      return;
    }
    this.uploadModal.hide();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = undefined;
    this.fileError = '';
    if (!file) {
      return;
    }
    if (!/\.(csv|txt)$/i.test(file.name)) {
      input.value = '';
      this.fileError = 'Select a CSV or TXT file.';
      return;
    }
    this.selectedFile = file;
  }

  async uploadPrefixes(): Promise<void> {
    this.uploadForm.markAllAsTouched();
    if (!this.selectedFile) {
      this.fileError = 'The field is required.';
    }
    if (this.uploadForm.invalid || !this.selectedFile || this.uploading) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('plmnId', String(this.uploadForm.value.plmn_id));
    formData.append('hasHeader', String(!!this.uploadForm.value.has_header));
    this.uploading = true;
    try {
      const response = await this.plmnNetworkService.uploadPrefixes(formData);
      if (response.status === 200) {
        const result = response.data as { inserted?: number; duplicates?: number } | null;
        this.uploadModal.hide();
        this.alertService.showAlert(
          1,
          response.message,
          `${response.comment} Inserted: ${result?.inserted ?? 0}. Duplicates skipped: ${result?.duplicates ?? 0}.`,
        );
        this.refresh();
      } else {
        this.alertService.showAlert(2, response.message, response.comment);
      }
    } finally {
      this.uploading = false;
    }
  }

  isUploadInvalid(field: string): boolean {
    const control = this.uploadForm.get(field);
    return !!(control?.invalid && control.touched);
  }

  editPrefix(prefix: PlmnPrefix): void {
    this.selectedPrefix = prefix;
    this.formModal.show();
  }

  closeForm(saved: boolean): void {
    this.formModal.hide();
    this.selectedPrefix = undefined;
    if (saved) {
      this.refresh();
    }
  }

  confirmDelete(prefix: PlmnPrefix): void {
    this.selectedPrefix = prefix;
    this.deleteMessage = `Are you sure you want to delete prefix ${prefix.prefix}?`;
    this.deleteModal.show();
  }

  async closeDelete(confirmed: boolean): Promise<void> {
    this.deleteModal.hide();
    if (!confirmed || !this.selectedPrefix) {
      return;
    }

    const response = await this.plmnNetworkService.deletePrefix(this.selectedPrefix.id);
    if (response.status === 200) {
      this.alertService.showAlert(1, response.message, response.comment);
      this.refresh();
    } else {
      this.alertService.showAlert(2, response.message, response.comment);
    }
  }

  refresh(): void {
    void this.loadNetworks();
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
          const response = await this.plmnNetworkService.getPrefixesPage(offset, limit, search);
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
        { data: 'prefix', render: (value: string) => this.escapeHtml(value) },
        { data: 'sn_range_start', render: (value: string | null) => this.escapeHtml(value || '-') },
        { data: 'sn_range_stop', render: (value: string | null) => this.escapeHtml(value || '-') },
        { data: null, render: (_data: unknown, _type: unknown, row: PlmnPrefix) => this.escapeHtml(this.formatMccMnc(row.mcc, row.mnc)) },
        { data: 'network_name', render: (value: string) => this.escapeHtml(value) },
        { data: 'country', render: (value: string) => this.escapeHtml(value) },
        { data: 'country_iso', render: (value: string) => this.escapeHtml(value) },
        {
          data: null,
          orderable: false,
          searchable: false,
          render: () => `
            <button class="btn btn-sm btn-red me-2 edit-prefix-btn" title="Edit prefix">
              <i class="bx bxs-pencil" aria-hidden="true"></i>
            </button>
            <button class="btn btn-sm btn-secondary me-2 delete-prefix-btn" title="Delete prefix">
              <i class="bx bxs-trash-alt" aria-hidden="true"></i>
            </button>`,
        },
      ],
      createdRow: (row: Node, data: PlmnPrefix) => {
        const element = row as HTMLElement;
        element.querySelector('.edit-prefix-btn')?.addEventListener('click', () => this.editPrefix(data));
        element.querySelector('.delete-prefix-btn')?.addEventListener('click', () => this.confirmDelete(data));
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
