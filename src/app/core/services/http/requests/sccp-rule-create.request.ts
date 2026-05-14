import { SccpRule } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpRuleCreateRequest implements IBaseRequest {

  constructor(
    private dto: SccpRule
  ) {}

  toJson(): object {
    return {
      "name": this.dto.name,
      "mask": this.dto.mask,
      "address_indicator": this.dto.address_indicator,
      "point_code": this.dto.point_code,
      "subsystem_number": this.dto.subsystem_number,
      "translation_type": this.dto.translation_type,
      "numbering_plan_id": this.dto.numbering_plan_id,
      "nature_of_address_id": this.dto.nature_of_address_id,
      "global_tittle_digits": this.dto.global_tittle_digits,
      "rule_type_id": this.dto.rule_type_id,
      "primary_address_id": this.dto.primary_address_id,
      "secondary_address_id": this.dto.secondary_address_id,
      "load_sharing_algorithm_id": this.dto.load_sharing_algorithm_id,
      "new_calling_party_address": this.dto.new_calling_party_address,
      "origination_type_id": this.dto.origination_type_id,
      "calling_address_indicator": this.dto.calling_address_indicator,
      "calling_point_code": this.dto.calling_point_code,
      "calling_subsystem_number": this.dto.calling_subsystem_number,
      "calling_translator_type": this.dto.calling_translator_type,
      "calling_numbering_plan_id": this.dto.calling_numbering_plan_id,
      "calling_nature_of_address_id": this.dto.calling_nature_of_address_id,
      "calling_global_tittle_digits": this.dto.calling_global_tittle_digits,
    }
  }
}
