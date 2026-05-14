import { Injectable } from '@angular/core';
import { ConnectionService, HomeRouting, HomeRoutingCcMccMnc, ResponseI } from '@app/core';

@Injectable({ providedIn: 'root' })
export class HomeRoutingService {
  constructor(private connectionService: ConnectionService) {}

  async getHomeRoutingByNetwork(networkId: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/home-routing/${networkId}`, 'get');
  }

  async createHomeRouting(payload: HomeRouting): Promise<ResponseI> {
    return this.connectionService.send('ss7-gateways/home-routing/create', 'post', payload);
  }

  async updateHomeRouting(payload: HomeRouting): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/home-routing/update/${payload.id}`, 'put', payload);
  }

  async listCcMccMnc(ss7HomeRoutingId: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/home-routing/cc-mcc-mnc/${ss7HomeRoutingId}`, 'get');
  }
  async createCcMccMnc(payload: HomeRoutingCcMccMnc): Promise<ResponseI> {
    return this.connectionService.send('ss7-gateways/home-routing/cc-mcc-mnc/create', 'post', payload);
  }
  async updateCcMccMnc(payload: HomeRoutingCcMccMnc): Promise<ResponseI> {
    return this.connectionService.send(
      `ss7-gateways/home-routing/cc-mcc-mnc/update/${payload.id}`,
      'put',
      payload
    );
  }
  async deleteCcMccMnc(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/home-routing/cc-mcc-mnc/delete/${id}`, 'delete');
  }
}