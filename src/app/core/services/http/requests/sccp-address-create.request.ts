import { SccpAddress } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpAddressCreateRequest implements IBaseRequest {

  constructor(
    private sccpId: number,
    private dto: SccpAddress
  ) {}

  toJson(): object {
    return {
      "ss7_sccp_id": this.sccpId,
      "name": this.dto.name,
      "address_indicator": this.dto.address_indicator,
      "point_code": this.dto.point_code,
      "subsystem_number": this.dto.subsystem_number,
      // "gt_indicator": this.dto.gt_indicator,
      "translation_type": this.dto.translation_type,
      "numbering_plan_id": this.dto.numbering_plan_id,
      "nature_of_address_id": this.dto.nature_of_address_id,
      "digits": this.dto.digits,
    }
  }
}
