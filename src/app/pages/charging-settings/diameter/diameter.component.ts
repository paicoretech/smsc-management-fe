import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { priorityRequiredValidator, hasPriorityGroupError } from '@app/shared/message-validator';
import {
  ChargingSettingsService,
  ChargingSetting,
  ResponseI,
  LocalPeer,
  Parameters,
  Application,
  Peer,
  Realm,
  AlertService,
  Mno,
  MnosService,
} from '@app/core';
import { FEATURE_FLAGS } from '@app/core/config/feeature-flag';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { isIpSmGw as isIpSmGwCtx, isSmsc as isSmscCtx } from '@core/utils/functions/apiContext.helper';

declare var window: any;

@Component({
  selector: 'app-diameter',
  templateUrl: './diameter.component.html',
})
export class DiameterComponent implements OnInit {
  @Input() diameterGatewayId: number | null = null;
  @Input() isCrudComponent: boolean = false;

  chargingSetting: ChargingSetting = {
    id: 0,
    network_id: 0,
    name: '',
    connection_type: '',
    type: '',
    mno_id: null,
    global_title: '',
    local_peer: {} as LocalPeer,
    parameters: {} as any,
    peers: [],
    realms: [],
    started: true,
    split_message: false,
    hss_update_enabled: false,
    allowed_traffic:false,
  };
  private backupChargingSetting!: ChargingSetting;
  readonly ipSmGwFeatureEnabled = FEATURE_FLAGS.ipSmGwEnabled;

  applications: Application[] = [];
  peers: Peer[] = [];
  realms: Realm[] = [];
  mnoList: Mno[] = [];
  form!: FormGroup;
  isModified: boolean = false;
  isDataLoaded: boolean = false;
  itemToToggle: any = null;
  toggleType: string = '';
  formModalConfirm: any;
  messageShow: string = '';
  ctx: ApiContext = ApiContext.SMSC;

  constructor(
    private fb: FormBuilder,
    private chargingSettingsService: ChargingSettingsService,
    private alertSvc: AlertService,
    private mnoService: MnosService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

    get flagsUi() {
      if (!this.ipSmGwFeatureEnabled) {
        return {
          showHssUpdate: false,
          showAllowedTraffic: false,
        };
      }

      return {
        showHssUpdate: !isIpSmGwCtx(this.ctx),
        showAllowedTraffic: !isSmscCtx(this.ctx),
      };
    }

   ngOnInit(): void {
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || 'SMSC';
    console.log('API Context Diameter Component:', this.ctx);
    this.initializeForm();
    this.applyCtxRulesToForm();
    this.loadChargingSettings();

    if (
      this.isCrudComponent &&
      this.diameterGatewayId &&
      this.diameterGatewayId > 0
    ) {
      this.chargingSetting.id = this.diameterGatewayId;
    }

    const el = document.getElementById('modalConfirmToggle');
    if (el) {
      this.formModalConfirm = new window.bootstrap.Modal(el);
    }

    this.applyCrudValidators();
    this.toggleFormState();
    this.getMnos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCrudComponent']) {
      this.applyCrudValidators();

      if (
        this.isCrudComponent &&
        this.diameterGatewayId &&
        this.diameterGatewayId > 0
      ) {
        this.chargingSetting.id = this.diameterGatewayId;
      }
    }

    this.toggleFormState();
  }

  

  async getMnos() {
    let response: ResponseI = await this.mnoService.getMnos();
    if (response.status == 200) {
      this.mnoList = response.data;
    }
  }

