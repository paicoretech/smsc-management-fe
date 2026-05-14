import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class MnosService {

    constructor(private connectionService: ConnectionService) {}

    async getMnos(): Promise<ResponseI> {
        return this.connectionService.send('mno', 'get');
    }

    async createMnos(mno: any): Promise<ResponseI> {
        return this.connectionService.send('mno/create', 'post', mno);
    }

    async updateMnos(mno: any): Promise<ResponseI> {
        return this.connectionService.send(`mno/update/${mno.id}`, 'put', mno);
    }

    async deleteMnos(id: number): Promise<ResponseI> {
        return this.connectionService.send(`mno/delete/${id}`, 'delete');
    }

}