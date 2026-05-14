import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
    providedIn: 'root'
})
export class RoutingRolesService {

    constructor(private connectionService: ConnectionService) { }

    async getRoutingRoles(): Promise<ResponseI> {
        return this.connectionService.send('routing-rules', 'get');
    }

    async getNetworks(): Promise<ResponseI> {
        return this.connectionService.send('routing-rules/networks', 'get');
    }

    async createRoutingRoles(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send('routing-rules/create', 'post', responseCode);
    }

    async updateRoutingRoles(responseCode: any): Promise<ResponseI> {
        return this.connectionService.send(`routing-rules/update/${responseCode.id}`, 'put', responseCode);
    }

    async deleteRoutingRolesg(id: number): Promise<ResponseI> {
        return this.connectionService.send(`routing-rules/delete/${id}`, 'delete');
    }
}
