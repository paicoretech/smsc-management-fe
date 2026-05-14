import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertService } from '@app/core';
import { DateTime } from 'luxon';
import { environment } from '@env/environment';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
})
export class LogFiltersComponent {
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<any>();
  private _originNetworkList: any[] = [];
  private _destinationNetworkList: any[] = [];
  private _catalogBroadcastList: any[] = [];
  private _initialFilters: any = null;

  private lastStartDatePart: string | null = null;
  private lastEndDatePart: string | null = null;

  @Input() hideAdvancedFilters: boolean = false;

  // Account filter - can be configured to show only SPs or all accounts
  @Input() set originNetworkList(value: any[]) {
    // Check environment variable to determine if filtering is enabled
    let filteredList = value || [];
    const filterEnabled = String(environment.filterOnlyServiceProviders).toLowerCase() === 'true';
    if (filterEnabled) {
      filteredList = value?.filter(item => {
        if (item.type) {
          return item.type.toLowerCase() === 'sp';
        }
        if (item.network_type) {
          return item.network_type.toLowerCase() === 'sp';
        }
        return true;
      }) || [];
    }
    
    // Add 'ALL' option at the beginning if it doesn't exist
    const hasAll = filteredList?.some(item => item.network_id === '' && item.name === 'ALL');
    this._originNetworkList = hasAll ? filteredList : [{ network_id: '', name: 'ALL' }, ...filteredList];
  }
  
  // Destination Gateway filter - independent configuration
  @Input() set destinationNetworkList(value: any[]) {
    // Check environment variable to determine if filtering is enabled for destination gateway
    let filteredList = value || [];
    const filterEnabled = String(environment.filterOnlyGateways).toLowerCase() === 'true';
    if (filterEnabled) {
      filteredList = value?.filter(item => {
        if (item.type) {
          return item.type.toLowerCase() === 'gw';
        }
        if (item.network_type) {
          return item.network_type.toLowerCase() === 'gw';
        }
        return true;
      }) || [];
    }
    
    // Add 'ALL' option at the beginning if it doesn't exist
    const hasAll = filteredList?.some(item => item.network_id === '' && item.name === 'ALL');
    this._destinationNetworkList = hasAll ? filteredList : [{ network_id: '', name: 'ALL' }, ...filteredList];
  }

  @Input() set catalogBroadcastList(value: any[]) {
    this._catalogBroadcastList = value;
    this.updateBroadcastOptions();
  }

  @Input() set initialFilters(value: any) {
    this._initialFilters = value;
    if (this.filtersForm) {
      this.filtersForm.patchValue({
        ...value,
      }, { emitEvent: false });
      this.syncDateParts();
    }
  }

