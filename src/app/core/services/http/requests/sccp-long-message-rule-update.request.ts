import { SccpLongMessageRule } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpLongMessageRuleUpdateRequest implements IBaseRequest {

  constructor(
    private dto: SccpLongMessageRule
  ) {}

  toJson(): object {
    return {
      "id": this.dto.id,
      "first_point_code": this.dto.first_point_code,
      "last_point_code": this.dto.last_point_code,
      "long_message_rule_type": this.dto.long_message_rule_type,
      "sccp_sap_id": this.dto.sccp_sap_id
    }
  }
}
