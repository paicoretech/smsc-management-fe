import { SccpGeneralSettings } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpPropertiesUpdateRequest implements IBaseRequest {

  constructor(
    private networkId: number,
    private dto: SccpGeneralSettings
  ) {}

  toJson(): object {
    return {
      "network_id": this.networkId,
      "z_margin_xudt_message": this.dto.z_margin_xudt_message,
      "remove_spc": this.dto.remove_spc,
      "sst_timer_duration_min": this.dto.sst_timer_duration_min,
      "sst_timer_duration_max": this.dto.sst_timer_duration_max,
      "sst_timer_duration_increase_factor": this.dto.sst_timer_duration_increase_factor,
      "max_data_message": this.dto.max_data_message,
      "period_of_logging": this.dto.period_of_logging,
      "reassembly_timer_delay": this.dto.reassembly_timer_delay,
      "preview_mode": this.dto.preview_mode,
      "congestion_control_timer_a": this.dto.congestion_control_timer_a,
      "congestion_control_timer_d": this.dto.congestion_control_timer_d,
      "congestion_control_algorithm": this.dto.congestion_control_algorithm,
      "congestion_control": this.dto.congestion_control,
    };
  }
}
