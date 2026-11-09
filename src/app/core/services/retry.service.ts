import { Injectable } from '@angular/core';
import { Retries, RetryConfiguration, RetryProfileDetail, RetryProfileMapping, RetryProfileMappingPayload, RetryProfilePayload, RetryProfileSummary } from '../interfaces/Retry';
import { ResponseI } from '../interfaces/Response';
import { ConnectionService } from '../utils/connection.service';

@Injectable({
    providedIn: 'root'
})
export class RetriesService {

    private readonly generalConfigurationPath = 'general-settings/smsc-retry';
    private readonly updateGeneralConfigurationPath = 'general-settings/smsc-retry/update';
    private readonly profilesPath = 'retry-profiles';
    private readonly mappingsPath = 'gateway-profiles';

    constructor(private connectionService: ConnectionService) { }

    async getGeneralConfiguration(): Promise<ResponseI<Retries | null>> {
        return this.connectionService.send(this.generalConfigurationPath, 'get');
    }

    async updateGeneralConfiguration(configuration: RetryConfiguration): Promise<ResponseI<Retries | null>> {
        return this.connectionService.send(this.updateGeneralConfigurationPath, 'put', configuration);
    }

    async getProfiles(): Promise<ResponseI<RetryProfileSummary[]>> {
        return this.connectionService.send(this.profilesPath, 'get');
    }

    async getProfileById(profileId: number): Promise<ResponseI<RetryProfileDetail | null>> {
        return this.connectionService.send(`${this.profilesPath}/${profileId}`, 'get');
    }

    async createProfile(profile: RetryProfilePayload): Promise<ResponseI<RetryProfileDetail | null>> {
        return this.connectionService.send(this.profilesPath, 'post', profile);
    }

    async updateProfile(profileId: number, profile: RetryProfilePayload): Promise<ResponseI<RetryProfileDetail | null>> {
        return this.connectionService.send(`${this.profilesPath}/${profileId}`, 'put', profile);
    }

    async deleteProfile(profileId: number): Promise<ResponseI<null>> {
        return this.connectionService.send(`${this.profilesPath}/${profileId}`, 'delete');
    }

    async getMappings(): Promise<ResponseI<RetryProfileMapping[]>> {
        return this.connectionService.send(this.mappingsPath, 'get');
    }

    async getMappingById(mappingId: number): Promise<ResponseI<RetryProfileMapping | null>> {
        return this.connectionService.send(`${this.mappingsPath}/${mappingId}`, 'get');
    }

    async createMapping(mapping: RetryProfileMappingPayload): Promise<ResponseI<RetryProfileMapping | null>> {
        return this.connectionService.send(this.mappingsPath, 'post', mapping);
    }

    async updateMapping(mappingId: number, mapping: RetryProfileMappingPayload): Promise<ResponseI<RetryProfileMapping | null>> {
        return this.connectionService.send(`${this.mappingsPath}/${mappingId}`, 'put', mapping);
    }

    async deleteMapping(mappingId: number): Promise<ResponseI<null>> {
        return this.connectionService.send(`${this.mappingsPath}/${mappingId}`, 'delete');
    }
}