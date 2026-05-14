import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GatewaySs7Service, HomeRouting, HomeRoutingService, HrMode, ResponseI } from '@app/core';
import { AlertService } from '@app/core/utils/alert.service';

@Component({
  selector: 'app-general-hr',
  templateUrl: './general-hr.component.html',
})
export class GeneralHRComponent implements OnInit, OnDestroy {

  gateway: any = null;
  hasUnsavedChanges: boolean = false;
  isHotReloadInProgress: boolean = false;
  @Input() set dataGateway(value: any) {
    this.gateway = value;
  }
  networkId!: number;
  form!: FormGroup;
  homeRouting: HomeRouting | null = null;
  response!: ResponseI;
  modes = Object.values(HrMode);
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private alertSvr: AlertService,
    private gatewaySs7Service: GatewaySs7Service,
    private homeRoutingService: HomeRoutingService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('network_id');
      this.networkId = idParam ? +idParam : 0;
      if (this.networkId) {
        this.loadHomeRouting();
      }
    });
  }

  isGatewayStarted(): boolean {
    return this.gateway && this.gateway.enabled === 1;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      mode: [HrMode.TRANSPARENT, Validators.required],
      ttlCache: [300, [Validators.required, Validators.min(1)]],
    });
  }

  async loadHomeRouting(): Promise<void> {
    this.response = await this.homeRoutingService.getHomeRoutingByNetwork(this.networkId);
    if (this.response.status === 200 && this.response.data) {
      this.homeRouting = this.response.data as HomeRouting;
      this.applySettingsToForm(this.homeRouting);
    } else {
      await this.save();
    }
  }

  applySettingsToForm(data: HomeRouting): void {
    this.form.setValue({
      mode: data.mode ?? HrMode.TRANSPARENT,
      ttlCache: data.ttl_cache ?? 300,
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const formData = this.form.value;
    const payload: HomeRouting = {
      id: this.homeRouting?.id ?? 0,
      network_id: this.networkId,
      mode: formData.mode,
      ttl_cache: formData.ttlCache,
    };

    if (this.homeRouting?.id) {
      this.response = await this.homeRoutingService.updateHomeRouting(payload);
    } else {
      this.response = await this.homeRoutingService.createHomeRouting(payload);
    }
    this.hasUnsavedChanges = true;
    const success = this.response.status === 200;
    this.alertSvr.showAlert(success ? 1 : 4, this.response.message, this.response.comment);
    if (success) await this.loadHomeRouting();
  }

  async triggerHotReload(): Promise<void> {
    if (!this.hasUnsavedChanges || this.isHotReloadInProgress) {
      return;
    }

    this.isHotReloadInProgress = true;
    try {
      const response = await this.gatewaySs7Service.triggerSccpHotReload('SCCP', 'RULES', this.networkId);
      
      if (response && response.status === 200) {
        this.alertSvr.success('SCCP Rules hot reload triggered successfully');
        this.hasUnsavedChanges = false;
      } else {
        this.alertSvr.warning('Hot reload request completed with warnings');
      }
    } catch (error: any) {
      console.error('Hot reload error:', error);
      if (error?.error?.message) {
        this.alertSvr.error(`Hot reload failed: ${error.error.message}`);
      } else {
        this.alertSvr.error('Failed to trigger hot reload. Please check your connection.');
      }
    } finally {
      this.isHotReloadInProgress = false;
    }
  }
}