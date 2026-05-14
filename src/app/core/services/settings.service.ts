import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { convertToSmscSetting } from '../utils/functions/smscConverter';

@Injectable({
    providedIn: 'root'
})
export class SettingServices {

    constructor(private connectionService: ConnectionService) { }

    async getSmppServerConfig(): Promise<ResponseI> {
        return this.connectionService.send('smpp-server', 'get');
    }

    async createSmppServer(smppServer: any): Promise<ResponseI> {
        return this.connectionService.send(`smpp-server/create`, 'post', smppServer);
    }

    async updateSmppServer(id: any, smppServer: any): Promise<ResponseI> {
        return this.connectionService.send(`smpp-server/update/${ id }`, 'put', smppServer);
    }

    async deleteSmppServer(id: any): Promise<ResponseI> {
        return this.connectionService.send(`smpp-server/delete/${ id }`, 'delete');
    }

    async getHttpServerConfig(): Promise<ResponseI> {
        return this.connectionService.send('http-server-config', 'get');
    }

    async updateStatusHttp(application_name: string, new_status: string): Promise<ResponseI> {
        return this.connectionService.send(`http-server-status?application_name=${ application_name }&new_status=${ new_status }`, 'post');
    }

    async updateAllStatusHttp(new_status: string): Promise<ResponseI> {
        return this.connectionService.send(`http-server-status/all?new_status=${ new_status }`, 'post');
    }

    async getGeneralSetting(): Promise<ResponseI> {
        return this.connectionService.send('general-settings', 'get');
    }

    async updateGeneralSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('general-settings/update', 'put', setting);
    }

    async getRetriesSetting(): Promise<ResponseI> {
        return this.connectionService.send('general-settings/smsc-retry', 'get');
    }

    async updateRetriesSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('general-settings/smsc-retry/update', 'put', setting);
    }

    async getSmscSetting(): Promise<ResponseI> {
        return this.connectionService.send('smsc-settings/variables', 'get');
    }

    async updateSmscSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('smsc-settings/massiveUpdate', 'put', setting);
    }

    /**
     * Get Analyze and DND Filtering settings
     * @returns Promise<{ use_analyze: boolean; use_dnd_filtering: boolean }>
     */
    async getAnalyzeAndDndSettings(): Promise<{ use_analyze: boolean; use_dnd_filtering: boolean }> {
        try {
            const settingsResponse = await this.getSmscSetting();
            if (settingsResponse.status === 200) {
                const smscSettings = convertToSmscSetting(settingsResponse.data);
                return {
                    use_analyze: smscSettings.use_analyze,
                    use_dnd_filtering: smscSettings.use_dnd_filtering
                };
            }
        } catch (error) {
            console.warn('Could not fetch USE_ANALYZE and USE_DND_FILTERING settings, defaulting to enabled');
        }
        // Default to both enabled if there's an error
        return {
            use_analyze: true,
            use_dnd_filtering: true
        };
    }
}
