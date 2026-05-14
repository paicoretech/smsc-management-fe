import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import {
  SccpRemoteResource,
  SccpRemoteSignaling,
  SccpServiceAccessPoint,
  SccpMtp3Destination,
  SccpLongMessageRule,
  SccpAddress,
  SccpRule,
  SccpGeneralSettings,
} from '../interfaces/GatewaySs7';

import {
  SccpPropertiesCreateRequest,
  SccpPropertiesUpdateRequest,
  SccpRemoteResourceCreateRequest,
  SccpRemoteResourceUpdateRequest,
  SccpSapCreateRequest,
  SccpSapUpdateRequest,
  SccpMtp3CreateRequest,
  SccpMtp3UpdateRequest,
  SccpLongMessageRuleCreateRequest,
  SccpLongMessageRuleUpdateRequest,
  SccpAddressCreateRequest,
  SccpAddressUpdateRequest,
  SccpRuleCreateRequest,
  SccpRuleUpdateRequest,
} from './http/requests';

@Injectable({
  providedIn: 'root'
})
export class SccpService {

  constructor(private connectionService: ConnectionService) {}

  async getProperties(networkId: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/${networkId}`, 'get');
  }

  async create(dto: SccpGeneralSettings): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/create`, 'post', dto);
  }

  async update(dto: SccpGeneralSettings): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/update/${dto.id}`, 'put', dto);
  }

  /// Resources
  async getRemoteResource(sccpId: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-resource/${sccpId}`, 'get');
  }

  async createRemoteResource(dto: SccpRemoteResource): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-resource/create`, 'post', dto);
  }

  async updateRemoteResource(sccpId: number, dto: SccpRemoteResource): Promise<ResponseI> {
    const req = new SccpRemoteResourceUpdateRequest(sccpId, dto);
    return this.connectionService.put(`ss7-gateways/sccp/remote-resource/update/${dto.id}`, req);
  }

  async deleteRemoteResource(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-resource/delete/${id}`, 'delete');
  }

  async addRemoteSignaling(sccpId: number, dto: SccpRemoteSignaling): Promise<ResponseI> {
    const data = {
      ss7_sccp_id: sccpId,
      remote_spc: dto.remote_spc,
      remote_ssn: 0,
      mark_prohibited: false,
    }
    return this.connectionService.send(`ss7-gateways/sccp/remote-resource/create`, 'post', data);
  }

  async addRemoteSubsystem(data: any): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-subsystem`, 'post', data);
  }

  async deleteRemoteSignaling(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-resource/delete/${id}`, 'delete');
  }

  async deleteRemoteSubsystem(id: number): Promise<ResponseI> {
    return this.connectionService.send(`ss7-gateways/sccp/remote-subsystem/delete/${id}`, 'delete');
  }


  /// Service Access Point
  async getServiceAccessPoint(sccpId: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/service-access-points/${sccpId}`, 'get');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async createServiceAccessPoint(dto: SccpServiceAccessPoint): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/service-access-points/create`, 'post', dto);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async updateServiceAccessPoint(sccpId: number, dto: SccpServiceAccessPoint): Promise<ResponseI> {
    try {
      const req = new SccpSapUpdateRequest(sccpId, dto);
      return this.connectionService.put(`ss7-gateways/sccp/service-access-points/update/${dto.id}`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async deleteServiceAccessPoint(id: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/service-access-points/delete/${id}`, 'delete');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }


  /// MTP3 Destinations
  async getMtp3Destination(sccpId: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/mtp3-destinations/${sccpId}`, 'get');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async createMtp3Destination(dto: SccpMtp3Destination): Promise<ResponseI> {
    try {
      const req = new SccpMtp3CreateRequest(dto);
      return this.connectionService.post(`ss7-gateways/sccp/mtp3-destinations/create`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async updateMtp3Destination(dto: SccpMtp3Destination): Promise<ResponseI> {
    try {
      const req = new SccpMtp3UpdateRequest(dto);
      return this.connectionService.put(`ss7-gateways/sccp/mtp3-destinations/update/${dto.id}`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async deleteMtp3Destination(id: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/mtp3-destinations/delete/${id}`, 'delete');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }


  /// Long Message Rules
  async getLongMessageRules(sccpId: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/long-message-rules/${sccpId}`, 'get');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async createLongMessageRule(dto: SccpLongMessageRule): Promise<ResponseI> {
    try {
      const req = new SccpLongMessageRuleCreateRequest(dto);
      return this.connectionService.post(`ss7-gateways/sccp/long-message-rules/create`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async updateLongMessageRule(dto: SccpLongMessageRule): Promise<ResponseI> {
    try {
      const req = new SccpLongMessageRuleUpdateRequest(dto);
      return this.connectionService.put(`ss7-gateways/sccp/long-message-rules/update/${dto.id}`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async deleteLongMessageRule(id: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/long-message-rules/delete/${id}`, 'delete');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }


  /// Addresses
  async getAddresses(sccpId: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/address/${sccpId}`, 'get');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async createAddress(sccpId:number, dto: SccpAddress): Promise<ResponseI> {
    try {
      const req = new SccpAddressCreateRequest(sccpId, dto);
      return this.connectionService.post(`ss7-gateways/sccp/address/create`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async updateAddress(sccpId:number, dto: SccpAddress): Promise<ResponseI> {
    try {
      const req = new SccpAddressUpdateRequest(sccpId, dto);
      return this.connectionService.put(`ss7-gateways/sccp/address/update/${dto.id}`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async deleteAddress(id: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/address/delete/${id}`, 'delete');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  /// Rule
  async getRules(sccpId: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/rules/${sccpId}`, 'get');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async createRule(dto: SccpRule): Promise<ResponseI> {
    try {
      const req = new SccpRuleCreateRequest(dto);
      return this.connectionService.post(`ss7-gateways/sccp/rules/create`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async updateRule(dto: SccpRule): Promise<ResponseI> {
    try {
      const req = new SccpRuleUpdateRequest(dto);
      return this.connectionService.put(`ss7-gateways/sccp/rules/update/${dto.id}`, req);
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }

  async deleteRule(id: number): Promise<ResponseI> {
    try {
      return this.connectionService.send(`ss7-gateways/sccp/rules/delete/${id}`, 'delete');
    }
    catch (error) {
      return { status: 500, message: "Unhandled error", comment:"", data: error };
    }
  }


}