  toggleFormState(): void {
    setTimeout(() => {
      if (this.form) {
        if (this.chargingSetting.started) {
          this.form.disable();
        } else {
          this.form.enable();
        }
        this.cdRef.detectChanges();
      }
    });
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [{ value: null, disabled: true }],
      network_id: [null],
      name: ['', [Validators.required]],
      connection_type: ['SCTP', [Validators.required]],
      type: ['OCS', [Validators.required]],
      mno_id: [null],
      global_title: [''],
      messages_per_second_high: [70, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_medium: [20, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_low: [10, [Validators.required, Validators.pattern('^[0-9]+$')]],
      tps: [{ value: 100, disabled: true }],
      split_message: [false],
      hss_update_enabled: [false],
      allowed_traffic:[false],
            }, {
      validators: priorityRequiredValidator('messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low')
      });

    // Subscribe to priority field changes to calculate total tps
    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach(field => {
      this.form.get(field)?.valueChanges.subscribe(() => {
        this.calculateTotalTps();
      });
    });

    // Initial calculation
    this.calculateTotalTps();

    setTimeout(() => {
      this.calculateTotalTps();
    });

    this.form.valueChanges.subscribe(() => {
      if (this.chargingSetting.id === 0) {
        this.isModified = true;
        return;
      }
      if (this.isFormChanged()) {
        this.isModified = true;
      }
    });
  }

  private isFormChanged(): boolean {
    const v = this.form.getRawValue();

    const prevName = this.backupChargingSetting?.name ?? '';
    const prevConnectionType = this.backupChargingSetting?.connection_type ?? '';
    const prevMnoId = this.backupChargingSetting?.mno_id ? Number(this.backupChargingSetting.mno_id) : null;
    const prevGlobalTitle = this.backupChargingSetting?.global_title ?? '';
    const prevSplitMessage = this.backupChargingSetting?.split_message ?? false;
    const prevHssUpdateEnabled = this.backupChargingSetting?.hss_update_enabled ?? false;
    const prevAllowedTraffic = this.backupChargingSetting?.allowed_traffic ?? false;

    const curName = v.name ?? '';
    const curConnectionType = v.connection_type ?? '';
    const curMnoId = v.mno_id ? Number(v.mno_id) : null;
    const curGlobalTitle = v.global_title ?? '';
    const curSplitMessage = v.split_message ?? false;
    const curHssUpdateEnabled = v.hss_update_enabled ?? false;
    const curAllowedTraffic = v.allowed_traffic ?? false;


    return (
      curName !== prevName ||
      curConnectionType !== prevConnectionType ||
      curMnoId !== prevMnoId ||
      curGlobalTitle !== prevGlobalTitle ||
      curSplitMessage !== prevSplitMessage ||
      curHssUpdateEnabled !== prevHssUpdateEnabled
      || curAllowedTraffic !== prevAllowedTraffic
    );
  }

  calculateTotalTps(): void {
    const high = this.form.get('messages_per_second_high')?.value || 0;
    const medium = this.form.get('messages_per_second_medium')?.value || 0;
    const low = this.form.get('messages_per_second_low')?.value || 0;
    const total = high + medium + low;
    this.form.get('tps')?.setValue(total, { emitEvent: false });
  }

  private applyCrudValidators(): void {
    const mno = this.form?.get('mno_id');
    const type = this.form?.get('type');
    if (!mno || !type) return;

    if (this.isCrudComponent) {
      mno.addValidators(Validators.required);
      type.setValue('GATEWAY');
    } else {
      mno.removeValidators(Validators.required);
      type.setValue('OCS');
    }

    mno.updateValueAndValidity({ emitEvent: false });
    type.updateValueAndValidity({ emitEvent: false });

    const priorityValidators = [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
    ];

    const high = this.form.get('messages_per_second_high');
    const medium = this.form.get('messages_per_second_medium');
    const low = this.form.get('messages_per_second_low');

    [high, medium, low].forEach((ctrl) => {
        if (!ctrl) return;
        if (this.isCrudComponent) {
            ctrl.setValidators(priorityValidators);
        } else {
            ctrl.clearValidators();
            ctrl.setValue(null, { emitEvent: false });
        }
        ctrl.updateValueAndValidity({ emitEvent: false });
    });

    if (!this.isCrudComponent) {
        this.form.get('tps')?.setValue(0, { emitEvent: false });
    } else {
        this.calculateTotalTps();
    }
  }