  filtersForm!: FormGroup;
  broadcastNameList: any[] = [];
  broadcastUserList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
  ) {}
  
  ngOnInit(): void {
    this.filtersForm = this.fb.group({
      start_datetime: [null],
      end_datetime: [null],
      source_addr: [null],
      destination_addr: [null],
      origin_network: [null],
      destination_network: [null],
      status: [null],
      message_type: [null],
      origin_type: [null],
      destination_type: [null],
      origin_protocol: [null],
      destination_protocol: [null],
      registered_delivery: [null],
      broadcast_filter_id: [null],
      broadcast_filter_user: [null],
    });

    if (this._initialFilters?.start_datetime && this._initialFilters?.end_datetime) {
      this.filtersForm.patchValue(this._initialFilters, { emitEvent: false });
    } else {
      this.assignInitialCurrentDay();
    }

    this.syncDateParts();
  }

  onClose(): void {
    this.close.emit();
  }

  onDateTimeChange(control: 'start' | 'end'): void {
    const startRaw = this.filtersForm.get('start_datetime')?.value;
    const endRaw = this.filtersForm.get('end_datetime')?.value;

    if (!startRaw || !endRaw) {
      this.syncDateParts();
      return;
    }

    const start = DateTime.fromISO(startRaw);
    const end = DateTime.fromISO(endRaw);

    if (!start.isValid || !end.isValid) {
      this.syncDateParts();
      return;
    }

    const currentDatePart = control === 'start' ? start.toISODate() : end.toISODate();
    const previousDatePart = control === 'start' ? this.lastStartDatePart : this.lastEndDatePart;

    const datePartChanged = currentDatePart !== previousDatePart;

    // If only the time has changed, keep it as is.
    if (!datePartChanged) {
      this.syncDateParts();
      return;
    }

    // Only auto-adjust when both dates are on the same day.
    if (start.hasSame(end, 'day')) {
      const now = DateTime.local();
      const normalizedStart = start.startOf('day');
      const normalizedEnd = start.hasSame(now, 'day')
        ? now
        : end.endOf('day');

      this.filtersForm.patchValue(
        {
          start_datetime: normalizedStart.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
          end_datetime: normalizedEnd.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
        },
        { emitEvent: false }
      );
    }

    this.syncDateParts();
  }

  applyFilters(): void {
    const rawFilters = this.filtersForm.value;

    const start = rawFilters.start_datetime;
    const end = rawFilters.end_datetime;

    if (start && end) {
      const startDate = DateTime.fromISO(start);
      const endDate = DateTime.fromISO(end);

      if (!startDate.isValid || !endDate.isValid) {
        this.alertService.showAlert(4, 'Invalid Dates', 'Please enter valid start and end dates.');
        return;
      }

      if (endDate < startDate) {
        this.alertService.showAlert(4, 'Invalid Dates', 'The end date cannot be earlier than the start date.');
        return;
      }

      const diffInMonths = endDate.diff(startDate, 'months').months;
      if (diffInMonths > 3) {
        this.alertService.showAlert(2, 'Date Range Too Large', 'The selected date range must not exceed 3 months.');
        return;
      }
    } else {
      this.alertService.showAlert(2, 'Missing Dates', 'Please select both start and end dates.');
      return;
    }
    
    const isNonEmpty = (v: unknown) => v !== '' && v !== null && v !== undefined;

    const cleanArrayIfArray = <T>(value: T | T[]) =>
      Array.isArray(value) ? value.filter(isNonEmpty) : value;

    const toNullIfEmptyArray = <T>(value: T | T[]) =>
      Array.isArray(value) && value.length === 0 ? null : value;

    const cleanedFilters = {
      ...rawFilters,
      origin_network: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.origin_network)),
      destination_network: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.destination_network)),
      origin_protocol: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.origin_protocol)),
      destination_protocol: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.destination_protocol)),
      broadcast_filter_id: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.broadcast_filter_id)),
      broadcast_filter_user: toNullIfEmptyArray(cleanArrayIfArray(rawFilters.broadcast_filter_user)),
    };

    this.apply.emit(cleanedFilters);
  }

  resetFilters(): void {
    this.filtersForm.reset({
      start_datetime: null,
      end_datetime: null,
      source_addr: null,
      destination_addr: null,
      origin_network: null,
      destination_network: null,
      status: null,
      message_type: null,
      origin_type: null,
      destination_type: null,
      origin_protocol: null,
      destination_protocol: null,
      registered_delivery: null,
      broadcast_filter_id: null,
      broadcast_filter_user: null,
    });

    this.assignDefaultDates();
    this.syncDateParts();

    this.applyFilters();
  }

  get originNetworkList(): any[] {
    return this._originNetworkList;
  }

  get destinationNetworkList(): any[] {
    return this._destinationNetworkList;
  }

  private updateBroadcastOptions(): void {
    this.broadcastNameList = [];
    this.broadcastUserList = [];

    const broadcastIds = new Map();
    const userIds = new Map();

    for (const item of this._catalogBroadcastList) {
      if (!broadcastIds.has(item.broadcast_id)) {
        this.broadcastNameList.push({ id: item.broadcast_id, name: item.broadcast_name });
        broadcastIds.set(item.broadcast_id, true);
      }
      if (!userIds.has(item.user_id)) {
        this.broadcastUserList.push({ id: item.user_id, name: item.user_name });
        userIds.set(item.user_id, true);
      }
    }
  }

  private assignInitialCurrentDay(): void {
    const now = DateTime.local();

    this.filtersForm.patchValue({
      start_datetime: now.startOf('day').toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      end_datetime: now.endOf('day').toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    }, { emitEvent: false });
  }

  private assignDefaultDates(daysBack: number = 7): void {
    const now = DateTime.local();
    const defaultStart = now.minus({ days: daysBack }).startOf('day');

    const formattedStart = defaultStart.toFormat("yyyy-MM-dd'T'HH:mm:ss");
    const formattedEnd = now.toFormat("yyyy-MM-dd'T'HH:mm:ss");

    this.filtersForm.patchValue({
      start_datetime: formattedStart,
      end_datetime: formattedEnd,
    }, { emitEvent: false });
  }

  private syncDateParts(): void {
    const startRaw = this.filtersForm?.get('start_datetime')?.value;
    const endRaw = this.filtersForm?.get('end_datetime')?.value;

    this.lastStartDatePart = startRaw ? DateTime.fromISO(startRaw).toISODate() : null;
    this.lastEndDatePart = endRaw ? DateTime.fromISO(endRaw).toISODate() : null;
  }

}
