import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class GatewaySmppService {

    constructor(private connectionService: ConnectionService) {}

    async getGateways(): Promise<ResponseI> {
        return this.connectionService.send('gateways', 'get');
    }

    async createGateway(gateway: any): Promise<ResponseI> {
        return this.connectionService.send('gateways/create', 'post', gateway);
    }

    async updateGateway(gateway: any): Promise<ResponseI> {
        return this.connectionService.send(`gateways/update/${gateway.network_id}`, 'put', gateway);
    }

    async deleteGateway(id: number): Promise<ResponseI> {
        return this.connectionService.send(`gateways/${id}`, 'delete');
    }

}