import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ServiceProvidersService {

    constructor(private connectionService: ConnectionService) { }

    async getProviders(): Promise<ResponseI> {
        return this.connectionService.send('service-provider', 'get');
    }

    async getProvider(id: number): Promise<ResponseI> {
        return this.connectionService.send(`service-providers/${id}`, 'get');
    }

    async createProvider(provider: any): Promise<ResponseI> {
        return this.connectionService.send('service-provider/create', 'post', provider);
    }

    async updateProvider(provider: any): Promise<ResponseI> {
        return this.connectionService.send(`service-provider/update/${provider.network_id}`, 'put', provider);
    }

    async deleteProvider(id: number): Promise<ResponseI> {
        return this.connectionService.send(`service-provider/${id}`, 'delete');
    }

    async getCreditBalance(network_id: string): Promise<ResponseI> {
        return this.connectionService.send(`balance-credit/rating`, 'post', { network_id });
    }

    async setCreditBalance(network_id: number, credit: any): Promise<ResponseI> {
        return this.connectionService.send(`balance-credit/sell/credit/${network_id}`, 'post', credit);
    }

}
