import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class TcapMapService {

  constructor(private connectionService: ConnectionService) {}

  async getTcap(id: number): Promise<ResponseI>  {
    return this.connectionService.send(`ss7-gateways/tcap/${id}`, 'get');
  }

  async getMap(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/map/${id}`, 'get');
  }

  async createTcap(data: any): Promise<ResponseI> {
    return this.connectionService.send('ss7-gateways/tcap/create', 'post', data);
  }

  async updateTcap(id: number, data: any): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/tcap/update/${id}`, 'put', data);
  }

  async createMap(data: any): Promise<ResponseI> {
    return this.connectionService.send('ss7-gateways/map/create', 'post', data);
  }

  async updateMap(id: number, data: any): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/map/update/${id}`, 'put', data);
  }
}