  async loadChargingSettings(): Promise<void> {
    try {
      this.peers = [];
      this.realms = [];
      this.applications = [];
      this.isDataLoaded = false;
      this.toggleFormState();

      let response!: ResponseI;

      if (this.isCrudComponent && (!this.diameterGatewayId || this.diameterGatewayId <= 0)) {
         this.resetChargingSetting();
         this.isDataLoaded = true;
         this.toggleFormState();
         return;
      }

      if (
        this.isCrudComponent &&
        this.diameterGatewayId &&
        this.diameterGatewayId > 0
      ) {
        response = await this.chargingSettingsService.getDiameterGateway(
          this.diameterGatewayId
        );
      } else if (
        !this.isCrudComponent &&
        (this.diameterGatewayId === null ||
          this.diameterGatewayId === undefined)
      ) {
        response =
          await this.chargingSettingsService.getDiameterChargingSettings();
      }

      if (response.status === 200 && response.data) {
        const { data } = response;
        if (data) {
          this.backupChargingSetting = { ...data };
          this.chargingSetting = data;
          this.form.patchValue(this.chargingSetting);
          this.applyCtxRulesToForm();
          this.applications =
            this.chargingSetting?.local_peer?.applications || [];
          this.peers = this.chargingSetting?.peers || [];
          this.realms = this.chargingSetting?.realms || [];
          this.notifyUpdates();
        } else {
          this.resetChargingSetting();
        }
      } else {
        this.resetChargingSetting();
      }

      this.isModified = !!(this.isCrudComponent && this.diameterGatewayId && this.diameterGatewayId > 0);
    } catch (error) {
      this.resetChargingSetting();
    }
    this.isDataLoaded = true;
    this.toggleFormState();
  }

  private resetChargingSetting(): void {
    this.chargingSetting = {
      id: 0,
      network_id: 0,
      name: '',
      connection_type: '',
      type: '',
      local_peer: {} as LocalPeer,
      parameters: {} as Parameters,
      peers: [],
      realms: [],
      started: false,
      split_message: false,
      hss_update_enabled: false,
      allowed_traffic:false,
    };
    this.applications = [];
    this.peers = [];
    this.realms = [];
    this.isModified = false;
    if (this.form) {
        this.form.reset({
            id: null,
            network_id: null,
            name: '',
            connection_type: 'SCTP',
            type: this.isCrudComponent ? 'GATEWAY' : 'OCS',
            mno_id: null,
            global_title: '',
            messages_per_second_high: null,
            messages_per_second_medium: null,
            messages_per_second_low: null,
            tps: 0,
            split_message: false,
            hss_update_enabled: false,
            allowed_traffic: false,
        });
        this.calculateTotalTps();
    }
  }

  updateLocalPeer(data: { localPeer: LocalPeer; applications: Application[]; modified?: boolean; source?: string }) {
    const previousLocalPeer = JSON.stringify(
      this.backupChargingSetting?.local_peer ?? {}
    );
    const updatedLocalPeer = JSON.stringify({
      ...(data.localPeer ?? {}),
      applications: [...(data.applications ?? [])],
    });

    this.chargingSetting.local_peer = {
      ...(data.localPeer ?? {}),
      applications: [...(data.applications ?? [])],
    };
    this.applications = data?.applications ?? [];

    if (this.chargingSetting.id === 0) {
      this.isModified = true;
      return;
    }

    if (data?.source === 'form' && previousLocalPeer !== updatedLocalPeer) {
      this.isModified = true;
      return;
    }

    if (data?.source === 'applications') {
      this.save();
      return;
    }
  }

  updateParameters(updatedParameters: Parameters) {
    const previousParameters = JSON.stringify(
      this.backupChargingSetting?.parameters ?? {}
    );
    const newParameters = JSON.stringify(updatedParameters ?? {});

    this.chargingSetting.parameters = updatedParameters ?? {};

    if (this.chargingSetting.id !== 0 && previousParameters !== newParameters) {
      this.isModified = true;
    }
  }

