import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { ApiContext } from '../utils/types/api-context.type';

@Injectable({
  providedIn: 'root'
})
export class GatewaySs7Service {

    constructor(private connectionService: ConnectionService) {}
    
    private suffix(ctx: ApiContext): string {
        return ctx === 'IP_SM_GW' ? '/getAll/ip-sm-gw/' : '';
    }

    async getGatewaySs7(ctx: ApiContext = ApiContext.SMSC): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways${this.suffix(ctx)}`, 'get');
    }

    async getGatewaySs7ById(id: number): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/${id}`, 'get');
    }

    async createGatewaySs7(gateway: any): Promise<ResponseI> {
        return this.connectionService.send('ss7-gateways/create', 'post', gateway);
    }

    async updateGatewaySs7(gateway: any): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/update/${gateway.network_id}`, 'put', gateway);
    }

    async refreshSettingSs7(id:number):Promise<ResponseI> {
      return this.connectionService.send(`ss7-gateways/refresh-setting/${id}`, 'get');
    }

    async triggerSccpHotReload(layer: string, module: string, networkId: number): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/hot-reload/${layer}/${module}/${networkId}`, 'post');
    }

    async generateApiToken(networkId: number): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/token/generate/${networkId}`, 'post');
    }

}
