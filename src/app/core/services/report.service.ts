import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { RouteSummaryI, UserSmsSummaryI } from '../interfaces/Report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

    constructor(private connectionService: ConnectionService) {}

    async getUsersSmsSummary(): Promise<ResponseI> {
        // TODO: change to real API call
        const mockData: UserSmsSummaryI[] = [
            { user: 'one_exe_t_1', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_2', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_3', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_4', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_5', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_6', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_7', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_8', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_9', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
            { user: 'one_exe_t_10', received: '13844656', sent_dlr: '13784241 (99.56%)', dlr_tps: '330/84' },
        ];

        const response: ResponseI = {
            status: 200,
            message: 'OK',
            data: mockData,
            comment: 'Users SMS summary data'
        };

        return new Promise<ResponseI>((resolve) => {
            setTimeout(() => resolve(response), 200);
        });
    }

    async getRoutesSummary(): Promise<ResponseI> {
        // TODO: change to real API call
        const mockData: RouteSummaryI[] = [
            { route: 'BSLN-Nodia-Trans1', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans2', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans3', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans4', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans5', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans6', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans7', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans8', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans9', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
            { route: 'BSLN-Nodia-Trans10', submitted: '13844656', tps: '485/242', failed: '142631 (9,08%)' },
        ];

        const response: ResponseI = {
            status: 200,
            message: 'OK',
            data: mockData,
            comment: 'Routes summary data'
        };

        return new Promise<ResponseI>((resolve) => {
            setTimeout(() => resolve(response), 200);
        });
    }

}