  updatePeers(updatedPeers: Peer[]) {
    const previousPeers = JSON.stringify(
      this.backupChargingSetting?.peers ?? []
    );
    const newPeers = JSON.stringify(updatedPeers ?? []);

    this.chargingSetting.peers = updatedPeers ?? [];
    this.peers = updatedPeers ?? [];

    if (this.chargingSetting.id !== 0 && previousPeers !== newPeers) {
      this.save();
    }
  }

  updateRealms(updatedRealms: Realm[]) {
    const previousRealms = JSON.stringify(
      this.backupChargingSetting?.realms ?? []
    );
    const newRealms = JSON.stringify(updatedRealms ?? []);

    this.chargingSetting.realms = updatedRealms ?? [];
    this.realms = updatedRealms ?? [];

    if (this.chargingSetting.id !== 0 && previousRealms !== newRealms) {
      this.save();
    }
  }

  openConfirmToggle(item: any, type: 'diameter' | 'peer') {
    this.itemToToggle = item;
    this.toggleType = type;
    this.messageShow =
      type === 'diameter'
        ? `Are you sure you want to ${
            item.started ? 'stop' : 'start'
          } the Diameter Gateway?`
        : `Are you sure you want to ${
            item.started ? 'stop' : 'start'
          } this Peer?`;

    if (this.formModalConfirm) {
      this.formModalConfirm.show();
    }
  }

  async onConfirmToggle(confirm: boolean) {
    if (this.formModalConfirm) {
      this.formModalConfirm.hide();
    }

    if (!confirm || !this.itemToToggle) return;

    if (this.toggleType === 'diameter') {
      await this.toggleDiameterGateway();
    } else if (this.toggleType === 'peer') {
      await this.togglePeer(this.itemToToggle);
    }

    this.itemToToggle = null;
  }

  async toggleDiameterGateway(): Promise<void> {
    if (!this.chargingSetting.id) return;

    const newStatus = !this.chargingSetting.started;
    const response = await this.chargingSettingsService.toggleDiameterGateway(
      this.chargingSetting.id,
      newStatus
    );

    if (response.status === 200) {
      this.chargingSetting.started = newStatus;
      this.alertSvc.showAlert(
        1,
        'Success',
        `Diameter Gateway ${newStatus ? 'Started' : 'Stopped'} Successfully.`
      );
    } else {
      this.alertSvc.showAlert(
        4,
        'Error',
        'Error updating Diameter Gateway status.'
      );
    }
    this.loadChargingSettings();
  }

  async togglePeer(peer: Peer): Promise<void> {
    if (!peer.id) return;

    const newStatus = !peer.started;
    const response = await this.chargingSettingsService.toggleSpecificPeer(
      peer.id,
      newStatus
    );

    if (response.status === 200) {
      this.peers = [];
      this.alertSvc.showAlert(
        1,
        'Success',
        `Peer ${newStatus ? 'Started' : 'Stopped'} Successfully.`
      );
    } else {
      this.alertSvc.showAlert(4, 'Error', 'Error updating Peer status.');
    }
    setTimeout(() => {
      this.loadChargingSettings();
    }, 100);
  }

  validateData(): boolean {
    if (!this.form.valid) {
      this.alertSvc.showAlert(
        4,
        'Error',
        'Please fill all the required fields in the form.'
      );
      return false;
    }

    if (this.isCrudComponent) {
      if (this.form.get('mno_id')?.invalid) {
        this.alertSvc.showAlert(4, 'Error', 'MNO is required.');
        return false;
      }
    }

    if (
      !this.chargingSetting.local_peer ||
      !this.chargingSetting.local_peer.uri ||
      !this.chargingSetting.local_peer.realm ||
      !this.chargingSetting.local_peer.ip_addresses ||
      this.chargingSetting.local_peer.vendor_id == null ||
      !this.chargingSetting.local_peer.product_name ||
      this.chargingSetting.local_peer.firmware_version == null
    ) {
      this.alertSvc.showAlert(
        4,
        'Error',
        'Local Peer must have URI, Realm, IP Addresses, Vendor ID, Product Name, and Firmware Version defined.'
      );
      return false;
    }

    if (
      !this.chargingSetting.local_peer.applications ||
      this.chargingSetting.local_peer.applications.length === 0
    ) {
      this.alertSvc.showAlert(
        4,
        'Error',
        'At least one Application is required.'
      );
      return false;
    }

    return true;
  }

