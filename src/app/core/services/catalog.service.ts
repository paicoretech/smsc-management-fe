import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private connectionService: ConnectionService) {}

  async getByCatalogType( catalogType: string): Promise<ResponseI> {
    return this.connectionService.send(`catalog/${catalogType}`, 'get');
  }

}