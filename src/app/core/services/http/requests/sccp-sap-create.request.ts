import { SccpServiceAccessPoint } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpSapCreateRequest implements IBaseRequest {

  constructor(
    private sccpId: number,
    private dto: SccpServiceAccessPoint
  ) {}

  toJson(): object {
    return {
      "ss7_sccp_id": this.sccpId,
      "name": this.dto.name,
      "origin_point_code": this.dto.origin_point_code,
      "network_indicator": this.dto.network_indicator,
      "local_gt_digits": this.dto.local_gt_digits,
    }
  }
}