  async save(): Promise<void> {
    if (!this.validateData()) return;

    const v = this.form.getRawValue();

    const payload = {
      ...this.chargingSetting,
      name: v.name,
      type: v.type,
      connection_type: v.connection_type,
      mno_id: v.mno_id,
      global_title: v.global_title,
      messages_per_second_high: v.messages_per_second_high,
      messages_per_second_medium: v.messages_per_second_medium,
      messages_per_second_low: v.messages_per_second_low,
      split_message: v.split_message,
      hss_update_enabled: isIpSmGwCtx(this.ctx) ? true : !!v.hss_update_enabled,
      allowed_traffic: isSmscCtx(this.ctx) ? true : (v.allowed_traffic ?? true),
    };

    if (this.isCrudComponent) {
        payload.messages_per_second_high = v.messages_per_second_high;
        payload.messages_per_second_medium = v.messages_per_second_medium;
        payload.messages_per_second_low = v.messages_per_second_low;
    } else {
        delete payload.messages_per_second_high;
        delete payload.messages_per_second_medium;
        delete payload.messages_per_second_low;
        delete payload.tps;
    }


    if (isSmscCtx(this.ctx)) payload.allowed_traffic = true;
    if (isIpSmGwCtx(this.ctx)) payload.hss_update_enabled = true;


    this.cleanTemporaryIds();
    this.restoreDeletedItems();

    this.replaceEmptyStringsWithNull(payload);

    if (payload.mno_id === 0) payload.mno_id = null;
    if (payload.network_id === 0) payload.network_id = null;

    const isCreate = !payload.id;

    if (isCreate) {
      payload.id = null;
    }

    if (!this.isCrudComponent) {
      payload.network_id = null;
    }

    const resp = isCreate
      ? await this.chargingSettingsService.addDiameterGateway(payload)
      : await this.chargingSettingsService.updateDiameterGateway(
          payload.id!,
          payload
        );

    if (resp.status === 200) {
      this.alertSvc.showAlert(
        1,
        'Success',
        isCreate ? 'Record added successfully.' : 'Record updated successfully.'
      );

      if (isCreate && this.isCrudComponent) {
        if(isIpSmGwCtx(this.ctx)){
          this.router.navigate(['/pages/ip-sm-gw/diameter']);
        }else{
          this.router.navigate(['/pages/gateways/diameter']);
        }
        return;
      }

      this.isModified = false;
      this.peers = [];
      this.realms = [];
      this.loadChargingSettings();
      this.notifyUpdates();
    } else {
      this.alertSvc.showAlert(
        4,
        'Error',
        isCreate ? 'Error adding record.' : 'Error updating record.'
      );
    }
  }

  private notifyUpdates(): void {
    this.peers = [...(this.chargingSetting.peers || [])];
    this.realms = [...(this.chargingSetting.realms || [])];
  }

  private cleanTemporaryIds(): void {
    this.chargingSetting.realms = this.chargingSetting.realms || [];

    this.chargingSetting.realms.forEach((realm) => {
      if (this.isTemporaryId(realm.id)) delete realm.id;

      if (
        realm.application &&
        (realm.application.id === null ||
          realm.application.id === undefined ||
          realm.application.id === 0)
      ) {
        delete realm.application.id;
      }
    });

    this.chargingSetting.peers = this.chargingSetting.peers || [];
    this.chargingSetting.peers.forEach((peer) => {
      if (this.isTemporaryId(peer.id)) delete peer.id;
    });

    if (!this.chargingSetting.id) {
      if (this.chargingSetting.local_peer) {
        delete this.chargingSetting.local_peer.id;
      }

      if (this.chargingSetting.parameters) {
        delete this.chargingSetting.parameters.id;
      }
    }

    if (
      this.chargingSetting.local_peer &&
      this.chargingSetting.local_peer.applications
    ) {
      this.chargingSetting.local_peer.applications.forEach((application) => {
        if (this.isTemporaryId(application.id)) delete application.id;
      });
    }
  }

