import { Observable, from } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { M3uaGeneralSettings } from '../interfaces/GatewaySs7';

@Injectable({
  providedIn: 'root'
})
export class M3uaService {

  constructor(private connectionService: ConnectionService) {}


  /**
   * Endpoints M3uaSettings
   */
  async getM3uaSettings(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/${id}`, 'get');
  }

  async createM3uaSettings(m3uaData: any): Promise<ResponseI>  {
    return this.connectionService.send(`ss7-gateways/m3ua/create`, 'post', m3uaData);
  }

  async updateM3uaSettings(id:number,m3uaData: any):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/update/${id}`, 'put', m3uaData);
  }

  async deleteM3uaSettings(id:number):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/delete/${id}`, 'delete');
  }
  /** */


  /**
   * Endpoints Associations
   */
  // getAssociationServers(id: number) {
  //   return this.connectionService.send(`ss7-gateways/m3ua/association-servers/${id}`, 'get');
  // }

  getAssociationsList(id: number) {
    return this.connectionService.send(`ss7-gateways/m3ua/associations/${id}`, 'get');
  }
  createAssociations(associationData: any):Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/associations/create`, 'post', associationData);
  }

  updateAssociations(id:number,associationData: any):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/associations/update/${id}`, 'put', associationData);
  }

  deleteAssociations(id:number):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/associations/delete/${id}`, 'delete');
  }
  /** */

  /**
   * Endpoints Sockets
   */
  getSocketsList(id: number): Promise<ResponseI> {
    return  this.connectionService.send(`ss7-gateways/m3ua/sockets/${id}`, 'get');
  }

  createSocket(socketData: any):Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/sockets/create`, 'post', socketData);
  }

  updateSocket(id:number,socketData: any):Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/sockets/update/${id}`, 'put', socketData);
  }

  deleteSocket(id:number):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/sockets/delete/${id}`, 'delete');
  }

  /** */

  /**
   * Endpoints Applications Servers
   */
  getApplicationServersList(id: number): Promise<ResponseI> {
    return  this.connectionService.send(`ss7-gateways/m3ua/application-server/${id}`, 'get');
  }

  createApplicationServers(applicationServersData: any):Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/application-server/create`, 'post', applicationServersData);
  }

  updateApplicationServers(id:number,applicationServersData: any):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/application-server/update/${id}`, 'put', applicationServersData);
  }

  deleteApplicationServers(id:number):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/application-server/delete/${id}`, 'delete');
  }
  /** */

  /**
   * Endpoints Routes
   */
  getRouteList(id: number): Promise<ResponseI> {
    return  this.connectionService.send(`ss7-gateways/m3ua/routes/${id}`, 'get');
  }

  createRoute(routeData: any, id: number):Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/m3ua/routes/create/${id}`, 'post', routeData);
  }

  updateRoute(id:number,routeData: any):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/routes/update/${id}`, 'put', routeData);
  }

  deleteRoute(id:number):Promise<ResponseI> {

    return this.connectionService.send(`ss7-gateways/m3ua/routes/delete/${id}`, 'delete');
  }
  /** */


}
