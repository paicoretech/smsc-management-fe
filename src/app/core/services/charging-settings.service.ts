import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { ChargingSetting, LocalPeer, Parameters, Peer, Realm } from '../interfaces/ChargingSetting';
import { ApiContext } from '../utils/types/api-context.type';

@Injectable({
    providedIn: 'root'
})
export class ChargingSettingsService {

    constructor(private connectionService: ConnectionService) { }

    private diameterSuffix(ctx: ApiContext): string {
        return ctx === 'IP_SM_GW' ? '/ip-sm-gw' : '';
    }

    // Global Controllers
    addDiameterGateway(setting: ChargingSetting): Promise<ResponseI> {
        return this.connectionService.send('diameter/add', 'post', setting);
    }

    updateDiameterGateway(id: number, setting: ChargingSetting): Promise<ResponseI> {
        return this.connectionService.send(`diameter/update/${id}`, 'put', setting);
    }

    removeDiameterGateway(id: number): Promise<ResponseI> {
        return this.connectionService.send(`diameter/remove/${id}`, 'delete');
    }

    getDiameterGateway(id: number): Promise<ResponseI> {
        return this.connectionService.send(`diameter/get/${id}`, 'get');
    }

    getDiameterChargingSettings(): Promise<ResponseI> {
        return this.connectionService.send('diameter/get/charging', 'get');
    }

    getAllDiameterGateways(ctx: ApiContext = ApiContext.SMSC): Promise<ResponseI> {
        return this.connectionService.send(`diameter/getAll${this.diameterSuffix(ctx)}`, 'get');
    }

    toggleDiameterGateway(id: number, status: boolean): Promise<ResponseI> {
        return this.connectionService.send(`diameter/update/${id}/start/${status}`, 'put');
    }

    toggleSpecificPeer(peerId: number, status: boolean): Promise<ResponseI> {
        return this.connectionService.send(`diameter/update/peer/${peerId}/start/${status}`, 'put');
    }

    // Specific Controllers
    addDiameterRealm(diameterGatewayId: number, realm: Realm): Promise<ResponseI> {
        return this.connectionService.send(`diameter/${diameterGatewayId}/realm/add`, 'post', realm);
    }

    updateDiameterRealm(realmId: number, realm: Realm): Promise<ResponseI> {
        return this.connectionService.send(`diameter/realms/${realmId}/update`, 'put', realm);
    }

    removeDiameterRealm(realmId: number): Promise<ResponseI> {
        return this.connectionService.send(`diameter/realms/${realmId}/remove`, 'delete');
    }

    addDiameterPeer(diameterGatewayId: number, peer: Peer): Promise<ResponseI> {
        return this.connectionService.send(`diameter/${diameterGatewayId}/peer/add`, 'post', peer);
    }

    updateDiameterPeer(peerId: number, peer: Peer): Promise<ResponseI> {
        return this.connectionService.send(`diameter/peers/${peerId}/update`, 'put', peer);
    }

    removeDiameterPeer(peerId: number): Promise<ResponseI> {
        return this.connectionService.send(`diameter/peers/${peerId}/remove`, 'delete');
    }

    updateParameters(diameterGatewayId: number, parameters: Parameters): Promise<ResponseI> {
        return this.connectionService.send(`diameter/${diameterGatewayId}/parameters/update`, 'put', parameters);
    }

    updateLocalPeer(diameterGatewayId: number, localPeer: LocalPeer): Promise<ResponseI> {
        return this.connectionService.send(`diameter/${diameterGatewayId}/localPeer/update`, 'put', localPeer);
    }
}