  private restoreDeletedItems(): void {
    if (!this.backupChargingSetting) return;

    this.chargingSetting.local_peer = this.chargingSetting.local_peer || {
      applications: [],
    };
    this.chargingSetting.peers = this.chargingSetting.peers || [];
    this.chargingSetting.realms = this.chargingSetting.realms || [];

    this.backupChargingSetting.local_peer = this.backupChargingSetting
      .local_peer || { applications: [] };
    this.backupChargingSetting.peers = this.backupChargingSetting.peers || [];
    this.backupChargingSetting.realms = this.backupChargingSetting.realms || [];

    const currentApplicationIds = new Set(
      this.chargingSetting.local_peer.applications.map((app) => app.id)
    );
    const deletedApplications =
      this.backupChargingSetting.local_peer.applications
        .filter((app) => app.id && !currentApplicationIds.has(app.id))
        .map((app) => ({ ...app, delete: true }));

    this.chargingSetting.local_peer.applications.push(...deletedApplications);

    const currentPeerIds = new Set(
      this.chargingSetting.peers.map((peer) => peer.id)
    );
    const deletedPeers = this.backupChargingSetting.peers
      .filter((peer) => peer.id && !currentPeerIds.has(peer.id))
      .map((peer) => ({ ...peer, delete: true }));

    this.chargingSetting.peers.push(...deletedPeers);

    const currentRealmIds = new Set(
      this.chargingSetting.realms.map((realm) => realm.id)
    );
    const deletedRealms = this.backupChargingSetting.realms
      .filter((realm) => realm.id && !currentRealmIds.has(realm.id))
      .map((realm) => ({ ...realm, delete: true }));

    this.chargingSetting.realms.push(...deletedRealms);
  }

  private replaceEmptyStringsWithNull(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && obj[key].trim() === '') {
        obj[key] = null;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.replaceEmptyStringsWithNull(obj[key]);
      }
    }
    return obj;
  }

  private isTemporaryId(id?: number): boolean {
    return id !== undefined && id >= 1_000_000_000_000;
  }

  validInput(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['required']
    );
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  validPattern(name: string) {
    return (
      this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern']
    );
  }

  getPatternMessage(name: string) {
    if (
      this.form.get(name)?.errors?.['pattern']?.requiredPattern ==
      '^[A-Za-z0-9]*$'
    ) {
      return 'Only alphanumeric characters are allowed';
    } else if (
      this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$'
    ) {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  get isIpSmGw(): boolean { return this.ctx === 'IP_SM_GW'; }
  get isSMSC(): boolean { return this.ctx === 'SMSC'; }

  private applyCtxRulesToForm(): void {
    if (!this.form) return;

    const hssCtrl = this.form.get('hss_update_enabled');
    const allowedCtrl = this.form.get('allowed_traffic');


    if (this.isIpSmGw) {
      hssCtrl?.setValue(true, { emitEvent: false });
      hssCtrl?.disable({ emitEvent: false });

      allowedCtrl?.setValue(allowedCtrl?.value ?? true, { emitEvent: false });
      allowedCtrl?.enable({ emitEvent: false });
    }


    if (this.isSMSC) {
      allowedCtrl?.setValue(true, { emitEvent: false });
      allowedCtrl?.disable({ emitEvent: false });


      hssCtrl?.enable({ emitEvent: false });
    }
  }
  hasPriorityValidationError(): boolean {
    return hasPriorityGroupError(
      this.form,
      'atLeastOnePriorityActive',
      [
        'messages_per_second_high',
        'messages_per_second_medium',
        'messages_per_second_low'
      ]
      );
    }
}
