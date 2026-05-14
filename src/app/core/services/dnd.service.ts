import {Injectable} from '@angular/core';
import {ConnectionService} from '../utils/connection.service';
import {ResponseI} from '../interfaces/Response';

@Injectable({
    providedIn: 'root'
})
export class DndService {


    constructor(private connectionService: ConnectionService) {
    }

    async getDndList(): Promise<ResponseI> {
        return this.connectionService.send('dnd', 'get');
    }

    async getDndEntriesById(parent_id: number, offset: number, limit: number, search: string = ''): Promise<ResponseI> {
        const query = `?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`;
        return this.connectionService.send(`dnd/${parent_id}/entries${query}`, 'get');
    }

    async createDnd(dnd: FormData): Promise<ResponseI> {
        return this.connectionService.send('dnd', 'post', dnd);
    }

    async createDndEntries(parentId: number, msisdnList: string[]): Promise<ResponseI> {
        return this.connectionService.send(`dnd/entry`, 'post', {
            parent_id: parentId,
            msisdns: msisdnList
        });
    }

    async changeDndStatus(parentId: number, enabled: boolean): Promise<ResponseI> {
        return this.connectionService.send(`dnd/change-status/${parentId}/${enabled}`, 'post', {});
    }

    async deleteDndList(parentId: number): Promise<ResponseI> {
        return this.connectionService.send(`dnd/${parentId}`, 'delete');
    }

    async renameDndList(parentId: number, name: string): Promise<ResponseI> {
        return this.connectionService.send(`dnd/${parentId}/name`, 'post', {name});
    }

    async deleteMsisdn(parentId: number, msisdn: string): Promise<ResponseI> {
        return this.connectionService.send(`dnd/${parentId}/msisdns/${encodeURIComponent(msisdn)}`, 'delete');
    }

}

