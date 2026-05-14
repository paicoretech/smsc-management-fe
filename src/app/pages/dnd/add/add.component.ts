import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DndService, AlertService } from '@core/index';
import { from, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';


@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {
  @Input() networksList: any[] = [];
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  title: string = 'Create DND';
  form!: FormGroup;
  selectedFile: File | null = null;
  fileError: string = '';

  showSenderInput = false;
  showNetworkSelect = false;

  constructor(
    private fb: FormBuilder,
    private dndService: DndService,
    private alertSvr: AlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.resetFileInput();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      dnd_type: ['GLOBAL', Validators.required],
      dnd_value: [''],
    });
  }

  validInput(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['required']
    );
  }

  onDndTypeChange(): void {
    const type = this.form.get('dnd_type')?.value;

    this.showSenderInput = type === 'SENDER';
    this.showNetworkSelect = type === 'NETWORK_ID';

    if (type === 'GLOBAL') {
      this.form.get('dnd_value')?.setValue('GLOBAL');
      this.form.get('dnd_value')?.clearValidators();
    } else {
      this.form.get('dnd_value')?.setValue('');
      this.form.get('dnd_value')?.setValidators(Validators.required);
    }

    this.form.get('dnd_value')?.updateValueAndValidity();
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    const allowedTypes = ['text/csv', 'text/plain'];

    if (!file) {
      this.selectedFile = null;
      this.fileError = 'File is required';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.selectedFile = null;
      this.fileError = 'Only .csv and .txt files are allowed';
    } else {
      this.selectedFile = file;
      this.fileError = '';
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async save(): Promise<void> {
    if (this.form.invalid || !this.selectedFile) {
      return;
    }

    const formData = new FormData();

    const dnd = {
      name: this.form.value.name,
      dnd_type: this.form.value.dnd_type,
      dnd_value: this.form.value.dnd_value,
    };

    formData.append('file', this.selectedFile);
    const jsonBlob = new Blob([JSON.stringify(dnd)], {
      type: 'application/json',
    });
    formData.append('dnd', jsonBlob);

    try {
      const resp = await this.dndService.createDnd(formData);
        if (resp.status === 200) {
            const created: any = resp.data || {};
            const createdId: number | undefined = created?.id ?? created?.dnd_id ?? created?.dndNameId;
            const createdName: string | undefined = created?.name ?? this.form.value.name;
            this.close();
            timer(1000).pipe(
                switchMap(() => from(this.dndService.getDndList())),
                map(listResp => {
                    const payload = listResp?.data;
                    return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
                })
            ).subscribe({
                next: (list: any[]) => {
                    const item = list.find((msisdn: any) => msisdn?.id === createdId || (createdName && msisdn?.name === createdName));
                    const comment: string | undefined = item?.comment;

                    if (comment) {
                        this.alertSvr.showAlert(2, comment, 'Warning');
                    } else {
                        this.alertSvr.success(resp.message || 'DND created successfully.');
                    }
                },
                error: (err) => {
                    console.error('Error while fetching the list:', err);
                    this.alertSvr.showAlert(2, 'Error retrieving DND list', 'Error');
                }
            });
            return;
        }
        this.alertSvr.showAlert(2, resp.message || 'Could not create DND', '');
    } catch {
        this.alertSvr.showAlert(2, 'Error', 'Unexpected error while saving DND');
    }
  }

  close(): void {
    this.closeModal.emit(true);
    this.initForm();

    this.showSenderInput = false;
    this.showNetworkSelect = false;
    this.selectedFile = null;
    this.fileError = '';
    this.resetFileInput();
  }

  private resetFileInput(): void {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
