import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { M3uaGeneralSettings, M3uaService, ResponseI } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { AlertService } from '@app/core/utils/alert.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
})
export class GeneralComponent implements OnDestroy {

  networkId!: number;
  m3uaSettings: M3uaGeneralSettings | null = null;
  form!: FormGroup;
  defaultValue = environment.GatewaySs7Defaults.m3ua;
  private subscriptions = new Subscription();
  response!: ResponseI;

  constructor(
    private route: ActivatedRoute,
    private m3uaService: M3uaService,
    private alertsvr: AlertService,
    private fb: FormBuilder,
    private m3uaSettingsService: M3uaSettingsService,
  ) {this.initializeForm();}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.networkId=0;
    this.form.reset({
      connectDelay: '',
      maxSequenceNumber: {value: '', disabled: true},
      maxAsForRoute: {value: '', disabled: true},
      deliverMessageThreadCount: this.defaultValue.DELIVER_MESSAGE_THREAD_COUNT,
      routingLabelFormat: {value: '', disabled: true},
      heartbeatTime: this.defaultValue.HEARTBEAT_TIME,
      useLowestBitForLink: this.defaultValue.USE_LOWEST_BIT_FOR_LINK,
      routingKeyManagementEnabled: this.defaultValue.ROUTING_KEY_MANAGEMENT_ENABLED,
      ccDelayThreshold1: this.defaultValue.CC_DELAY_THRESHOLD_1,
      ccDelayThreshold2: this.defaultValue.CC_DELAY_THRESHOLD_2,
      ccDelayThreshold3: this.defaultValue.CC_DELAY_THRESHOLD_3,
      ccDelayBackToNormalThreshold1: this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1,
      ccDelayBackToNormalThreshold2: this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2,
      ccDelayBackToNormalThreshold3: this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3,
    });


  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const networkIdParam = params.get('network_id');
      this.networkId = networkIdParam ? +networkIdParam : 0;
      if (this.networkId) {
        this.loadM3uaSettings();
      }
    });
    this.subscriptions.add(
          this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.applySettingsToForm(settings);
      }
    })
    );

  }

  initializeForm():void {
    this.form = this.fb.group({
      connectDelay: [this.defaultValue.CONNECT_DELAY, Validators.required],
      maxSequenceNumber: [{value: '', disabled: true}],
      maxAsForRoute: [{value: '', disabled: true}],
      deliverMessageThreadCount: [this.defaultValue.DELIVER_MESSAGE_THREAD_COUNT, Validators.required],
      routingLabelFormat: [{value: '', disabled: true}],
      heartbeatTime: [this.defaultValue.HEARTBEAT_TIME,Validators.required],
      useLowestBitForLink:[this.defaultValue.USE_LOWEST_BIT_FOR_LINK,Validators.required],
      routingKeyManagementEnabled:[this.defaultValue.ROUTING_KEY_MANAGEMENT_ENABLED,Validators.required],
      ccDelayThreshold1:[this.defaultValue.CC_DELAY_THRESHOLD_1,Validators.required],
      ccDelayThreshold2:[this.defaultValue.CC_DELAY_THRESHOLD_2,Validators.required],
      ccDelayThreshold3:[this.defaultValue.CC_DELAY_THRESHOLD_3,Validators.required],
      ccDelayBackToNormalThreshold1: [this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1,Validators.required],
      ccDelayBackToNormalThreshold2: [this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2,Validators.required],
      ccDelayBackToNormalThreshold3: [this.defaultValue.CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3,Validators.required],

    });
  }


  async loadM3uaSettings() {
    this.response = await this.m3uaService.getM3uaSettings(this.networkId);
    if (this.response.status === 200 && this.response.data) {
      this.m3uaSettings = this.response.data;
      if (this.m3uaSettings!=null) {
        this.applySettingsToForm(this.m3uaSettings);
        this.m3uaSettingsService.updateData(this.m3uaSettings);
      }
    } else {
      this.save();
    }
  }

  applySettingsToForm(settings: any): void {
      this.form.setValue({
        connectDelay: settings.connect_delay || '',
        maxSequenceNumber: settings.max_sequence_number || '',
        maxAsForRoute: settings.max_for_route || '',
        deliverMessageThreadCount: settings.thread_count || '',
        routingLabelFormat: settings.routing_label_format || '',
        heartbeatTime: settings.heart_beat_time || '',
        useLowestBitForLink:settings.use_lowest_bit_for_link || false ,
        routingKeyManagementEnabled: settings.routing_key_management_enabled || false,
        ccDelayThreshold1:settings.cc_delay_threshold_1 || 0,
        ccDelayThreshold2:settings.cc_delay_threshold_2 || 0,
        ccDelayThreshold3:settings.cc_delay_threshold_3 || 0,
        ccDelayBackToNormalThreshold1: settings.cc_delay_back_to_normal_threshold_1 || 0,
        ccDelayBackToNormalThreshold2: settings.cc_delay_back_to_normal_threshold_2 || 0,
        ccDelayBackToNormalThreshold3: settings.cc_delay_back_to_normal_threshold_3 || 0,
      });
  }


  async save() {
    if (this.form.invalid) {
      return
    }
    const formData = this.form.getRawValue();
    const m3uaData = {
      network_id: this.networkId,
      connect_delay: formData.connectDelay,
      thread_count: formData.deliverMessageThreadCount,
      heart_beat_time: formData.heartbeatTime,
      routing_key_management_enabled: formData.routingKeyManagementEnabled,
      use_lowest_bit_for_link: formData.useLowestBitForLink,
      cc_delay_threshold_1: formData.ccDelayThreshold1,
      cc_delay_threshold_2: formData.ccDelayThreshold2 ,
      cc_delay_threshold_3: formData.ccDelayThreshold3 ,
      cc_delay_back_to_normal_threshold_1: formData.ccDelayBackToNormalThreshold1 ,
      cc_delay_back_to_normal_threshold_2: formData.ccDelayBackToNormalThreshold2 ,
      cc_delay_back_to_normal_threshold_3: formData.ccDelayBackToNormalThreshold3 ,
    };

    if (this.m3uaSettings && this.m3uaSettings.id) {
      // Update existing M3UA settings
      this.response = await this.m3uaService.updateM3uaSettings(this.m3uaSettings.id, {...m3uaData, id:this.m3uaSettings.id});
      if (this.response.status === 200) {
        this.alertsvr.showAlert(1, this.response.message, this.response.comment);
      } else {
        this.alertsvr.showAlert(4, this.response.message, this.response.comment);
      }
    } else {
      // Create new M3UA settings
      this.response = await this.m3uaService.createM3uaSettings(m3uaData);

      if (this.response.status === 200) {
        this.alertsvr.showAlert(1, this.response.message, this.response.comment);
        this.loadM3uaSettings();
      } else {
        this.alertsvr.showAlert(4, this.response.message, this.response.comment);
      }
    }

  }


}
