import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, GatewaySs7, GatewaySs7Service, MapInterface, ResponseI, TcapInterface, TcapMapService } from '@app/core';
import { environment } from '@env/environment';
@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
})
export class ConfigurationsComponent implements OnInit {

  networkId!: number;
  gatewaySs7!: GatewaySs7 | null;
  response!: ResponseI;
  tcap!: TcapInterface;
  map!: MapInterface;
  defaultValueTcap= environment.GatewaySs7Defaults.tcap;
  defaultValueMap= environment.GatewaySs7Defaults.map;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gatewaySs7Service: GatewaySs7Service,
    private serviceTcapMap: TcapMapService,
    private alertSvc: AlertService
  ) { }

  async ngOnInit() {
    const networkIdParam = this.route.snapshot.paramMap.get('network_id');
    this.networkId = networkIdParam ? + networkIdParam : 0;
    
    let response = await this.gatewaySs7Service.getGatewaySs7ById(this.networkId);
    if (response.status == 200) {
      this.gatewaySs7 = response.data;
      this.validateSettingsTcapMap();
    } else {
      this.router.navigate(['/pages/gateways/ss7']);
    }

  }

  async validateSettingsTcapMap() {
    const responseTcap = await this.serviceTcapMap.getTcap(this.networkId);
    const responseMap = await this.serviceTcapMap.getMap(this.networkId);


    if (responseTcap !== null && responseTcap.status !== 200 && responseMap !== null && responseMap.status !== 200) {
      this.createSettingsTcapMap();
    }
  }

  async createSettingsTcapMap() {

    this.tcap = {
      network_id: this.networkId,
      ssn_list: this.defaultValueTcap.ssn_list,
      preview_mode: this.defaultValueTcap.preview_mode,
      dialog_idle_timeout: this.defaultValueTcap.dialog_timeout,
      invoke_timeout: this.defaultValueTcap.invoke_timeout,
      dialog_id_range_start: this.defaultValueTcap.dialog_range_start,
      dialog_id_range_end: this.defaultValueTcap.dialog_range_end,
      max_dialogs: this.defaultValueTcap.max_dialogs,
      do_not_send_protocol_version: this.defaultValueTcap.do_not_send,
      swap_tcap_id_enabled: this.defaultValueTcap.swap_tcap,
      sls_range_id: this.defaultValueTcap.sls_range,
      exr_delay_thr1: this.defaultValueTcap.exr_delay_thr_1,
      exr_delay_thr2: this.defaultValueTcap.exr_delay_thr_2,
      exr_delay_thr3: this.defaultValueTcap.exr_delay_thr_3,
      exr_back_to_normal_delay_thr1: this.defaultValueTcap.exr_normal_delay_thr_1,
      exr_back_to_normal_delay_thr2: this.defaultValueTcap.exr_normal_delay_thr_2,
      exr_back_to_normal_delay_thr3: this.defaultValueTcap.exr_normal_delay_thr_3,
      memory_monitor_thr1: this.defaultValueTcap.memory_monitor_thr_1,
      memory_monitor_thr2: this.defaultValueTcap.memory_monitor_thr_2,
      memory_monitor_thr3: this.defaultValueTcap.memory_monitor_thr_3,
      mem_back_to_normal_delay_thr1: this.defaultValueTcap.mem_normal_delay_thr_1,
      mem_back_to_normal_delay_thr2: this.defaultValueTcap.mem_normal_delay_thr_2,
      mem_back_to_normal_delay_thr3: this.defaultValueTcap.mem_normal_delay_thr_3,
      blocking_incoming_tcap_messages: this.defaultValueTcap.blocking_tcap
    };

    this.map = {
      network_id: this.networkId,
      sri_service_op_code: this.defaultValueMap.sri_service_op_code,
      forward_sm_service_op_code: this.defaultValueMap.forward_sm_service_op_code,
    }

    this.response = await this.serviceTcapMap.createTcap(this.tcap);
    let isComplete: boolean = false;
    if (this.response.status == 200) {
      isComplete=true;
    } 

    if ( isComplete ) {
      this.response = await this.serviceTcapMap.createMap(this.map);

      if (this.response.status === 200) {
        this.alertSvc.showAlert(1, 'Success', 'TCAP/MAP configuration created correctly');
      } else {
        this.alertSvc.showAlert(2, 'Warning', 'TCAP/MAP configuration not created');
      }
    } else {
      this.alertSvc.showAlert(2, 'Warning', 'TCAP/MAP configuration not created');
    }
  }

}