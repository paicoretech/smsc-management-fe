import { Injectable } from '@angular/core';
import { ResponseI } from '../interfaces/Response';
import {
  PlmnCountry,
  PlmnNetwork,
  PlmnPage,
  PlmnNetworkPayload,
  PlmnPrefix,
  PlmnPrefixPayload,
} from '../interfaces/PlmnNetwork';
import { ConnectionService } from '../utils/connection.service';

@Injectable({
  providedIn: 'root',
})
export class PlmnNetworkService {
  constructor(private readonly connectionService: ConnectionService) {}

  getCountries(): Promise<ResponseI<PlmnCountry[]>> {
    return this.connectionService.send('plmn-country', 'get');
  }

  getNetworks(): Promise<ResponseI<PlmnNetwork[]>> {
    return this.connectionService.send('plmn-network', 'get');
  }

  getNetworksPage(offset: number, limit: number, search = ''): Promise<ResponseI<PlmnPage<PlmnNetwork>>> {
    const query = `?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`;
    return this.connectionService.send(`plmn-network${query}`, 'get');
  }

  createNetwork(network: PlmnNetworkPayload): Promise<ResponseI> {
    return this.connectionService.send('plmn-network/create', 'post', network);
  }

  updateNetwork(id: number, network: PlmnNetworkPayload): Promise<ResponseI> {
    return this.connectionService.send(`plmn-network/update/${id}`, 'put', network);
  }

  deleteNetwork(id: number): Promise<ResponseI> {
    return this.connectionService.send(`plmn-network/delete/${id}`, 'delete');
  }

  getPrefixes(): Promise<ResponseI<PlmnPrefix[]>> {
    return this.connectionService.send('plmn-prefix', 'get');
  }

  getPrefixesPage(offset: number, limit: number, search = ''): Promise<ResponseI<PlmnPage<PlmnPrefix>>> {
    const query = `?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`;
    return this.connectionService.send(`plmn-prefix${query}`, 'get');
  }

  createPrefix(prefix: PlmnPrefixPayload): Promise<ResponseI> {
    return this.connectionService.send('plmn-prefix/create', 'post', prefix);
  }

  uploadPrefixes(formData: FormData): Promise<ResponseI> {
    return this.connectionService.send('plmn-prefix/upload', 'post', formData);
  }

  updatePrefix(id: number, prefix: PlmnPrefixPayload): Promise<ResponseI> {
    return this.connectionService.send(`plmn-prefix/update/${id}`, 'put', prefix);
  }

  deletePrefix(id: number): Promise<ResponseI> {
    return this.connectionService.send(`plmn-prefix/delete/${id}`, 'delete');
  }
}
