import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiContext } from '@app/core/utils/types/api-context.type';

@Component({
  selector: 'app-add-diameter',
  templateUrl: './add-diameter.component.html'
})
export class AddDiameterComponent implements OnInit {
  diameterGatewayId: number | null = null;
  mode: 'add' | 'edit' = 'add';
  ctx: ApiContext = ApiContext.SMSC;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('diameterGatewayId');
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || 'SMSC';
    if (idParam !== null) {
      const parsed = Number(idParam);
      if (!Number.isNaN(parsed)) {
        this.diameterGatewayId = parsed;
        this.mode = 'edit';
      }
    }
  }

  get isIpSmGw(): boolean { return this.ctx === 'IP_SM_GW'; }
  get isSMSC(): boolean { return this.ctx === 'SMSC'; }


  get diameterBasePath(): string[] {
    return this.isIpSmGw
      ? ['/pages/ip-sm-gw/diameter']
      : ['/pages/gateways/smsc/diameter'];
  }
}
