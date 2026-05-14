import {Injectable} from '@angular/core';
import {ConnectionService} from '../utils/connection.service';
import {ResponseI} from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class BroadCastService {

  constructor(private connectionService: ConnectionService) {}

  async getBroadCast(): Promise<ResponseI> {
    return this.connectionService.send('broadcast', 'get');
  }

  async getBroadCastById(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${id}`, 'get');
  }

  async createBroadCast(broadcast: FormData): Promise<ResponseI> {
    return this.connectionService.send('broadcast', 'post', broadcast);
  }

  async updateBroadCast(id: number, broadcast: FormData, updatedFile: boolean): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${id}?updatedFile=${ updatedFile }`, 'put', broadcast);
  }

  async startBroadCast(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/start/${id}`, 'post');
  }

  async deleteBroadCast(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${id}`, 'delete');
  }

  async requestFileDownload(broadcastId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/logs/${broadcastId}`, 'post');
  }

  async checkFileStatus(fileId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/logs/${fileId}`, 'get');
  }

  async downloadReportStream(token: string) {
    return this.connectionService.downloadFile(`broadcast/download/logs/${token}`);
  }

  async getMessageEventFields(): Promise<ResponseI> {
    const mockData = [
      {
        group: 'Basic',
        fields: [
          { key: 'sourceAddr', label: 'Sender' },
          { key: 'destinationAddr', label: 'Recipient' }
        ]
      },
      {
        group: 'Advanced',
        fields: [
          { key: 'sourceAddrNpi', label: 'Source Address Numbering Plan Indicator' },
          { key: 'sourceAddrTon', label: 'Source Address Type of Number' },
          { key: 'destAddrNpi', label: 'Destination Address Numbering Plan Indicator' },
          { key: 'destAddrTon', label: 'Destination Address Type of Number' },
          { key: 'dataCoding', label: 'Data Coding Scheme' }
        ]
      }
    ];

    const response: ResponseI = {
      status: 200,
      message: 'Mocked fields loaded successfully',
      comment: '',
      data: mockData
    };

    return Promise.resolve(response);
  }

  async uploadFile(file: FormData): Promise<ResponseI> {
    return this.connectionService.send('broadcast-file', 'post', file);
  }

  async deleteUploadedFile(fileId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast-file/${fileId}`, 'delete');
  }

  async cloneBroadcast(broadcastId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/clone/${broadcastId}`, 'get');
  }

  async testBroadcast(testData: {
    network_id: string;
    message_template: string;
    source_addr: string;
    destination_addr: string;
    column_mapping_data: { [key: string]: string };
    column_mapping: { [key: string]: string };
  }): Promise<ResponseI> {
    return this.connectionService.send('broadcast/test', 'post', testData);
  }

  async changeStatusBroadcast(id: number, broadcastStatus: string, comment: string): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/change-status/${id}`, 'post', {
      broadcast_status: broadcastStatus,
      comment: comment
    });
  }

  async getFailureReasons(broadcastId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${broadcastId}/failures`, 'get');
  }


}
