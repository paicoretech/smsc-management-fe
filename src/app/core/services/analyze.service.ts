import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { DateTimeUtil } from '../utils/functions/DateTimeUtils';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class AnalyceService {
  
  constructor(private connectionService: ConnectionService) {}

  async getCatalog(): Promise<ResponseI> {
    return this.connectionService.send('analyze/catalog/broadcast', 'get');
  }

  async getLogs(offset: number, limit: number, filters: any = {}): Promise<ResponseI> {
    const baseBody = {
      ...filters,
      start_datetime: DateTimeUtil.toLocalTime(filters.start_datetime),
      end_datetime: DateTimeUtil.toLocalTime(filters.end_datetime),
      origin_network: this.normalizeToStringArray(filters.origin_network),
      destination_network: this.normalizeToStringArray(filters.destination_network),
      offset,
      limit
    };

    const cleanedBody = Object.fromEntries(
      Object.entries(baseBody).filter(([_, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        (!Array.isArray(v) || v.length > 0)
      )
    );

    return this.connectionService.send('analyze/cdrs', 'post', cleanedBody);
  }

  private normalizeToStringArray(value: any): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map(v => String(v)).filter(v => v !== '');
    }

    const stringValue = String(value);
    return stringValue !== '' ? [stringValue] : [];
  }

  async getReportHistory(types: string[]): Promise<any> {
    return this.connectionService.send('reportFile?types=' + types, 'get');
  }

  async exportCdrs(filters: any, fileType: string): Promise<any> {
    const baseBody = {
      ...filters,
      start_datetime: DateTimeUtil.toLocalTime(filters.start_datetime),
      end_datetime: DateTimeUtil.toLocalTime(filters.end_datetime),
      origin_network: this.normalizeToStringArray(filters.origin_network),
      destination_network: this.normalizeToStringArray(filters.destination_network)
    };

    const cleanedBody = Object.fromEntries(
      Object.entries(baseBody).filter(([_, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        (!Array.isArray(v) || v.length > 0)
      )
    );

    return this.connectionService.send(`reportFile/cdrs/${ fileType }`, 'post', cleanedBody);
  }

  async downloadReportFile(token: string): Promise<any> {
    return this.connectionService.downloadFile(`reportFile/download/${token}`);
  }

  async getDashboardData(filters: any = {}): Promise<any> {
    const baseBody = {
      ...filters,
      start_datetime: DateTimeUtil.toLocalTime(filters.start_datetime),
      end_datetime: DateTimeUtil.toLocalTime(filters.end_datetime),
      origin_network: this.normalizeToStringArray(filters.origin_network),
      destination_network: this.normalizeToStringArray(filters.destination_network),
    };

    const cleanedBody = Object.fromEntries(
      Object.entries(baseBody).filter(([_, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        (!Array.isArray(v) || v.length > 0)
      )
    );

    return this.connectionService.send('analyze/dashboards', 'post', cleanedBody);
  }

}