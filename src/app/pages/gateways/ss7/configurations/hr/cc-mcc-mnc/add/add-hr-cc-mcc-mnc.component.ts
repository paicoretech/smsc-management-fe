import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import {
  AlertService,
  HomeRoutingCcMccMnc,
  HomeRoutingService,
} from '@app/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-hr-cc-mcc-mnc',
  templateUrl: './add-hr-cc-mcc-mnc.component.html',
})
export class AddHrCcMccMncComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<boolean>();
  @Input() ss7HomeRoutingId!: number;

  @Input() set dataUpdate(value: HomeRoutingCcMccMnc | null) {
    if (value) {
      this.isEdit = true;
      this.title = 'Edit MSISDN Prefix / MCC-MNC';
      this.row = value;
      this.loadDataForm(value);
    } else {
      this.isEdit = false;
      this.title = 'Create MSISDN Prefix / MCC-MNC';
      this.row = null;
      this.loadDataForm(null);
    }
  }

  @ViewChild(FormGroupDirective) formGroupDir!: FormGroupDirective;

  title = 'Create MSISDN Prefix / MCC-MNC';
  form!: FormGroup;
  row: HomeRoutingCcMccMnc | null = null;
  isEdit = false;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private hrService: HomeRoutingService,
    private alertsvr: AlertService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      country_code: ['', [Validators.pattern('^[0-9]+$')]],
      mcc_mnc: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      smsc: ['', [Validators.pattern('^[0-9]+$')]],
    });
  }

  loadDataForm(data: HomeRoutingCcMccMnc | null): void {
    if (!this.form) this.initializeForm();
    if (data) {
      this.form.patchValue({
        country_code: data.country_code ?? '',
        mcc_mnc: data.mcc_mnc ?? '',
        smsc: data.smsc ?? '',
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    } else {
      this.cleanForm();
    }
  }

  validInput(name: string) {
    const c = this.form.get(name);
    return c?.touched && c?.invalid;
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const payload: HomeRoutingCcMccMnc = {
      id: this.row?.id ?? 0,
      country_code: v.country_code,
      mcc_mnc: v.mcc_mnc,
      smsc: v.smsc,
      ss7_home_routing_id: this.ss7HomeRoutingId,
    };

    try {
      const resp = this.isEdit
        ? await this.hrService.updateCcMccMnc(payload)
        : await this.hrService.createCcMccMnc(payload);

      if (resp.status === 200) {
        this.alertsvr.showAlert(1, resp.message, resp.comment);
        this.cleanForm();
        this.close(true);
      } else {
        const comment = (resp.comment ?? '').toLowerCase();

        const duplicatePatterns = [
          'duplicate key value',
          'violates unique constraint',
          'uk_hr_cc_mccmnc_per_hr',
          'already exists',
        ];

        const isDuplicate = duplicatePatterns.some((p) => comment.includes(p));

        if (isDuplicate) {
          this.alertsvr.showAlert(
            4,
            'Validation Error',
            'The combination of MSISDN Prefix / MCC-MNC already exists.'
          );
        } else {
          this.alertsvr.showAlert(4, resp.message, resp.comment);
        }
      }
    } catch (e) {
      console.log('ERROR CATCH');

      this.alertsvr.showAlert(
        3,
        'Server error',
        'An error occurred while saving.'
      );
    }
  }

  close(refresh = false): void {
    this.cleanForm();
    this.isEdit = false;
    this.row = null;
    this.title = 'Create MSISDN Prefix / MCC-MNC';
    this.closeModal.emit(refresh);
  }

  cleanForm(): void {
    if (!this.form) return;

    this.form.reset({
      country_code: '',
      mcc_mnc: '',
      smsc: '',
    });

    if (this.formGroupDir) {
      this.formGroupDir.resetForm({
        country_code: '',
        mcc_mnc: '',
        smsc: '',
      });
    } else {
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }
}