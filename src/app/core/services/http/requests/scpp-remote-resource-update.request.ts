import { SccpRemoteResource } from "@app/core/interfaces/GatewaySs7";
import { IBaseRequest } from "./base.request";

export class SccpRemoteResourceUpdateRequest implements IBaseRequest {

  constructor(
    private sccpId: number,
    private dto: SccpRemoteResource
  ) {}

  toJson(): object {
    return {
      "ss7_sccp_id": this.sccpId,
      "id": this.dto.id,
      "remote_spc": this.dto.remote_spc,
      "remote_ssn": this.dto.remote_ssn,
      "mark_prohibited": this.dto.mark_prohibited,
    }
  }
}
