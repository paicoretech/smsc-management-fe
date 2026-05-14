import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

    constructor(private connectionService: ConnectionService) {}

    async getInterpreter(): Promise<ResponseI> {
        return this.connectionService.send('interpreter', 'get');
    }

    async createInterpreter(interpreter: any): Promise<ResponseI> {
        return this.connectionService.send('interpreter/create', 'post', interpreter);
    }

    async updateInterpreter(interpreter: any): Promise<ResponseI> {
        return this.connectionService.send(`interpreter/update/${interpreter.id}`, 'put', interpreter);
    }

    async deleteInterpreter(id: number): Promise<ResponseI> {
        return this.connectionService.send(`interpreter/delete/${id}`, 'delete');
    }

    async getHttpGateways(): Promise<ResponseI> {
        return this.connectionService.send('interpreter/gateways', 'get');
    }
}