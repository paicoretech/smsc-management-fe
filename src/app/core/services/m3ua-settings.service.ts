import { Injectable } from '@angular/core';

import { M3uaGeneralSettings } from '../interfaces/GatewaySs7';
import { DataServiceBaseService } from './data-service-base.service';

@Injectable({
  providedIn: 'root'
})
export class M3uaSettingsService extends DataServiceBaseService<M3uaGeneralSettings> {
}
