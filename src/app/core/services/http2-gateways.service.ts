import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root',
})
export class Http2GatewaysService {
  private readonly basePath = 'http2-gateways';

  constructor(private connectionService: ConnectionService) {}

  async getHttp2Gateways(): Promise<ResponseI> {
    return this.connectionService.send(this.basePath, 'get');
  }

  async getHttp2GatewaysById(networkId: number): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/${networkId}`, 'get');
  }

  async createHttp2Gateway(payload: any): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/create`, 'post', payload);
  }

  async updateHttp2Gateway(networkId: number, payload: any): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/update/${networkId}`, 'put', payload);
  }
}
