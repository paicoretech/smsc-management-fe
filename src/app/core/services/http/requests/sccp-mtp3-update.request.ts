import { SccpMtp3Destination } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpMtp3UpdateRequest implements IBaseRequest {

  constructor(
    private dto: SccpMtp3Destination
  ) {}

  toJson(): object {
    return {
      "id": this.dto.id,
      "name": this.dto.name,
      "first_point_code": this.dto.first_point_code,
      "last_point_code": this.dto.last_point_code,
      "first_sls": this.dto.first_sls,
      "last_sls": this.dto.last_sls,
      "sls_mask": this.dto.sls_mask,
      "sccp_sap_id": this.dto.sccp_sap_id
    }
  }
}
