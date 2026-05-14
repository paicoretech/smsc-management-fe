import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    constructor(private connectionService: ConnectionService) {}

    async getUsers(): Promise<ResponseI> {
        return this.connectionService.send('user', 'get');
    }

    async createUser(user: any): Promise<ResponseI> {
        return this.connectionService.send('user/create', 'post', user);
    }

    async updateUser(id: number, user: any): Promise<ResponseI> {
        return this.connectionService.send(`user/update/${id}`, 'put', user);
    }

    async getRoles(): Promise<ResponseI> {
        return this.connectionService.send('user/roles', 'get');
    }

}