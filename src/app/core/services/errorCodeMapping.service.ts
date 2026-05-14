import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class ErrorCodeMappingService {

  constructor(private connectionService: ConnectionService) {}

    async getErrorCodeMapping(): Promise<ResponseI> {
        return this.connectionService.send('error-code-mapping', 'get');
    }

    async createErrorCodeMapping(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send('error-code-mapping/create', 'post', responseCode);
    }

    async updateErrorCodeMapping(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send(`error-code-mapping/update/${responseCode.id}`, 'put', responseCode);
    }

    async deleteErrorCodeMapping(id: number): Promise<ResponseI> {
        return this.connectionService.send(`error-code-mapping/delete/${id}`, 'delete');
    }
}
