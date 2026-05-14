import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class DeliveryErrorCodeService {

  constructor(private connectionService: ConnectionService) { }

  async getdeliveryErrorCode(): Promise<ResponseI> {
    return await this.connectionService.send('delivery-error-code', 'get');
  }

  async createdeliveryErrorCode(responseCode: any): Promise<ResponseI> {
    return this.connectionService.send('delivery-error-code/create', 'post', responseCode);
  }

  async updatedeliveryErrorCode(responseCode: any): Promise<ResponseI> {
    return this.connectionService.send(`delivery-error-code/update/${responseCode.id}`, 'put', responseCode);
  }

  async deletedeliveryErrorCode(id: number): Promise<ResponseI> {
    return this.connectionService.send(`delivery-error-code/delete/${id}`, 'delete');
  }

}
