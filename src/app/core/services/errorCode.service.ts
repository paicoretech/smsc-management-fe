import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class ErrorCodeService {

    constructor(private connectionService: ConnectionService) {}

    async getErrorCode(): Promise<ResponseI> {
        return this.connectionService.send('error-code', 'get');
    }

    async createErrorCode(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send('error-code/create', 'post', responseCode);
    }

    async updateErrorCode(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send(`error-code/update/${responseCode.id}`, 'put', responseCode);
    }

    async deleteErrorCode(id: number): Promise<ResponseI> {
        return this.connectionService.send(`error-code/delete/${id}`, 'delete');
    }

}